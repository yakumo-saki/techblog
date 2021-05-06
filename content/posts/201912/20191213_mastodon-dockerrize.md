---
layout: post
title: "Mastodonの非Docker→Docker化"
date: "2019-12-13 13:56:00 +0900"
categories: 
  - blog
---
## 環境

* 元サーバー：非Dockerで稼働中のMastodonサーバー
* 新サーバー：Docker及びdocker-composeインストール済みのサーバー
* 作業PC：作業を行うPCです。SSHとSCPがあるとよいです。

## 移行の大枠

考え方としては、DBと `.env.production` ファイルを移行すればOK。  

ただし、Redisのデータを移行しないとSidekiqのジョブのカウントが0に戻って少し悲しい。  

## 移行手順
### （元サーバー）から `.env.production` を取得する

そのままなので詳細は割愛。新サーバーにコピーしておく。  

### （新サーバー）`docker-compose.yml` の準備

<a href="https://github.com/tootsuite/mastodon/blob/master/docker-compose.yml">https://github.com/tootsuite/mastodon/blob/master/docker-compose.yml を取得して、変更を加える  

この変更はdocker-compose upを行う前に実施する（postgresの初回起動時に初期化が行われるため）  

```
<code class="language-yaml:docker-compose.ymlの抜粋">  db:
    restart: always
    image: postgres:11    # 9だったが11にした
    networks:
      - internal_network
    environment:          # この部分追加
      POSTGRES_USER: root # 元サーバーと合わせると楽
      POSTGRES_PASSWORD: rootpwd   # パスワードは変えて下さい
      POSTGRES_INITDB_ARGS: "--encoding=UTF-8"
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "root"]    # postgresになっているので修正
````

### （新サーバー） `.env.production` の修正

DBサーバー、REDISサーバーの接続先が変更になるので修正する。  

```
<code class="language-ini:.env.production">REDIS_HOST=redis     # docker-compose上の名前が解決できるのでこれでOK
REDIS_PORT=6379

DB_HOST=db           # docker-compose上の名前が解決できるのでこれでOK
DB_USER=root         # 上で設定した内容に合わせる
DB_PASS=rootpwd      # 上で設定した内容に合わせる
DB_NAME=mastodon_db  # あとで作成するDB名に合わせる
DB_PORT=5432
````

### redis

データ移行を行わなくても問題ないが、行うのであれば、元サーバーを停止した状態で  

redisのデータファイルをコピーすればOK。  

### PostgreSQL

これが一番移行が面倒。新サーバーで `docker-compose up -d` を実行して一度全て起動させる。  


* （元サーバー）サービスを停止する。


データロスがちょっとあっても良いのであれば止めなくても問題はない（と思われる）  


* （元サーバー） DBバックアップの取得


元サーバーで、以下を実行。（DBが別サーバーであれば、 -h 等を追加して下さい）  

`pg_dump --dbname=<元のDB名> > mastodon.sql`  


* （作業PC）バックアップをdockerコンテナに転送する


一番簡単なのは、PostgreSQLコンテナのデータ領域にファイルを投げ込んでしまうこと  

特に変更していなければ、`docker-compose.ymlがあるディレクトリ/postgres` にSQLファイルをコピーすればよい  


* （新サーバー）データベース等の作成

```
`docker-compose exec db bash
# psql
root=# create database mastodon_db;
root=# \q
````


* （新サーバー）（オプション） ダンプファイルの修正


元サーバーでのDBユーザー名が新サーバーと異なる場合、ダンプファイルを修正する。  

```
`# cd /var/lib/postgresql/data
# cat mastodon.sql | sed s/元サーバーでのユーザー名/新サーバーのユーザー名/ > mast.sql
````


* （新サーバー）ダンプの取込

```
`# cd /var/lib/postgresql/data
root=# \c mastodon_db
mastodon_db=# \i mast.sql
（インポートの表示が大量にでる）
````

### Web / streaming / Sidekiq

これらは特にデータを持たないので特段の対応は不要。  

## 終わり

ここまで来たら、正常に動くはずです。おつかれさまでした。  

ディスク容量節約のために、転送したバックアップファイルを削除するとよいでしょう。  

## 蛇足1 docker ps すると unhealthy と表示される件

ちなみに webとstreamingのhealthcheckのwgetのパラメタが  

`--proxy off` （proxyとoffの間がスペース） の場合、 `--proxy=off` にしないと、`docker ps` した際に  

`status: unhealthy` となってしまう。(v2.8.0以降であれば修正済み）  

<a href="https://github.com/tootsuite/mastodon/pull/10553/files">https://github.com/tootsuite/mastodon/pull/10553/files  

```
<code class="language-yaml">    healthcheck:
      test: ["CMD-SHELL", "wget -q --spider --header 'x-forwarded-proto: https' --proxy=off localhost:3000/api/v1/instance || exit 1"]

````

## 蛇足2 SideKiqのスレッド数の変更

docker-compose.yml のcommand行を変更すれば可能。  

```
`    environment:
      DB_POOL: 20                          # DBコネクションプール
    command: bundle exec sidekiq -c 20     # -c 20 で20スレッド
````

## 蛇足3 PostgreSQLのパラメタ変更

公式イメージを使用しているのでパラメタの変更にはconfの上書きが… 不要です！  

```
`$ docker-compose exec db psql

root=# ALTER SYSTEM SET shared_buffers = "384MB";
ALTER SYSTEM
root=# ALTER SYSTEM SET max_connections = 100;
ALTER SYSTEM
````


<a href="https://pgtune.leopard.in.ua/">pgtune を使用すると `ALTER SYSTEM` の形で適切と思われるパラメタを表示してくれます。  

<img src="https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/2454/5ce0d4ca-fe56-65ca-c80b-43d208200484.png" alt="image.png" loading="lazy">  


なお、ALTER SYSTEM を行うと、 `postgresql.auto.conf` ファイルに設定内容が書き込まれて、永続化されるそうです。  

<a href="https://www.postgresql.jp/document/11/html/sql-altersystem.html">https://www.postgresql.jp/document/11/html/sql-altersystem.html  


PostgreSQLの起動中に変更ができないパラメタは、次回起動時から有効になります。  

PostgreSQLを再起動するまでは、PgHeroの表示は前の値のままですのでご注意下さい。  

