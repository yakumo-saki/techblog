---
layout: post
title: "\"/\"のファイルシステムを変更したときの手順メモ"
date: "2020-09-18 10:45:00 +0900"
categories: 
  - blog
---
## 前提

* Linux Mint 20
* UEFIブート
* 変更前ルートファイルシステムは xfs、変更後はext4
* `/dev/sda1` = EFIシステムパーティション `/dev/sda2` = swap `/dev/sda3` = "/" `/dev/sda4` = new "/home"

## why?

* "/" と "/home" のパーティションを分けたかった
* 単純にgpartedでリサイズしようとしたら、xfsはリサイズ非対応だった

## 手順
### boot

* gparted live iso をUSBメモリに書き込んでそこからブートした。
* gparted live iso は、Legacyブート（BIOSブート）でしか起動できないので注意（UEFIブートOnlyに設定してると起動できない）

### ファイル退避

`/dev/sdb1` をバックアップ先として使う。せっかくgpartedで起動しているので、GUIからext4でフォーマットしておく。  

```
`$ sudo su -
# mkdir /mnt/ssd1
# mkdir /mnt/ssd2
# mount /dev/sda3 /mnt/ssd1     元のシステムのSSD
# mount /dev/sdb1 /mnt/ssd2     一時退避先のSSD（ext4でフォーマット済み）
# rsync -aAXv --numeric-ids /mnt/ssd1/ /mnt/ssd2/      ディレクトリ名は末尾 / まで入れるのが重要
````

### パーティション作り直し

パーティションを作り直す前に ` umount /mnt/ssd1` でアンマウントしておく。  

パーティション操作自体は、gparted のGUIがあるので省略。  

/dev/sda3 (xfs) を削除して、  /dev/sda3 (ext4, LABEL=root)  /dev/sda4 (ext4, LABEL=home) を作成した。  

ここでLABELを指定しているのは、後々fstabの修正で楽をするため  

### ファイル書き戻し
```
`$ sudo su -
# mkdir /mnt/root
# mkdir /mnt/home
# mount /dev/sda3 /mnt/root       "/" にするパーティション
# mount /dev/sda4 /mnt/home    "/home"にするパーティション
# rsync -aAXv --numeric-ids --exclude=home/ --exclude=opt/vmpool /mnt/ssd2/ /mnt/root/ ※1
# rsync -aAXv --numeric-ids /mnt/ssd2/home/ /mnt/home/
# rsync -aAXv --numeric-ids /mnt/ssd2/opt/vmpool/ /mnt/home/vmpool ※2
````


※１ homeは別のパーティションにコピーするのでexclude指定している。 excludeは相対パスで指定しないと効かない。 -vが指定されているので、進捗表示をみて、そこに表示されているパスで指定すればOK。ここでもFROMとTOのパスは末尾 "/"まで指定するのが重要  

※2 KVMのディスクイメージが入っている。容量が大きいので/home側に移動  

### /etc/fstab修正

rootファイルシステムのUUIDが変わってしまうのと、/homeを分割したので、起動するSSDの/etc/fstabを修正する。  

`vim /mnt/root/etc/fstab`  

```
<code class="language-fstab">LABEL=root      /               ext4    defaults        0       0
LABEL=home      /home           ext4    defaults        0       0 
````

### 再起動

ここで、バックアップ用SSDを外して再起動する。  

### grub

"/"のディスクのUUIDが変わっているため、初回はgrubのプロンプトに入ってしまう。  

ここで以下のように入力  

```
`grub> ls 
(hd0) (hd0,gpt4) (hd0,gpt3) (hd0,gpt2) (hd0,gpt1)

grub> set root=(hd0,gpt3)      "/"にマウントするファイルシステム
grub> linuxefi /boot/vmlinuz-5.8.10-xanmod-1 root=LABEL=root rescue ※3
grub> initrdefi /boot/initrd.img-5.8.10-xanmod1 ※4
grub> boot
````


※3 rescueをつけてレスキューモードにしておかないと、GUIが立ち上がったりすると面倒なので。  

※4 カーネルのバージョンと同じものがついているinitrdを選択する。違っていると起動に失敗する。  

### rescueモードでの起動

これで、rescueモードで起動できる。何も入力しなくてもrootのプロンプトが表示されるので、以下のように操作する。  

```
`# fstabが正しいかチェック

# ls /
# ls /home

それぞれ、予定したディレクトリが表示されればOK。ダメならなにかおかしい。
ここまで来ていれば、 `vi /etc/fstab` できるので修正すれば良い。
````

```
`# mount /dev/sda1 /mnt     EFIシステムパーティションをマウントする。
# blkid
/dev/sda1: UUID="D668-7F30" TYPE="vfat" PARTUUID="6d2e1e9f-5e30-41b6-a02d-617a11cd1689"
/dev/sda2: UUID="a168f2e5-f9eb-4612-a209-2f205e17f4b9" TYPE="swap" PARTUUID="623ac68c-f536-4fee-bdfd-fe8883bf4dcf"
/dev/sda3: LABEL="root" UUID="8ba8067b-38c5-416c-9144-fe5687c364f6" TYPE="ext4" PARTUUID="0457990b-2395-45ea-8928-0df5d571e06b"
/dev/sda4: LABEL="home" UUID="1a70c7ef-8120-44a4-a3f3-b16b2c226791" TYPE="ext4" PARTUUID="b9557977-5584-48e8-b1fb-0c7c0d02e0ff"
※ このUUIDはシステムによって異なる。 root にするパーティションのUUIDをメモる（次で使う）

# vi /mnt/EFI/ubuntu/grub.cfg
 
当方の環境の場合なので、8ba8〜の部分は、上記 `blkid` の出力結果から抜き出す必要がある
```grub.cfg
search.fs_uuid 8ba8067b-38c5-416c-9144-fe5687c364f6 root hd0,gpt3
以下は触らない
set prefix=($root)'/boot/grub'
configfile $prefix/grub.cfg
````


作業が完了したら再起動する。  

```
`# reboot
````

### 通常起動

何もせずに普通に起動してくればOK。おつかれさまでした。  

## 蛇足
### 念の為の追記。

* 実際に作業をしたときは、`rescueモードでの起動` の時に、`update-initramfs` `update-grab` を実行しているが、意味がないはず。

### 起動の動作

UEFI -> /dev/sda1/EFI/bootx64.efi （GRUB） -> Linuxカーネル -> systemd  

"/"パーティションのUUIDが変わってしまうと、GRUBが "/" を見つけられなくなる（/boot/EFI/ubuntu/grub.cfgに書いてあるUUIDが変わるから）のでGRUBで停止していると思われる。  

なので、手動でgrubにルートファイルシステムを指定し、カーネルとinitramfsを読み込ませれば起動できるようになる。ということだと思う。  
