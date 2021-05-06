---
layout: post
title: "Knockout.jsを使っていてハマった事"
date: "2015-08-29 15:00:00 +0900"
categories: 
  - blog
---
## はじめに

Knockout.js 3.3.0を使い始めて数週間ですが、  

とりあえずハマった事をメモします。  

## Mapping

JSONからKnockoutのObservableを作ってくれる便利なプラグインですが…  

### ko.toJSONするといらないものが付く

*ko_mappings* みたいなのが付いてしまう。  

→ ko.mapping.toJSON を使う必要がある。  

## Editables

編集のロールバックや、変更されたか否かを自動で判定してくれる便利なもの。  

### ko.editable(hoge) すると hasChanges が追加されてしまう

ko.mapping.toJSONしたときに余計なプロパティが  

付いてしまう。（で、例えばJavaとか型の固い言語にJSON化して引き渡すとhasChangesを  

解釈できずにコケる）  

→どうにもならないので、ko.mapping側のignoreに追加する。hasChangesという名前をフィールドに使えなくなるが仕方が無い（editable使う時点で使えないし）  


<a href="http://knockoutjs.com/documentation/plugins-mapping.html">http://knockoutjs.com/documentation/plugins-mapping.html  

```
`ko.mapping.defaultOptions().ignore = ["hasChanges"];
````

## observableArrayにsubscribeしたは良いけど、変更が通知されない

→FAQらしい。observableArrayは中身について一切関知しない。  

なので、追加／削除の時しか通知は来ない。  

see: <a href="http://kojs.sukobuto.com/docs/observableArrays">http://kojs.sukobuto.com/docs/observableArrays  

・・・でもこれ、直感的な動作とは言いがたいような気がする。  

### じゃあ中身の変更を知りたい時は？

ObservableArrayの中身のプロパティを、ko.observableで定義して（ko.mappings使えば自動）  

Array内の全てのオブジェクトの、必要なプロパティにSubscribeすれば良い。  

Subscribeするときは、次の項目の通り、 this に束縛する値に都合のよいものを指定する。  

### Subscribeしたは良いけど、変更されたオブジェクトがハンドラに渡ってこない！

Subscribeするときの第二引数で、ハンドラの this に束縛する値をセットする必要がある。  

### Subscribeをやめたい

Subscribeした時に返ってくるオブジェクト.dispose() すればOK。  

```
`ko.utils.arrayForEach(array.items(), function (item) {
	var subscribe = item.value.subscribe(function (newValue) {
		// 変更されたときのハンドラ
	}, item);     // 第二引数にちゃんと対象オブジェクトを指定しておく
	
	subscribe.dispose();  // subscribeやめる
});
````

## observableDictionaryがSubscribeできない

実装されてないのでどうにもならない模様。私は諦めた。  

ただし、中身は普通にObservableなはずなので、subscribeできるはず。  

## $rootは出来るだけ使わない

ViewModel一個で画面を作っている場合、$root = $parent となるのが大半でしょう。  

この時、できるだけ $parent で指定しておいた方が良いです。  

後々、画面が複雑化してきて、複数ViewModelに分割した場合（以下例参照）  

```
`    // 例えばこんな感じです
    var viewModel = new MainViewModel();
    var subModel = new SubViewModel();
    ko.applyBindings({
        main: viewModel
        , sub: subModel
    });
    
    // HTML内
    <div id="main" data-bind="with: main">
    略
    </div>
    <div id="sub" data-bind="with:sub">
    略略
    </div>
````


元々$rootで取得していたものは $root.main で参照するようになります。  

$rootを使っている箇所、全て書き直しになってしまうので、$parentを  

できるだけ使う事をおすすめします。というより、$rootを使わないといけないことは  

滅多にないはずです。  


→2015/08/30 追記  

そもそも、大きく囲んだ要素に data-bind="with: main" と書いてあるのであれば  

mainのviewModelの中の要素を指定する際、プレフィックス的なものは不要。  

とりあえず data-bind="with:hoge" を書いておいた方が収まりがいいと感じた。  

バインディングコンテキストは理解しておいた方がよさそう。  


-> 2015/09/30 追記  

viewModelが一つしかない場合でも、ko.applyBindings(viewModel); は使わずに  

上のコードのように連想配列を渡しておけば、後からＶＭ分割したくなっても安心。  

## 可能であれば if より visibleを使う

ifは、条件がfalseな時に、その中の要素を本当に消してしまいます。  

条件が成立すると、中の要素を追加します。何が問題かというとバインドした  

イベントが消えるということです。  

visibleであれば隠れるだけなのでこういった問題は発生しません。  

