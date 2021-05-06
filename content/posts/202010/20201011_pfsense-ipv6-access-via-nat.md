---
layout: post
title: "pfSenseでフレッツのIPv6を通す（IPv6 NAT)"
date: "2020-10-11 15:20:40 +0900"
categories: 
  - blog
---
## はじめに（前提・いいわけ）

* ひかり電話なし
* IPv6 NATしてしまうとエンドtoエンド通信ができなくてよろしくないみたいなのは一度置いておく
* pfSenseだとND Proxyがないので普通にIPv6を通すことは（ひかり電話なしでは）できない
* 手順といいつつ、終わったあとに書いているので手順がかなり怪しいです。

## 手順
### IPv6を許可する

<img src="/images/2020/10/20201011_202859.png" alt="20201011_202859" loading="lazy">  


System - Advanced - Networking の一番上、`All IPv6 traffic will be blocked by the firewall unless this box is checked` にチェックが入っていることを確認する  

### WANにIPv6を通す

DS-Liteで接続しているなら既に済んでいるはず。  

ONUに向かっているInterface（普通にやっていたらWAN）の `IPv6 Configuration Type` を `SLAAC`に設定。これでよしなにIPv6のアドレスを取得してくれる。  

### pfSenseのLAN I/FにIPv6アドレスを設定

今回はNATするつもりなので、ここで設定するIPv6アドレスはローカル限定のもの。  

うちの環境では `fc00:a::1` `/64` とした。 `fc00:〜〜〜` はユニークローカルアドレス（IPv4のプライベートアドレス的なものだと思う）なので何を振ってもよい。  


<img src="/images/2020/10/20201011_222232.png" alt="20201011_222232" loading="lazy">  


ここで固定IPアドレスを振っておかないと、あとでDHCPv6サーバーの設定に失敗する。  

### RAの設定

LANに対してRA(Router Advatise)を行うように設定する。これによりLAN内の端末は、IPv6のアドレスを得ることができるようになる。  


<img src="/images/2020/10/20201011_235114.png" alt="20201011_235114" loading="lazy">  


`Router mode` を `Unmanaged` に変更  

`Subnets` を `fc00:a::` `/64` と設定。  

`DNS Configuration` `DNS Server 1` を `fc00:a::1`(pfSenseのLAN向きのIPアドレス）  


ひかり電話を契約していれば、ここで上位からもらったアドレス帯(/56)を分割してNATなしで扱えるのだけれども…  

### NAT6の設定

`Firewall - NAT` の `Outbound` タブにルールを追加する。  

`Outbound NAT Mode` は `Hybrid Outbound NAT rule generation. (Automatic Outbound NAT + rules below)`  を選択している。  


しかし、IPv6のNATは自動で定義されることはない（そりゃそうだ）  


<img src="/images/2020/10/20201012_000228.png" alt="20201012_000228" loading="lazy">  


Interface `WAN`  

Address Family `IPv6`  

Protocol `Any`  

Source `Network` `fc00:a::` `/64`  

Destination `Any`  

### Firewallの設定

<img src="/images/2020/10/20201012_000228-1.png" alt="20201012_000228-1" loading="lazy">  


IPv6を許可するルールを `INTRA` （LANインターフェイス）のルールに追加。  

### ここまでのテスト

`ping6 2001:4860:4860::8888` でpingしてみる（宛先はGoogle public DNS)  

OKであれば次へ。  

### システムDNSの設定

System / General Setup 内の DNSサーバーのところに  

`2404:1A8:7F01:A::3` `2404:1A8:7F01:B::3` を指定する。  

(なお、これはNTT東日本の場合。西日本の場合はおそらく異なると思われる）  

### DNSの設定

DNS Resolverを有効にする。だけ。  

もし、Firewallで弾かれるようであれば（うちはこれに該当した）  


`Firewall - Rules` の `Floating` に次のルールを追加する  

Action `Pass`  

Interface `INTRA` （LANのインターフェイス)  

Direction `in`  

Address Family `IPv4/IPv6`  

Protocol `TCP/UDP` (最近のDNSはTCPも使うようなので）  

Source `Any`  

Destination `This Firewall` Port from `DNS(53)` to `DNS(53)`  

### DNSのテスト

適当なクライアントから `nslookup www.google.com` or `host www.google.com` して  

```
`www.google.com has address 172.217.161.68
www.google.com has IPv6 address 2404:6800:4004:80b::2004
````


IPv6のアドレスが帰ってくればOK  

## その他

* 一つづつ設定を変えて、ちゃんとIPv6アドレスが取得できるか？ traceroute6が通るか、と確認しながらやっていった。
* 正直、NATしてしまって良いのであれば、ND Proxyとか考えるよりこちらの方が話が早いように思える。
* ただし、外から見たときにpfSenseがもっているWANのIPv6アドレスが常に見えるのでこれによる不具合が起きる…かもしれない？（IPv6 NATを意識していないなにかの場合）

