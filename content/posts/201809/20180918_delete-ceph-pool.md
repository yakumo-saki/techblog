---
layout: post
title: "Cephのpoolを消すメモ"
date: "2018-09-18 15:00:00 +0900"
categories: 
  - blog
---

(メモばっかり）  

## 環境

* Ceph mimic (on ubuntu 18.04LTS)

## 手順

cephコマンド使えるところから操作します。  

```
`# pool削除を許可（危ないので後で戻します）
ceph config set mon  mon_allow_pool_delete true

# 削除
# poolname が二重になっているのは間違いではありません。本当にそうしろって言われます。
ceph osd pool delete poolname poolname --yes-i-really-really-mean-it
pool 'poolname' removed

# pool削除を不許可
ceph config set mon mon_allow_pool_delete false

````

