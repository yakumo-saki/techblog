---
layout: post
title: "EntityFramework （モデルファースト）+SQL Server で日付型を扱う時の罠"
date: "2016-03-23 15:00:00 +0900"
categories: 
  - blog
---
# 環境

Visual Studio 2015 (VB)  

EntityFramework 6.1.2  

SQL Server 2012 Express LocalDB  

## はじめに

Entity Frameworkを使ったモデルファーストの開発をすると、  

ER図を書くだけで  


* 自動的にエンティティクラスを定義してくれる
* 自動的にテーブル生成SQL文を作ってくれる  

など、便利です。

## 罠

しかし、日付型に関しては罠があります。  

エンティティクラスでは、日付型の列は DateTime型 にマップされます。(コード上は Date型ですが、Date型 = DateTime型 です)  

SQL Serverのテーブルでは、日付型の列は datetime型 として生成されます。  

一見、何の問題もなさそうです。型の名前も同じだし。  

ここに罠があります。  


.NetのDateTime型と同等以上の精度を持つSQL Serverの型は <em>datetime2 なのです。  

DateTime型の精度 2016/03/24 12:34:56.1234567  

datetime型の精度 2016/03/24 12:34:56.123  

なので、DBに値を保存するとき、後ろの4567は丸められてしまいます。  

## 何が問題？

EntityFrameworkを使って、日付型のデータを入れて、その値で検索をかけると  

ヒットしません。擬似コードで示すと以下のようなかんじです。  

```
<code class="language-vbnet">dim dt = Now
dim entity = DbContext.TestTable.create()
entity.dateTimeColumn = dt
DbContext.save() ' これでINSERT文が発行されるが、日付は丸められる

dim entity2 = (From e In DbContext.TestTable
               Where e.dateTimeColumn = dt).SingleOrDefault

' entity2は取得できていない
````


entity2を取得する為のLINQ to SQLが Where句 のパラメタを設定するとき、  

datetime2 でパラメタをセットするので、値が異なるとしてヒットしません。  

## 対策

秒以下を0にしてしまえば、問題無く処理されます。  

```
<code class="language-vbnet">Dim dtStr = Now.ToString("yyyy/MM/dd HH:mm:ss")
dim dt = Date.Parse(dt)

' dt.Milliseconds = 0 とはできない。残念ながらReadOnly
````

## 所感

思ったのは、Visual Studioのモデルデザイナ側で datetime2型でテーブルを  

生成するSQLを出力できれば良いのですが、モデルデザイナ上で選べる型は datetime  

しか存在しません。  

LINQ to SQL（のSQL Server向け実装）はDateTime型をdatetime2として扱うので、  

ちょっとミスマッチが起きてしまっています。今回は SQL Serverの話なのですが、  

Oracle等でも同様の罠が発生する可能性がありますのでご注意を。という話でした。  

