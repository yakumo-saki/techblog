---
layout: post
title: "DockerのAPIをTCPで待受させる"
date: "2019-12-12 13:55:00 +0900"
categories: 
  - blog
---
## 動機

家に数台のDockerを走らせるVMが存在している。それをまとめてWebで監視する為に、Portainerを導入した。  

Portainerは、リモートのDockerを管理する事ができるが、デフォルトではdockerd はTCP経由のAPIアクセスができない。  

これを変更する方法をメモする。  

## 環境

* Ubuntu 18.04.2 LTS
* Docker version 18.09.5, build e8ff056 (docker公式ページのaptリポジトリ使用インストール）

## 解決方法

解決方法は二つある。 どちらか片方を選択すること（両方やってはいけない）  

なお、失敗すると、dockerdが起動しなくなる。  

## 方法その1
## systemdの定義を変更して、 dockerd コマンドラインを変更する（直接指定）
```
`# systemctl edit dockerd.service

<エディタが開くので以下の内容で上書き>
[Service]
ExecStart=
ExecStart=/usr/bin/dockerd -H fd:// -H tcp://0.0.0.0:2375
````

## 方法その2
## systemdの定義を変更して、 dockerd コマンドラインを変更し、JSONの内容を反映可能にする
```
`# systemctl edit dockerd.service

<エディタが開くので以下の内容で上書き>
[Service]
ExecStart=
ExecStart=/usr/bin/dockerd
````


`/etc/docker/daemon.json` を以下の内容で作成する。 ディレクトリ・ファイルが存在しない場合は作成する。  

（デフォルトでは存在しない）  

```
<code class="language-json">{
    "hosts": ["fd://", "unix:///var/run/docker.sock", "tcp://0.0.0.0:2375"]
}
````

```
`# dockerd を再起動する
sudo systemctl restart dockerd.service
````

## なぜこんなことをするのか

dockerd の起動パラメタに `-H` が指定されていると、 `/etc/docker/daemon.json` に `hosts` が指定されていると  

エラーが発生して起動しなくなってしまうことが原因。  

