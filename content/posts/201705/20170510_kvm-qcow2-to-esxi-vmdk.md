---
layout: post
title: "KVMのqcow2イメージファイルをESXiに持ってくる方法"
date: "2017-05-10 15:00:00 +0900"
categories: 
  - blog
---
# バージョンなど

ESXi 6.0U2 (無償版)  

## イメージのコンバート

さすがのESXiでも qcow2 イメージは読めないので vmdk にコンバートする必要がある。  

KVMが動いているサーバー上で、以下のコマンドを使えば変換できる。  

```
`qemu-img convert -O vmdk [入力ファイル].qcow2 [出力先].vmdk
````

## イメージの転送

一番素直なのは、 vSphere Client か　Web Clientを使ってデータストアに  

ファイルをアップロードすることだけれども、転送速度があまり出ないわ、Web Clientは  

セッションタイムアウトで中断するわであまりうれしくない。  

そこで、ESXiホスト上でSSHを有効にして、scpコマンドを使って転送することにした。  

```
`scp imagefile.vmdk root@[esxiホストのIPアドレス]:/vmfs/volumes/datastore1/imagefile.vmdk
````

## イメージをZeroedthickに変換

転送したイメージファイルは.vmdkなので普通にそのままVMに接続できそうに思えるが、  

実際に接続してみると、以下のエラーがでる。  

"Unsupported or invalid disk type 7. Ensure the disk has been imported"  

どうも、形式が微妙に違うようなので変換する。  

ESXiホストにSSHして、以下のコマンドを使う。  

```
`cd /vmfs/volumes/datastore1/
mkdir temp
cd temp
mv ../imagefile.vmdk temp
vmkfstools -i imagefile.vmdk [VM名].vmdk
````


わざわざ、datastore1 の下にディレクトリを作ってそこで作業しているのは、  

どういうわけか、datastore1 直下だと元ファイルの読み込みに失敗するから。  

ファイルが存在しているのにファイルがないとか言われたりして少しハマった。  

## 完了

最後に作ったvmdkをよしなな位置に移動して、仮想マシンに接続すればOK。  

