---
title: Ubuntu 16.04LTSでSamba 4.9.4 をコンパイルしたメモ
permalink: /p/ce75de3d46fc4aee8dd3fde2c55579da
tags: []
date: 2019-12-11 01:54:00
updated: 2021-07-29 02:36:11
---

## 動機とか

Ubuntu 16.04 の apt でインストールされる samba は、`4.3.x` だが、Timemachine over SMB を使ってみたいので、

最新の Samba を導入してみることにした。

特段用事がないならコンパイルするよりパッケージマネージャからインストールしたいのですが、

Ubuntu 16.04LTS 用の Samba 4.9.4 のパッケージがないようなので仕方なくコンパイルすることにします。

※ ppa で 4.8.x まではあったのですが… 多分、18.04LTS でもほぼ同じ手順でいけると思いますが、ppa から入れた方が楽です。

## 公式手順書

- <a href="https://wiki.samba.org/index.php/Package_Dependencies_Required_to_Build_Samba"><https://wiki.samba.org/index.php/Package_Dependencies_Required_to_Build_Samba>
- <a href="https://wiki.samba.org/index.php/Build_Samba_from_Source"><https://wiki.samba.org/index.php/Build_Samba_from_Source>

## 実際にやった手順

sudo 権限のある一般ユーザー権限で実行している。

### パッケージマネージャからインストールした Samba を削除

これは、ビルドに成功してからやった方がよいかもしれない。

失敗して切り戻す可能性もあるので。

```
`# configのバックアップ
sudo cp /etc/samba/smb.conf ~

# 削除。 /etc/samba/smb.conf も消されるので注意
apt purge samba*
```

### ソースを取得＆展開

```
`cd ~
wget https://download.samba.org/pub/samba/stable/samba-4.9.4.tar.gz
tar xvf samba-4.9.4.tar.gz
cd samba-4.9.4
```

### ビルドに必要なパッケージをインストール

ドキュメントの通り。 `libgpgme-dev` パッケージは存在しないので、 `libgpgme11-dev` パッケージを入れるように変更した。

```
<code class="language-bash">apt-get install acl attr autoconf bind9utils bison build-essential \
  debhelper dnsutils docbook-xml docbook-xsl flex gdb libjansson-dev krb5-user \
  libacl1-dev libaio-dev libarchive-dev libattr1-dev libblkid-dev libbsd-dev \
  libcap-dev libcups2-dev libgnutls28-dev libgpgme-dev libjson-perl \
  libldap2-dev libncurses5-dev libpam0g-dev libparse-yapp-perl \
  libpopt-dev libreadline-dev nettle-dev perl perl-modules pkg-config \
  python-all-dev python-crypto python-dbg python-dev python-dnspython \
  python3-dnspython python-gpgme python3-gpgme python-markdown python3-markdown \
  python3-dev xsltproc zlib1g-dev liblmdb-dev lmdb-utils libgpgme11-dev
```

### configure

```
<code class="language-bash"># 設定ファイルを /etc/samba に変更する。しないと /usr/local/samba/etc/ になってしまい使いにくい
./configure --systemd-install-services --with-systemd \
--without-ad-dc --enable-fhs --prefix=/usr/local --sysconfdir=/etc --localstatedir=/var
```

実行中、 `not found` とか `no` とかが出ていても、エラーメッセージがでて停止しない限りは無視してよい。

停止した際も親切なエラーメッセージが出るのでそれに従えばよい。

※ なお、有効なオプション一覧は `./configure --help` で確認できる

※ デフォルトでは、 `/usr/local/samba/bin` にインストールされるので、 prefix を指定している

※ --enable-fhs Filesystem Hierarchy Standard 準拠の場所にインストール

※ AD DC 機能はいらないので `--without-ad-dc` を指定している。不要な機能は止めておくとコンパイルが早くなります（対象が減るので）

`'configure' finished successfully (1m41.605s)`

と表示されれば OK

### make

コンパイルするだけなのでまだ root 権限は不要。それなりに時間がかかるので休憩するならここ。

```
<code class="language-bash">make
```

`'build' finished successfully (23m39.848s)` と表示されれば OK

### インストール

前までのステップでコンパイル"は"完成しているのでリンクしつつ実行バイナリを作成してインストール。

もし、パッケージマネージャでインストール済みの samba があるのであれば、ここで削除しておいた方が無難。

ここで時間がかかって SSH が切断される恐れがあるので、tmux や byobu 等を使用した方がよいかもしれない。

```
<code class="language-bash">sudo make install
```

`'install' finished successfully (4m39.752s)` と表示されれば成功

### 設定と daemon の自動起動

ここで、 `/etc/samba/smb.conf` を作成する（が内容については割愛）

