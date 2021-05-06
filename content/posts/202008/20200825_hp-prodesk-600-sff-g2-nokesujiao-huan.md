---
layout: post
title: "HP Prodesk 600 SFF G2 のケース交換"
date: "2020-08-25 04:09:00 +0900"
categories: 
  - blog
---
## まえがき

やめておいたほうがいい。 まったく得しないしめんどくさい。  

## tl;dr;

* 起動時にUSBコネクタが接続されていないエラーが表示される（Enterキーをおさないと進まない）
* 起動時に背面ファンエラーが表示される。（Enterキーをおさないと進まない） 元の筐体にも背面ファンなんか無いのに
* ロープロファイルからは開放されたが、電源ユニットが240wなのでつらいはつらい。

## モチベーション

* Prodesk 600 SFF の筐体は、ロープロファイルの拡張カードしか刺さらなくて色々と面倒
* ちょうど、PCケースのあまりがあった。

# 入れ替えプラン

HP Prodesk 600 SFF 純正筐体→Antec NSK 2480 (MicroATXまでのケース）  

## 電源の話

* これが原因でケース載せ替えてもまったくうれしくない
* 電源供給周りが専用仕様で、交換が一切効かない。
* 電源ユニット→マザーの電源ピンは 6ピンの信号線ぽいの（横一列）と、ATX12V（CPU電源、これは普通の規格品）、PCI-e 6ピン（グラボに指すやつ。あれがマザーに刺さる） で構成されているっぽい。


Amazonで普通のATX電源ケーブルからの変換もあるようだが試していない <a href="https://www.amazon.co.jp/dp/B08B6D5KWC">これとか <a href="https://www.amazon.co.jp/dp/B06XW7RWNH">これとか <a href="https://www.amazon.co.jp/dp/B077PXQL71">これとか  

特に <a href="https://www.amazon.co.jp/dp/B07PNGTB2Y">これ は対応機器に普通に600 SFF G2が入っているので使えるだろうなぁ。という感じ。  


試していないから何とも言えないけれども、写真と実物を見比べた限りではうまく行きそうに見える。電圧の変換を行うとかそういうことはしないだろうから、ピン配列さえあっていれば動く…はず。  


2020/09/08 追記  

<a href="https://www.amazon.co.jp/dp/B07PNGTB2Y">この変換ケーブルでATX電源から変換してみたが、きっちり動いている。マザーボードからSATAの電源が取れるのはすごい便利。  

## マザーボードのピン配置

これが書きたかった  

```
`↑CPU
12n34
56789
````


* 1&amp;2 1側が+で、電源LED
* 5&amp;6 5側が+で、HDD LED
* 7&amp;8 電源ボタン
* 残りは不明

## その他
### CPUファン

CPUファンは、ネジ止め式だがネジの受けがケース側にある。 しかし、サイズの合うナットを裏につけてしまえば問題なく止めることができる。  

ダイソーで売っているボルト・ナット・ワッシャーセット M4~M6 のM4のナットがぴったり合う。  

CPU側のスプリングを潰しながら（ようするにドライバーでネジを押し回し）すれば締めることができる。  

CPUグリスはカピカピになっているので安物でもいいから塗り直したほうが良い。  

ひとつだけ朗報なのは、プラスチックの風道パーツは、かぶさっているだけなので手で引っ張れば外れる。  

そして中身はおそらくIntel純正のCPUクーラー。ケースを替えても困らない。  

### マザーボード

サイズは普通にmicroATXのようだ。  

ネジ穴の位置も、普通のマザーと変わらない。  

### ネジ

すべてのネジがちょっと妙なネジになっていて扱いづらいので、普通のネジに交換した。  

### スピーカー

元の筐体からもぎ取ればいいのだが、ネジがトルクスかなにかになっていて取れないので諦めた。  
