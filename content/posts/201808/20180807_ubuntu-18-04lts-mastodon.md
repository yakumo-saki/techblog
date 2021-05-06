---
layout: post
title: "Ubuntu 18.04LTSにMastodonを入れてみたメモ"
date: "2018-08-07 15:00:00 +0900"
categories: 
  - blog
---
## なにこれ？

公式の Production Guide は Ubuntu Server 16.04LTS を前提に書かれているので  

18.04LTSの際の差分をメモしておく  

## Mastodon Production Guide

<a href="https://github.com/tootsuite/documentation/blob/master/Running-Mastodon/Production-guide.md">https://github.com/tootsuite/documentation/blob/master/Running-Mastodon/Production-guide.md  

## で、違いは？

実は一つだけ。  

```
`apt -y install imagemagick ffmpeg libpq-dev libxml2-dev libxslt1-dev file git-core g++ libprotobuf-dev protobuf-compiler pkg-config nodejs gcc autoconf bison build-essential libssl-dev libyaml-dev libreadline6-dev zlib1g-dev libncurses5-dev libffi-dev libgdbm3 libgdbm-dev nginx redis-server redis-tools postgresql postgresql-contrib letsencrypt yarn libidn11-dev libicu-dev
````


の中にある、 `libgdbm3` がUbuntu 18.04LTSにはありません。 `libgdbm5` がありますが、標準でインストール済みなので  

特にインストールする必要はありませんでした。  


これ以外は、全てProduction Guideの手順通りでインストールできました。  

