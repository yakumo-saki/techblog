---
layout: post
title: "Redmine - BitBucket 連携設定方法"
date: "2015-08-26 15:00:00 +0900"
categories: 
  - blog
---
## このメモは

社内用資料を書くためのメモだったものをQiitaにUPしちゃえ程度に書いているので  

割と適当です。  

## 前提

本体：  

Redmine 2.6.5.stable  


プラグイン：  

Redmine Bitbucket plugin 1.0.0  

<a href="https://bitbucket.org/steveqx/redmine_bitbucket">https://bitbucket.org/steveqx/redmine_bitbucket  


プラグイン導入時の前提として、一度Redmineを実行しているユーザーから、bitbucketに  

鍵認証でログインする必要がある。  

（＝SSH鍵でログイン出来る状態にまでRedmineサーバー、Bitbucketの設定が必要。メモでは割愛）  

## Redmine側の設定

* 設定→リポジトリタブの一番下、新しいリポジトリをクリック
* バージョン管理システム git を選択
* リポジトリのパスに <a href="mailto:git@bitbucket.org">git@bitbucket.org:ownername/[bitbucketのプロジェクト識別子].git  

＃例えば、git@bitbucket.org:yourname/projectname.git

## Bitbucket側の設定（フック）

* BitBucketのプロジェクトの設定（左下の歯車アイコン）を開く
* フックを選んで、Select a hook 欄から　POST　を選択
* URLに http://[redmineサーバー]/hooks/bitbucket/[redmineのプロジェクト識別子]?key=[redmineのAPIキー（管理ページで作成する）]  を入力

## 結果

BitBucketにpushすると自動的にRedmineがレポジトリ内容を再取得しに行くようになる。  

