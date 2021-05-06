---
layout: post
title: "kubenetesクラスタに突然接続できなくなった (証明書の期限切れ)"
date: "2020-07-27 15:39:00 +0900"
categories: 
  - blog
---
## 前ふり

* kubernetes 1.18.x

## tl;dr;

* 証明書の期限切れ

## 流れ

* 2020/07/28 の昼頃から、kubectlを使ってpodに処理を実行させる系のジョブがすべてコケる
* 自分のPCからkubectlコマンドを打つと `error: You must be logged in to the server (Unauthorized)` がでる
* ググりまくるもののまったく成果なし。
* kubectlのバグを踏んだのではないかとおもい、コントロールノードのkubeadm, kubectl, kubelet をアップグレードした（本当は良くない）
* 再度 kubectl コマンドを自分の端末から打つと、`The connection to the server 192.168.10.190:6443 was refused - did you specify the right host or port?` となった
* ここで、kubeletの状態を `systemctl status kubelet` で確認したところ、`activating` となっており起動できてないということがわかる
* kubeletのログを `journalctl -u kubelet` で見たところ、 `part of the existing bootstrap client certificate is expired: 2020-07-27 06:24:58 +0000 UTC` というメッセージが出て異常終了していた。

## 復旧手順
```
<code class="language-sh"># バックアップを取得
sudo su -
mkdir ~/k8s_backup_20200728
cp -rva /etc/kubernetes ~/k8s_backup_20200728/
````

```
<code class="language-sh"># とりあえずkubelet停止。
sudo systemctl stop kubelet
````

```
<code class="language-sh"># kubeadm init phase certs all 
W0728 00:52:10.502471    3790 configset.go:202] WARNING: kubeadm cannot validate component configs for API groups [kubelet.config.k8s.io kubeproxy.config.k8s.io]
[certs] Using certificateDir folder "/etc/kubernetes/pki"
[certs] Using existing ca certificate authority
[certs] Using existing apiserver certificate and key on disk
[certs] Using existing apiserver-kubelet-client certificate and key on disk
[certs] Using existing front-proxy-ca certificate authority
[certs] Using existing front-proxy-client certificate and key on disk
[certs] Using existing etcd/ca certificate authority
[certs] Using existing etcd/server certificate and key on disk
[certs] Using existing etcd/peer certificate and key on disk
[certs] Using existing etcd/healthcheck-client certificate and key on disk
[certs] Using existing apiserver-etcd-client certificate and key on disk
[certs] Using the existing "sa" key
````


この時点ではまだ kubelet が起動してこない  

```
`# kubeadm alpha certs renew all
[renew] Reading configuration from the cluster...
[renew] FYI: You can look at this config file with 'kubectl -n kube-system get cm kubeadm-config -oyaml'
[renew] Error reading configuration from the Cluster. Falling back to default configuration

W0728 00:58:18.634587    4408 configset.go:202] WARNING: kubeadm cannot validate component configs for API groups [kubelet.config.k8s.io kubeproxy.config.k8s.io]
certificate embedded in the kubeconfig file for the admin to use and for kubeadm itself renewed
certificate for serving the Kubernetes API renewed
certificate the apiserver uses to access etcd renewed
certificate for the API server to connect to kubelet renewed
certificate embedded in the kubeconfig file for the controller manager to use renewed
certificate for liveness probes to healthcheck etcd renewed
certificate for etcd nodes to communicate with each other renewed
certificate for serving etcd renewed
certificate for the front proxy client renewed
certificate embedded in the kubeconfig file for the scheduler manager to use renewed
````


これでもダメだった  

```
<code class="language-sh"># cd /etc/kubernetes/pki
# mv {apiserver.crt,apiserver-etcd-client.key,apiserver-kubelet-client.crt,front-proxy-ca.crt,front-proxy-client.crt,front-proxy-client.key,front-proxy-ca.key,apiserver-kubelet-client.key,apiserver.key,apiserver-etcd-client.crt} ~/k8s_backup_20200728/
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
# mv {admin.conf,controller-manager.conf,kubelet.conf,scheduler.conf} ~/k8s_backup_20200728/
# kubeadm init phase kubeconfig all
W0728 01:05:49.334781    5092 configset.go:202] WARNING: kubeadm cannot validate component configs for API groups [kubelet.config.k8s.io kubeproxy.config.k8s.io]
[kubeconfig] Using kubeconfig folder "/etc/kubernetes"
[kubeconfig] Writing "admin.conf" kubeconfig file
[kubeconfig] Writing "kubelet.conf" kubeconfig file
[kubeconfig] Writing "controller-manager.conf" kubeconfig file
[kubeconfig] Writing "scheduler.conf" kubeconfig file
````


これで kubelet が起動するようになった。大量にエラーを吐いているが起動はするようなので、  

ここで一度 `reboot` を行った  

```
`# ~/.kube/config を置換
$ sudo cp /etc/kubernetes/admin.conf ~/.kube/config

$ kubectl version
Client Version: version.Info{Major:"1", Minor:"18", GitVersion:"v1.18.6", GitCommit:"dff82dc0de47299ab66c83c626e08b245ab19037", GitTreeState:"clean", BuildDate:"2020-07-15T16:58:53Z", GoVersion:"go1.13.9", Compiler:"gc", Platform:"linux/amd64"}
Server Version: version.Info{Major:"1", Minor:"18", GitVersion:"v1.18.5", GitCommit:"e6503f8d8f769ace2f338794c914a96fc335df0f", GitTreeState:"clean", BuildDate:"2020-06-26T03:39:24Z", GoVersion:"go1.13.9", Compiler:"gc", Platform:"linux/amd64"}

Server Version が表示されていればOK!
````

## 最後に

* kubectlを使用する端末の ~/.kube/config を置き換えていってください。
* kubectl get nodes した結果、既存のノードとの接続は切れていませんでした。
* kubeletが起動していない間もクラスタの管理ができないだけで、起動済みのPodは正常に可動していました。
* 正直、肝を冷やしたので勘弁してほしい。

## 蛇足
### 証明書の確認

今回の件と関係ないような気もするが、クラスタ内で使用される証明書の期限を一括表示できる。  


* <a href="https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-certs/">https://kubernetes.io/docs/tasks/administer-cluster/kubeadm/kubeadm-certs/
* `kubeadm alpha certs check-expiration`

### 誕生日
```
<code class="language-sh">$  kubectl get nodes
NAME          STATUS   ROLES    AGE    VERSION
kubemaster    Ready    master   365d   v1.18.6
kubeworker1   Ready    <none>   352d   v1.18.5
kubeworker2   Ready    <none>   352d   v1.18.5
kubeworker3   Ready    <none>   350d   v1.18.5
````


とんだ誕生日プレゼントだった  

