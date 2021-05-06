---
layout: post
title: "SpringBootで Request-URI Too Large が出てしまった時のメモ"
date: "2018-08-05 15:00:00 +0900"
categories: 
  - blog
---
## 環境

SpringBoot 1.5.4  

Apache 2.4 (リバースプロクシとして)  

## 問題点

フォームをGETで送信してしまうと、（これ自体が問題なんですが）  

URLの文字数が1000文字を超えてしまうことがあります。その場合、題記のエラーが発生します。  

本来は、アプリケーションを改修すべきですが、それまでの間に合わせとして設定変更で逃げる  

場合の手法をメモします。  

## 考え方

Request-URI Too Largeエラーを出す所は二箇所あります。  

それぞれに対して設定の変更が必要です。  

1． Apache  

2. SpringBoot内蔵のTomcat  

## Apacheの設定変更

http.conf に以下の行を加えます。  

```
`LimitRequestLine 81920
````


注意：この設定はメモリ使用量に直結するようです。また、長いURLをエラーにしているのは、  

セキュリティ対策の部分があるようなので、設定変更時はご注意下さい。  

## Springboot内蔵Tomcatの設定変更

application.yml に以下の設定を追加します。  

```
`server.max-http-header-size:  81920
````


リミットの値は、ApacheとSpringboot内蔵Tomcatで合わせておくとよいでしょう。  


以上です。  

## 蛇足

そもそも、よほどの理由がなければFormをGETするのはやめた方が無難です。  

特に、データ数が可変な場合は実運用フェイズでいきなりこのエラーに遭遇するので、かなり最悪です。  