```
`sudo systemctl enable winbind.service
sudo systemctl enable nmb.service
sudo systemctl enable smb.service
```

で終わり。と言いたいところだが、当方の環境では、 unit ファイルの実行パスが誤っていて起動できなかった。

```
<code class="language-bash"># パスを確認しておく。 当方の環境では /usr/local/sbin/smbd
which smbd

export EDITOR=vim

# ExecStart=/usr/local/samba/sbin/winbindd のようになっているのでパスを変更する
sudo systemctl edit --full winbind.service
sudo systemctl edit --full nmb.service
sudo systemctl edit --full smb.service
```

これでも、`smb.service`の起動に失敗した。エラーメッセージは以下の通り。

```
` create_local_token failed: NT_STATUS_ACCESS_DENIED
 ERROR: failed to setup guest info.
```

これは、以下のコマンドで解決できる

```
`# ネタ元： https://bugzilla.redhat.com/show_bug.cgi?id=1648399#c1
net -s /dev/null groupmap add sid=S-1-5-32-546 unixgroup=nobody type=builtin
```

## おまけ

### しくじった時は以下のコマンドでやり直しできる

```
`# インストールしたものを削除
sudo make uninstall

# コンパイルしたものを全部削除。やらなくても大丈夫だとは思うが念のため
# インストール先のパスを変える程度であればこれを省略するととても時間短縮になる
make clean
```

### 設定ファイル

`/etc/samba/smb.conf` の設定内容は以下の通り。以下の conf で macOS X Mojave 10.14.3（18D109） から

Tiemmachine のバックアップが可能なことを確認した。

※ なお、Timemachine 設定前に一度 Finder から手動でこのボリュームをマウントしておく必要がある。（？ Timemachine のディスクに出てこない場合のみ。当方環境では普通に表示された）

```
`[global]

## Browsing/Identification ###
   local master = no
   preferred master = no

# Change this to the workgroup/NT-domain name your Samba server will part of
   server role = standalone server
   netbios name = chinachu
   workgroup = WORKGROUP
   server string = %h server (Samba, Ubuntu)

   dos charset = CP932
   unix charset = utf-8
   unix extensions = yes

   load printers = no
   disable spoolss = yes

#### Debugging/Accounting ####

# This tells Samba to use a separate log file for each machine
# that connects
   log file = /var/log/samba/log.%m

# Cap the size of the individual log files (in KiB).
   max log size = 5000

####### Authentication #######

# If you are using encrypted passwords, Samba will need to know what
# password database type you are using.
   security = user
   map to guest = never

# timemachine
   vfs objects = catia fruit streams_xattr
   fruit:aapl = yes
   fruit:model = MacSamba

   fruit:resource = file
   fruit:metadata = netatalk
   fruit:locking = netatalk
   fruit:encoding = native
   durable handles = yes
   kernel oplocks = no
   kernel share modes = no
   posix locking = no
   fruit:advertise_fullsync = true
   smb2 leases = yes

#======================= Share Definitions =======================
[timemachine]
   comment = timemachine
   path = /opt/timemachine/
   guest ok = no
   browseable = yes
   read only = no
   create mask = 0666
   directory mask = 0777
   fruit:time machine = yes
```

## 蛇足 (2019/03/13 追記）

これでコンパイルした Samba に大して Timemachine バックアップを行うと core 吐いて落ちるんですがこれは…

## 蛇足 (2019/03/13 追記）

Samba 4.9.5 でも同じ手順でコンパイルが可能な事を確認しました。

## 2019/03/14 追記

smb.conf を差し替えました。以前の設定はこちら。この設定で core を吐かずにバックアップが完了しました。

```
`[global]
## Browsing/Identification ###
   local master = no
   preferred master = no

# Change this to the workgroup/NT-domain name your Samba server will part of
   netbios name = filesrv
   workgroup = WORKGROUP
   server string = %h server (Samba, Ubuntu)

   dos charset = CP932
   unix charset = utf-8
   unix extensions = yes

   load printers = no
   disable spoolss = yes

#### Debugging/Accounting ####

# This tells Samba to use a separate log file for each machine
# that connects
   log file = /var/log/samba/log.%m

# Cap the size of the individual log files (in KiB).
   max log size = 5000

####### Authentication #######

# If you are using encrypted passwords, Samba will need to know what
# password database type you are using.
   security = user
   map to guest = never

# timemachine
   vfs objects = catia fruit streams_xattr
   fruit:aapl = yes
   fruit:model = MacSamba

   fruit:resource = file
   fruit:metadata = netatalk
   fruit:locking = netatalk
   fruit:encoding = native

#======================= Share Definitions =======================
[timemachine]
   comment = timemachine
   path = /opt/timemachine/
   guest ok = no
   browseable = yes
   read only = no
   create mask = 0660
   directory mask = 0770
   fruit:time machine = yes
   fruit:time machine max size = 900G
```
