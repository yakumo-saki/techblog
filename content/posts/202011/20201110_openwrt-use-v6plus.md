---
layout: post
title: "OpenWRTでV6プラス(MAP-E)に接続する"
date: "2020-11-10 15:26:30 +0900"
categories: 
  - blog
---
## 前提条件

* OpenWRT 19.07.4 r11208-ce6496d796 (WSR-1166DHP)
* WAN6にIPv6-PDが表示されている(/openwrt-ipv6-to-lan-without-hikari-denwa/)
* プロバイダはso-net、V6プラスオプションを契約済み

## 手順

本当ならLuciで設定…と行きたいところだが、Javascriptエラーで設定できない。  

修正自体はされているようなので次のリリースでは治りそう（だと思われる）  

### mapパッケージインストール

ここだけはWebからできる。  

`System-Software` から `map` パッケージをインストールする。  

### MAP-E パラメータの計算

<a href="http://ipv4.web.fc2.com/map-e.html">http://ipv4.web.fc2.com/map-e.html  


MAP-E接続に必要なパラメータ類はIPv6に割り当てられたアドレスから算出できる。  

自分のIPv6アドレスを入力して算出してもらう。  

### MAP-Eインターフェイスの設定

ここからはSSH等でOpenWRTに接続する必要がある。  

#### /etc/config/network の設定

`/etc/config/network` に以下を追記する。これにより `mape` インターフェイスが作成される。  

```
`config interface 'mape'           
        option proto 'map' 
        option type 'map-e'
        option mtu '1424'
        option encaplimit 'ignore'
        list tunlink 'ONU6'   # ONU6は当方環境。通常はWAN6  
        # ↑ここまで固定
        # ↓ここからは算出結果の下に書いてあるのをコピペ
        # ↓この設定をコピペしても動かない
        option peeraddr '2404:9200:225:100::64'
        option ipaddr '106.72.0.0'
        option ip4prefixlen '15'
        option ip6prefix '240b:10::'
        option ip6prefixlen '31'
        option ealen '25'
        option psidlen '8'
        option offset '4'
````


編集が終わったら  


`uci commit /etc/config/network`  


で設定を反映させる。  

#### /etc/config/firewall

`mape` インターフェイスがどこにも属していないので `WAN` グループに属させる  

```
`config zone
        option name 'wan'
        option input 'REJECT'
        option output 'ACCEPT'
        option forward 'REJECT'
        option masq '1'
        option mtu_fix '1'
        option network 'wan wan6 ONU ONU6 mape'   # この行に mape を追加
````


`uci commit /etc/config/firewall` で反映させる  

#### map.sh

MAP-Eの細かい設定等を入れる。  

参照→ <a href="https://gist.github.com/anonymous/0fdec75fa20a7f1ce4806391d6b0429b">https://gist.github.com/anonymous/0fdec75fa20a7f1ce4806391d6b0429b  

ここでコメントを入れている人は本件の修正を入れてくれた人。ありがたい。  


`/lib/netifd/proto/map.sh.orig /lib/netifd/proto/map.sh` を編集  


変更箇所  

```
`# uncomment for legacy MAP0 mode
#export LEGACY=1 
# コメントアウトされているので外す
export LEGACY=1 
````

```
`json_add_boolean connlimit_ports 1
# json_add_boolean -> string
json_add_string connlimit_ports "1"
````


これはuci commit 不要  

### MAP-E インターフェイスの開始

ここからはLuciで操作できる。（設定変更はできないが見ることはできる）  

`Network-Interface` から `mape` を Restart させると接続されるはず。  

また、接続されると自動的にデフォルトゲートウェイがMAP-Eに向く。  


うまく接続されない場合は、SSHから logread -f をすることでログを見ながら  

MAP-E をRestart するとなにかエラーがでるはず。  

## 残っている問題等
### Local address not yet configured!

MAP-Eを接続した際に上記メッセージが複数（8個くらい）表示されるが接続されているので  

とりあえず無視。  

### 一部サイトが見れない

ここのブログ主と同じく、一部のサイトへの接続が失敗したり、すごく遅かったりする。  

<a href="https://blog.misosi.ru/2019/12/14/openwrt-v6plus-stuck/">https://blog.misosi.ru/2019/12/14/openwrt-v6plus-stuck/  


具体的には上記ブログの内容からだが、  


* <a href="https://www.nichiban.co.jp/general/health/foot/corn/speelko_ex/">https://www.nichiban.co.jp/general/health/foot/corn/speelko_ex/ は異様に遅い。
* <a href="https://www.nichiban.co.jp/">https://www.nichiban.co.jp/ 表示されるが画像や動画が抜ける。


その他、Skypeのログインが遅くなる、音声がおかしくなる等…  

OpenWRTでのMAP-E接続はまだ色々とあるのかもしれない。  

## 参考資料

* 徹底解説V6プラス(無料) <a href="https://www.jpne.co.jp/books/v6plus/">https://www.jpne.co.jp/books/v6plus/

