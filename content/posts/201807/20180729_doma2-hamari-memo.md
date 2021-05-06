---
layout: post
title: "Doma2 ハマりメモ"
date: "2018-07-29 15:00:00 +0900"
categories: 
  - blog
---
## 環境

Doma2 + SQL Server  

# ハマりメモ
## Timestamp列があるテーブルにINSERTしようとしたらエラー

文字が化けてよく読めないが、DOMA2009が発生している模様。  

原因1:  

Timestamp列にデータをINSERTしようとしていた。  

Entityクラスの当該列を以下の感じにして、挿入、更新の対象外にした。  

```
`	@Column(insertable = false, updatable = false)
	LocalDateTime updateDate;
````

## Timestamp列があるテーブルをSELECTするとエラー

<a href="https://docs.microsoft.com/en-us/sql/connect/jdbc/using-basic-data-types">https://docs.microsoft.com/en-us/sql/connect/jdbc/using-basic-data-types  

によると、Timestamp列がマップされるのは、BYTE ･･･やってられないので、普通のDATETIME型にすることにした。  

