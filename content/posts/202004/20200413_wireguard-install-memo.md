---
layout: post
title: "Wireguardインストールログ"
date: "2020-04-13 15:00:00 +0900"
categories: 
  - blog
---
## 目的

* 家のオンプレサーバーをインターネットに公開したいが、DS-Liteしている為公開できない
* VPNを使う事で、Oracle Cloud上のサーバーを経由してオンプレ鯖のサービスを公開する。

## URL

* 

<a href="https://www.wireguard.com/install/">https://www.wireguard.com/install/  


* 

<a href="https://www.wireguard.com/quickstart/#command-line-interface">https://www.wireguard.com/quickstart/#command-line-interface  


* 

<a href="https://ma-tech.centurysys.jp/doku.php?id=mae3xx_ope:use_wireguard_vpn:start">https://ma-tech.centurysys.jp/doku.php?id=mae3xx_ope:use_wireguard_vpn:start  


* 

<a href="https://access.redhat.com/documentation/ja-jp/red_hat_enterprise_linux/6/html/load_balancer_administration/s1-lvs-forwarding-vsa">https://access.redhat.com/documentation/ja-jp/red_hat_enterprise_linux/6/html/load_balancer_administration/s1-lvs-forwarding-vsa  



## ホスト

* 

クラウド Ubuntu 18.04LTS  


* 

ローカル <s>Debian 10 Ubuntu 18.04LTS  


* 

執筆時点 2020/04/14 では Debian 10でwireguardをセットアップした際に `ip link add dev wg0 type wireguard` が `Unknown type` となってしまった為Ubuntuに変更  



## セットアップ手順
### クラウド側（サーバー側）

* 

sudo add-apt-repository ppa:wireguard/wireguard  


* 

sudo apt-get update  


* 

sudo apt-get install wireguard  


* 

ip link add dev wg0 type wireguard  


* 

ip address add dev wg0 10.240.0.1/24  


* 

sudo su -  


* 

cd /etc/wireguard  


* 

wg genkey > private  

Warning: writing to world accessible file.  

Consider setting the umask to 077 and trying again.  


* 

chmod 077 private  


* 

wg pubkey < private  

CzAAAAAAAAAAAAAAAAAAAAAAAuVg=  


* 

configを作成 (/etc/wireguard/wg0.conf)  



```
<code class="language-/etc/wireguard/wg0.conf">[Interface]
PrivateKey = サーバー側秘密鍵 (private) の中身をコピペ
# Address = 10.240.0.1 参考にしたサイトではこれが記述されていたが、エラーとなるのでコメント化
ListenPort = 51820 

[Peer]
PublicKey = クライアント側公開鍵（後で生成する）
AllowedIPs = 10.240.0.0/24
````

### ローカル側（クライアント側）

* 

sudo add-apt-repository ppa:wireguard/wireguard  


* 

sudo apt-get update  


* 

sudo apt-get install wireguard  


* 

ip link add dev wg0 type wireguard  


* 

ip address add dev wg0 10.240.0.20/24  


* 

sudo su -  


* 

cd /etc/wireguard  


* 

wg genkey > private  

Warning: writing to world accessible file.  

Consider setting the umask to 077 and trying again.  


* 

chmod 077 private  


* 

wg pubkey < private  

CzBBBBBBBBBBBBBBBBBBBBBBuVg=  


* 

クライアント側 configを作成 (/etc/wireguard/wg0.conf)  



```
`[Interface]
# クライアント側秘密鍵
PrivateKey = このホストのprivate の中身 

[Peer]
PublicKey = # サーバー側公開鍵 
EndPoint = サーバー側公開IPアドレス:port
AllowedIPs = 10.240.0.0/24
PersistentKeepAlive = 30
````


* ここでサーバー側configファイルのクライアント側publickey が生成されるのでconfigを直す。

### 接続開始

* サーバー側、クライアント側　両方で  `wg setconf wg0 /etc/wireguard/wg0.conf`

## 備考

* サーバー側はポート開放が必要。
* wg pubkey < private は、privateの中身が同一であれば、何度やっても同じ結果が出る。
* 

