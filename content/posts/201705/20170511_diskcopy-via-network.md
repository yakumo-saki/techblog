---
layout: post
title: "ネットワーク越しにディスクコピーする(Linux , macOS)"
date: "2017-05-11 15:00:00 +0900"
categories: 
  - blog
---
# 環境

Ubuntu 14.04 LTS  

ディスクのパーテーションは  

1 swap 2GB  

2 / (ext4) 40GB  

## 動機

物理マシン上で動いているLinuxをそのまま仮想マシンにしたかった。  

動機はLinuxマシンの転送ですが、仮想マシンのWindows（ESXi）を同（Hyper-V）に移行する際に  

同様の手順で実施可能な事を確認しています。その他、物理マシン上のWindowsのディスクコピー等、物理コピーでどうにかなるものなら大抵なんとかなります。  

## 準備（転送元）

パーティションをできるだけ小さくする。 gparted live dvdを使用した。  

この手順はオプションなので、やらなくても良い。  

## 準備（転送先）

仮想マシンを作成（ディスク容量は、転送元のパーティションがコピーできるだけの容量を確保）  

UbuntuのLive DVDで起動して、パーティションを転送元と同じブロック数で確保した。  

転送元と転送先で、fdisk　のブロック数が同じになるようにパーティションを作成。  

ブート可能フラグを立てるのを忘れない（ブートしたい場合は）  


なお、この手順はディスク丸ごと転送する場合は不要。  

次の手順のデバイス名を /dev/sda とすればディスク丸ごと転送になる。  

この場合、ブート可能フラグは自動で立つはず。  

## 転送準備

転送元、転送先の両方のPCで同じ操作をする。  

PCをUbuntu Live DVDで起動する。（以下の手順は14.04LTSで動作確認している）  

起動後、Ubuntuを試す を選択してしばらく待ち、UIが起動するのを待つ。  

起動したら、Windowsキー(Linux的にはSuperキー)を押下して、 terminal とタイプ。  

すぐ下に、端末　というアイコンが出るのでそれをクリックする。  

紫色のコマンドプロンプトみたいな何かが起動すればOK。  

## 転送

転送先→転送元の順で操作する。  

ようするに、書いてある順に操作すればOK。デバイス名を間違えると悲しいことになるので要注意。  

```
<code class="language-bash:転送先"># 転送先で以下のコマンドを打つ。デバイス名は適宜調整して下さい。（例： ディスク全体なら /dev/sda等）
sudo su -
nc -l 12345 | dd of=/dev/sda2
````

```
<code class="language-bash:転送元"># 転送元で以下のコマンドを打つ。デバイス名は適宜調整して下さい。（例： ディスク全体なら /dev/sda等）
sudo su -
dd if=/dev/sda2 bs=10240000| nc [転送先IPアドレス] 12345
````

```
<code class="language-bash:転送元"># 進捗確認用
# 転送元の別コンソールから使用すると、10秒ごとに進捗が dd を実行しているコンソールに表示される
sudo su -
watch -n 10 pkill -USR1 dd

# 今回は関係ないですが、 macOS上のdd は USR1 を送ると終了してしまいます。
# watch -n 10 pkill -INFO dd
# とすれば希望する動作になります。
````

## 起動してみる

新しくできたVMを起動してみると、GRUB Rescueの画面に入ってしまい起動できない場合がある（あった）  

その場合の操作は以下の通り  

```
`grub rescue> set prefix=(hd0,2)/boot/grub
grub rescue> set root=(hd0,2)
grub rescue> insmod normal
grub rescue> normal
````

## Windowsの場合は、とりあえずWindowsのセットアップ用ISOを入れて起動し、diskpartコマンドを

使ってブートローダを上書きしてみる感じでしょうか（未検証）  

## 20180123追記 macOS 上でやる場合

いくつか違いがあります。  

```
`ディスクの一覧を表示
sudo diskutil list

ここでは、ディスクのデバイス名が /dev/diskN と表示されますが、ddを行う際は
/dev/rdiskN を使用するほうが


## 参考
ddの進捗を確認 - Qiita
http://qiita.com/tukiyo3/items/5e3fd748287ffa4b6612

Linux 上の GRUB 2 がブートできなくなったときの対処方法 
https://jp.linux.com/news/linuxcom-exclusive/418274-lco20140625

MacでRaspberry PiのSDカードをハードコピー（バックアップ） http://karaage.hatenadiary.jp/entry/2015/06/09/080000
````

