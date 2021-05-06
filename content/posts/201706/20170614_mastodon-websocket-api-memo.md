---
layout: post
title: "MastodonのWebSocket APIのメモ"
date: "2017-06-14 15:00:00 +0900"
categories: 
  - blog
---
## はじめに

Mastodonからストリームで取得する際のAPIに関するメモ。  

## 基本形
```
`wss://example.com/api/v1/streaming?access_token=xxxxxxxx?stream=TYPE
````


access_token は事前に取得する必要がある。  

## TYPE一覧

なぜかドキュメントに載っていないものがあるが、以下の通り。  

<table>
<thead>
<tr>
<th style="text-align:center">TYPE
<th style="text-align:left">内容


<tbody>
<tr>
<td style="text-align:center">public
<td style="text-align:left">連合タイムライン

<tr>
<td style="text-align:center">public:local
<td style="text-align:left">ローカルタイムライン

<tr>
<td style="text-align:center">user
<td style="text-align:left">ホーム

<tr>
<td style="text-align:center">hashtag
<td style="text-align:left">ハッシュタグ（連合）？

<tr>
<td style="text-align:center">hashtag:local
<td style="text-align:left">ハッシュタグ（ローカル）?




ソース  

<a href="https://github.com/tootsuite/mastodon/blob/master/streaming/index.js#L376">https://github.com/tootsuite/mastodon/blob/master/streaming/index.js#L376  

