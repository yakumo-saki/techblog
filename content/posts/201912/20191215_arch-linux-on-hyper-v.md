---
layout: post
title: "Arch LinuxをHyper-Vにインストール（作業メモ）"
date: "2019-12-15 13:58:00 +0900"
categories: 
  - blog
---
## Why Arch Linux?

Dockerを動かす為のできるだけ小さい構成のOSを捜していた。  

Archは全部自分でパッケージ入れて好きに構成するという考え方らしいので  

できるだけ最小にできるはず！ということでやってみた記事です。（なお初めてです）  


手順は以下を参照しながらやっています  

<a href="https://dzone.com/articles/install-arch-linux-on-windows-10-hyper-v">https://dzone.com/articles/install-arch-linux-on-windows-10-hyper-v  

## 環境

* Hyper-V 第二世代VM
* ディスク容量 20GB
* archlinux-2019.06.01-x86_64.iso

## 手順
### VMの作成

* セキュアブート無効

### 起動

ArchのISOをマウントして起動する。  

すると、自動的にrootのプロンプトが起動してくる。  

コンソールではコピペもできず不便なので、sshが使えるようにする。  

```
`localectl set-keymap jp106
passwd  # rootにパスワードがないとssh繋げられない
systemctl start sshd

# なお、IPアドレスは
ip a  なり  ifconfig で調べられる
````

### パーティション作成

EFIで起動させたいので、GPTでパーティションを切っていく。  

```
`$ gdisk /dev/sda
# EFIブート
command?: n #新規作成
number: [入力せずにENTER]
First sector: [入力せずにENTER]
End Sector: +512M
type: EF00  # EFIブートパーティション

# データ
command?: n #新規作成
number: [入力せずにENTER]
First sector: [入力せずにENTER]
End Sector: [入力せずにENTER]
type: [入力せずにENTER]  # Linux

command?: w # 書込
Do you want to proceed? (Y/N): Y
````

## フォーマット
```
`mkfs.fat -F32 /dev/sda1
mkfs.ext4 /dev/sda2
````

## とりあえずマウント
```
`mount /dev/sda2 /mnt
mkdir /mnt/boot     # EFIブートパーティションをマウントするため
mount /dev/sda1 /mnt/boot
````

## ファイルコピー
```
`pacstrap /mnt base base-devel openssh vim
genfstab -U /mnt >> /mnt/etc/fstab
arch-chroot /mnt

# ここから、ディスク上に書き込まれる

# ブートローダー入れる
bootctl install
````

## ブートローダー設定
### vim /boot/loader/loader.conf
```
`default arch
timeout 3
editor 0
````

### ブートローダー設定2
```
`cp /usr/share/systemd/bootctl/arch.conf /boot/loader/entries/
````


`blkid -s PARTUUID -o value /dev/sda2`  

でUUIDを取得しておく。  


vim /boot/loader/entries/arch.conf  

```
`options root=PARTUUID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx rootfstype=ext4 add_efi_memmap
````

### ブートローダー設定を反映
```
`bootctl update
bootctl
````


これで再起動できます。おつかれさまでした。  

## ネットワーク設定

固定IPを指定する。DHCP使わない。Network-managerもナシ  

```
`vim /etc/systemd/network/20-wired.network
````

```
<code class="language-/etc/systemd/network/20-wired.network">[Match]
Name=eth0

[Network]
Address=10.1.0.230/24
Gateway=10.1.0.1
DNS=8.8.8.8
DNS=8.8.4.4
````

```
`systemctl enable systemd-networkd
systemctl enable systemd-resolved
````

## localeまわり
```
`vim /etc/locale.gen

en_US.UTF-8 UTF-8
ja_JP.UTF-8 UTF-8
の二行のコメントアウトを外した。
````

```
`sudo locale-gen
````

```
`sudo localectl set-locale LANG=en_US.UTF-8
````


ここで一度SSHを切断して、再接続しないと表示乱れが発生した。  

## timezone
```
`sudo ln -sf /usr/share/zoneinfo/Asia/Tokyo /etc/localtime
````

```
`$ date
Thu 20 Jun 2019 05:06:48 PM JST    JSTになっていることを確認
````

## ホスト名
```
`hostnamectl set-hostname ほすとめい
````

