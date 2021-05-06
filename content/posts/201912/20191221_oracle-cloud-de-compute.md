---
layout: post
title: "Oracle Cloud で Compute にWebサーバーを立てたメモ"
date: "2019-12-21 14:08:00 +0900"
categories: 
  - blog
---
## はじめに

Oracle CloudのAlways Free枠、シビれましたね。  

何がすごいって、O(racle)CPU 1個、メモリ1GBのVMインスタンスを2個も作らせてくれると。  

OCPUはXeonの物理1コア+HTをそのまま割り当てするので、OSから見ると2コアです。すげー。  

ということで、ホイホイ釣られてサーバーとして使用している機能を一部試しに移してみようと思ったらハマったので記事化することにしました。  


個人的な好みで Ubuntu 18.04LTS を使用します。  

## Oracle Cloud上での作業

Computeを作成します。ここはWebから普通に作業すれば良いので省略します。  

サーバーへの接続（ssh)も省略します。 接続後、 `apt install nginx` したものとして記述します。  

### ハマりポイント

*インスタンス名は、あとから変更できません*  

Webからは変更できなそうです。CLI使うと変更できるかもしれません。  


*インスタンス名は、Computeのホスト名として使用されてしまう*  

日本語を入れるとsudoするたびに怒られます。  

hostnamectlを使ってホスト名を変更し、 /etc/hosts に 127.0.1.1  yourhostname という感じに記述すると治ります。  

## 作業手順
### セキュリティリストの編集

* 左ペインの、 `ネットワーキング→仮想クラウド・ネットワーク` を選択
* `VirtualCloudNetwork-201909xx-xxxx` のような名前のVCNを選択。
* サブネット `Default Subnet for xxx` を選択。
* セキュリティリスト `Default Security List for Virtual...` を選択
* イングレス・ルールの追加をクリック
* ソースタイプ `CIDR`、ソースCIDR `0.0.0.0/0` IPプロトコル `TCP` ソース・ポート範囲 `All` （空欄にするか All と入れる） 宛先ポート範囲 `80` を指定して、イングレス・ルールの追加 ボタンをクリック


※ default security list をいじるのではなく、セキュリティリストを追加すべきですが手順短縮の為にこうしています。  


この手順で、Compute(=VM)まで 80番宛のパケットが届くようになります。  

### OSのファイヤウォールの設定

Ubuntu 18.04 のイメージでは、iptablesが最初から有効になっています。  

Oracle Cloud用のルールが入っているので、UFWに乗り換えるのは大変そうです。  

仕方が無いので、iptablesに設定を入れていきます。  

お行儀がわるいのですが、ルールファイルを直接編集します。  

`vi /etc/iptables/rules.v4`  (/etc/sysconfig/iptables ではありませんでした）  

```
<code class="language-/etc/iptables/rules.v4">-A INPUT -p udp --sport 123 -j ACCEPT
-A INPUT -p tcp -m state --state NEW -m tcp --dport 22 -j ACCEPT
-A INPUT -p tcp -m state --state NEW -m tcp --dport 80 -j ACCEPT  <= この行追加
-A INPUT -j REJECT --reject-with icmp-host-prohibited   <= これより前に追加すること
````


編集後に、 `/etc/init.d/netfilter-persistent reload` を実行します。  

これで、外からのhttpアクセスを受け付けられるようになりました。  

## 蛇足

httpアクセスだったらLoadBalancerとか使うべきかもしれませんが、あれはAlways Free枠ではないので割愛。  

