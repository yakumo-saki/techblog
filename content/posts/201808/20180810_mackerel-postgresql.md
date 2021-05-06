---
layout: post
title: "Mackerelを入れてpostgres監視するまでのメモ"
date: "2018-08-10 15:00:00 +0900"
categories: 
  - blog
---
## 環境

* Ubuntu 18.04LTS
* Mackerel

## 手順
### Mackerelエージェントを入れる

<a href="https://mackerel.io/ja/docs/entry/howto/install-agent">https://mackerel.io/ja/docs/entry/howto/install-agent  

Ubuntu16以降なので以下のコマンド。と言っても、MackerelのWebにログイン状態で、Hosts→右上のエージェントをインストール　を選択するとOSの選択肢が表示されて、そこから選ぶとコマンドが完璧な形で表示されるのでそこをコピペすることをおすすめします。  

```
`wget -q -O - https://mackerel.io/file/script/setup-all-apt-v2.sh | MACKEREL_APIKEY='<YOUR_API_KEY>' sh
````

### Mackerel Agent Plugin を入れる

全部のプラグインがセットになっています。  

```
`apt-get install mackerel-agent-plugins
````

### Postgres Plugin設定

MackerelのプラグインはCLIからテストできる。楽。  

```
`mackerel-plugin-postgres -user=postgres -password=postgres_pwd [-database=<databasename>]
# -database 以降省略可能
````

#### 出力例

なお、最初は同じコマンドを二度実行しないと警告が表示されます。  

```
`postgres.tempfile.temp_bytes    0.000000        1534094514
postgres.connections.active     1.000000        1534094514
postgres.connections.active_waiting     0.000000        1534094514
postgres.connections.idle       0.000000        1534094514
postgres.connections.idle_in_transaction        0.000000        1534094514
postgres.commits.xact_commit    77.899761       1534094514
postgres.commits.xact_rollback  0.000000        1534094514
postgres.blocks.blks_read       2.291169        1534094514
postgres.blocks.blks_hit        1660.954654     1534094514
postgres.size.total_size        984558979.000000        1534094514
postgres.iotime.blk_read_time   0.000000        1534094514
postgres.iotime.blk_write_time  0.000000        1534094514
postgres.rows.tup_returned      7974.272076     1534094514
postgres.rows.tup_fetched       739.761337      1534094514
postgres.rows.tup_inserted      1.861575        1534094514
postgres.rows.tup_updated       2.004773        1534094514
postgres.rows.tup_deleted       0.000000        1534094514
postgres.deadlocks.deadlocks    0.000000        1534094514
postgres.xlog_location.xlog_location_bytes      37238.377088    1534094514
````

### Mackerel Agent に plugin実行を指示する

設定ファイルに実行する内容を記述する必要があります。  

`/etc/mackerel-agent/mackerel-agent.conf` を編集します。  

すでにpluginの設定サンプルが書かれているので、コメントアウトするだけ…  

*ではありません* 設定例は以下のような形になります。  

```
`[plugin.metrics.postgres]
command = "mackerel-plugin-postgres -user=postgres -password=postgres_pwd"
````

### 蛇足

ようするに `command = "先程テストしたコマンドラインそのまま"`  

です。これに気づかず、少しハマりました。  


他のプラグインでパラメタがないものについては、設定ファイルのコメントアウトを外すだけで有効になります。  


各プラグインの説明は・・・ <a href="https://github.com/mackerelio/mackerel-agent-plugins">https://github.com/mackerelio/mackerel-agent-plugins  

これなんですかねぇ… 割と淡白な説明ですがなんとかなると思います。  

