---
layout: post
title: "Linux デスクトップにインストールしたアプリ"
date: "2020-07-04 10:35:00 +0900"
categories: 
  - blog
---
## まえがき

半分は自分用メモである。  

## ターミナル
### Guake

ホットキーを押すとターミナルが出てくる。  

QuakeとかMinecraftのターミナルウィンドウみたいな感じ。  

テーマで `Aci` を選択、 `F1` で起動するように設定  

### GNOME端末

Guakeの中身もこれ。  


* iTermの色設定を入れて
* フォント 源の角ゴシック Code JP R 12pt
* 透明度20%くらい
* Guakeに限り、Gtkテーマ Mint-Y-Dark-Red を指定

## 開発用
### Jetbrains toolbox

tar.gz形式。IntelliJとかDataGripを入れて管理してもらうためのツール。  

AppImageだけれども、このツールに日本語を入れることというか入力するようなツールではないのでOK  

### VSCode

公式からdeb形式で。 セッティング同期、実装されないかなぁ  

プラグインにあるけど、本体に実装されるとかなんとか。  


→ VSCode insider 版には設定の同期があるので、Insider版を入れている。  

アイコンの色が違う程度なので普通に使える。  

個人的な好みだけど、ChromeとかEdgeみたいに DEV とか Canary みたいな文字がアイコンに入ると  

常用できないので、VSCode、Firefox的なアイコンの色が違うとかそういうのが好み  

### docker

docker.io 版を入れている。  

## VM

Windowsはどうしても動かさざるをえないときがあるので入れる。  

KVMを使えばよい気もするが…  

### VMware workstation Player

モジュールのコンパイルに失敗する場合、以下を参照。  

<a href="https://ubuntu-mate.community/t/20-04-vmware-workstation-player-fails-to-build-kernel-modules-vmmon-vmnet/21176">https://ubuntu-mate.community/t/20-04-vmware-workstation-player-fails-to-build-kernel-modules-vmmon-vmnet/21176  

### Oracle VM Virtualbox

Managerの表示が乱れて設定がまともにできない。  

つらつらのつらみ。  

## SNSとか周り
### Rambox

SNSまとめるブラウザ。  

本当はBiscuitを使いたいが、AppImage形式でしか配られていないので日本語入力ができず、こちらに。  

Franzは有料、StationもAppImage形式。  

Twitterはブラウザで見てる。（Chromium系だと入力がおかしい）  

→妙に重いので諦めてVivaldiにピン止めして使っている  

### Slack

deb形式でインストール。 まぁ必要だよね  

## Google Drive同期
### Open Drive (ODrive)

Google Driveと同期するためのツール。  

本当は同期する場所を選べるといいんだけど、まぁ全部同期しちゃってる。  

→ Syncボタンを押したときしか同期しない？なんか動作がよくわからないので削除した  

### google-drive-ocaml-fuse

fuseなのであんまりかなぁと思って避けていた。  

入れてみると、Google Driveがデバイスとして見えてこれはこれでとてもアリ。  

→と思ったが、ローカルにファイルがないのはいろいろと不便なので乗り換え  

### overGrive

<a href="https://www.thefanclub.co.za/overgrive">https://www.thefanclub.co.za/overgrive $5の有料ソフトウェア。  

いろいろと頑張るよりちょっとお金を払うほうが早いという結論に。  

## ランチャー
### albert

有名どころ。  

### ulauncher

<a href="https://ulauncher.io/">https://ulauncher.io/  

albertよりExtensionがおおい  

## その他
### Remmina

RDP / VNC クライアント。 とりあえずいい感じだったのでこれにした。  

### Font Manager

TTC形式のフォントをインストールするために入れた。  

標準だとTTC形式が扱えないので。  

### DeaDBeeF

公式ページ <a href="https://deadbeef.sourceforge.io/">https://deadbeef.sourceforge.io/  

マルチプラットフォーム音楽プレイヤー。正直、foobar2000ぽい。  

初回起動時はGtk2になってるので、なんじゃこりゃ？！っていう表示だがGtk3にして再起動すると普通になる。  

ReplayGain Scannerが入ってるのがとても良い。  


入れたプラグイン  


* GNOME multimedia keys support
* MPRISv2 plugin D-Bus対応。タスクトレイの♪アイコンに曲情報が出る
* Musical Spectrum とてもきれいなスペアナ
* VU Meter VUメーター。そのまま。

### LinuxBrew

macOSで言うところのHomeBrewのLinux版。  


* kubectl (kubernetes管理ツール）
* k9s（kubernetes管理用ツール）
* docker-compose


を入れるのに使っている。  

