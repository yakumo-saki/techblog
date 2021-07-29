---
title: Fedora24にZFSを入れたらAutomountが動かない
permalink: /p/bc33e93d6cab41e0b3cca4da3ee9ea33
tags: []
date: 2017-05-23 03:00:00
updated: 2021-07-29 02:06:07
---

## 環境

Fedora 24

ZFS (ZFS on Linux) 0.6.5.8 　（以下、ZoL）

## 問題

そもそも、0.6.5.8 になるまで Fedora24 で ZoL をインストールできなかった。

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
```

## 参考 URL

<a href="https://github.com/zfsonlinux/zfs/issues/2575"><https://github.com/zfsonlinux/zfs/issues/2575></a>
