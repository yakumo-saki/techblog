---
layout: post
title: "CentOS 7 でSELinuxを無効化しようとしてハマったこと"
date: "2015-08-20 15:00:00 +0900"
categories: 
  - blog
---
## 何が起きた？

CentOS 7 を入れて、SELinuxを無効化しようとしたが、何度やっても  

設定が反映されない。  

## 何やった？

/etc/sysconfig/selinux を編集した。  

SELINUX=permissive  


再起動したにもかかわらず、getenforce すると  

Enforcing と出てしまう。設定が反映されてない。  

＃disableよりpermissiveにしておけ！っていう記事を読んだのでpermissive  

## 結論

<a href="https://www.centos.org/docs/5/html/5.1/Deployment_Guide/sec-sel-enable-disable.html">https://www.centos.org/docs/5/html/5.1/Deployment_Guide/sec-sel-enable-disable.html  

ここによると、 /etc/sysconfig/selinux は /etc/selinux/config へのシンボリックリンクらしいが、なぜか普通のファイルになっていた。  

直接、 /etc/selinux/config を編集して再起動した所、設定が反映された。  

## その他

CentOS-7-x86_64-DVD-1503-01.iso を使ってインストールしたばっかりなんだけど  

自分で壊したのかもしれない。  

