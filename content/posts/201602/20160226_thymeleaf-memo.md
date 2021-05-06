---
layout: post
title: "Thymeleafメモ"
date: "2016-02-26 15:00:00 +0900"
categories: 
  - blog
---
## HTML5的に好きな要素にThymeleafで値を埋めたい

th:attrを使えば良い。  

下のサンプルは適当な名前にしていますが、正式にやるときは data-attr のようにdata-を付けて下さい。  

```
<code class="language-html"><a href="#" th:attr="myattr=myvar">test</a>

myvar = "abc"のときの出力
=> <a href="#" myattr="abc">test</a>

<a href="#" th:attr="myattr1=myvarA,myattr2=myvarB">test</a>

myvarA="abc" / myvarB="XYZ"のとき
<a href="#" myattr1="abc" myattr2="XYZ">test</a>
````

## Javascriptにオブジェクトを埋め込みたい

以下の通りにすればOK  


* scriptタグに th:inline="javascript" を付ける
* scriptタグの最初に /<em><![CDATA[>/
* scriptタグの最後に /<em>]]>/
* 埋め込みたい部分に /<em>[[${value}]]/ {};  // 直後の {} は Thymeleafが消してくれる

```
`// 例
<script th:inline="javascript">
/*<![CDATA[>*/
   var API_URL = /*[[ @{/api/test}]]*/ "dummy";   // URL埋め込み
   	var obj = /*[[${obj}]]*/ {}; // {"name":"test", "job" : "hagure-metal"}
/*]]>*/
</script>
````

## 権限がある人にだけ何かを表示する (SpringSecurity連携)

取説は以下  

<a href="https://github.com/thymeleaf/thymeleaf-extras-springsecurity">https://github.com/thymeleaf/thymeleaf-extras-springsecurity  

### hasRoleを使う
```
<code class="language-html"><li sec:authorize="hasRole('ROLE_ADMIN')">
    <a href="/hoge">管理者にしか見えないリンク</a>
</li>

<!-- （少なくとも）SpringSecurity4以降なら ROLE_ は省略可能 -->
<li sec:authorize="hasRole('ADMIN')">
    <a href="/hoge">管理者にしか見えないリンク</a>
</li>
````

### authorize-urlを使う
```
<code class="language-html"><li sec:authorize-url="/admin/">
    <a href="/hoge">管理者にしか見えないリンク</a>
</li>
````

