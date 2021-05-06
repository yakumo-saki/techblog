---
layout: post
title: "Windows Server 2019 のファイル共有が遅かった件"
date: "2019-12-25 14:15:00 +0900"
categories: 
  - blog
---
## 2019/01/10 追記

解決しました。 NICとの相性なのかなんなのかわかりませんが、NICをIntelの  

ものに変更したら治りました。  

## 前書き

本件、未解決です。内容も全然ありません。  

## 環境

* Ryzen 1700X / ASRock X370 Fatality Gaming K4
* Windows Server 2019 Standard Edition
* NICを増設（Broadcomの2ポートNIC）
* Adaptec 6805T
* Hyper-Vロール

## 現象

ファイル共有にアクセスした際、ものすごく遅い。Windows10の表示だと 300kb/s くらいしかでない。  

しかし、VM上のUbuntuでホストしているSamba共有にアクセスすると通常の速度（100MB/s)が出る。  

## 調べたこと

<a href="https://social.technet.microsoft.com/Forums/windowsserver/en-US/02593d94-1cea-4318-a2ff-aaa8a2eafd83/server-2019network-problems-hyperv-role-is-suspected">https://social.technet.microsoft.com/Forums/windowsserver/en-US/02593d94-1cea-4318-a2ff-aaa8a2eafd83/server-2019network-problems-hyperv-role-is-suspected  

Hyper-Vロールが入っていなければ問題ない？という書込。  


色々なサービスを動かしてしまっているのでHyper-Vを止められないので未テスト。  

## 試したモノ

* Offload類をオフ　→変化なし
* USB-NICを追加して、そちら経由でアクセス→変化なし  

→BroadcomのNICが2012R2の頃にバグってる的な記事があったのでNICを変えてテストしたかった  

→管理OSと共有していないNICならHyper-Vの影響はあまりないだろうと考えた

## 結局

ファイル共有を全てUbuntuに任せる事に。 うーん。  

## 蛇足

Windows、割とバージョンアップごとにファイル共有がおかしくなってるような気がする。。  

