---
layout: post
title: "metricbeatをパッケージ(yum / apt)から入れる際の落とし穴"
date: "2018-09-22 15:00:00 +0900"
categories: 
  - blog
---
## 環境

* Ubuntu 18.04LTS (CentOS6.5でも同じ）
* Metricbeat 6.4

## TL;DR

リポジトリからmetricbeatをインストールすると、 modules.d / kibana ディレクトリが存在しないので、tarballから設定をコピってこなければ何もデータが飛ばない。  

## 詳細

以下の手順に従って、metricbeatをインストールしても思った通りに動作しない  

<a href="https://www.elastic.co/guide/en/beats/metricbeat/current/setup-repositories.html">https://www.elastic.co/guide/en/beats/metricbeat/current/setup-repositories.html  


インストールは成功するし、metricbeat自体は動作するが、データが一切送られない。  


原因は、 `/etc/metricbeat/modules.d/` 以下が存在しないため。  

`modules.d` 以下にはどのメトリックを送るかの設定ファイルが存在しなければならないが存在しないので何も送信されない。  

## 対応

<a href="https://www.elastic.co/downloads/beats">https://www.elastic.co/downloads/beats  


ここからtarballをダウンロードして、展開すると `modules.d` と `kibana` ディレクトリがあるので、中身ごと、`/etc/metricbeat/` 以下にコピーする。  

その後、metricbeatを再起動するとメトリックが送信されるようになる。  

## 蛇足

modules.dが入らないのは、もしかすると、あえてこうしているのかもしれません。  

バージョンアップの時にconfが上書きされると割と気づきにくい事故になってしまうので、それを避ける狙いなのかも。。  

