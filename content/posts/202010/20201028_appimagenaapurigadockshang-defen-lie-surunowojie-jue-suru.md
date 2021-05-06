---
layout: post
title: "AppImageなアプリがDock上で分裂するのを解決する"
date: "2020-10-28 09:05:14 +0900"
categories: 
  - blog
---
## 前提

* Biscuit (<a href="https://eatbiscuit.com/ja">https://eatbiscuit.com/ja) のLinux版はAppImageで配布されている
* AppImageのアプリは、メニューにも出てこないし、DockとかDashに登録できない
* .Desktop ファイルを `/home/yakumo/.local/share/applications/` に置くことでメニューに出てくる

## 問題点

* Dashにアプリケーションを登録することはできるが、アプリが起動するとDockのアイコンではなく別のアイコンが表示されてしまう（Biscuitが2個になってしまう）

### why?

* おそらく実行ファイル名とウィンドウ名が異なるため

## 解決策

* `.Desktop` ファイルに `StartupWMClass=biscuit` を追加する。

### 調べ方

対象のアプリケーションを起動した状態で `xprop` を実行するとマウスカーソルがターゲットの形になるので、その状態で調べたいアプリケーションをクリックする。  

WM_CLASS(STRING) = "biscuit", "biscuit" となっているので、それをそのまま `.Desktop`ファイルの `StartupWMClass` に指定すれば良い  

（Firefoxなど、名前が異なるものが2つ表示される場合があるが、この場合どちらを指定するかは不明。どちらかを指定すれば当たると思われる）  

## 蛇足

`biscuit.Desktop` の中身は以下の通り  

```
`#!/usr/bin/env xdg-open
[Desktop Entry]
Version=1.0
Name=Biscuit
Keywords=
Exec=AppImageへのパス %u
Terminal=false
X-MultipleArgs=false
Type=Application
Categories=Network;
Icon=アイコンファイルへのパス（png形式）
StartupNotify=true
StartupWMClass=biscuit
````

