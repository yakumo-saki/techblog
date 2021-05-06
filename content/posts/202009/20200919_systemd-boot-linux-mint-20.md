---
layout: post
title: "systemd-bootで起動するように構成する(Linux Mint 20)"
date: "2020-09-19 11:15:00 +0900"
categories: 
  - blog
---
## 前提

* Linux Mint 20 (Ubuntu 20.04LTSベース）

## きっかけ

<a href="https://ibulog-iblog.hateblo.jp/entry/2020/06/14/015333">https://ibulog-iblog.hateblo.jp/entry/2020/06/14/015333  

この記事を読んで、起動が2〜３秒早くなる。という記述に興味を惹かれたので試しにやってみることに。  

## ポイント

* ESPからしかカーネルをロードできない


ようするに、initrd.imgとvmlinuzが `/boot/efi` に存在する必要がある。  

普通にインストールすると、 `/boot/efi`（以降、ESPと呼ぶ）は、500MBのfat32パーティションとして作られる。  

initrd.img+vmlinuz で大体容量100MBなので、余裕を見るとカーネルは３セットが限界。（４セットも行けると思うが）  

当方の環境では、<a href="https://xanmod.org/">xanmod のカーネルが入っているので、これの最新で１セット、標準のカーネルと、標準のカーネルの一つ前のやつ。の３セットとした。  

## 手順1

できるだけギリギリまで後戻りできるような順番で作業した。  

### カーネルをESPにコピーするsystemdユニットを作る

xanmodのカーネルは、標準のカーネルと違って vmlinuz / vmlinuz.old とか initrd.img / initrd.img.old みたいなのを作ってくれないので、/boot 自体に変更があったら全部のカーネルとinitrdをコピーする構成とした。  


以下の２ファイルを作成する。  

```
<code class="language-/etc/systemd/system/systemd-boot-cp-to-efi.path">[Unit]
Description=Copy kernel and initrd to /boot/efi for systemd-boot
Documentation=man:systemd.path

[Path]
PathChanged=/boot/

[Install]
WantedBy=multi-user.target
````

```
<code class="language-/etc/systemd/system/systemd-boot-cp-to-efi.service">[Unit]
Description=Copy Kernel to ESP
Description=Trigger by path watch (systemd-boot-cp-efi.path)

[Service]
Type=oneshot

# ubuntu general kernel and initrd
ExecStart=/bin/cp -f /boot/vmlinuz /boot/efi/vmlinuz
ExecStart=/bin/cp -f /boot/initrd.img /boot/efi/initrd.img
ExecStart=/bin/cp -f /boot/vmlinuz.old /boot/efi/vmlinuz.old
ExecStart=/bin/cp -f /boot/initrd.img.old /boot/efi/initrd.img.old
ExecStart=/bin/bash -c '/bin/ls /boot/* | /bin/grep -e "\/boot\/vmlinuz.*xanmod" | /usr/bin/sort -Vr | /usr/bin/head -n 1 | /usr/bin/xargs -i /bin/cp -f {} /boot/efi/vmlinuz-xanmod'
ExecStart=/bin/bash -c '/bin/ls /boot/* | /bin/grep -e "\/boot\/initrd.*xanmod" | /usr/bin/sort -Vr | /usr/bin/head -n 1 | /usr/bin/xargs -i /bin/cp -f {} /boot/efi/initrd.img-xanmod'
````

### systemdのユニットを有効化

ユニット有効化  

```
`$ sudo su -
# systemctl daemon-reload
# systemctl enable systemd-boot-cp-to-efi.path    (serviceはenableにする必要はありません。してもエラーになります）
````

### テスト
```
`$ sudo su -
# rm /boot/efi/vmlinuz*
# rm /boot/efi/initrd*
# touch /boot/a   （適当なファイルを/bootに作ってsystemdを反応させる）
# ls /boot/efi/ （予定通りコピーされているかチェック）
EFI                               initrd.img         initrd.img.old  vmlinuz         vmlinuz.old
initrd.img-xanmod  loader          vmlinuz-xanmod
````

## 手順2
### systemd-bootのインストール
```
`$ sudo bootctl install
````

### ブートエントリ作成

カーネル３セット分のブートエントリを作成する。  

```
<code class="language-/boot/efi/loader/entries/01xanmod.conf">title   Linux Mint (xanmod)
linux   /vmlinuz-xanmod
initrd  /initrd.img-xanmod
options root=LABEL=root quiet splash rw
````

```
<code class="language-/boot/efi/loader/entries/02ubuntu.conf">title   Linux Mint (ubuntu)
linux   /vmlinuz
initrd  /initrd.img
options root=LABEL=root quiet splash rw
````

```
<code class="language-/boot/efi/loader/entries/03ubuntu-old.conf">title   Linux Mint (ubuntu-old)
linux   /vmlinuz.old
initrd  /initrd.img.old
options root=LABEL=root quiet splash rw
````

### デフォルト起動エントリの指定
```
`/boot/efi/loader/loader.conf 
#timeout 3
#console-mode keep
default 01xanmod     # この行だけ変更。標準で起動させたい起動エントリの名前だけを書く（.confは書かない）
````

### 最終確認
```
`$ efibootmgr
efibootmgr 
BootCurrent: 0007
Timeout: 0 seconds
BootOrder: 0007,0005,0004,0003,0006,0002,0000   ←これが起動順
Boot0000* SanDisk SDSSDH3 500G : 
Boot0005* ubuntu  ←こっちはGRUB
Boot0007* Linux Boot Manager      ←これがsystemd-boot
````

### 再起動

起動してくればOK。おつかれさまでした。  

## 蛇足

起動時にhpのロゴが出たまま→GUIログイン画面になった。  

起動が2〜３秒早くなった。 なんかいい感じ。  

