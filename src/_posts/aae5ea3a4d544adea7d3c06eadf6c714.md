---
title: VM上のext4パーティションを拡張するメモ
permalink: /p/aae5ea3a4d544adea7d3c06eadf6c714
tags: []
date: 2020-11-27 03:38:00
updated: 2021-07-29 01:14:26
---

## 前提

- Hyper-V 上の VM
- Ext4
- debian 10
- 無停止

## 手順

`parted` を使用するので、入っていない場合は `apt install parted` でインストールする。

### ディスク拡張

Hyper-V 上でディスクを拡張する。

VM に容量を認識してもらうため `echo 1>/sys/class/block/sda/device/rescan` を実行

※ sudo だと上手くいかない？ `sudo su -` して root だと上手くいった。

`parted -l /dev/sda`

warning: \~\~\~\~ Fix/Ignore? -> `Fix`

```
`Model: Msft Virtual Disk (scsi)
Disk /dev/sda: 34.4GB <- 容量が増えたことを確認
Sector size (logical/physical): 512B/4096B
Partition Table: gpt
Disk Flags:

Number  Start   End     Size    File system  Name  Flags
 1      1049kB  538MB   537MB   fat32              boot, esp
 2      538MB   25.8GB  25.2GB  ext4
```

### パーティションの拡張

`parted /dev/sda`

(parted) `p`

```
`Number  Start   End     Size    File system  Name  Flags
 1      1049kB  538MB   537MB   fat32              boot, esp
 2      538MB   25.8GB  25.2GB  ext4
```

(parted) `resizepart 2`

Warning: Partition /dev/sda2 is being used. Are you sure you want to continue?

Yes/No? `yes`

End? 25.8GB? `-1`

(parted) `p`

```
`Model: Msft Virtual Disk (scsi)
Disk /dev/sda: 34.4GB
Sector size (logical/physical): 512B/4096B
Partition Table: gpt
Disk Flags:

Number  Start   End     Size    File system  Name  Flags
 1      1049kB  538MB   537MB   fat32              boot, esp
 2      538MB   34.4GB  33.8GB  ext4   <= 拡張された
```

### ファイルシステムの拡張

`resize2fs /dev/sda2`

```
`resize2fs 1.44.5 (15-Dec-2018)
Filesystem at /dev/sda2 is mounted on /; on-line resizing required
old_desc_blocks = 3, new_desc_blocks = 4
The filesystem on /dev/sda2 is now 8257036 (4k) blocks long.
```
