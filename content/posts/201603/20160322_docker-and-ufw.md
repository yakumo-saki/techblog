---
layout: post
title: "Dockerコンテナのポートをホストにマップすると危険?"
date: "2016-03-22 15:00:00 +0900"
categories: 
  - blog
---
## お断り

本記事は古いです。  

今は --expose と -port を適切に使い分けることで回避できます。  

ただし、dockerがiptablesを自動的に設定しているのは変わらないです。  


以下の記事がわかりやすかったです。  

dockerとufwの設定が独立なせいで無駄にポートが開いてしまう件と、解決するためのdocker runオプションの記法について  

<a href="https://qiita.com/jqtype/items/9574ef74868b73323939">https://qiita.com/jqtype/items/9574ef74868b73323939  

# 以下、古い記述
## 具体的に何が危険なのか

コンテナのポートをホストにマップした場合（ -p 80:80 )  

そのポートは、ufw（ファイアウォール）の制限を受けません。  

ようするに、そのポートは外からアクセス可能です。  

## ではどうすれば？

/etc/default/docker に以下を追記して下さい。  

```
`DOCKER_OPTS="--iptables=false"
````

## 参考にしたURL

<a href="http://askubuntu.com/questions/652556/uncomplicated-firewall-ufw-is-not-blocking-anything-when-using-docker">http://askubuntu.com/questions/652556/uncomplicated-firewall-ufw-is-not-blocking-anything-when-using-docker  

<a href="http://blog.viktorpetersson.com/post/101707677489/the-dangers-of-ufw-docker">http://blog.viktorpetersson.com/post/101707677489/the-dangers-of-ufw-docker  

## 所感

これを知らなかったので、TomcatがWorldwideに公開されてたとか…恐ろしい  

