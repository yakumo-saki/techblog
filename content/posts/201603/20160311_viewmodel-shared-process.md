---
layout: post
title: "ViewModelに共通する処理をまとめたい"
date: "2016-03-11 15:00:00 +0900"
categories: 
  - blog
---
## 出典

<a href="http://stackoverflow.com/questions/16569810/knockout-viewmodel-base-class-javascript-inheritance">http://stackoverflow.com/questions/16569810/knockout-viewmodel-base-class-javascript-inheritance  

## やり方
```
`// 1 共通の処理
(function (ko, undefined) {
	ko.MyBase = function () {
		var self = this;
		//  共通で使う変数とかメソッドとか
		self.test = function() {
			alert('test');
		}
	}
}(ko));

// 2 個別の画面で使うVM
function MyViewModel() {
	"use strict";

    var self = this;
	ko.MyBase.call(self);


}

// new するとき
var myVM = new MyViewModel();
myVM.test();   // alert
````


* 共通の処理を 1 のように書く
* それを使用するVMを 2 のように書く。 var self = this した後に、 ko.[ベースの名前].call(self) を呼ぶのがポイント
* あとは普通のViewModelとして使うだけ


共通の処理に記述された内容がそのままViewModelに存在するのと  

同様に処理されるので、お手軽に共通処理をくくり出せて便利。  

