---
layout: post
title: "Raspberry Pi にbeepコマンドモドキを実装してみた"
date: "2017-06-12 15:00:00 +0900"
categories: 
  - blog
---
## 動機

なんとなく、Raspberry Piが起動したときに音を鳴らしたいなと思って、圧電ブザーを付けたら  

ビープ音で音楽を鳴らしてみたくなったので実装してみた。  

※実際の所は Python に慣れたかったから書いただけです。。  

## 参考にした所

圧電スピーカー（余興） | Feijoa.jp  

<a href="http://www.feijoa.jp/laboratory/raspberrypi/speaker/">http://www.feijoa.jp/laboratory/raspberrypi/speaker/  


ここのプログラムをベースにしました。セットアップ方法等はこちらをご参照下さい。  

## ソース

<a href="https://github.com/yakumo-saki/raspberrypi-beep">https://github.com/yakumo-saki/raspberrypi-beep  

こちらで公開しています。  

### 使い方１　（シンプル）

python beep.py 750 100  

750hz で 100ms ビープ音を鳴らします。  

### 使い方2 （beep互換）

python beep.py -f 750 -l 100 -n -f 300 -l 100  

オプションと値がくっついている形式はサポートしません。スペースで区切って下さい。  


サポートしているつもりのオプションは以下の通り。  


* -f (周波数hz) 省略可。省略時は 200hz
* -l (長さms)。 省略時は 100ms
* -n -new 複数のbeep音を指定する際のデリミタ
* -d -D (長さms) 無音を再生します
* -r (繰り返し回数) 最初から、もしくは前回の -r 以降を指定回数繰り返します

### ご注意＆TIPS

root権限が必要です。  

beepを連打して実行するような形式の場合、プログラム自体が多少時間がかかるため、  

音に隙間が空いてしまうのでご注意下さい。  

以下のように実行すると、隙間が空いてしまいます。  

```
<code class="language-shell-session">python beep.py -f 300 -l 100
python beep.py -f 400 -l 100
python beep.py -f 500 -l 100

# これならOK
python beep.py -f 300 -l 100 -n -f 400 -l 100 -n -f 500 -l 100

# シェルスクリプトに書くなら以下のようなのがよろしいかと
# 1行につなげて書いてももちろんOKですが、行が長すぎるとvimが重くなったりします。
python ./beep.py \
 -f 100 -l 53   -d 53  \
 -n -f 150 -l 53   -d 53  \
 -n -f 130 -l 53   -d 53  \
 -n -f 200 -l 200         \
 -n -f 220 -l 200
````

## beep音楽

以下の通り。ここのbeep音楽は大体再生できます。（なんか一部おかしいのもありますが）  


* <a href="https://www.kirrus.co.uk/2010/09/linux-beep-music/">https://www.kirrus.co.uk/2010/09/linux-beep-music/
* <a href="https://blog.dhampir.no/content/fun-with-beep">https://blog.dhampir.no/content/fun-with-beep

