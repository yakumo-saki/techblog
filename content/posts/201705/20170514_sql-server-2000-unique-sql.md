---
layout: post
title: "SQL中の謎の =* という演算子について(SQLServer 2000)"
date: "2017-05-14 15:00:00 +0900"
categories: 
  - blog
---

既存の SQLServer 2000 を使用しているシステムのSQLに謎のSQLがあった  

適当にサンプルを上げるとこんな感じ。  

```
<code class="language-sql:SQLServer独自構文(LEFT_JOIN)">select a.col1 , b.col2
from a , b 
where
 a.col1 *= b.col2
````


WHERE条件の *=とか、=*とかなんだこれ？と思ってググってみたけれどもヒットしない。  

列名からJOIN絡みの何かだろうと当たりをつけて試してみた結果  

```
`*=  → LEFT JOIN
=*  → RIGHT JOIN
````


だった。なんか黒歴史みたいなものに触れてしまった感じだ。  

ちなみに、これは最近のSQLServerでは使用できず、エラー扱いになる模様。  

### 追記

ちなみに、Oracleにも同様の記法がある。コメント欄で教えて頂いた通り、  

LEFT JOIN/RIGHT JOIN が制定される前の名残だろうか。  

```
<code class="language-sql:Oracle独自構文(LEFT_JOIN)">select a.col1 , b.col2
from a , b 
where
 a.col1 (+)= b.col2
````

```
<code class="language-sql:Oracle独自構文(RIGHT_JOIN)">where
 a.col1 = b.col2 (+)
````


JOINしたい方に(+) を付けるだけ。今でも使えますが、標準SQLで書いた方が無難。  

