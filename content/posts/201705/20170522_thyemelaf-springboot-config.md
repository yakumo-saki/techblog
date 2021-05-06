---
layout: post
title: "Thyemelafテンプレート内からSpringbootの設定値を取得する"
date: "2017-05-22 15:00:00 +0900"
categories: 
  - blog
---
## 動作確認環境

Springboot 1.3.5  

## 使い方
```
<code class="language-html"><div th:text="${@environment.getProperty('my.setting')}"></div>
````

## 所感

今までこれを知らずに、わざわざControllerでModelに設定値をセットとかやっていたのでメモ。  

