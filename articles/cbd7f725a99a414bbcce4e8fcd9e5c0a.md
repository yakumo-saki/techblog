---
title: kubenetesクラスタに突然接続できなくなった (証明書の期限切れ)
permalink: /p/cbd7f725a99a414bbcce4e8fcd9e5c0a
tags: []
date: 2021-07-29 12:38:07
updated: 2021-07-29 12:58:30
---

## 前ふり

- kubernetes 1.20.0
- kubeadm v1.21.0

## tl;dr;

- 証明書の期限切れ

## 流れ

- 2020/07/28 の昼頃から、kubectl を使って pod に処理を実行させる系のジョブがすべてコケる
- 自分の PC から kubectl コマンドを打つと `error: You must be logged in to the server (Unauthorized)` がでる
- 再度 kubectl コマンドを自分の端末から打つと、`The connection to the server 192.168.10.190:6443 was refused - did you specify the right host or port?` となった
- kubelet のログを `journalctl -u kubelet` で見たところ、 `part of the existing bootstrap client certificate is expired: 2021-07-27 06:24:58 +0000 UTC` というメッセージが出て異常終了していた。

## 復旧手順

去年の手順と完全に一緒。

### バックアップを取得

```
sudo su -
mkdir ~/k8s_backup_20210728
cp -rva /etc/kubernetes ~/k8s_backup_20210728/
```

### 証明書更新

```
# cd /etc/kubernetes/pki
# mv {apiserver.crt,apiserver-etcd-client.key,apiserver-kubelet-client.crt,front-proxy-ca.crt,front-proxy-client.crt,front-proxy-client.key,front-proxy-ca.key,apiserver-kubelet-client.key,apiserver.key,apiserver-etcd-client.crt} ~/k8s_backup_20210728/
# kubeadm init phase certs all --apiserver-advertise-address 192.168.10.190

W0728 01:03:46.960780    4926 configset.go:202] WARNING: kubeadm cannot validate component configs for API groups [kubelet.config.k8s.io kubeproxy.config.k8s.io]
[certs] Using certificateDir folder "/etc/kubernetes/pki"
[certs] Using existing ca certificate authority
[certs] Generating "apiserver" certificate and key
[certs] apiserver serving cert is signed for DNS names [kubemaster kubernetes kubernetes.default kubernetes.default.svc kubernetes.default.svc.cluster.local] and IPs [10.96.0.1 192.168.10.190]
[certs] Generating "apiserver-kubelet-client" certificate and key
[certs] Generating "front-proxy-ca" certificate and key
[certs] Generating "front-proxy-client" certificate and key
[certs] Using existing etcd/ca certificate authority
[certs] Using existing etcd/server certificate and key on disk
[certs] Using existing etcd/peer certificate and key on disk
[certs] Using existing etcd/healthcheck-client certificate and key on disk
[certs] Generating "apiserver-etcd-client" certificate and key
[certs] Using the existing "sa" key

# cd /etc/kubernetes
# mv {admin.conf,controller-manager.conf,kubelet.conf,scheduler.conf} ~/k8s_backup_20210728/
# kubeadm init phase kubeconfig all
W0728 01:05:49.334781    5092 configset.go:202] WARNING: kubeadm cannot validate component configs for API groups [kubelet.config.k8s.io kubeproxy.config.k8s.io]
[kubeconfig] Using kubeconfig folder "/etc/kubernetes"
[kubeconfig] Writing "admin.conf" kubeconfig file
[kubeconfig] Writing "kubelet.conf" kubeconfig file
[kubeconfig] Writing "controller-manager.conf" kubeconfig file
[kubeconfig] Writing "scheduler.conf" kubeconfig file
```

ここで一度 `reboot` を行った

```
`# ~/.kube/config を置換
$ sudo cp /etc/kubernetes/admin.conf ~/.kube/config

$ kubectl version
Client Version: version.Info{Major:"1", Minor:"21", GitVersion:"v1.21.3", GitCommit:"ca643a4d1f7bfe34773c74f79527be4afd95bf39", GitTreeState:"archive", BuildDate:"2021-07-16T17:16:46Z", GoVersion:"go1.16.5", Compiler:"gc", Platform:"linux/amd64"}
Server Version: version.Info{Major:"1", Minor:"21", GitVersion:"v1.21.0", GitCommit:"cb303e613a121a29364f75cc67d3d580833a7479", GitTreeState:"clean", BuildDate:"2021-04-08T16:25:06Z", GoVersion:"go1.16.1", Compiler:"gc", Platform:"linux/amd64"}

Server Version が表示されていればOK!
```

## 蛇足

通常の証明書は `kubeadm certs renew all` で更新可能だが、control-plane が起動時に使用する証明書は更新できない? そんなバカな話も無いと思うので何か手順を忘れているのかなんなのか…
