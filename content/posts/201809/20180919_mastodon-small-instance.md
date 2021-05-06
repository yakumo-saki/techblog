---
layout: post
title: "Mastodonの弱小インスタンスを運用するのに設定したこと"
date: "2018-09-19 15:00:00 +0900"
categories: 
  - blog
---
# 前提
## 環境

* Ubuntu 18.04LTS
* Mastodon （バージョン2.4.3でスタート。随時正式版に追従）

## 構成

すべて自宅サーバー上のHyper-V仮想マシン (Ryzen 7 1700, 32GBメモリ, Windows Server 2016)  


* Mastodonサーバー (3コア, 4GBメモリ)
* Ceph (2コア 4GB, 1コア 1.5GB * 2)


Cephに関してはオーバースペック。ただの興味で動かしているだけです。以前はminioを使っていました。  

将来的にクラウドに移行することを考慮して、最初から画像系は分離しています。  

## セットアップ回り

<a href="https://github.com/tootsuite/documentation/blob/master/Running-Mastodon/Production-guide.md">https://github.com/tootsuite/documentation/blob/master/Running-Mastodon/Production-guide.md  

これに従っています。なので docker は使っていません。  

## 監視回り

Raspberry Pi上で動いているzabbixにより監視しています。  

現在の監視項目は以下の通り  


* ロードアベレージ
* ディスク残量
* Sidekiqジョブ（<a href="https://github.com/ken-washikita/zbx-templates-mstdn">https://github.com/ken-washikita/zbx-templates-mstdn)
* Redis（<a href="https://github.com/ken-washikita/zbx-templates-mstdn">https://github.com/ken-washikita/zbx-templates-mstdn)
* postgres (<a href="https://share.zabbix.com/databases/db_postgresql/mamonsu-monitoring-agent-for-postgresql">https://share.zabbix.com/databases/db_postgresql/mamonsu-monitoring-agent-for-postgresql)

# 参考資料
## 大規模Mastodonインスタンスを運用するコツ

<a href="https://speakerdeck.com/harukasan/inside-pawoo-mastodon-infrastructure">https://speakerdeck.com/harukasan/inside-pawoo-mastodon-infrastructure  

バージョンが古いけれどもやってることは基本一緒なはず。実体験でもSidekiqが詰まってしまうと色々と障害を引き起こしたので  

Sidekiq重要。  

# 設定変更内容
## Sidekiq

defaultキューを処理するのがキモなようなので、defaultキュー専業のプロセスを作成。  

元の全部のキューを処理するプロセスはそのままにすることで、忙しくなったら2プロセスでdefaultキューを処理してくれることを  

期待している。足りなければスレッドを増やせばよいだろうというくらいの気持ち。  

### 全キュー対象のプロセスのスレッド数増加
```
`# /etc/systemd/system/mastodon-sidekiq.service
# 変更点のみ
Environment="DB_POOL=7"
ExecStart=/home/mastodon/.rbenv/shims/bundle exec sidekiq -c 10 -q default -q（略）

# ファイル作成後、以下を実行
systemctl restart mastodon-sidekiq
````

### defaultキュー対象のプロセス新規追加

defaultキューが滞留すると重いに直結するので、defaultキューだけを処理するプロセスを立ち上げる。  

これで、ダッシュボード上の表示は2プロセスになる。  

```
`# /etc/systemd/system/mastodon-sidekiq.service をコピーして mastodon-sidekiq-default.serviceを作成
# 変更点のみ
Environment="DB_POOL=5"
ExecStart=/home/mastodon/.rbenv/shims/bundle exec sidekiq -c 5 -q default

# ファイル作成後、以下を実行
systemctl start mastodon-sidekiq-default
systemctl enable mastodon-sidekiq-default
````

## PostgreSQLのバッファ増量

2018/09/29 追記  

<a href="https://pgtune.leopard.in.ua/#/">https://pgtune.leopard.in.ua/#/ ここに"postgresが使用してよい"メモリ量を入れると、適切なconfigが生成されるので便利。  


デフォルトだと128MBになっているが、あまりに頼りないので増量。  

メモリ自体は2GBくらい空いているので増量しても問題ないと判断した。  

```
`# /etc/postgresql/10/main/postgresql.conf
shared_buffers = 512MB    # 元は128MB
````

## ulimit増加

Sidekiqのエラー部に、Too many open filesが記録されていたので増量  

```
`/etc/security/limits.conf
# 末尾に追加
      *    soft nofile 65536
      *    hard nofile 65536
````

### 備考

* DB_POOL 5 => 7 処理スレッド数を増やしたのでDB接続がそれだけ必要になるだろうから増加
* sidekiqスレッド数 5 => 10、CPU負荷に余裕があったので倍増。スレッド数が足りずにSidekiqのキューが伸びてレイテンシが上がってしまったタイミングがあったため（ダッシュボードで見れます）

## 事件記録
### 画像アップロード用サーバーのFW設定ミスで接続蹴ってた事件

もうそのまんま。画像がアップロードできない状態になると、連合から飛んでくる画像も保存できずにSidekiqのキューが伸びる。  

結果、リモートフォローが失敗したり、プロフィール画像変更すると象が出てきたりした。  

### サイレンスと同時に画像もブロックしたら画像表示されなかった事件

連合の流れが速すぎるので上位3インスタンス(jp, nico, pawoo)をサイレンスにした際に、画像もブロックにしたら  

該当インスタンスをフォローしている場合に画像が表示されなくなった問題。画像はブロックしないにして解決。  

### 2018/09/29 追記 Sidekiqのメモリ使用量削減

Rails+Sidekiq環境でメモリ使用量を減らす  

<a href="https://qiita.com/imbsky/items/fca64e52f6e1d03504c9">https://qiita.com/imbsky/items/fca64e52f6e1d03504c9  

↑（これ、mstdn.jpの運営引き継いだ会社の方ですね）  


簡単に言えば jemallocを使うことでメモリの無駄な領域を削減でき、驚くほどの効果がある。らしいです。 Sidekiqの作者が登場して、これ良いよって言っているのでそれほどの効果なんでしょう。  

<a href="https://github.com/tootsuite/mastodon/issues/7257">https://github.com/tootsuite/mastodon/issues/7257 (英語)  

<a href="https://techracho.bpsinc.jp/hachi8833/2017_12_28/50109">https://techracho.bpsinc.jp/hachi8833/2017_12_28/50109 （仕組み：日本語）  


なお、dockerだとjemallocは適用できない。みたいなことがissueで語られています。  

jemallocの適用は下記がすごくわかりやすいです  

<a href="https://qiita.com/kumasun/items/bf4997f181f893130041">https://qiita.com/kumasun/items/bf4997f181f893130041  

### 2018/10/03 追記

<a href="https://qiita.com/motiakoron/items/b81a8f956ae4ea62ce11">https://qiita.com/motiakoron/items/b81a8f956ae4ea62ce11  

こちらの RedisをUNIXソケット経由接続に変更を適用しました。  

少しでも負荷を削れるなら削りたいですよね。  

