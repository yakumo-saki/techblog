---
layout: post
title: "writefreely をdockerで走らせてみた。"
date: "2019-12-18 14:02:00 +0900"
categories: 
  - blog
---
# まえがき
## writefreely をdockerで走らせてみた。

docker-compose.ymlと、Dockerfileは以下で公開しています。  

<a href="https://github.com/yakumo-saki/docker-writefreely">https://github.com/yakumo-saki/docker-writefreely  

ライセンスはオリジナルに従い AGPL 3.0 としています。  


なお、本文書は作業を行ってからしばらく立って記憶だけで書いているので  

誤りがある可能性が高いです。誤りを見つけたら編集リクエスト等頂けるとありがたいです。  


また、writefreelyをproductionで走らせる場合、dockerイメージはまだ出来てないよ的な  

記述があるのでご注意ください。  

## dockerイメージ

yakumosaki/writefreely は、  

<a href="https://hub.docker.com/r/writeas/writefreely/tags">https://hub.docker.com/r/writeas/writefreely/tags  

に v0.10 のイメージがないので自分でビルドしたものです。  

多少Dockerfileに変更を入れていますが、影響はないと思います。  

# 準備
## リポジトリのクローン

必要なものはまとめてあるので、  

`git clone https://github.com/yakumo-saki/docker-writefreely writefreely`  

で、私のリポジトリからクローンして下さい。  

## config.ini

（クローンしたディレクトリ内で）  


`cp config.ini.example config.ini`  


config.iniファイルを編集。 公式のconfig.ini.example に追加して、  

```
`[server]
bind = 0.0.0.0
````


としています。 リバースプロクシ等、この方が都合が良い場合が多いでしょう。  

なお、config.iniでいうところの site name はblogの集合体としてのwritefreelyのサイト名で  

例えば、FC2ブログ。とかlivedoorブログ。のようなレベルの名前です。  

自分のブログの名前はWeb UIから設定できます。この名前はあとで変えても良いので気楽に決めて下さい。  

## DBの準備

とりあえず、DBを準備します。残念ながらここは自動化できていません。  

```
<code class="language-shell-session">$ docker-compose run db bash
$ mysql -uroot

mysql> create user writefreely identified by 'writefreely';
mysql> create database writefreely DEFAULT CHARACTER SET utf8mb4;
mysql> grant all on writefreely.* to writefreely;
mysql> use writefreely
Database changed

writefreely> source /tmp/schema.sql
（出力がそれなりに出るが省略）
writefreely> quit
````

## Webの準備

一時的に keys ディレクトリに誰でも書込ができるようにします。  

```
`chmod 777 ./keys
````

```
`$ docker-compose run --entrypoint '' web ash
$ cmd/writefreely/writefreely --gen-keys
$ cmd/writefreely/writefreely  # 起動テスト。 CTRL+C で抜ける
$ (CTRL+D)
````


パーミッションを戻しておきます  

```
`chmod 755 ./keys
````

## 実行

あとは普通に `docker-compose up -d` して下さい  

## おまけ

federationするには恐らく、httpsが必要です。  

また、一度federationした場合は、ドメインを変更するとActivityPubからみたアカウントと  

ドメインの整合性がとれなくなるので適当なドメインで試しに動かす場合は、federationしないように  

した方がよいでしょう。  

