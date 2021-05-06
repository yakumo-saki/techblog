---
layout: post
title: "knockoutjs + Typescript でのViewModelの書き方"
date: "2016-03-14 15:00:00 +0900"
categories: 
  - blog
---
## はじめに

knockoutjs + Typescript でのViewModelの書き方が分からなかったので  

試行錯誤した結果をまとめてみる。Webアプリケーション向けです。  

注意：書いた人はTypescript初心者です。間違ってたらコメント下さい。  


参考にしたページ（英語）:  

<a href="https://github.com/Microsoft/TypeScript/wiki/'this'-in-TypeScript">https://github.com/Microsoft/TypeScript/wiki/'this'-in-TypeScript  

## 書き方
```
`///<reference path="../../typings/jquery/jquery.d.ts"/>
///<reference path="../../typings/knockout/knockout.d.ts"/>
///<reference path="../../typings/knockout.mapping/knockout.mapping.d.ts"/>
// ライブラリの型宣言ファイル取込。

// 外部変数の宣言（html直書きのscriptの変数を参照するとか) …注１
declare var nextUrl: String;

// 
class HogeViewModel {
  // koお約束の self = this はいらない

  // クラス変数宣言。 self.hoge = ko.observable(true);
  hoge:knockoutObservable<boolean> = ko.observable(true);

  // 普通のクラスメソッド。これは普通のTypescript
  hogeMethod(layer1:any):void {
     （略） 
  }

  // イベントハンドラにする場合・・・注２
  eventHandler = (layer1:any):void => {
    （略）
  }

}
````

### 注１ 外部変数

例えば、遷移先URLとか。次の例でいうとnextUrl  

```
`<!-- html(thymeleaf)内だと思って下さい -->
<script th:inline="javascript">
var nextUrl = /*[[@{/next/url}]]*/ '/app/next/url';
// さすがにこれはts内には埋め込めない
</script>
````

### 注２ イベントハンドラにする場合

イベントハンドラにする場合とは、例えば data-bind="click: eventHandler" とか、  

jQuery.on するとか、そういう場合のことを指す。  

この場合、書き方をしないと、thisがインスタンスではなく他のものを指してしまう。  

＃ data-bind=click だとそれに紐付いたオブジェクトのインスタンスになったりとか。  

## その他

今まで self.hogehoge で参照していたものは全て、 this.hogehoge に書き換えが  

必要。慣れれば頭を使わずに js -> ts にコンバート出来るかもしれません。  

## ライブラリ用の型宣言ファイルについて

<a href="https://github.com/DefinitelyTyped/DefinitelyTyped">https://github.com/DefinitelyTyped/DefinitelyTyped  

ここからダウンロードすれば良い。が。さすがにgibhubから直接探すのは辛いので、それ用の  

ツールを使う。個人的には dtsm がオススメ。コマンドが yum とか apt-get ぽくて慣れやすい  

dtsm <a href="http://qiita.com/vvakame/items/38b953ab0f4de63cce8b">http://qiita.com/vvakame/items/38b953ab0f4de63cce8b  

