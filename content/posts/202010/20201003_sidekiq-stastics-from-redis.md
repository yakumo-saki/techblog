---
layout: post
title: "Sidekiqの状況をRedisから取得する"
date: "2020-10-03 04:05:33 +0900"
categories: 
  - blog
---

Zabbixにデータを送信したかったので調べてみた。  

```
<code class="language-sh"># 件数
完了 `redis-cli get stat:processed`
103399489

失敗 `redis-cli get stat:failed`
1143243

デッド `redis-cli zcard dead`
311
(redis-cli内から実行すると) => (integer) 311

リトライ `redis-cli zcard retry`
予定 `redis-cli zcard schedule`

# キュー名一覧
`redis-cli SMEMBERS queues`
1) "pull"
2) "push"
3) "default"
4) "mailers"

# 各キューのジョブ数
`redis-cli llen queue:キュー名`

例）
`redis-cli llen queue:default`
10
````

