---
layout: post
title: "zabbixでmastodonの監視をしてみた"
date: "2018-08-08 15:00:00 +0900"
categories: 
  - blog
---
## 環境

* Ubuntu 18.04
* mastodon 2.4.3
* redis-cli 4

## やったこと

<a href="https://github.com/ken-washikita/zbx-templates-mstdn">https://github.com/ken-washikita/zbx-templates-mstdn  


このセットをつかっただけ。  

## ハマりポイント

redis-latency スクリプトが正常な値を返さなくて、値が取得できなかった。  

## 対策

redis-latency.sh を以下のように書き換えた。  

```
`#!/bin/bash

WORKFILE=/var/tmp/redis-latency
SAVEFILE=/etc/zabbix/redis/redis-latency

redis-cli --latency > $WORKFILE
cat $WORKFILE | cut -d ' ' -f 2 > $SAVEFILE
````

## 原因

ターミナルから、 `redis-cli --latency` を実行すると出力は以下のようになる。  

```
`min: 0, max: 1, avg: 0.25 (165 samples)
# CTRL+Cで停止するまで更新し続ける。
````


しかし、出力をリダイレクトすると、値のみが出力されるように変更された模様。  

```
`$ redis-cli --latency > file
$ cat file
0 1 0.25
````


なお、元のスクリプトがmax を取得していたので、変更したスクリプトもそれに習っている  

## 蛇足
### cronの設定

コマンドが標準エラー出力になにか吐いているのがいるので、それは捨てるかなにかしないと、メールがえらい数とんできて大変なことになります。（なりました）  

### redisのバージョン

Mastodon Production Guideに従った場合、redisはディストリビューションの標準バージョンが入るのですが、Ubuntu 16.04LTSの場合は3.xで、この場合は元のスクリプトそのままで動きます。  

### postgresの監視は？

個人的にはmamonsuがおすすめです。ただし、postgresはユーザー名／パスワードで認証するために、pg_hba.confの修正が必要なのでそれを忘れると動きません。ハマるので注意！  

