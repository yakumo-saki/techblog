---
layout: post
title: "kubernetes 1.16 -> 1.18 アップグレードメモ"
date: "2020-04-15 16:37:00 +0900"
categories: 
  - blog
---
## 前提として知っておくべき知識

* kubernetes のマイナーバージョンを飛ばしたアップグレードは不可能
* マスターとワーカーのノードのマイナーバージョンは 1 違いまで許される
* なので、1.16 -> 1.17 、1.17 -> 1.18 と2回のバージョンアップが必要

## 1.16 -> 1.17
### 準備

以下の問題にひっかかるので、 マスターノードの、 `/var/lib/kubelet/config.yaml` に以下の二行を追加  

```
`featureGates:
  CSIMigration: false
````


* <a href="https://stackoverflow.com/questions/59279546/kubeletnotready-failed-to-initialize-csinodeinfo">https://stackoverflow.com/questions/59279546/kubeletnotready-failed-to-initialize-csinodeinfo
* <a href="https://github.com/kubernetes/kubeadm/issues/1795">https://github.com/kubernetes/kubeadm/issues/1795

### 実際のバージョンアップ

1.16 から 1.17.x にバージョンアップ。  

#### マスター
```
`$ sudo apt-mark unhold kubeadm kubelet kubectl 
$ sudo apt update
$ sudo apt install kubeadm=1.17.4-00 kubelet=1.17.4-00 kubectl=1.17.4-00
$ sudo kubeadm upgrade plan 
（upgradeしてよいという表示がでるかチェック）

$ sudo kubeadm upgrade apply v1.17.4
````

#### ワーカー

以下を1台ずつ、全台に対して行う  

```
`$ kubectl drain <workername> --ignore-daemonsets --delete-local-data
※ metrics-serverがひっかかるので、delete-local-dataを付けている。
※ 当方の環境はデータは全てNFSなので問題無いが、セットアップによってはマズいかもしれない

$ sudo apt-mark unhold kubelet kubectl kubeadm
$ sudo apt update
$ sudo apt install kubelet=1.17.4-00 kubectl=1.17.4-00 kubeadm=1.17.4-00

$ kubectl uncordon <workername>

````

#### 1.17 -> 1.18 へのバージョンアップ

ここまでの手順を 1.17.4 -> 1.18.1 （執筆時点）に変更して、再度実行する。  

