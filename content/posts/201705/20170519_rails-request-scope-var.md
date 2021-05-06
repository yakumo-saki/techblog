---
layout: post
title: "リクエストスコープの変数を作りたい"
date: "2017-05-19 15:00:00 +0900"
categories: 
  - blog
---
## 環境

* Rails 4.2.6
* Ruby 2.2.4
* request_scope 1.3.1

## どんな用途？

以下のような場合に有用です。  


* IPアドレスをログに出したりしたい
* Modelからセッションに入っているユーザー情報を参照したい

## How To

* gem 'request_store'  をGemfileに追加
* bundle install
* application_controller.rbにbefore_filterを追記
* どこからでも RequestStore.fetch() で3でセットした内容を使用可能

## コード例

上記手順の3で追記するコードは以下の通り  

```
<code class="language-rb:application_controller.rb">class ApplicationController < ActionController::Base
  before_filter :set_request_store
  def set_request_store
    RequestStore.store[:request] = request
  end
end
````


セットしたものを使いたい場合のコード  

```
<code class="language-rb:hoge_model.rb">RequestStore.fetch(:request) { nil }

RequestStore.fetch(:request) # 取得できないと no block given エラー
````


* 後ろについている { nil } は指定した値が取得できなかった（セットされていない）場合に実行されるブロック。
* 取得できなかった場合はブロックの返り値が返される（例だと、取得できなかった場合は nil）
* ブロックを書かずに取得出来なかった場合は no block given (yield) エラー
* 取得できた場合は、ブロックが無くても普通に動く

## 参考

リクエスト単位でグローバルな参照を持たせてAuditログをスッキリ実装したい  

<a href="http://qiita.com/ainame/items/823b396d560d82194d48">http://qiita.com/ainame/items/823b396d560d82194d48  

## その他

参考にしたQiitaに書いてある request_store_rails は最近でも更新があってそっちのがよさそうに見える。  

が、しかし。　request_store は大人気（私的見解） gon が依存しているので  

ただのrequest_storeで良いだろうと思っている。  

