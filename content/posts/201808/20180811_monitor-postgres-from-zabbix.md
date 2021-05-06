---
layout: post
title: "zabbixからpostgres監視"
date: "2018-08-11 15:00:00 +0900"
categories: 
  - blog
---
## 環境

* Ubuntu 18.04
* Postgres 10.5
* zabbix 3.4

## 選択肢
### pg_monzII

<a href="http://pg-monz.github.io/pg_monz/">http://pg-monz.github.io/pg_monz/  

国産。多機能っぽいけどその分つらい。Active Check使うからテストできない。  

グラフが死ぬほどある。 複数台の構成でも監視可能ぽい。  

### PostgreSQL Monitoring for Zabbix

<a href="https://share.zabbix.com/databases/db_postgresql/postgresql-monitoring-for-zabbix">https://share.zabbix.com/databases/db_postgresql/postgresql-monitoring-for-zabbix  

libzbxpqなるモジュールを入れるのが面倒そうだった。Ubuntu Trustyくらいまでしかバイナリがない。早そうだけどちょっと… ソースからコンパイルもできるようだけれどもコンパイルにzabbixのソースがいるとかいろいろとあって断念。  

### mamonsu

<a href="https://github.com/postgrespro/mamonsu">https://github.com/postgrespro/mamonsu  

別のエージェントを実行。取説が割と親切でそのとおりに進めばなんとかなる。別のエージェントが起動してしまうのはいかがなものかと思わなくもないけれども、逆にzabbix-agentとは別のエージェントが起動するので干渉しないとも言える…  

私はこれを採用しました。  

## 蛇足

Twitterに書こうと思ったら文字数足りませんでした。  

