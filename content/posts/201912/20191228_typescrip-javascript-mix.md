---
layout: post
title: "TypescriptとJavascriptが混在しているときの対処メモ"
date: "2019-12-28 14:28:00 +0900"
categories: 
  - blog
---
## はじめに

* Typescript初心者です。
* 既存のjavascriptのコードにtypescriptを混ぜ込んでいく時の色々をメモします。
* tsc とかの導入は省略します。

# メモ
## documentがundefinedと言われる。

その .ts ファイルの先頭に  

```
`declare var document: Document;
````


を追加する。既に存在する document は Document型であるという宣言。  

Document型は標準で d.ts を持ってくれているのでそのまま使える。  

## window が undefined と言われる
```
`declare var window: Window &amp; typeof globalThis;
````


Window型は標準で d.ts を持ってくれているのでそのまま使える。  

globalThisという謎の型は恐らく windows.* にはglobalな変数も入ってしまうので、  

そこをどうにかする宣言だと思われる。  

## document.getElementById("hoge") が possible null とか言われる。

* TS2531: Object is possibly 'null'.
* TS2345: Argument of type 'HTMLElement | null' is not assignable to parameter of type 'Element'. Type 'null' is not assignable to type 'Element'.


getElementByIdに指定したIDの要素がHTML中に無ければnullが帰ってきてしまうから怒られている。  

`document.getElementById('hoge')!`  のように末尾に `!` をつけると、nullチェックをスルーできる。  

…本当はちゃんとチェックするべきでしょうけども。  

## 型にStringと書いたものを引き渡そうとしたら警告された

* TS2322: Type 'String' is not assignable to type 'string'. 'string' is a primitive, but 'String' is a wrapper object. Prefer using 'string' when possible.


stringとStringは別モノです。 恐らく、 String ではなく string で問題ないはず。  

変数の定義を直しましょう。  

## console.log しようとしたら Cannot find name 'console'
```
`declare var console: Console;
````

## windowにプロパティを追加したいができない

* TS2339: Property 'app' does not exist on type 'Window &amp; typeof globalThis'.

```
`declare global {
    interface Window {
	myProperty: any;
    }
}
window.myProperty = console;  // 入れれる
````


anyなのはサンプルだからで、型が解るなら型を入れた方がいい  

