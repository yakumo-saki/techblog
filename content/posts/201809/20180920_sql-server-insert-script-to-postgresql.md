---
layout: post
title: "SQL ServerのINSERTスクリプトをどうにかしてPostgreSQLに投入するメモ"
date: "2018-09-20 15:00:00 +0900"
categories: 
  - blog
---
## 要件

SQL ServerからPostgreSQLに移行するために、SQL Server Management Studioでスクリプト化したSQLをどうにかしてPostgreSQLに流したい。  

## 前提

* テーブル定義は手動で変換して、既にテーブル自体は作成済みの状態
* Windows上のSSMSで出力したSQLファイルをLinuxホストに持ってきた上で実行

## 変換

結論から行くと、以下のコマンドを使用した。  

各行の意図は後述  

```
<code class="language-bash"># コピペしても動かないです。1行にまとめてください。

nkf -Lu dbo.example.Table.sql
| tail -n +5 
| head -n 3      # この行はテスト用！
| sed -e 's/$/;/' 
| sed -e 's/\[dbo\]\.//' 
| sed -e 's/\[//g' -e 's/\]//g' 
| sed -e 's/DateTime/Timestamp/g' 
| sed -e 's/^GO//g' 
| sed -e 's/^INSERT/INSERT INTO/g' 
| head -n -1
> sql.sql
````


後半の `sed -e` を連打しているところは、ひとつの `sed -e 's/hoge/fuga/` -e 's/bar/baz/'` の形にまとめることが出来ます。まとめた方が恐らく早いですが説明しにくくなるのであえてわけてあります。  

## 各行の意図
### nkf

改行コードの変換。出力元がWindowsなので改行コードがCRLFになっているのでLFに。  

改行コードが違うと `sed` がまともに動かなかったりしてつらいです。  

```
`nkf -g dbo.example.table.sql
UTF-16
````


なのにも関わらず、処理後にASCIIになっているのは問題になるのか悩ましい。  

### tail

先頭のSQL Server用の指示をスキップさせている。  

### head

テスト用なので本番では外す。 `tail -n 10` にしてもよいが、ファイルを全部読んでしまうので遅くなる。  

### sed (1)

INSERT文の末尾に `;` がついていないので付ける  

### sed (2)

テーブル名が、 `[dbo].[example]` となっているので、`[dbo].` を削除  

### sed (3)

前段の置換で、テーブル名が、 `[example]` となっているので、`[]` を削除  

### sed (4)

SQL ServerのDateTime型はPostgreSQLでは Timestamp型にマップすることにしたので置換。  

CAST(N'2017-01-01T12:34:56.789' As Timestamp) はPostgreSQLでもそのまま通る。  

### sed (5)

`GO` は不要なので削除。空行が残りますが問題ありません。  

### sed (6)

SQL Serverでは `INSERT テーブル名` が通るが、PostgreSQLでは `INSERT INTO テーブル名` なのでINTOを補う  

### head

末尾に `SET IDENTIFY example OFF;` という行が含まれるのでそこを削除。  

### リダイレクト

説明不要だけど、ファイルに吐かせる  

## 蛇足

作成したSQLファイルは、 `psql` 内で `i ファイル名` とすることで実行できる。  

なお、トランザクションが設定されてないので、自動commitされることに注意。  

失敗したらTRUNCATE TABLEでテーブルをクリアしてから実行していたので、特にそのあたりはケアしていません。  


件数が多い場合は、`i sqlfile.sql` を実行する前に `begin transaction` しておいた方が早いかもしれません。  

※ 多分、INSERT一回ごとにCOMMITが暗黙でかかるはずなので  

その場合、進捗が分からないとつらいので、`GO` を `commit; begin transaction;` に置換すると良いかもしれません。  

（100行に1度挟まれています。）  


あと、件数の確認は確実に行ってください。それほど多くのパターンでテストしていないので行が欠けているかもしれません。（特に、先頭・末尾）  

