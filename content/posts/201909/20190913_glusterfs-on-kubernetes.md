---
layout: post
title: "GlusterFS on Kubernetes セットアップメモ"
date: "2019-09-13 14:07:00 +0900"
categories: 
  - blog
---
## 変更履歴

* 2019/09/13 初稿。 kubernetes 1.15.3
* 2019/09/26 storageclass.yamlのresturlについてを追記。

## requirements

* 3台以上のノード(1台でも2台でも動くのですが、1台だとありがたみが薄い、2台だとスプリットブレインの可能性）
* それなりのディスク容量とディスクをGlusterFSのノードに割り当て済みであること。（パーティションでもいけそうに思えるが未検証）

## 準備

最後のデプロイスクリプトが、deployディレクトリの構造に依存している為、ディレクトリ名の変更等は  

してはいけません。また、以下のファイル類はkubectlコマンドが使えればどのマシンに置いてあっても問題なさそうですが、  

一応、kubernetesのmasterノードで行いました。  

### 各ノードの準備

/etc/modules-load.d/glusterfs.conf というファイル名で、GlusterFSの全ノードに以下の内容のファイルを配置します。  

再起動ができれば再起動が一番良いですが、とりあえず `modprobe` でロードしてもよいと思います。  

この作業は、GlusterFSのノード全てで必要です。（大事なので強調）  

```
<code class="language-/etc/modules-load.d/glusterfs.conf">dm_snapshot
dm_mirror
dm_thin_pool
````

### clone

まずは、以下のリポジトリをcloneします。ZIPでダウンロードでもOKです。  

<a href="https://github.com/gluster/gluster-kubernetes/">https://github.com/gluster/gluster-kubernetes/  

使用するのは、deployディレクトリ以下のみなので、以下deployディレクトリを基準に説明します。  

### topology.jsonの準備

topology.json.sample をコピーしてtopology.json とします。  

内容はsampleを見て頂いた方が早いと思います。  

### gk-deployスクリプトの修正

最近のkubernetesで変更になったオプションが使われている為、以下のissueの内容に従ってgk-deployを書き換えます。  

具体的には、 `--show-all` を検索して、削除して下さい。  

<a href="https://github.com/gluster/gluster-kubernetes/issues/582">https://github.com/gluster/gluster-kubernetes/issues/582  

```
`例
#heketi_pod=$(${CLI} get pod --no-headers --show-all --selector="heketi" | awk '{print $1}')
                               ↓
heketi_pod=$(${CLI} get pod --no-headers --selector="heketi" | awk '{print $1}')
````

## 構築
### gk-deployスクリプトの実行

gk-deployスクリプトを実行します。失敗に備えて、一度本記事を最後まで読んでからやることをおすすめします。  

```
`./gk-deploy -gv -w 600 --admin-key admkey --user-key usrkey

-g クラスタを新しく構築する
-v ログ出力を多めに
-w podが起動するまでの待ち時間。デフォルト300秒だが、当方の環境ではタイムアウトが発生した。
--admin-key 管理者用パスワード（と思われる）
--user-key ユーザー用パスワード（と思われる）
````

### storageclassのapply

gk-deployが成功すると、最後に、storageclass.yaml の内容が表示されます。  

後でapplyするので、 `storageclass.yaml` のような名前でファイルに保存して下さい。  


表示される内容が誤っている場合があるので、 `resturl:` の指定が正しいことを確認して下さい。  


`resturl` は、PVを確保する際に使用する heketiのAPIエンドポイントのアドレスです。  

heketiはスクリプト内で自動的にデプロイされています。  

エンドポイントはServiceから取得することができます。具体的には以下です。  

```
<code class="language-shell:heketi_Endpoint取得">> kubectl get svc heketi
NAME     TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)    AGE
heketi   ClusterIP   10.99.248.111   <none>        8080/TCP   15m
                     ~~~~~~~~~~~~~                 ~~~~
````


これで取得したIPアドレスとポートが、 `storageclass.yaml` 内に指定されているか確認して下さい。  

*当方が実行した際は、誤った値が表示されていました。*  

```
<code class="language-yaml:storageclass.yaml">apiVersion: storage.k8s.io/v1beta1
kind: StorageClass
metadata:
  name: glusterfs-storage
provisioner: kubernetes.io/glusterfs
parameters:
  resturl: "http://10.99.248.111:8080"  <= heketi の serviceから取得可能
#  restuser: "user"                    <= gk-deployはuserを指定しているのですが、
#  restuserkey: "usrkey"               <= adminに書き換えないと動きませんでした。
  restuser: "admin"                    
  restuserkey: "admkey"                
reclaimPolicy: Retain                  <= 個人的好みです。PV削除時に物理削除されなくなります。
allowVolumeExpansion: true             <= PV拡張を許可する
````


ここまで確認したら、 `kubectl apply -f storageclass.yaml` でStorageClassを生成して完了です。  

### （必要であれば） 作成したStorageClassをデフォルトに指定する

PVCを作成する際に、StorageClass名を指定すれば良いのですが、省略された際にこのStorageClassが使用される  

ようにする為には、defaultに指定する必要があります。  

```
<code class="language-shell-session">> kubectl patch storageclass glusterfs-storage -p '{"metadata": {"annotations":{"storageclass.kubernetes.io/is-default-class":"true"}}}'
````


適用されたかどうかは以下のコマンドで確認できます。  

```
`> kubectl get sc
NAME                           PROVISIONER               AGE
nfs                            nfs-client/nfs-ssd        42d
glusterfs-storage (default)    kubernetes.io/glusterfs   37m  <= (default) がついた
````

## 蛇足
### 失敗時のやりなおし

この記事はここが書きたいので書きました。  

```
<code class="language-shell">./gk-deploy -gv -w 600 --admin-key admkey --user-key usrkey --abort
````


末尾に `--abort` をつけるとやり直しができますが、途中でディスクに対して変更を行ってしまっている場合、abortしても  

成功しません。 全ノードの `topology.json` で指定したディスクに対して `wipefs --all /dev/sdb` のように  

各種シグネチャを削除する必要があります。  

ありますが･･･　恐らく、`resource busy` と言われて失敗するかもしれません。  

その場合、一度ディスクをデタッチしてから再度行うと上手く行くと思います･･･が、恐らく、デバイス名が変わってしまいます。  

最終的には再起動しかありません。（むしろご存じでしたら教えて下さい）  

