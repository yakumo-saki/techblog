---
layout: post
title: "SpringbootのErrorControllerにはPOSTの処理も必要"
date: "2017-05-25 15:00:00 +0900"
categories: 
  - blog
---
## 環境

Springboot 1.3.5  

Java 8  

## やりたかったこと

アプリ内の例外を補足してエラー画面に飛ばしたかった。  

## ハマったこと

参考URLのスライドを参考にして、ErrorControllerを実装したところ、GETで例外が発生した  

場合は、想定通りエラー処理が行われるが、POST中に例外が起きるとエラー画面どころかTomcatのエラー画面  

が表示された。  

## 対策
```
`@RequestMapping(value = PATH)
public String errorGet(HttpServletRequest request, HttpServletResponse response) { 略 }

// これを追加した。
@RequestMapping(value = PATH, method = RequestMethod.POST))
public String errorPost(HttpServletRequest request, HttpServletResponse response) { 略 }
````


GETの時と、POSTの時はそれぞれに対してRequestMappingを書かないと捕捉されない模様。  

POST時は、更新ボタンによる再POSTを防ぐため、エラー画面のURLにredirectさせる実装にした。  

## 参考

Spring Boot で Boot した後に作る Web アプリケーション基盤/spring-boot-application-infrastructure // Speaker Deck  

<a href="https://speakerdeck.com/sinsengumi/spring-boot-application-infrastructure">https://speakerdeck.com/sinsengumi/spring-boot-application-infrastructure  

