---
layout: post
title: "MastodonのDBを外出ししてみたメモ"
date: "2018-09-26 15:00:00 +0900"
categories: 
  - blog
---
## 前提

* Mastodon prodcution guideに従った非docker構成
* Ubuntu 18.04LTS

## 構成

* もともとのMastodonサーバー(Mastodonサーバーと呼ぶ)
* 移行先PostgreSQL DBサーバー(DBサーバーと呼ぶ）

## やったことの前提

私は複数のMastodonインスタンスを運営しており、ひとつはほぼ負荷がないテスト用で、もう一つは本番稼働しているものです。これらのPostgreSQLのDBを別のサーバー（2つのインスタンスで共有）にまとめてみようと思い今回の作業を行いました。  

## 手順

本作業は、Mastodonのインスタンスを停止して行う必要がある。  

### 外出側のPostgreSQLにユーザーとDBを作成

DBサーバーでの作業。  

`postgres` ユーザーで実行する。  

```
<code class="language-sql">CREATE USER mastodon_user; # 複数インスタンスのDBを統合するならその分作る
alter role mastodon_user with password 'password';  # パスワード設定
create database mastodon_db with owner=mastodon_user;
````

### 外部接続を可能にするように設定

DBサーバーでの作業。  

`/etc/postgresql/10/main/pg_pba.conf` を編集し、以下の内容を追加する。  

```
<code class="language-/etc/postgresql/10/main/pg_hba.conf"># ↓固定 database     user           ip              ↓固定
host    mastodon_db mastodon_user 192.168.10.0/24   md5
````


設定を反映させるためにリロード（restartでもOK）  

```
<code class="language-bash">sudo systemctl reload postgresql
````

### もとのDBをdumpする

*ここから先は mastodon を停止して行う必要があります*  


Mastodonサーバーでの作業。  

postgresユーザーで実行。  

```
<code class="language-bash">sudo su - postgres
pg_dump mastodon_production > dump.sql
````

### ダンプをロード

Mastodonサーバーでの作業。  

postgresユーザーで実行（だが、dump.sqlにアクセスできればどのユーザーでもよい）  

```
<code class="language-bash">psql --host=192.168.10.40 --username=mastodon_username < dump.sql
# --no-owner オプションを追加すれば次項のユーザーに関する警告をスキップできる（コメント参照）
````

#### 注意点

接続が拒否されるのであれば、DBサーバー側のファイアウォール(ポート5432)や、`pg_hba.conf`の設定を疑う。  


`ERROR:  role "mastodon" does not exist` が表示されるが無視して良い。  

alter で所有者を変更しようとしているが、もともとは `mastodon` ユーザーが所有していたのを、DB移行の際に `mastodon_user` に変更しているせい。  

DB自体の所有者を変更してあるので動作上問題はない（ownerならそのDBとその中身に対して全権限がある）  


しかし、`mastodon`ユーザーが、移行先のpostgresqlに存在してしまっている場合は問題になる。  

この場合は、`dump.sql`を編集して(OWNERで検索して置換すると良い）ユーザー名を書き換えるしかないと思われる。  

※ 私はこれに該当したので`dump.sql`を書き換えました。それなりに大きなサイズになるはずなので可能なら`sed`を使うなりした方がいいかもしれません。VSCodeで頑張って置換しましたが動作がもっさりして辛かったです。  

### Mastodon の設定ファイル修正

mastodonサーバーでの作業。  

DBの準備が終わったので接続先をそちらに変更する。  

mastodonユーザーで行う。  


`/home/mastodon/live/.env.production` の以下の部分を編集  

```
<code class="language-/home/mastodon/live/.env.production">DB_HOST=192.168.10.40
DB_USER=mastodon_user
DB_NAME=mastodon_db
DB_PASS=mastodonpassword
DB_PORT=5432
````

### 動作確認

ここで、mastodonを立ち上げて、Webからアクセスできることを確認する。  

一度テストでトゥートしたり、お気に入りをつけたり軽く動かしてみるとよい。  

### mastodonサーバー上で動作しているpostgresqlを停止

ここまでで、DBサーバーの移行は完了したので、mastodonサーバーで動作しているpostgresqlが  

不要になったので停止する。  


mastodonサーバーでの作業。  

以下を実行。  

```
<code class="language-bash"># sudo可能なユーザーで実行。mastodonサーバーで動作しているPostgreSQLを停止
sudo systemctl stop postgresql
sudo systemctl disable postgresql
````

```
<code class="language-bash"># mastodonユーザーで実行。
cd ~/live
~/live$ RAILS_ENV=production bundle exec rake db:collation
en_US.UTF-8  # これが表示されればOK！
````


ここには記述しないが、この時点でPostgreSQLのデータファイルも削除することもできる。  


以上  

### 変更履歴

2018/09/27 この手順でDBの移設が可能なことを確認した。  

2019/08/15 誤記修正、体裁修正  

