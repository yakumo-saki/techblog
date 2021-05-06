---
layout: post
title: "pfSense on KVM でNICをVirtIOにするとハマる"
date: "2015-08-21 15:00:00 +0900"
categories: 
  - blog
---
# 環境

pfSenseが CentOS 7 上のKVMに乗っていて、家庭内LANのデフォルトゲートウェイになっている。  

フレッツ光 - (pppoe) - pfSense - LAN というイメージ。  

pfSenseのバージョンは 2.2.1-RELEASE (amd64)  

## NICをVirtIOにすると何が起きる？

大体はまともに動くが、仮想マシンホスト→pfSense→インターネット の通信だけがおかしくなる。  

現象としては  

・Pingはインターネットに向けて打っても届く  

・他の通信方法は届かない。応答が帰ってこない。（例えばHTTP(s)はダメ）  

## 対処

pfSenseのNICをVirtIOにしない。e1000にすれば普通に動く。  

## その他所感など

同じく、UbuntuのKVMでも同じようにハマったので多分、何かバグってる。  

