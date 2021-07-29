---
title: TypescriptとJavascriptが混在しているときの対処メモ
permalink: /p/b8c3ceaa3c3b47cda99cdfaf8b5c268c
tags: []
date: 2019-12-28 02:28:00
updated: 2021-07-29 01:37:40
---

## はじめに

- Typescript 初心者です。
- 既存の javascript のコードに typescript を混ぜ込んでいく時の色々をメモします。
- tsc とかの導入は省略します。

# メモ

## document が undefined と言われる。

その .ts ファイルの先頭に

```
`declare var document: Document;
```

を追加する。既に存在する document は Document 型であるという宣言。

Document 型は標準で d.ts を持ってくれているのでそのまま使える。

## window が undefined と言われる

```
`declare var window: Window &amp; typeof globalThis;
```

Window 型は標準で d.ts を持ってくれているのでそのまま使える。

globalThis という謎の型は恐らく windows.\* には global な変数も入ってしまうので、

そこをどうにかする宣言だと思われる。

## document.getElementById("hoge") が possible null とか言われる。

- TS2531: Object is possibly 'null'.
- TS2345: Argument of type 'HTMLElement | null' is not assignable to parameter of type 'Element'. Type 'null' is not assignable to type 'Element'.

getElementById に指定した ID の要素が HTML 中に無ければ null が帰ってきてしまうから怒られている。

`document.getElementById('hoge')!` のように末尾に `!` をつけると、null チェックをスルーできる。

…本当はちゃんとチェックするべきでしょうけども。

## 型に String と書いたものを引き渡そうとしたら警告された

- TS2322: Type 'String' is not assignable to type 'string'. 'string' is a primitive, but 'String' is a wrapper object. Prefer using 'string' when possible.

string と String は別モノです。 恐らく、 String ではなく string で問題ないはず。

変数の定義を直しましょう。

## console.log しようとしたら Cannot find name 'console'

```
`declare var console: Console;
```

## window にプロパティを追加したいができない

- TS2339: Property 'app' does not exist on type 'Window & typeof globalThis'.

```
`declare global {
    interface Window {
	myProperty: any;
    }
}
window.myProperty = console;  // 入れれる
```

any なのはサンプルだからで、型が解るなら型を入れた方がいい
