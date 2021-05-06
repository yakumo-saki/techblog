---
layout: post
title: "家庭内ラズパイセットアップメモ"
date: "2020-06-03 15:00:00 +0900"
categories: 
  - blog
---
## ほんとにメモ

* Raspberry Pi OS (aka Raspbian) 32bit

## インストールしたソフトウェア
### zabbix

* 5.0 LTS
* 公式にあるとおり、aptリポジトリ追加してインストール
* PostgreSQL

### Java

* Jenkins ノードになるため必要
* apt install java8-jdk-headless

### beep

* <a href="https://github.com/yakumo-saki/raspberrypi-beep/">https://github.com/yakumo-saki/raspberrypi-beep/
* apt install wiringpi
* apt install python3-pip

### NodeRED

* <a href="https://nodered.org/docs/getting-started/raspberrypi">https://nodered.org/docs/getting-started/raspberrypi
* スクリプトを使ってインストールした。node.js も同時にインストールされる。
* NodeRED内から、node-red-contrib-aws 追加

