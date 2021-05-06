---
layout: post
title: "Raspberry Pi Zero W と 4DPi-32 （rev2ではない）を使う"
date: "2020-12-19 02:49:36 +0900"
categories: 
  - blog
---
# 最初に

タッチセンサーは有効にできなかった。キャリブレーション画面までは出せるのだが反応してくれない。個体不良なのか、構成ミスなのかわからず。利用目的的に問題なさそうなので諦めた。  


そもそも、Raspberry Pi Zero Wに4DPi-32を組み合わせるのがNot Supportedな組み合わせ。  

ピンの数が違うのでこれが本記事に影響している可能性がある。  


そもそも論として同じタッチパネル液晶でもHDMI経由で出力するような液晶をチョイスした方が良い。  

が。4DPi32は見た目がスッキリしているので悩みどころ。(もちろん、買うならRev2で）  

Rev2とRev1の違いは、製品種別が自動判別できるようになったことと、ピンがラズパイ1用の26ピンからラズパイ2以降用の40ピンになったこと程度で、基本構成は一緒、ドライバというかカーネルも同じ。Rev1だとconfig.txtに手で書かなければいけない部分がRev2だと自動。という程度の認識  


ちなみに、接続は Raspberry Pi ZeroのmicroSDカードを左側にした状態で、4DPi32がZeroの下側にはみ出す方向に横長に置いた状態でピンを左寄せして接続すれば良い。  

ZeroのGPIOの右側(=電源LEDがある方）14ピン分余っている状態ならOK。  

もちろん、Rev2であれば40ピン全部を覆うようになっている。  

# 必要なリソース

* <a href="https://4dsystems.com.au/mwdownloads/download/link/id/818/">https://4dsystems.com.au/mwdownloads/download/link/id/818/
* wpa_supplicant.conf
* ssh (という名前の空ファイル)
* microHDMIで接続できるディスプレイ（変換アダプタ可）
* microUSBで接続できるキーボード、マウス（変換して普通のUSBで可）


取説の手順だと、tarballを持ってきて、/に展開するとkernel等一式が展開されて、これでOKと書いているがそれをやるとkernel panicで起動すらしなくなった。別のLinux PCで上書きした場合は起動したのでなにか間違えたのかもしれない。  

## 手順
### 初期設定

この時点ではHATを接続しないこと（重要）  

updateをかけないこと（重要）  


* raspbian を焼く。執筆時点では `2020-12-02-raspios-buster-armhf.img`
* wpa_supplicant.conf と ssh を boot にコピー
* microSDカードをラズパイに装着
* microHDMI接続のディスプレイと、USBキーボード、マウスを接続する
* 最初の起動。
* 初期設定を行う(ここで完了させておかないと、液晶では解像度が足りずボタンが押せない。)
* 日本語にしたくなるが、英語にしておくと明らかに反応がよくなる。フォント周りの負荷？
* アップデートするか？という手順は Skip する
* IPアドレスとssh接続確認（注意：右上のネットワークインジケータにマウスオーバーした際に no wireless lanと表示されるのは問題ではない。クリックしたときにSSIDとIPアドレスが表示されていれば良い）
* 【オプション】vimを入れる。viだとつらい

### 4DPi用のカーネル導入

* 

boot内のoverlays -> overlays_org にリネーム（念の為）  


* 

tarballを展開した中の /boot/overlays を boot にコピー  


* 

tarball内の /boot/*.imgとconfig.txt を bootにコピー  


* 

tarball内の /lib/modules/* を rootfs の /lib/modules/ にコピー（上書きが発生したら何か間違えている）  


* 

tarball内の /etc/modules を rootfs の /etc/modules に上書きコピー  


* 

config.txt に `dtoverlay=4dpi-32` を追記（場所はあまり関係ない）  



### 4DPiにGUIを出力するように設定

次のステップからはmicroHDMIでのGUIは表示されなくなる。  


* 4DPiを接続する
* tarball内の /etc/X11/xorg.conf.d/99-fbturbo.conf を rootfs の /etc/X11/xorg.conf.d にコピー
* 【オプション】/usr/share/X11/xorg.conf.d/99-fbturbo.conf を 99-fbturbo.conf.nouse 等にリネーム
* 起動させて4DPiにGUIが表示されるかテスト

### 最後に

apt update, upgrade をやってしまうと壊れる可能性がある。執筆時点(2020/12/19)では、この手順で動いたあとに、upgradeをすると、表示されなくなった。  

やり直しは…最初からになるので、なにか事情があって apt upgradeを実行するのであれば、SDカードのフルバックアップを取ってから行うことをおすすめする。  

## トラブルシュート
### 基本

* dmesgで起動時のメッセージを読んで、エラーになっているのを潰していく。
* raspbianを素で起動しても出るエラーもあるのであまり深追いしないように注意
* lsmod で指定したモジュールがロードされているかチェック。されていなければ、`modprobe`を使って手動ロードさせてみる。ダメならなにかエラーが出るはず。
* GUI周りのログは /var/log/Xorg.0.logを見る。HDMIにもLCDにも画面が出ていなければなにか出ているはず
* デバイスファイルが作成されているかチェックする /dev/fb1 がないとか

### microHDMIに画面出力したい

LEDに画面が表示されているとGUI操作できないに近いので、HDMIに戻したい場合は、  

`/etc/X11/xorg.conf.d/99-fbturbo.conf` を `99-fbturbo.conf.nouse` のようにリネームして再起動すればOK。 LEDに出力させるようにする場合は、ファイル名を元に戻す。  

### やらなかった手順

以下は覚書。問題が起きたときにやったが、それにより他の問題を引き起こした等でやらなかったか意味がなかった手順。  


* overlay_org -> overlays にファイルを上書き（これをしないとWiFiが使えなくなったことがあった）
* /dev/fb1 が存在せず、 /dev/fb0 のみがある場合は、上記ファイルの /dev/fb1を /dev/fb0 に書き換える…だが、おそらくこの場合は何かが間違っていると思われる。(config.txtのdtoverlayが間違っている？)

## 補遺
### wpa_supplicant.conf

/boot/wpa_supplicant.conf (bootパーティションの /wpa_supplicant.conf)に以下の内容でファイルを作っておくと、ラズパイ起動時に `/etc/wpa_supplicant/wpa_supplicant.conf` に上書きされる（上書きしたあとbootの方は削除される）。  

bootパーティションはFAT32なのでWindowsでも読み書きできるが、rootfsはext4なのでLinux以外で読み書きできないという事情があるのでこういう親切をしてくれていると思われる。  

```
`country=ja
update_config=1
ctrl_interface=/var/run/wpa_supplicant

network={
 scan_ssid=1
 ssid="your_sssid"
 psk="your_psk"
}
````

## 補遺2
### バックライトのPWM制御

ソフトウェア的にはデフォルトでPWM制御がON。  

4DPi本体の裏側のジャンパで、バックライトのPWM制御がOFFになっているので、そこを変更する。  

明るさの変更は、  

```
`echo 100 | sudo tee /sys/class/backlight/4dpi-32-pwm/brightness 
````


明るさは、 (暗）0〜100（明）の間の整数で指定する。0だとバックライトオフ。  

datasheetのコマンド `sudo echo 0 > ...` ではPermission Deniedになってしまうのでteeを挟む必要があった。  

### ディスプレイの自動スリープOFF

<a href="http://gml.blog.jp/archives/8144348.html">http://gml.blog.jp/archives/8144348.html  


/etc/xdg/lxsession/LXDE/autostart に以下を追記  

```
`@xset s off
@xset s noblank
@xset -dpms
````

## 補遺3
### タッチパネル

`sudo apt-get install evtest libts-bin libts0`  

`sudo TSLIB_FBDEVICE=/dev/fb1 TSLIB_TSDEVICE=/dev/input/event0 ts_calibrate`  


`/dev/input/event0` はマウス等を接続していると `/dev/input/event4` になったりする。  

間違っている場合はts_calibrateを起動した瞬間にエラーが出るのでわかる。  


・・・が。タッチパネルの調整画面は表示されるが反応しない。  

ここで心が折れてしまった。  

## 参考リソース

* 公式 <a href="https://4dsystems.com.au/4dpi-32">https://4dsystems.com.au/4dpi-32
* datasheetという名前のマニュアル <a href="https://4dsystems.com.au/mwdownloads/download/link/id/267/">https://4dsystems.com.au/mwdownloads/download/link/id/267/

