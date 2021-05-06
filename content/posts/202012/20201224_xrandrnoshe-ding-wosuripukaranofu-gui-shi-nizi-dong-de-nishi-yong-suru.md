---
layout: post
title: "xrandrの設定をスリープからの復帰時に自動的に適用する"
date: "2020-12-24 08:17:19 +0900"
categories: 
  - blog
---

<a href="https://forums.linuxmint.com/viewtopic.php?t=288050">https://forums.linuxmint.com/viewtopic.php?t=288050  

に書いてあることなんだけども、自分的にすごい満足度があがったのでメモ  


* /lib/systemd/system-sleep/xrandr


内容は以下の通り  

```
`#!/bin/sh
   case $1 in
   post) 
   su XXX -c "DISPLAY=:0 xrandr （省略）"
;;
esac
````

