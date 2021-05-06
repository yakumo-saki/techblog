---
layout: post
title: "FreeNASのシステムpoolを拡張する"
date: "2020-06-10 16:26:00 +0900"
categories: 
  - blog
---
## why?

* バージョンアップを続けた為か、WebUIでfreenas-boot の容量警告（80%以上）が表示されてしまった。
* 放置しても大丈夫そうな気がするがzabbixもアラートを出すので拡張したい
* なお、FreeNASはVMとして動いている (Hyper-V)

## 手順
### VMのディスクを拡張

（省略）  


この時点で、`dmesg` に以下のような表示が出るが出力の通り `gpart commit da0` しても意味は無い  

```
`(da0:storvsc0:0:0:0): Capacity data has changed
GEOM_PART: da0 was automatically resized.
  Use `gpart commit da0` to save changes or `gpart undo da0` to revert them.
````

### zpoolを拡張する

zfsはディスク全体を使用しているのであれば `zpool online -e [pool] [disk]` で拡張した分を認識できるが、freenas-boot はパーティションをzfs poolとして使用しているのでパーティションを拡張しないといけない。  

#### パーティション拡張

zfsで使っているのパーティションを確認  

```
`root@freenas[~]# zpool status freenas-boot
  pool: freenas-boot
 state: ONLINE
  scan: scrub repaired 0 in 0 days 00:00:13 with 0 errors on Wed Jun 10 03:45:13 2020
config:

	NAME        STATE     READ WRITE CKSUM
	freenas-boot  ONLINE       0     0     0
	  da0p2     ONLINE       0     0     0

=> 使っているパーティションは da0p2

root@freenas[~]# gpart show da0
=>      40  20971440  da0  GPT  (10G)
        40    532480    1  efi  (260M)
    532520  16220160    2  freebsd-zfs  (7.7G)
  16752680   4218800       - free -  (2.0G)
````


この表示であれば、拡張する対象は 2 である。この数字を使って拡張する。  

`gpart resize -i 2 da0`  

-i の次の 2 がパーティション番号。特にサイズを指定していないので、使えるだけ使う。  

```
`root@freenas[~]# gpart show da0
=>      40  20971440  da0  GPT  (10G)
        40    532480    1  efi  (260M)
    532520  20438960    2  freebsd-zfs  (9.7G)
````


free が消えて、 freebsd-zfs が9.7Gに拡張された。  

### 拡張した分をzfsに認識させる
```
`zpool online -e freenas-boot da0p2
````


これだけでOK。念のため確認する。  

```
`zfs list
NAME                                                    USED  AVAIL  REFER  MOUNTPOINT
freenas-boot                                           6.00G  3.20G   176K  none
略
````


AVAIL が増えたことが確認できた。  

WebUIのアラートも消えてスッキリした。  

