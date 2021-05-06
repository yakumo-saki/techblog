---
layout: post
title: "SpringBootの設定ファイルを外部化したい時"
date: "2017-05-21 15:00:00 +0900"
categories: 
  - blog
---
## 環境

SpringBoot 1.3.5  

jarでデプロイ (warの場合はこの記事の対象外)  

## どんな時に嬉しいか

開発中は、resources/application.yml を読んで欲しいが、本番時は運用者が設定ファイルを  

変更する為に外だしのファイルになっていて欲しいという時。  

## 何をするか

起動時のオプションを以下のように記述すればOK  

```
<code class="language-bat:コマンドライン">REM 適当に改行していますが、実際は一行で入力します
java 
 -jar 
 -Dspring.config.location="c:pathmyconfig.yml"
 -Dspring.config.name="DummyConfigFilename" appname.jar
````

## 解説

spring.config.location は名前に反してファイル名まで入れる必要がある。  

＃StackOverflowで検索したらファイル名が入ってないパターンが多くてハマった。  


spring.config.name にダミーのファイル名を指定しているのは、SpringBootの設定ファイル  

読込順として、クラスパスにある application.yml が優先して読みこまれるため。  

これを指定しないと、クラスパス内のapplication.yml の指定を、外部ファイル  

（上記例だと c:pathmyconfig.yml) で上書きするという感じになる。  

＃この動きが希望であれば、spring.config.name を指定する必要はない  

＃ただ、外部ファイル側で、キー名を間違えた場合にクラスパス内の指定が使用されるのは  

＃困るというか、原因究明しにくくなる・・・ような気がするので、spring.config.name　に  

＃存在しないファイル名を指定して、クラスパス内の設定ファイルを読めないようにしている。  

## PS

logbackの設定ファイルも外部化したのでそのことをあとで追記する。  

