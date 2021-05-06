---
layout: post
title: ".NetのWebRequestのTimeoutはいつまでのタイムアウト？"
date: "2016-03-20 15:00:00 +0900"
categories: 
  - blog
---
## これは？

ただのメモです。  

WebClientはタイムアウト時間が設定できないのですが  

※設定する場合は、WebClientを継承する必要がある  

そもそも、タイムアウト時間ってダウンロードが始まるまでなのか  

ダウンロードが完了するまでなのか気になったのでテストしてみました。  

## テスト方法

HFS <a href="http://www.rejetto.com/hfs/?f=dl">http://www.rejetto.com/hfs/?f=dl  

を使って、帯域制御したHTTPサーバーをローカルに立ててテストしました。  

## 結論

WebRequestのタイムアウトは、最初の応答が返るまでのタイムアウトで、  

ダウンロード完了までのタイムアウトではありませんでした。  

そうじゃないと困るので安心しました。  

