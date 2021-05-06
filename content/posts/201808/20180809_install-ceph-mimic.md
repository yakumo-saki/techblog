---
layout: post
title: "Ceph (Mimic) を Ubuntu 18.04 に入れた時の構築メモ"
date: "2018-08-09 15:00:00 +0900"
categories: 
  - blog
---
## 変更履歴

* 20180818 ファイアウォール設定に不足があったので修正

## 環境

* Hyper-V上の Ubuntu 18.04LTS 3台の構成
* ceph* はパブリック(192.168.10.0/24) と ceph専用ネットワーク (172.16.10.0/24) の両方に接続
* cephadmin = (admin, mon) publicip=192.168.10.201~200 privateip=172.16.0.200
* cephosd1~2 = (mon, osd) publicip=192.168.10.201~202 privateip=172.16.0.201~202
* cephadmin は adminnodeを兼ねています。

## 目的

* S3互換ストレージサービスを動かす

## 基本的な手順

公式のGetting Started に従う  

<a href="http://docs.ceph.com/docs/master/start/quick-ceph-deploy/">http://docs.ceph.com/docs/master/start/quick-ceph-deploy/  

## しくじりポイント

なぜこの項目が作業手順より先にあるのかというと･･･  

クラスタものなのでしくじったら基本的にやり直しした方がよろしいと思われる為です。  

しくじったら以下のコマンドで全部やりなおし。VMを使っているならチェックポイントやスナップショットも使えますが、一度全部通るまでは以下のコマンドでやり直す方が早いです。  

```
`ceph-deploy purge cephosd1 cephosd2 cephosd3
ceph-deploy purgedata cephosd1 cephosd2 cephosd3
ceph-deploy forgetkeys
rm ceph.*
````

### OSDは3台ないと上手くいかない

Luminous以前は上手くいったというQiita記事等が見つかるのですが、Mimicでは3台ないと  

上手く行かないようです。  

### 先にceph というユーザーを作ってはいけない

作ってしまうと、 `ceph-deploy install cephadmin cephosd1 cephosd2` がコケる  

自動的にcephユーザーが作られるので作業用のユーザーは別のユーザーである必要があります。  

rootでも良いのかも。  

### クラスタの全てのホストには python2 コマンドが必要である

ceph-deploy を入れるホストは、依存性で自動的にインストールされますが、その他のホストには手動でインストールが必要そうです。  

インストールしていないと、 `ceph install` で、 `bash: python2: command not found` と言われてコケます。  

python3はともかく python2ってなんじゃい？と思いますが、python2.7を入れると入ります。  

```
`apt install python-minimal   #python2.7-minimal ではありません！！
````

### sudo が必要な状態だと失敗する？
```
`[ceph_deploy.install][DEBUG ] Detecting platform for host cephosd1 ...
[cephosd1][DEBUG ] connection detected need for sudo
sudo: no tty present and no askpass program specified
[ceph_deploy][ERROR ] RuntimeError: connecting to host: cephosd1 resulted in errors: IOError cannot send (already closed?)
````


/etc/sudoer を変更して（visudo使っておきました）パスワード不要にしても同じ症状。  

わけがわからない･･  

#### 【暫定】とりあえず、rootから直接行くようにすることで対応

cephadminで `sudo su -` してその状態で、cephosd1, cephosd2 にssh鍵認証が通るように設定。  

（要するに、 root@cephadminで `ssh-keygen` して、 id_rsa.pub の内容を cephosd1,2のauthorized_keysに追加）  

### hostsで名前解決を行うなら、記述するのはpublic ip

cephadmin -> cephosd* は名前でアクセスできないといけないが、名前解決といえば  

/etc/hosts ファイルを使うのが一番簡単。しかし、ここに記述するのは publicなIPアドレスでなければいけない。今回の例なら *172.16.0.21と書くのはNG* で *192.168.10.201が正解*  

（これだけで5回はしくじりました）  

参考資料：  

<a href="http://docs.ceph.com/docs/master/rados/configuration/network-config-ref/">http://docs.ceph.com/docs/master/rados/configuration/network-config-ref/  

```
`192.168.10.200   cephadmin
192.168.10.201   cephosd1
192.168.10.202   cephosd2
````

## 実作業ログ

以下は実際の作業時の手順です。  


* (事前に、ssh, ntpは構成済み)
* ceph-deploy は既に構成済み <a href="http://docs.ceph.com/docs/mimic/start/quick-start-preflight/">http://docs.ceph.com/docs/mimic/start/quick-start-preflight/

### 最初のmonを構成
```
`mkdir ceph-cluster
cd ceph-cluster
ceph-deploy new cephosd1 cephosd2 cephadmin
````

```
`vi ceph.conf
// 以下二行追加
# osd pool default size = 2  入れても効果がないように見えます
public network = 192.168.10.20/24
````

