---
layout: post
title: "Electronハマりメモ"
date: "2017-05-16 15:00:00 +0900"
categories: 
  - blog
---
## 最初に

ElectronでTwitterクライアントを開発しているときにハマった所をメモしていきます。  

と、メモしていたらElectronがついにVer 1に到達しました。 早速アップデートしたので  

その際に遭遇したエラーもメモしていきます。  

追記：Ver1に到達したあと、日替わりでElectron周りのバージョンアップが日替わりリリース状態です。  

npm outdated すると古いモジュールを洗い出してくれるので便利です。  

## 環境

Electron 0.37.8 => 1.0.2  

Typescript 1.8.0  

なので、本文中のコードは全てTypescriptです。  

## 本文
### BrowserWindowのクッキーを消したい
```
<code class="language-ts">var loginWindow:Electron.BrowserWindow = new BrowserWindow({width: 800, height: 600});
loginWindow.webContents.session.clearStorageData({ storages: ["cookies"] }, () => {});
````


Twitterのアカウントをoauth認証する際に、クッキーが保存されてしまっていると、ログイン画面を  

表示せずにそのまま認証が完了してしまうのでクッキーを消したかった。そもそも論で言えば、別のセッションとして  

扱って欲しかったが、うまく動かなかった。なので、仕方なくクッキーを全部消してしまうことにした。  

```
<code class="language-ts:動かなかったコード">var loginWindow:Electron.BrowserWindow = new BrowserWindow({width: 800, height: 600, webPreferences: { partition: 'TempSession' } });
````

### ブラウザウィンドウ内でjQueryが使えない

ElectronでjQueryがundefinedになるhttp://qiita.com/pirosikick/items/72d11a8578c5c3327069  

まさにこの状況。 解決策も上の通り。  

```
<code class="language-ts">var loginWindow:Electron.BrowserWindow = new BrowserWindow({width: 800, height: 600, 'node-integration': false }
````

## require('electron').app => undefined

npm install -g electron しているとなった。  

electronコマンドは electron-prebuilt をインストールすれば一緒に入っている。  

なので、正しいのは npm install -g electron-prebuilt である。  

## require('something') => undefined になった！

require('menu') => require('electron').Menu  

require('remote') => require('electron').remote  

remote.require('dialog') => remote.require('electron').dialog  


要するに、今まで独立していたモジュールが全て electron　の配下に入ったということのようです。  

## アプリ内でコピペができない

Mac限定かもしれないけれども、アプリ内でコピペができない。  

メニュー内にカット、コピー、ペーストのメニューとそれぞれのショートカットキーを登録すればできるようになる。  

<a href="http://electron.atom.io/docs/api/menu/">http://electron.atom.io/docs/api/menu/  

公式ドキュメント参照  

