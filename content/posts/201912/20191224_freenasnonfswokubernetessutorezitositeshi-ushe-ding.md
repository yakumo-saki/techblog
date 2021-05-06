---
layout: post
title: "FreeNASのNFSをkubernetesストレージとして使う設定"
date: "2019-12-24 14:12:00 +0900"
categories: 
  - blog
---
## ただのメモ

FreeNASのNFSをkubernetesストレージとして使うときに、デフォルト設定だと動きません。（動かない可能性があります）  

何をどうすれば良いかメモします。  

使用しているFreeNASは 11.2 です  

## 設定

設定は二箇所あります。  

### 設定1 poolの権限設定

左側メニューの `Storage→Pools` を選択し、一覧の右端の　・・・　をクリックして、 `edit permission` を選択します。  


<img src="/images/2020/09/6a2403036e1c55e93c4c293d4f27c3fd.png" alt="6a2403036e1c55e93c4c293d4f27c3fd" loading="lazy">  


ポイントは、 `Mode` を全部チェックすることです。ようするにパーミッション 777 です。  

### 設定2 NFSの設定

左側メニューの `Sharing-> Unix(NFS) Shares` を選択し、一覧から、該当するNFS共有の右端の　・・・　を選択して、  

`Edit` を選択します。その後、`ADVANCED MODE` ボタンをクリックします。  


<img src="/images/2020/09/9f5fca96fb48ebd827e9a084cc3dabec.png" alt="9f5fca96fb48ebd827e9a084cc3dabec" loading="lazy">  


`Maproot User` 欄が空欄になっていると思いますが、ここに root と入力します。  


ここが空欄の場合、自動的にNFS経由でのrootでアクセスがnobodyに置き換えられてしまい、権限がほぼない。という状態に  

なってしまい、kubernetesのPod内のファイルのchown等が失敗してしまいます。  

