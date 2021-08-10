---
title: Doma2 ハマりメモ
permalink: /p/88b558dfbbfd47c7bde7aea1ddfafb1c
tags: []
date: 2018-07-29 03:00:00
updated: 2021-07-29 02:17:36
---

## 環境

Doma2 + SQL Server

# ハマりメモ

## Timestamp 列があるテーブルに INSERT しようとしたらエラー

文字が化けてよく読めないが、DOMA2009 が発生している模様。

原因 1:

Timestamp 列にデータを INSERT しようとしていた。

Entity クラスの当該列を以下の感じにして、挿入、更新の対象外にした。

```
`	@Column(insertable = false, updatable = false)
	LocalDateTime updateDate;
```

## Timestamp 列があるテーブルを SELECT するとエラー

<a href="https://docs.microsoft.com/en-us/sql/connect/jdbc/using-basic-data-types"><https://docs.microsoft.com/en-us/sql/connect/jdbc/using-basic-data-types>

によると、Timestamp 列がマップされるのは、BYTE ･･･やってられないので、普通の DATETIME 型にすることにした。
