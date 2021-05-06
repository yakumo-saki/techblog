---
layout: post
title: "LinuxにCanon MG7530 のスキャナを設定する"
date: "2020-07-11 07:38:00 +0900"
categories: 
  - blog
---
## 前提

* Linux Mint 20 (Ubuntu 20.04LTSベース)

## 前置き

<a href="https://wiki.archlinux.org/index.php/SANE">https://wiki.archlinux.org/index.php/SANE  

ここ見れば答えが書いてある感じ。  

## 手順
### 準備

* プリンタ本体の、ｾｯﾄｱｯﾌﾟ→本体設定→LAN設定→その他の設定→プリンタ名設定 でプリンタ名を調べておく。
* プリンタ名.local にpingして名前解決とネットワーク的疎通が取れることを確認する。
* プリンタ名.local が使えない場合は、IPアドレスでも良い

### 設定

* 一応 xsane をソフトウェアの管理 から入れておく
* `/etc/sane.d/pixma.conf` に以下の行を追加。

```
<code class="language-conf"># （末尾に追加）
bjnp://<printerName_Or_IPaddr>.local
# 例
bjnp://mg7530.local   
````

### スキャン

* アプリケーションのドキュメントスキャナーを使ってスキャンをテストする。
* xsaneでもいいはずだが、使い方が難しそうなのでやめておいた。