### cephインストール
```
`ceph-deploy install cephosd1 cephosd2 cephadmin
# aptを実行しているようで結構時間がかかる
````

### MON 初期化？

しくじりがあれば大抵ここでコケます。祈りながら実行します。  

```
`ceph-deploy mon create-initial
````

### 設定ファイルと鍵をコピー
```
`ceph-deploy admin cephosd1 cephosd2 cephadmin
````

### OSDを作成

ミスると、ゴミOSDが生成されますが、後で消せるのでとりあえず続行しましょう。  

```
`ceph-deploy osd create --data /dev/sdb cephadmin
ceph-deploy osd create --data /dev/sdb cephosd1
ceph-deploy osd create --data /dev/sdb cephosd2
````


地味なハマりポイント、指定するのはディスク全体。パーティション作ってたりすると失敗する。  

`stderr: Device /dev/sdb excluded by a filter.` と出てしまったら以下のコマンドを実行後、osd create を再実行。これはリモートでできない（？）みたいなので必要ならSSHする。  

`ceph-volume lvm zap /dev/sdb` これをしたときに resource busy となった場合は、既にLVMにディスクが掴まれているので、 `/bin/dd if=/dev/zero of=/dev/sdb bs=1M count=10` してから再起動すればOK。  

### メタデータサーバー作成
```
`ceph-deploy mds create cephadmin
````

### S3互換ストレージ <=> RADOS ゲートウェイ

単語集  

<a href="http://docs.ceph.com/docs/master/glossary/#term-ceph-object-gateway">http://docs.ceph.com/docs/master/glossary/#term-ceph-object-gateway  

```
`ceph-deploy rgw create cephadmin
````


試しに `curl http://192.168.10.200:7480/` すると何かでるはずです。  

### Manager作成

これが終わると、ダッシュボードが使えるようになります。  

使えるようになりますが、 <a href="https://192.168.10.200:8443/">https://192.168.10.200:8443/ です。443じゃないです  

```
`apt install python-routes    # 入れておかないとコケるらしい
ceph-deploy mgr create cephadmin
ceph-deploy --overwrite-conf mgr create cephadmin

ceph dashboard create-self-signed-cert
ceph dashboard set-login-credentials <username> <password>
radosgw-admin user create --uid=<username> --display-name=<displayname> --system
# ここでJSON形式でユーザー情報が出るのでコピっておく
ceph dashboard set-rgw-api-access-key <JSONの access key>
eph dashboard set-rgw-api-secret-key <JSONの secret key>

# ダッシュボード再起動
ceph mgr module disable dashboard
ceph mgr module enable dashboard
````


<img src="https://qiita-image-store.s3.amazonaws.com/0/2454/0e997151-4200-53ab-eaa8-a0ea95602f3e.png" alt="Greenshot 2018-08-10 19.14.22.png" loading="lazy">  

### ゴミOSDの削除

OSDの作成で失敗していると、ダッシュボードに無名で、 down, out 状態なOSDが表示されます。  

残っていても恐らく問題はないのですが気持ち悪いので削除します。  

ダッシュボード上で ID（数字） を確認してから実行して下さい。  

```
`ceph osd out <id>
ceph osd purge <id> --yes-i-really-mean-it
````

## ここまでで出来るようになったこと

* S3互換のストレージが使える <a href="http://192.168.10.200:7443/">http://192.168.10.200:7443/
* ダッシュボードが使える <a href="https://192.168.10.200:8443/">https://192.168.10.200:8443/


ダッシュボードからS3互換ストレージのバケットを作れますし、ユーザー管理もできるようになりました。  

## 追記　ファイアウォールの設定

実際に使った設定を少し改変しています。  

```
`# web画面（アクセス元絞った方がよいかも）
ufw allow 8443

# ssh
ufw allow ssh

# MON(フロント）
ufw allow from 192.168.10.0/24 to any port 6789

# MON(バック。不要なはずなんだけど開けないと上手くいかなかった）, OSD
ufw allow from 172.16.0.0/24 to any port 6800:7300 proto tcp
ufw allow from 172.16.0.0/24 to any port 6789

# MDS and MGR （フロントだけで良いはずだけど、結局OSDと同じポート範囲）
ufw allow from 192.168.10.200 to any port 6800:7300 proto tcp
ufw allow from 192.168.10.201 to any port 6800:7300 proto tcp
ufw allow from 192.168.10.202 to any port 6800:7300 proto tcp

# 20180818 追記
# cephfs を使用すると、各OSDに直接アクセスに行くので同一ネットワーク内から
# osdへのアクセスを許可するようにルール追加
ufw allow from 192.168.10.0/24 to any port 6800:7300 proto tcp

````
