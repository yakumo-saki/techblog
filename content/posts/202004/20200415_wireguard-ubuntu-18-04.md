---
layout: post
title: "Wireguardインストールログ (Ubuntu 18.04)"
date: "2020-04-15 03:00:00 +0900"
categories: 
  - blog
---
## 前提
### 目的

* 家のオンプレサーバーをインターネットに公開したいが、DS-Liteしている為公開できない
* VPNを使う事で、Oracle Cloud上のサーバーを経由してオンプレ鯖のサービスを公開する。
* ようするに、Oracle Cloud上のサーバーからオンプレ鯖のLANが参照したい

### 設定値

* wireguardのネットワークは 10.240.0.0/24
* オンプレ鯖のネットワークは 192.168.10.0/24

## 参考URL
### 公式

* <a href="https://www.wireguard.com/install/">https://www.wireguard.com/install/
* <a href="https://www.wireguard.com/quickstart/#command-line-interface">https://www.wireguard.com/quickstart/#command-line-interface

### Ubuntu

* <a href="https://gihyo.jp/admin/serial/01/ubuntu-recipe/0614">https://gihyo.jp/admin/serial/01/ubuntu-recipe/0614

### net.ipv4.forward = 1

* <a href="https://access.redhat.com/documentation/ja-jp/red_hat_enterprise_linux/6/html/load_balancer_administration/s1-lvs-forwarding-vsa">https://access.redhat.com/documentation/ja-jp/red_hat_enterprise_linux/6/html/load_balancer_administration/s1-lvs-forwarding-vsa

## ホスト

* クラウド Ubuntu 18.04LTS
* ローカル <s>Debian 10 Ubuntu 18.04LTS
* 執筆時点 2020/04/14 では Debian 10でwireguardをセットアップした際に `ip link add dev wg0 type wireguard` が `Unknown type` となってしまった為Ubuntuに変更

## セットアップ手順

* クライアント、サーバーともに `net.ipv4.forward = 1` を設定する。

### 概要

* ip コマンド + wg コマンドを使って設定する方法と、wg-quickを使う方法の2種類ある。
* wg-quick を使った方が楽なのでこちらを選択する（といってもあまり変わらないが）
* とりあえず公式のやり方等は一旦忘れる

### サーバー側、クライアント側共通
#### インストール

* sudo add-apt-repository ppa:wireguard/wireguard
* sudo apt-get update
* sudo apt-get install wireguard

#### 公開鍵、秘密鍵の生成

* sudo su -
* cd /etc/wireguard
* wg genkey > private  

Warning: writing to world accessible file.  

Consider setting the umask to 077 and trying again.
* chmod 077 private
* wg pubkey < private  

`CzAAAAAAAAAAAAAAAAAAAAAAAuVg=`    ←これを控えておく

### サーバー側

* サーバー側 configを作成 (/etc/wireguard/wg0.conf)

```
<code class="language-/etc/wireguard/wg0.conf">[Interface]
PrivateKey = サーバー側秘密鍵 (private) の中身をコピペ
ListenPort = 12345

Address = 10.240.0.1

[Peer]
PublicKey = クライアント側公開鍵
AllowedIPs = 10.240.0.20/32, 192.168.10.0/24
````

### ローカル側（クライアント側）

* クライアント側 configを作成 (/etc/wireguard/wg0.conf)

```
`[Interface]
PrivateKey = クライアント側秘密鍵 (private) の中身をコピペ

Address = 10.240.0.20
PostUp = iptables -A FORWARD -i wg0 -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PreDown = iptables -D FORWARD -i wg0 -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE

[Peer]
PublicKey = サーバー側公開鍵
EndPoint = example.com:12345
AllowedIPs = 10.240.0.0/24
PersistentKeepAlive = 30
````

### 接続開始

* サーバー側、クライアント側　両方で  `sudo wg-quick up wg0`

### systemdのserviceを有効化

* 起動時に自動的にVPNが貼られるようにする。
* サーバー、クライアント側両方で実行
* `sudo systemctl enable wg-quick@wg0.service`

## 備考

* サーバー側はポート開放が必要。
* wg pubkey < private は、privateの中身が同一であれば、何度やっても同じ結果が出る。
* <s>[TODO] systemd のunitファイルを書いていないので、サーバー再起動するとアウト

