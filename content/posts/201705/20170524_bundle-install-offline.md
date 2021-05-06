---
layout: post
title: "bundle installをオフラインで実行する"
date: "2017-05-24 15:00:00 +0900"
categories: 
  - blog
---
## 環境

Ruby 2.2 (Windows x64)  

Bundler 1.12.5  

## 前提

* 本番環境のサーバーはインターネット接続不可
* 開発用に使ってるPCはインターネット接続可

## 手順

開発機で、使用するgemを全てダウンロードさせる。  

```
<code class="language-bat:開発機上で実行する">cd railsアプリケーションのパス

rem とりあえず普通にbundle install
bundle install

rem これで、 vendor/cache に使用するgemファイルが全部キャッシュされる
bundle package --all
````


開発機上の vendor/cache 内のファイルを何らかの方法で、サーバー上の vendor/cache にコピーする  

＃ここが一番問題という説もある。USBメモリ使うなり、共有サーバー使うなりでなんとかする  

```
<code class="language-bat:サーバー上で実行する">cd railsアプリケーションのパス

rem --pathは普通不要な気がするが念のため
bundle install  --path vendor/bundle --local
````


これで、サーバー機がインターネットに接続されていなくてもRailsアプリを起動できるはず。  

## その他

bundle install中の、Native Extensionのコンパイルがcygwinのエラーでコケた場合は  

とりあえず、Windowsを再起動してもう一度やってみるとうまく行く事が多い。  

```
<code class="language-text:エラー例">make.exe: *** Couldn't reserve space for cygwin's heap, Win32 error 0
````

## 雑記

Windows上でbundle install をオンラインでやろうとするとcacert.pemがどうしたとか  

色々と面倒な部分があるのでデプロイはこれで良いんじゃないかという気がする。  

gemをダウンロードしてこない分、高速にデプロイできるというメリットもある。  

## 参考にしたURL

Bundlerめも  

<a href="https://gist.github.com/kozy4324/5719555">https://gist.github.com/kozy4324/5719555  


bundle packageでgemをアプリケーションに含める <a href="http://qiita.com/ryo0301/items/e6c8dad0e8d66ab33ab7">http://qiita.com/ryo0301/items/e6c8dad0e8d66ab33ab7  


Windows上のRubyでSSL接続時にcertificate verify failedが出る場合の対処 <a href="http://qiita.com/whiteleaf7@github/items/4504b208ad2eec1f9357">http://qiita.com/whiteleaf7@github/items/4504b208ad2eec1f9357  

