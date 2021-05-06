---
layout: post
title: "Google Homeに喋らせてみた"
date: "2019-12-08 13:51:00 +0900"
categories: 
  - blog
---
## さいしょに

本記事はただの学習記録です。  

## 環境

* Ubuntu 18.04.1 LTS
* node.js v10.14.1

# 失敗編
## この記事の内容を実行してみたかっただけ

<a href="https://qiita.com/SatoTakumi/items/c9de7ff27e5b70508066">https://qiita.com/SatoTakumi/items/c9de7ff27e5b70508066  

## 必要なライブラリ
```
`sudo apt install libavahi-compat-libdnssd-dev
````

### 蛇足

もし、 `apt install` がエラーになった場合は、 `/etc/apt/source.list` が以下のようになっているか確認して下さい。  

標準では、 main だけになっているはずです。  

```
`deb http://archive.ubuntu.com/ubuntu bionic main universe multiverse
deb http://archive.ubuntu.com/ubuntu bionic-security main universe multiverse
deb http://archive.ubuntu.com/ubuntu bionic-updates main universe multiverse
````

## コードを実行してみると･･･ 動かない（その1）

`Error: get key failed from google`  

APIの返り値が変わってしまった為に、google-tts-api ライブラリがエラーを吐いている模様。  


原因は以下のQiitaに詳しく書いてありました。  

<a href="https://qiita.com/ezmscrap/items/24b3a9a8548da0ab9ff5">https://qiita.com/ezmscrap/items/24b3a9a8548da0ab9ff5  


google-tts-api の新しいバージョンでは対応済みのようなので、 `package.json` の以下の行を書き換えてバージョンアップさせます。  

```
`# 20行目付近
   "google-tts-api": "0.0.2",
             ↓
   "google-tts-api": "0.0.4",
````

## コードを実行してみると･･･ 動かない（その2）

Webブラウザから、 `http://<host>:8091/google-home-notifier?text=Hello+Google+Home`  

を実行してみると、（大量のWARNINGはとりあえず無視して）  

```
`Error: connect ECONNREFUSED 192.168.1.20:8009
````


これは割と単純で、Google HomeのIPアドレスが分かっていない時に起きる。  

`example.js` の先頭に `var ip = '192.168.1.20'; // default IP` というところがあるので  

それを書き換える。  


なお、Google HomeのIPアドレスは、Google Homeアプリの設定画面の一番下に表示されている。  

これを直せばとりあえず動くはず。  


蛇足：  

すぐ上にGoogle Homeのデバイス名が設定されているが、これは間違っていてもIPアドレスが正しければ動く。  


(とりあえず初版)  

## IPアドレスが固定なのはさすがに酷い
### 対応その1

そもそも、READMEに書いてある通りの事をやっていなかった。  

<a href="https://github.com/noelportugal/google-home-notifier#after-npm-install">https://github.com/noelportugal/google-home-notifier#after-npm-install  


･･･やっても効果はなく、しかもnpmで入れたものに対して修正かけるのは反則なのでは･･･  

### 原理から考えてみる

Google Homeアプリは普通に自動的にGoogle Homeを発見できるので、何かのプロトコルで探索できるはず。  

というか、普通に `example.js`　が mDNS を呼んでいるのでこれで見つかるはず。  


でも、先にググってみたら既にQiitaにお書きになってる人がいらっしゃいました。  

<a href="https://qiita.com/tinoue@github/items/ecb8b6211bee686a75e8">https://qiita.com/tinoue@github/items/ecb8b6211bee686a75e8  


要するに、`example.js` のdevicenameに書く値が･･･というよりもう探索の仕方が（今となっては）正しくない。  

`example.js` のコードでは、現状実質IPアドレスベースで動かすしかない。  

### コード書いてみる

（今書いてます）  

