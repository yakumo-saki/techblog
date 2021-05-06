---
layout: post
title: "SpringBoot使ってる場合はHttpSessionを@Autowiredできる"
date: "2017-05-17 15:00:00 +0900"
categories: 
  - blog
---
## 最初に

思いっきり勘違いして大騒ぎしたのでメモ  

Springboot 1.3.5  

## 問題（ではなかった）コード

結論を先に言うと、このコードは想定通り動きます。  

```
<code class="language-java">@Controller
public class MenuController {
    @Autowired
    HttpSession session;
    @RequestMapping(value = "/", method = RequestMethod.GET)
    String method() {
        return "somehtml";
    }
}
````

## 何が問題だと思ったか

くどいですが、以下のような問題は起きません。  


* Controller（prototypeスコープ)にHttpSession(sessionスコープ)のインスタンスをDIしようとしている
* Controllerのフィールドにsessionを持っているので同時にアクセスが来たときにsessionを取り違えるのではないか？


簡単に検証しただけなのであまり詳しくは調べていませんが、DIされるインスタンスはHttpSessionそのものではなく  

適切にrequestに紐付いたsessionを触ってくれるようなプロクシみたいなもののようです。  

そのため、上記1,2のどちらも発生しないようになっています。（Thread.sleep入れて検証したので間違いないです）  

## 所感

Spring様はほんと偉大。  

