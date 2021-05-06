---
layout: post
title: "docker-compose down時の SIGKILL が送られるまでの待ち時間を変更する"
date: "2019-12-14 13:57:00 +0900"
categories: 
  - blog
---
## まえがき

`docker-compose down` を実行した際にデフォルトでは `SIGTERM` が送信され、  

10秒以内にプロセスが終了しないと、 `SIGKILL` を送信するようになっている。  

大抵のコンテナは10秒以内に終了できるが、DBMS等のシャットダウンが必要なコンテナは  

タイムアウトが発生して `SIGKILL` されてしまう可能性がある。  


そこで、このタイムアウトを変更する方法をメモしておく  

## docker-compose.yml での指定

docker-compose.yml に `stop_grace_period` を追加する。  

<a href="https://docs.docker.com/compose/compose-file/#stop_grace_period">https://docs.docker.com/compose/compose-file/#stop_grace_period  

```
`version: '3'
services:
  db:
    restart: always
    image: postgres:11
    stop_grace_period: 1m   # ここ！
````

