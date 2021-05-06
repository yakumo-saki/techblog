---
layout: post
title: "jetson nano (aarch64) にdockerでzabbixを入れる"
date: "2019-12-17 14:01:00 +0900"
categories: 
  - blog
---
## tl;dr

成果物はこちらです。試していないのですが、Rock64等、arm64なものであれば動くと思います。  

<a href="https://github.com/yakumo-saki/docker-zabbix-server-arm64/tree/master">https://github.com/yakumo-saki/docker-zabbix-server-arm64/tree/master  

<a href="https://hub.docker.com/r/yakumosaki/zabbix-server-mysql">https://hub.docker.com/r/yakumosaki/zabbix-server-mysql  

<a href="https://hub.docker.com/r/yakumosaki/zabbix-web-nginx-mysql">https://hub.docker.com/r/yakumosaki/zabbix-web-nginx-mysql  

## 本記事について

成果物は上記の通りなので、失敗談等を書いていきます。  

## はじめに

Jetson nano、すごくよさそうだったので買ったのですがなかなか触れずに埃を被っていました。  

なにせケースもありませんし。ということで、ちょうどメモリも4GBあるのでzabbixのホストを仮にやってもらうことにしました。  

## 困った点1

zabbixは公式にdockerfileを配布しています。 さらに、dockerhubにもコンテナを公開してくれています。  

と言うことは、それをpullすれば楽勝…だと思っていました。  

甘かったです。 普通に jetsonから `docker pull zabbix/zabbix-server-mysql` をpullすると、x86_64のコンテナが落ちてきます。  

当然動かないです。仕方ないので公開されているdockerfileからコンテナをビルドすることにしました。  


…とはいえ、Dockerfileがあるのでそれほど苦労はしないはずです。ビルド時間がかかるかもと思ったのですが、  

数分でビルドが完了しました。  

## 困った点2 DBまわり

公式では、mysql-server:5.7 のイメージを使うようになっていますが、aarch64版のコンテナはありません。  

と言うことで、8.0のmysql公式コンテナを使用していますが、mysql8.0は色々と変更が入っているので、  

動かすのに苦労しました。具体的には `command: --default-authentication-plugin=mysql_native_password` を  

docker-compose.ymlに加えただけなんですが。  

### さらに困った点

zabbix公式の、docker-entrypoint.sh なんですが、DBが起動するのを待つために以下のコマンドを実行します。  

`mysqladmin ping -h db -P 3306 -u root --password="password" --silent --connect_timeout=10`  

しかし、mysqlコンテナの初期構築のrootは、他ホストからの接続に対応していません。  

そのため、いつまでまっても、 "MySQL is not ready... " となってしまいます。  

なので、docker-compose up する前に、DBに接続して、外から接続できるrootを作成するようにREADMEに記述しました。  

ついでに、私のdockerhubにアップロードしているイメージは、ping に使用するユーザーをzabbixに変更しています。  


さらに、docker-entrypoint.sh でroot権限を使ってzabbixの初期DBを流し込もうとするのですが、  

これが失敗するのも上記の対応で上手く行くようになりました。  

## zabbix-agent

serverが動いているホスト以外のzabbix-agentは何も不思議なことはないのですが、  

serverが動いているホストだけは問題があります。それは、dockerコンテナのIPアドレスからzabbix-agentを叩いてしまうので、  

zabbix-agent.conf にかかれたServerと一致せず、要求を拒否されてしまいます。  

これは正直参りました。dockerコンテナのIPアドレスを固定するように書くのが良いのでしょうが、  

そうそう変わるものでもないのでとりあえず直接記述してしまっています。  

なお、Server, ServerActive は複数のIPアドレスを並べることができるので、それっぽいのを並べてしまえばOKです。  

テストには、zabbix_get -s ホストIP -k agent.version を使うと便利です。  

拒否した場合は、拒否したagent側の /var/log/zabbix/zabbix-agent.log にログが出力されます。  

