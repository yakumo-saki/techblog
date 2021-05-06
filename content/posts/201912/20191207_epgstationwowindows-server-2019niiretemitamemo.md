---
layout: post
title: "EPGStationをWindows Server 2019にいれてみたメモ"
date: "2019-12-07 13:50:00 +0900"
categories: 
  - blog
---
## 最初に

Mirakurunは既に稼働状態であることを前提としています。  

## node.js

* 10.13.0 LTSをインストール（この時インストーラーにその他必要なモノを入れる的なチェックを入れておく）
* インストール後の処理で強制的に再起動されるので注意

## git for windowsインストール

* インストーラー使うだけ

## Visual C++ Build Tools 2015のインストール

以下のURLからダウンロードしてインストール  

<a href="https://go.microsoft.com/fwlink/?LinkId=691126">https://go.microsoft.com/fwlink/?LinkId=691126  

## ffmpegのインストール

<a href="https://ffmpeg.zeranoe.com/builds/">https://ffmpeg.zeranoe.com/builds/  


直接リンク  

<a href="https://ffmpeg.zeranoe.com/builds/win64/static/ffmpeg-20181125-370b8bd-win64-static.zip">https://ffmpeg.zeranoe.com/builds/win64/static/ffmpeg-20181125-370b8bd-win64-static.zip  

20181125-370b8bd 4.1  / Windows 64bit　を選択  


zipアーカイブを好きな場所に展開する。このパスは後ほど使う。  

## EPGStationのインストール

<a href="https://github.com/l3tnun/EPGStation/blob/master/doc/windows.md">https://github.com/l3tnun/EPGStation/blob/master/doc/windows.md に従う。  


`npm install` が失敗するので、 `npm install --msvs_version=2015` とする。  

ここで先ほど入れた C++ Build Toolsが必要。  

config.json 変更点  


* sqlite3 使用
* エンコーダーのパス変更 (enc.js)
* ffmpegのパス変更


`npm start` するとsqlite3モジュールがない。という感じのエラーが出るので次のステップで解消する  

## sqlite3モジュールのインストール

<a href="https://qiita.com/noobar/items/0128677c44bb9dde88b2">https://qiita.com/noobar/items/0128677c44bb9dde88b2  

```
`cd c:\usr\EPGStation\node_modules\sqlite3
npm install -g node-gyp
npm install
npm run prepublish       ←これは失敗するが問題なかった
````


`npm run prepublish` が失敗しているが、EPGStationが起動するようになった。  

## 蛇足

config.jsonは公式マニュアルを一通り見ながら設定した方がよい。ファイル名や、録画したファイルの保存場所など、  

sampleには書いていないけれども必須の設定がかなりある。  

