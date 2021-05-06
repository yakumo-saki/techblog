---
layout: post
title: "EclipseからIntelliJ IDEAに乗り換えてやったことメモ"
date: "2017-05-27 15:00:00 +0900"
categories: 
  - blog
---
## バージョン情報

IntelliJ IDEA Ultimate 2016.2  

macOS Sierra  

## はじめに

EclipseからIntelliJ　IDEAに乗り換えたので変更した設定を列挙していきます。  

## キーバインド

キーバインドをEclipse (Mac OS X)に変更  

## フォーマッタ(JavaDoc)

Editor - Code Style - Java - JavaDoc -> Do not wrap one line comments にチェック  

```
`/** 項目名 */
String value;
が
/**
 * 項目名
 */ 
になるのを防止する。
````

## native2ascii時、実体参照を小文字にする

ちなみにPropertiesファイルはデフォルトではUTF-8で書く仕様（普通はこれでOK）  

native2asciiしたい場合は、  

Editor - File Encoinggs -> Transparent native-to-ascii conversion にチェック。  

これはプロジェクトごとの設定のようだ。(ということは、 .iml はgit管理した方がよい？）  


native2ascii実施時に、実体参照が大文字で出力されてしまうので、それを小文字（Eclipseと互換）にする為の設定。詳細は下記Qiita参照。  

<a href="http://qiita.com/shiena/items/5143a81f26907475713f">http://qiita.com/shiena/items/5143a81f26907475713f  

