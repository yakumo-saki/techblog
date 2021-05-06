---
layout: post
title: "Hyper-V上のgptディスク(Linux)を縮小したメモ"
date: "2018-09-24 15:00:00 +0900"
categories: 
  - blog
---
## 環境

* Windows Server 2016
* VMのOSはUbuntu 18.04LTS (非LVM)

## 何がしたかったか

Hyper-Vのデフォルト値で仮想マシンを作成してしまったため、127GBの可変HDDが作られてしまった。そのため実使用量以上にVHDXファイルが膨らんでしまっているのでどうにかしたかった。  

(実使用量8GB程度なのにVHDXファイルは64GBになっていた）  

## 操作手順

操作前にVHDXのバックアップを取得しておいた方が無難です。  

カジュアルにできる部分もある割に、起動しないと慌ててしまい二次災害が起きやすいです。  

### VM上でパーティションを縮小する

縮小はオンラインでは出来ません。（ext4です）  

ファイルシステムの縮小と、パーティションの縮小とに分かれていますが、慣れないことを手でやると事故が起きるので、GParted live USB (iso)を使いました。  

（手でやるのであれば、 e2fsck -> resize2fs でファイルシステムが縮小されるので、その後パーティション縮小です）  

この時点では、パーティションテーブル等の面倒はGpartedが見てくれるので、縮小後も何事もなく起動できるはずです。  


GParted Live <a href="https://gparted.org/livecd.php">https://gparted.org/livecd.php  

### ディスクの縮小

Hyper-Vマネージャから、ディスクを縮小します。この操作はVMが起動している間でも実行可能です。 `gdisk` コマンドが使用可能な状態で行ったほうが良いでしょう。  

シャットダウン状態で行った場合は、起動できない状態になりますので、なんらかのISOから起動する必要があります。（私の場合は、前述の gparted liveCDを使いました）  


ここがポイントで一番書きたかった部分なのですが、ディスクを縮小する際、Hyper-Vはパーティションテーブルの面倒を見てくれません。ただし、表示される最小容量はパーティションテーブルを見ているようで、適切な値を表示しているようです。  

ディスクの縮小を行うと、*gptディスクのパーティションテーブルが不整合な状態になります。* この状態で、再起動をしてしまうと、パーティションテーブルがおかしいので、起動できません。これを修正するには、 gdiskコマンドを使って、パーティションテーブルを書き直してもらう必要があります。操作ログは以下です。  

```
`~$ sudo gdisk /dev/sda
Warning! Disk size is smaller than the main header indicates! Loading
secondary header from the last sector of the disk! You should use 'v' to
verify disk integrity, and perhaps options on the experts' menu to repair
the disk.
Caution: invalid backup GPT header, but valid main header; regenerating
backup header from main header.

Warning! One or more CRCs don't match. You should repair the disk!

Partition table scan:
  MBR: protective
  BSD: not present
  APM: not present
  GPT: damaged

****************************************************************************
Caution: Found protective or hybrid MBR and corrupt GPT. Using GPT, but disk
verification and recovery are STRONGLY recommended.
****************************************************************************

Command (? for help): v    # ベリファイしてみた

Caution: The CRC for the backup partition table is invalid. This table may
be corrupt. This program will automatically create a new backup partition
table when you save your partitions.

Problem: The secondary header's self-pointer indicates that it doesn't reside
at the end of the disk. If you've added a disk to a RAID array, use the 'e'
option on the experts' menu to adjust the secondary header's and partition
table's locations.

Problem: Disk is too small to hold all the data!
(Disk size is 41943040 sectors, needs to be 266338304 sectors.)
The 'e' option on the experts' menu may fix this problem.

Problem: GPT claims the disk is larger than it is! (Claimed last usable
sector is 266338270, but backup header is at
266338303 and disk size is 41943040 sectors.
The 'e' option on the experts' menu will probably fix this problem

Partition(s) in the protective MBR are too big for the disk! Creating a
fresh protective or hybrid MBR is recommended.

Identified 5 problems!
Found valid GPT with protective MBR; using GPT.

要するにディスクのサイズがあってない、CRCもおかしい。ということらしい

Command (? for help): p   # パーティション認識できるかチェックした
Disk /dev/sda: 41943040 sectors, 20.0 GiB
Model: Virtual Disk
Sector size (logical/physical): 512/4096 bytes
Disk identifier (GUID): BEE153EA-CA7C-4A4D-A297-B74537528FF5
Partition table holds up to 128 entries
Main partition table begins at sector 2 and ends at sector 33
First usable sector is 34, last usable sector is 41943006
Partitions will be aligned on 2048-sector boundaries
Total free space is 7339965 sectors (3.5 GiB)

Number  Start (sector)    End (sector)  Size       Code  Name
   1            2048         1050623   512.0 MiB   EF00
   2         1050624        34605055   16.0 GiB    8300

パーティションの存在自体は理解しているようだ

Command (? for help): w  # ばっちり正しいのでそのまま書き込んでもらう

Final checks complete. About to write GPT data. THIS WILL OVERWRITE EXISTING
PARTITIONS!!

Do you want to proceed? (Y/N): y
OK; writing new GUID partition table (GPT) to /dev/sda.
Warning: The kernel is still using the old partition table.
The new table will be used at the next reboot or after you
run partprobe(8) or kpartx(8)
The operation has completed successfully.
````

### VMをシャットダウンしてVHDXを最適化する

これをしないとVHDXファイルが縮みません。Hyper-Vマネージャから操作可能です。  

### VMの再起動

祈りながら再起動します。正常に起動するはずです。  

お疲れ様でした。  

## ちなみに

本手順は、ディスク縮小後VMを起動したままgdiskしたパターン、gpartedのLive CDから起動してgdiskを使ったパターンとも検証済みで、どちらも成功しています。  

## 蛇足１

結果、64GBあったVHDXファイルは12GB強まで小さくなりました。  

しかし、可能なら固定長ディスクを使うようにしましょう。  

## 蛇足２

ファイルシステムだけ縮小しておいて、最適化して使えばそんなにVHDXが膨れることもないのかもしれないと思いました。どちらにしろオフラインになる時間はできてしまいますが。GUIだとできないので、シェルからコマンドを叩くことになるので事故りそう感はあります。  

