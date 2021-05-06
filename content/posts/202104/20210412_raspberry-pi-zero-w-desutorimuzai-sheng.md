---
layout: post
title: "Raspberry Pi Zero W でストリーム再生"
date: "2021-04-12 15:21:24 +0900"
categories: 
  - blog
---
## 結論

`omxplayer --live --orientation 90 http://10.0.0.111:8084`  

### omxplayer

Raspberry Pi OS lite ではデフォルトでは入っていないので `apt install omxplayer` でインストール。  

### --live

これがないと最初の画像を表示してそのままほとんど更新されなくなるので必須。  

### --orientation 90

90度倒して表示する。カメラ画像が縦長なのでこうしている。普通の向きであれば不要。  

### http〜

ストリーミングURL。MotionEyeOSであれば、設定の `Stream URL` をクリックすると取得できる。まぁ、`IPアドレス:8084` なわけですが。  

## 背景

MotionEyeOSで撮影しているカメラ画像をストリーミングで再生させたかった。  

<a href="__GHOST_URL__/razupaidex-windowwodong-kasazunihttpsutorimuwozai-sheng-suru/">ラズパイでX Windowを動かさずにHTTPストリームを再生する  

のときとは異なり、ラズパイZERO WのminiHDMI端子に7インチHDMIディスプレイ(1024x600)を接続している。  

ただし、これはHDMI出力なのでomxplayerが使えるが、そうでない場合は上記の通りになると思われる。  

