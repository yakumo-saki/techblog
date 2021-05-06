---
layout: post
title: "BeanValidation on SpringBoot"
date: "2017-05-26 15:00:00 +0900"
categories: 
  - blog
---
## ためした環境

* SpringBoot 1.3.5
* Java 8

## 基本

FORMのフィールドにアノテーションをつけると、自動的にバリデーションを  

行ってくれる。SpringBootの場合は、ControllerのBindingResultに結果が入る。  

```
<code class="language-java:MyForm.java">// lombok使ってると思ってください
@Data
public class MyForm {
    @NotNull
    String value;
}
````


単項目チェックはこれで十分。javax.constraintsに用意されているだけでも  

結構な数のバリデータがそろっているので割といける。  

<a href="https://docs.oracle.com/javaee/7/api/javax/validation/constraints/package-summary.html">https://docs.oracle.com/javaee/7/api/javax/validation/constraints/package-summary.html  


独自のバリデーションを作りたい場合も案外難しくはない。そう、単項目チェックならね。  

## 複合チェック

バリデータをがんばって作ればできるらしいので頑張る。  

…がそんなのは忘れるので応用のパターン使えばよいのではないか  

## 応用

BeanValidationのチェック対象は、フィールドだけではなく、メソッドの返り値もチェックできる。以下は例  

```
<code class="language-java:MyForm2">@Data
public class MyForm {
    String value;

    @AssertTrue
    public boolean isValueNotNull() {
        return (value != null);
    }
}
````


エラーメッセージは異なるが、value == null の時検証エラーになる。(NotNullと同条件）  

ということは、これで複数のフィールドにまたがるチェックを行うと話が早いだろう。  

注意事項としては、getterと同じルールのメソッド名にしないとチェックされない。  

本気でハマるので注意。  

## エラーメッセージ

普通にBeanValidationを使うと、エラーメッセージがかなりシステム寄りのものになる。  

それではいろいろと困る場合（ほとんど困る）メッセージリソースに以下のように記述する。  

```
<code class="language-messageResource.properties">AssertTrue.myForm.value = カスタムエラーです。
````


みたいな形で書くと各formごとにメッセージを変えられる。  

## 中の動きを想像してみる

検証対象クラス内のpublicメソッドを抽出する  

→getterとして正しくないメソッドは捨てる（返り値の型含めて）  

　boolean &amp; isMyMethod() はOK。 booleanでなければ get～である必要がある。  

→それぞれのメソッドごとに、アノテーションを探す。メソッドについていればその検証  

→getterぽいメソッド名からフィールド名を算出して、そのフィールドにアノテーションがあれば検証。  


みたいな動きしているのかなーと妄想。（ソース見ればいいんだけれども）  

チェック用アノテーションがついていても、getterとして正しくない返り値と、メソッド名の  

組み合わせの場合、無視されるので大体あっているのではないか。  

## TODO

記事内のソースがあってるかテストする  

