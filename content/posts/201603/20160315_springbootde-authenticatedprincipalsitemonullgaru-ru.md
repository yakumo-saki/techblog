---
layout: post
title: "Springbootで@AuthenticatedPrincipalしてもnullが入る"
date: "2016-03-15 15:00:00 +0900"
categories: 
  - blog
---

今さっきやらかしてしまったのでメモ。  


SpringSecurityの設定が間違っていると @AuthenticatedPrincipalした引数に  

nullが入ってしまう。  

```
`// これは間違い。
@Override
public void configure(WebSecurity web) throws Exception {
    web.ignoring().antMatchers("/mypage/**");
}

// 正しくはこう書く
public void configure(WebSecurity web) throws Exception {
    http.authorizeRequests()
	.antMatchers("/mypage").permitAll()
}

````


間違いの方も必ず間違いというわけではなく、静的なコンテンツは上の書き方でよい。  

上の書き方はSpringSecurity自体をバイパスしてしまうので、ログイン状態であっても  

ログインユーザーの情報が取れないと思われる。  

