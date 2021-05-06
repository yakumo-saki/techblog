---
layout: post
title: "RaspberryPiにzabbixを入れた時のメモ"
date: "2017-06-09 15:00:00 +0900"
categories: 
  - blog
---
## 環境

* Raspberry-Pi 3
* RASPBIAN JESSIE LITE 2016-11-25
* Zabbix 3.2.4

## 参考にしたサイト

Raspberry PiにZabbix 3.0をインストール  

<a href="http://straightweeds.hatenablog.com/entry/2016/08/05/002649">http://straightweeds.hatenablog.com/entry/2016/08/05/002649  


正直、上記サイトの孫引きなので上記サイトを良く読めばOK。  

# 手順

以下の手順はすべて　root として実行している。  

```
<code class="language-shell-session">sudo su -
````

## 前提パッケージのインストール
```
<code class="language-shell-session">apt install make gcc libc6-dev libmysqlclient-dev libcurl4-openssl-dev libssh2-1-dev libsnmp-dev libiksemel-dev mysql-server libsqlite3-dev libopenipmi-dev fping php5-gd snmp libsnmp-base openjdk-7-jdk unixodbc unixodbc-dev libxml2 libxml2-dev snmp-mibs-downloader snmpd snmptt python-pywbem php5-ldap php5-mysql traceroute libldap2-dev apache2 php5 libapache2-mod-php5 gettext vim
````

## zabbixパッケージの取得

wget を使って取得すればOK。手順は省略。  

tar xvf で展開可能。展開したディレクトリ内を <src> と記述する  

## コンパイル

恐らく、この作業は時間がかかると思われるので、byobu(screen)を入れてSSHが切れても  

処理が継続されるようにしておいた方が良いかもしれない。  

```
<code class="language-shell-session">cd <src>
./configure --enable-server --enable-agent --with-mysql --with-net-snmp --with-libcurl --with-openipmi --with-ssh2 --with-libxml2 --enable-ipv6 --with-unixodbc --with-openssl --enable-java --with-jabber --with-ldap
make install
````

## Zabbixユーザー追加

zabbixをrootで動かすわけにはいかないので、ユーザーを追加。  

```
<code class="language-shell-session">adduser --system --home /usr/local/sbin --no-create-home zabbix
````

## Zabbixサーバー設定
```
`vi /usr/local/etc/zabbix_server.conf
````


変更ポイント  


* DBName=zabbix
* DBUser=zabbix
* DBPassword=zabbix
* DBSocket=/var/run/mysqld/mysqld.sock

## MySQLにzabbixのスキーマを作成
```
`mysql -u root -p

SQL> create database zabbix;
SQL> grant all on zabbix.* to zabbix@localhost identified by 'zabbix';
````

```
<code class="language-shell-session">cd <src>
mysql -u zabbix --password=zabbix zabbix < ./schema.sql
mysql -u zabbix --password=zabbix zabbix < ./images.sql
mysql -u zabbix --password=zabbix zabbix < ./data.sql
````

### とりあえず zabbix_server 起動
```
`zabbix_server
````


起動しても何もでない。 /tmp/zabbix_server.log を見てエラーが出ていたら要修正。  

## zabbix frontendをセットアップ
### PHPの設定
```
`vi /etc/php5/apache2/php.ini
````


変更点  


* memory_limit = 128M
* post_max_size = 16M
* max_execution_time = 300
* max_input_time = 300
* date.timezone = Asia/Tokyo
* always_populate_raw_post_data =-1

### zabbix frontend をapache公開ディレクトリに配置
```
`mkdir /var/www/html/zabbix
cd <src>/frontends/php
cp -a . /var/www/html/zabbix/
````


ロケールとパーミッション関係  

```
`cd /var/www/html/zabbix/locale
./update_po.sh
./make_mo.sh

chown -R www-data /var/www/html/zabbix
````


ついでにリダイレクト設定  

```
`vi /var/www/html/index.html
````


内容  

```
<code class="language-html"><html xmlns="http://www.w3.org/1999/xhtml">
  <head>
   <meta http-equiv="refresh" content="0;URL=/zabbix">
  </head>
</html>
````

### ロケール設定
```
`dpkg-reconfigure locales
````


* All locales
* ja_JP.UTF8
* 時間がかかる
* 必要なロケールだけ選択した方がいいかもしれない

### Apache再起動＆確認
```
`systemctl restart apache2
````


Webブラウザからアクセスして、初期設定を行う。  

## 自動起動登録

起動スクリプトをコピー  

```
`cp <src>/misc/init.d/debian/
cp * /etc/init.d/
````


コピー後、参考サイトにあるLSBヘッダを追加する。  

```
`systemctl enable zabbix-server
systemctl enable zabbix-agent
````

# 以上
# 追記

日本語を選択すると、グラフ内にも日本語が使われるが、それが文字化けする（豆腐□になる）  

解決するには以下のQiitaの通りやればOK  

<a href="http://qiita.com/Hiroki_lzh/items/8aa1acc55921ddd9dfb0">http://qiita.com/Hiroki_lzh/items/8aa1acc55921ddd9dfb0  

