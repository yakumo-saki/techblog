---
layout: post
title: "MastodonのURLは、一度立てた後は変更してはいけない"
date: "2018-08-04 15:00:00 +0900"
categories: 
  - blog
---
## 環境

Mastodon 2.3.3  

## やったこと

元々、mastodon.example.com で運用していた（アカウント名は <a href="mailto:hoge@example.com">hoge@example.com)  

（要するに、.env.production でWEB_DOMAIN を指定してアカウント名と実際マストドンにアクセスするURLを変えていた）  

いくつかのクライアントが、返信する際に、 <a href="mailto:hoge@mastodon.example.com">hoge@mastodon.example.com と書いて返信して  

しまうようだったので、マストドン自体のURLも example.com でアクセスできるように、  

WEB_DOMAINの指定を消したところ、トラブルに遭遇した。  

## 現象

トゥートを行うと、SideKiqの pushジョブが失敗して、retryキューに溜まってしまう。  

現象はこのIssueの通り  

<a href="https://github.com/tootsuite/mastodon/issues/6667">https://github.com/tootsuite/mastodon/issues/6667  

## 対処

基本的には、対処方法はありません。元に戻すしかありません。。  

しかも、URL変更中に作成されたアカウント、かつ他インスタンスに登録されてしまうと、  

戻したとしても新しいアカウントについて同じことが発生してしまいます。  


しかし、Issueを見ると、他のインスタンスに既に登録されたアカウントと、URLの対応を変更する事ができず  

アカウント名重複エラーとなっているようなので、自インスタンス側の全てのアカウントを作り直すことで  

対応できます。（今回はほぼお一人様インスタンスだったので、こちらを選択しました）  

## 蛇足

アカウントとURLの対応の変更、下手に出来ちゃうとアカウント乗っ取りが可能になりかねないので  

なかなか難しいのでしょうね。  

## 追記

2.8くらいで、ユーザーを作り直す的なコマンドが toot-ctl に追加されているので、この記事の内容は古いかもしれません。  

