---
layout: post
title: "kubernetesのdocker -> containerd 切り替え"
date: "2021-04-20 05:58:48 +0900"
categories: 
  - blog
---
# まえがき
## 環境

* kubernetes 1.20.1
* workerもmasterも同じ手順で切り替え可能。

## 備考

用語の定義  

* master = コントロールプレーン
* worker = ワーカー

# 手順
## worker / master 共通
### docker削除

dockerを削除してcontainerdを入れる（dockerをつかっているならcontainerdはインストール済みなので、apt installで手動インストールフラグを建てておく）  

```
apt install contained
apt purge docker
```

### /var/lib/kubelet/kubeadm-flags.env

KUBELET_KUBEADM_ARGS に追記  

```
--container-runtime remote --container-runtime-endpoint unix:///run/containerd/containerd.sock
```

## masterでkubeadm の作業をする場合のみ

rootで作業する。  


共通の手順を行えば、とりあえずkubernetesクラスタは普通に稼働する。  

しかし、バージョンアップ時など、`kubeadm` を使用しようとすると  

```
[ERROR ImagePull]: failed to pull image k8s.gcr.io/kube-proxy:v1.21.0: output: Cannot connect to the Docker daemon at unix:///var/run/docker.sock. Is the docker daemon running?
```


このようなエラーが出てしまう。とりあえずの対処をしたがこれで正しいのかはちょっとわからない。  

### criSocketを指定するyamlを作る

これは、 `kubeadm config print init-defaults` の中から必要な行だけを切り出して作成した。  

```
apiVersion: kubeadm.k8s.io/v1beta1
kind: InitConfiguration
nodeRegistration:
  criSocket: /run/containerd/containerd.sock
```


ファイル名とファイルの場所はどこでもOK。  

### yamlのバージョン変換

作ったyamlを使用すると、それはバージョンが古いという警告がでるので変換しておく  


`kubeadm config migrate --old-config /etc/kubernetes/kubeadm-crisocket.yaml --new-config new.yaml`  

### 実際のコマンドを入力

`kubeadm upgrade apply v1.21.0 --config=new.yaml`  

### メモ

kubeadm はクラスタのconfigmapに情報を記録していて、それを読んでどうこうしているらしい。  

取得の仕方は以下。  


`kubectl -n kube-system get cm kubeadm-config -o yaml`  

## 蛇足

* masterを切り替えるとデータどうなるんだろうと不安だったけれども特に問題はなさそう。
* `kubeadm --cri-socket=/run/containerd/containerd.sock upgrade apply v1.21.0` が通ればなんの問題もなかったのだが、upgrade コマンドはcri-socketオプションが通らないように1.17から変更されている。

