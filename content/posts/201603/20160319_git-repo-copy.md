---
layout: post
title: "gitのリポジトリを丸コピーする"
date: "2016-03-19 15:00:00 +0900"
categories: 
  - blog
---
## 何のためのメモ？

ある日あるとき、gitのリポジトリを移行する必要に駆られてしまい、  

色々と失敗したのでメモ。  

## pullしてremote変えてpushじゃダメなのか？

基本的なソースはそれでOK。  

ただし、それだけだとtagが消えたりするので、私は以下のコマンドをたたいた。  

## 取得
```
`git clone --mirror <RepositoryURL>
````


カレントディレクトリ以下に、リポジトリ名.git というディレクトリ名でクローンされる。  

## 移動先にpush
```
`git remote remove origin
git remote add origin <NewRepositoryURL>
git push --mirror
````

## まとめ

cloneとpushの時に --mirror オプションつけようね。っていうお話でした。  

