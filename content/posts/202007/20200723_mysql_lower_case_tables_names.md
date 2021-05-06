---
layout: post
title: "MySQLのlower_case_tables_namesでハマった"
date: "2020-07-23 16:40:00 +0900"
categories: 
  - blog
---
## まえがき

Windowsで開発していたJava + MySQLのプロジェクトの開発をLinuxデスクトップで  

引き継いでみようと思ってやってみた。  

## 本文

大枠としては普通に動いた。 IntelliJ IDEA は普通にLinux版がある。  

MySQLももちろんLinux版がある。  

Javaもバッチリ。  


ではOKと思ってシステムを起動してみると、MySQLのテーブルがないといって落ちる。  

データはWindows上で動いてたときのをそのままdump/restoreしたのに。  

## 原因

* MySQLがテーブル名大文字小文字を区別するか否かは lower_case_tables_names という設定で変わる
* 公式 <a href="https://dev.mysql.com/doc/refman/8.0/en/identifier-case-sensitivity.html">https://dev.mysql.com/doc/refman/8.0/en/identifier-case-sensitivity.html
* この設定はOSによって初期値が異なり、簡単に言えば Windows / macOS は大文字小文字を区別しない。Linuxではテーブル名の大文字小文字を区別する。
* で、システム内のSQLを見ると…大文字小文字がDB上のと全然違うので「なるほどね。。」と

## 蛇足

* lower_case_tables_names は、dumpを取り込む前にセットした方がいいです。（ファイル名の取扱が変わるため）
* 当方の環境ではとりあえず、 lower_case_tables_names = 1 をセットしてOKとなりました。

