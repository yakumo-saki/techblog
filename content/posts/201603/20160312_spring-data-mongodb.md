---
layout: post
title: "Spring-Data MongoDBを使っていてハマったこと"
date: "2016-03-12 15:00:00 +0900"
categories: 
  - blog
---
## はじめに

Spring-Data MongoDBを使っていてハマったことをメモしていく。  

ハマるたびに随時更新する。  

## addOperator使おうとしたら手前にWhereがないと書けない？

andOperatorは、SQLで言う所の And で複数条件のAndを取る。  

```
`Query q = new Query();
q.addCriteria(Criteria.where("column1").is("abc")
                      .andOperator(Criteria.where("column2").ne("abc")
                                   , Criteria.where("column2").ne("xyz")));
                                   
// 手前にwhereがあれば普通に書けるが、q.addCriteria(andOperator())とは書けない
// その場合は、以下のように書く。
q.addCriteria(new Criteria().andOperator(略));
````

