---
layout: post
title: "EclipseのパッケージエクスプローラーのFQCN表示が長すぎるので縮めたい"
date: "2015-08-27 15:00:00 +0900"
categories: 
  - blog
---

Eclipse標準で表示を短縮する方法がある。  

## 方法１

設定 -> Java -> 外観 を選択し（設定 -> 一般 -> 外観 ではない)  


最終セグメントを除く、すべてのパッケージ名セグメントを圧縮にチェックを  

入れて、圧縮パターンテキストボックスに、 "1." と入力する。  

するとcom.example.appname.longname.MyPackage が c.e.a.l.MyPackage  

と表示されるようになる。(SpringBootでおなじみの形式)  

要するに、最後の部分以外を、 n文字に縮める。という設定  

```
`com.example.appname.longname.MyPackage
"0" -> MyPackage   #最後以外表示しない
"." -> ....MyPackage   #最後以外は、"." にする
"1." -> c.e.a.l.MyPackage #最後以外は、先頭1文字だけ表示
"1~." -> c~.e~.a~.l~.MyPackage # 数字以外はそのまま表示される
````

## 方法２

設定 -> Java -> 外観 を選択し　（方法１と同じ）  


パッケージ名の短縮にチェックを入れる。  

ルールテキストボックスに、短縮ルールを記述する。1ルール1行  

```
`com.example.appname.longname.MyPackage

com.example.appname.longname=appname #appname.MyPackageと表示される
````

## まとめ

好きな表示にカスタマイズできるし、わかりやすいという意味で方法２の方が私は好みです。  

Eclipseの機能なので、Eclipseベースの他のIDEでも使えるはずです。  

（少なくとも Spring Tools Suite 3.6.4 では使えました）  

