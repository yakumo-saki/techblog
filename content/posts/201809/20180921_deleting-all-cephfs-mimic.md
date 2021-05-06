---
layout: post
title: "CephFSの削除方法（mimic)"
date: "2018-09-21 15:00:00 +0900"
categories: 
  - blog
---
## 環境

* Ceph mimic

## 何がしたかったのか

CephFSはCephクラスタにひとつしか作れない（複数ファイルシステムはまだexperimental)にも関わらず  

複数作りそうな名前で作ってしまったので、名前を変えたかった。cephfsのリネーム機能はなさそうなので、作り直しをすることにした。  

## 手順

以下のコマンドで可能です。MDSが複数いる場合は、全部failさせる必要があります。  

```
`ceph mds fail 0; ceph fs rm <cephfsname> --yes-i-really-mean-it
````


全部やり直したければ、cephfsに紐付くpoolも削除して下さい。  

なお、MDSは、CephFS専用なので、データの損失は発生しません。（CephFS内のデータは消えますが）  

## 背景

単純に、 `ceph fs rm <cephfsname>` とやってしまうと  

```
`Error EINVAL: all MDS daemons must be inactive before removing filesystem
````


と怒られます。ググってみると、 `ceph mds stop` だとか `service ceph mds stop` とか出てくるのですが、  

```
`Error ENOTSUP: command is obsolete; please check usage and/or man page
````


ということでobsoleteらしいです。何も起きません。  

では、止めずに削除すればよいのかと `ceph mds rm 0` と実行してみても、削除されるような表示はされますが、削除されません。多分、最後のひとつなので削除できないのだろうと思われます。  


では、どうやったらCephFSを消せるのかとググりまくった結果たどり着いたのが上のコマンドです。  

わざわざ、 ceph mds fail -> ceph fs rm とつなげて書いているのは、MDSがfailすると、通常ははMDSが0個になってしまうので、自動的にMDSが再起動されるようです（動作からの推測）。MDSが再起動されると all MDS daemon is inactive ではなくなってしまうので、エラーになる。  

では、再起動される前に cephfsを削除してしまえば。。。ということで成功したという所です。  

本当はもう少し良いやり方があるのではないかと思うのですが、とりあえず可能だったのでOKとします。  

