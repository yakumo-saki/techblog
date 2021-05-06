---
layout: post
title: "Fedora24にZFSを入れたらAutomountが動かない"
date: "2017-05-23 15:00:00 +0900"
categories: 
  - blog
---
## 環境

Fedora 24  

ZFS (ZFS on Linux) 0.6.5.8　（以下、ZoL）  

## 問題

そもそも、0.6.5.8になるまでFedora24でZoLをインストールできなかった。  

バージョン上がってインストールは成功するようになって、マウントも正常に出来る。  

しかし、再起動すると自動的にマウントされない。  

## とりあえずの解決策

以下の通りコマンドを実行したらマウントされるようになった。  

```
`# dmesg中にsplが出力しているhostidが0x000000000 だとマズい？
# これでそれが修正される（が必要かどうかは不明）
dd if=/dev/urandom of=/etc/hostid bs=4 count=1

# なぜかこのあたりのサービスが動いていないようなので enable にする
systemctl enable zfs-import-cache
systemctl enable zfs-mount
````

## 参考URL

<a href="https://github.com/zfsonlinux/zfs/issues/2575">https://github.com/zfsonlinux/zfs/issues/2575  

