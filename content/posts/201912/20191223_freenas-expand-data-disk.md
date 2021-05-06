---
layout: post
title: "FreeNASのデータディスクの増設・サイズ変更メモ"
date: "2019-12-23 14:10:00 +0900"
categories: 
  - blog
---
## 環境

* FreeNAS 11.2 Stable
* Hyper-V on Windows Server 2019

## 目的

VMでFreeNASを動かしているので、できるだけ再起動なしで増設・サイズ変更を認識させる。  


本項では、以下の3パターンについて扱う  


* ディスク増設
* ディスク容量変更（パーティションあり時。Web UIで作った場合はこちら）
* ディスク容量変更（ディスク全体を使用時。zfsプールをコマンドラインで作成した場合）

## ディスク増設

Web画面のshellから、以下のコマンドを叩くだけ。  

これでdisk一覧に追加したディスクが表示される。  

なお、ZFSプールを作るのであればディスク全体を使用した方が後々楽です。（蛇足1参照）  

```
`camcontrol rescan all
````

## ディスク容量変更（パーティションありの場合）

FreeNASのWeb UI から作ったプールの場合はこの手順です。  

zpoolコマンドを直接叩いて、ディスク全体をプールにした場合は別の手順です。しばらく下まで飛ばして下さい。  

### ディスク容量の変更をOSに認識させる
```
`# diskinfo -v /dev/da1        # 実行前の容量確認
/dev/da4
        512             # sectorsize
        55834574848     # mediasize in bytes (52G)   # ここ
        109051904       # mediasize in sectors
(略）

# camcontrol readcap da4 -h   # 容量が変化してるか確認

# camcontrol reprobe da4      # 容量を再認識させる

# diskinfo -v /dev/da4        # 実行後の容量確認


````


これで、容量が <em>表示 できる。これで新しい容量が見えるはず。  

da4の部分は、 /dev/da4 の/dev/を省略したもの。  

```
`camcontrol reprobe da4
````

### zfs パーティションのサイズ変更

必要であれば、zfs poolのサイズを変更します。 というより普通にWebからやっていれば必須です。  

```
`# 容量確認
# zpool list   

NAME           SIZE  ALLOC   FREE  CKPOINT  EXPANDSZ   FRAG    CAP  DEDUP  HEALTH  ALTROOT
minio         47.5G   556K  47.5G        -         -     0%     0%  1.00x  ONLINE  /mnt
````


FreeNASでzfs poolを作ると、パーティションを切って作っているようなので、パーティションサイズを拡張します。  

```
`# gpart show da4

=>       40  109051824  da4  GPT  (52G)
         40         88       - free -  (44K)
        128    4194304    1  freebsd-swap  (2.0G)
    4194432  100663128    2  freebsd-zfs  (48G)
  104857560    4194304       - free -  (2.0G)      # この空き容量が増設分

もし、ここで、  [CORRUPT] の表示があった場合は

# gpart repair da4

# gpart resize -i 2 da4     # -i の 2は、パーティション番号。 gpart show の時の数字です。
da4p2 resized

# gpart show da4
=>       40  109051824  da4  GPT  (52G)
         40         88       - free -  (44K)
        128    4194304    1  freebsd-swap  (2.0G)
    4194432  104857432    2  freebsd-zfs  (50G)     # 48G -> 50Gになった
           # free の部分がなくなった #
````

### ZFSに容量変更を認識させる

先に書いておきますが、ここで容量が変更されても、Web画面には反映されません。  

どうやったら反映されるんでしょう。。実用上は問題ないはずですが、監視系に問題が起きるかもしれません。  

### zpool online する

この方法では、マウント解除は発生しません。  

```
`# zpool status minio
  pool: minio
 state: ONLINE
  scan: none requested
config:

        NAME                                          STATE     READ WRITE CKSUM
        minio                                         ONLINE       0     0     0
          gptid/db00a183-f2d5-11e9-82df-00155d001e61  ONLINE       0     0     0

該当するディスクのgptid/xxxxxxx の前に、 /dev/ を追加して実行します。
daNpM 形式の場合も同じです。

# zpool online -e minio /dev/gptid/db00a183-f2d5-11e9-82df-00155d001e61

# zpool list minio
Freeが増えたことを確認
````


ここで容量が増えればそれで完了です。  

### （ダメな場合のみ） import/export する方法

注意： 一時的にZFS pool がマウント解除されます。  

```
`# zpool set autoexpand=on minio
# zpool export minio
（ここでpoolがマウント解除される）
# zpool import minio
````

#### (念のため) マウントポイント確認

export/importした場合に限るかわかりませんが、マウントポイントが変更されてしまい共有として指定できなくなりました。  

念のために確認します。  

```
`# zfs get mountpoint minio
NAME   PROPERTY    VALUE       SOURCE
minio  mountpoint  /minio      default

【NG】 /mnt/minio でなければWebから共有に指定できない

# zfs set mountpoint=/mnt/minio minio
=> 即時反映される
````

## ディスク容量変更（パーティションなしの場合）

自力でzpoolコマンドを叩いて、ディスク全体を使用した場合の手順です。  

### ディスク容量の変化を認識させる
```
`# zpool list
（元の容量を確認）

# camcontrol rescan all
# zpool online -e <poolname> <devicename>
例） zpool online -e s3 /dev/da5

# zpool list
（容量が変化したことをを確認）
````

## 蛇足1

FreeNASのGUIから新しいディスクを追加して、poolを作成すると必ずSwapが2GBほど取られてしまうので、  

十分なSwap or メモリが確保できているのであれば、Shellから自分でzpoolコマンドを使ってpoolを作った方が  

無駄がなくて良い。 手動でpoolを作る→ export →Web UI からimport でOK。  

ディスク全体を割り当てれば、コマンド3つでサイズ変更に対応できるので楽である。（swap領域、使わないなら無駄になるし）  

## 蛇足2

調査したけど使わなかったコマンドです。  

### reopen
```
`# zpool status minio
# zpool set autoexpand=on minio
# zpool reopen minio

=> 効果なし
````

### GPTパーティションにラベルを付ける
```
`# gpart modify -i 2 -l minio_ssd1 da4
da4p2 modified

# gpart show -l da4    # da4 は省略してもよい。全部表示される

=>       40  109051824  da4  GPT  (52G)
         40         88       - free -  (44K)
        128    4194304    1  (null)  (2.0G)
    4194432  104857432    2  minio_ssd1  (50G)   # ラベルがついた
````

## 蛇足の蛇足

このエラーが解決できずにハマりました。表示上/dev/ が省略されているので、  

コマンドの引数でも省略可能だと思い込んでいた。というオチでした。  

```
`# zpool online -e minio gptid/183-f2d5-11e9-82df-00155d001e61
cannot expand gptid/183-f2d5-11e9-82df-00155d001e61: no such device in pool
````

