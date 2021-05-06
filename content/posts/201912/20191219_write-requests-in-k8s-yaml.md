---
layout: post
title: "障害記録：podにはできるだけrequestsに使用するメモリ量を書いた方が良い"
date: "2019-12-19 14:03:00 +0900"
categories: 
  - blog
---
## tl;dr;

* podにrequestsを書いた方がいい。特にメモリ量。
* さもないと、Out Of Memory(OOM)が発生してエライことになる可能性がある。

## 事故事例

requestsが書かれていない状態で起きた。  


* requestsがないのでメモリが逼迫したノードに新しいコンテナが配置された
* OOMが発生してワーカーノードがマスターノードと疎通できなくなった
* ワーカーノードがダウンしたと判断され、他のノードにpodが移動を始めた
* 他のノードもメモリ量がそれほどあるわけではないのでOOM発生
* ギリギリだったノードにさらに割り振られてOOM発生
* ワーカーノード全滅

## requestsに書くメモリ量が分からない

とりあえず稼働させてみて、そのpodが動作しているpodにSSHでログインし、  

`docker stats [containerID]` を実行することで使用中のメモリ量がわかる。  

## 記述例

Deployments、ReplicaSet、DaemonSet、StatefulSet等のconteinersの定義に書くことができる。  

`requests` はスケジューリングに使用されるが、制限はされない参考情報なので多すぎる分には問題だが  

少なくても問題は起きない（OOMが起きる可能性はあるが）のでちょっと多いくらいの数値が良いと思われる。  

※ 未確認ですが、リソースがどのノードでも不足する場合は、podが作成されずに `Pending` されるそうです。  

```
`containers:
  - name: db
    image: postgres:11
    resources:
      requests:
        cpu: 1000m         # CPU使用量の見込み
        memory: "500M"     # メモリ使用量の見込み
      limits:
        cpu: 2000m         # CPU使用量の上限
        memory: "700M"     # メモリ使用量の上限
````

