---
layout: post
title: "Linuxデスクトップをはじめてみた"
date: "2020-07-02 06:02:00 +0900"
categories: 
  - blog
---
## 前書き

* Linuxはサーバーとしては使っている
* LinuxをVMとしては入れているが、物理PCに入れるのはほぼ初めて
* CPUはIntel Core i5 6500 / GPU等追加なし
* ディストリは Linux Mint 20

## 何を書くのか

* インストール直後に確認すべき項目を列挙する
* 設定値メモ
* ソフトウェア類は別記事 /entries/MYb57TjGERPde4B8

## 確認（設定項目）

インストール前に、そもそもWindowsでいうところのスタートメニューの形が気に入らないとか  

その辺をLive USBで確認する。GUIのルックアンドフィールが気に入らないのはまだ何とかなるが  

基本的な好みが合わないのはどうにもならない気がする。  

Ubuntu, Kubuntu, Linux Mint, MX Linux, Elementary OS あたりは試してもよさそう。  

debian (Ubuntu) ベースか、RHEL(CentOS, Fedora)ベースだとアプリケーションのパッケージが  

用意されているので楽かもしれない。  

### ディスプレイ設定

ここが一番トラブる。  


* 4K等のHiDPIのディスプレイを使用している場合に顕著。
* LinuxのGUI環境では(2020/06時点)、ディスプレイ毎のスケーリングというものはなく、システム全体のスケーリングしかない。
* 要するに4Kディスプレイ（高解像度なノートPCのディスプレイも）と普通のFullHDのディスプレイを繋ぐいで、4K側に合わせると、FullHDなディスプレイにはめちゃくちゃデカいUIが表示される事になる。
* と言うのが原則。<s>なんとかする方法は下記。
* HiDPIという設定とは別に、`分数スケーリング` という設定があり、これはディスプレイごとに設定可能。
* この設定で、フルHDディスプレイ側を 100% に設定することで、サイズ調整が可能。
* 少なくともこれを書いた 2020/07/03 時点では、GUIから設定すると分数スケーリングしたモニタの表示品質がひどいことになる。下のxrandrを使った方法だとうまく行くので、それで回避できる。

#### コマンドラインでの設定

~~  

これは古い手順。  

GUIから設定できない。というのが間違っていて、普通にGUIから設定できた。（上記分数スケーリングの話）  

おそらく、設定内容は xrandrコマンドを使うのと同じなのだけれども、標準の作法に則っておけば  

スリープ後でもちゃんと反映されるので、理由がないのであればGUIで設定することをおすすめする。  

~~  


他のディストリビューションではできないものもあったので、残しておく。  


うちでの設定は、以下。メインの4Kディスプレイの左にサブのフルHDディスプレイがある。という構成。  

GUIでHiDPIに設定している。（これだけだとフルHDのモニタの表示が２倍ｘ２倍サイズになっている）  


このままではフルHDのモニタが使い物にならないので、追加で設定をする。  

この構成は、GUIから設定できないのでターミナルから以下のコマンドで設定した。  

```
`xrandr --fb 7680x2160 --output DP-1 --pos 3840x0 --panning 3840x0+3840+0 --output HDMI-2 --pos 0x0 --scale 2x2
````


考え方は、  


* xrandr をパラメタなしで実行すると今の設定が表示される。
* `fb` で全部のディスプレイをつなげた解像度を特定。フルHDのモニタも４Kとみなして計算する。
* 今回は横に並べた形なので、横3840が２枚で7680、縦は普通に2160をそのまま
* --output から次の --output の前までが１モニタの設定。
* 最初に書いたモニタがプライマリ扱い。
* HDMI-2 はフルHDモニタがつながっている。 左側にあるので `pos 0x0`
* `scale 2x2` で HiDPIで表示されているものを縮小して表示するようにする
* DP-1 は4Kモニタの設定。左側にフルHDモニタがあるので、その分 `--pos`と`--panning`で右側を表示させる。

##### xrandr設定の自動適用

システム設定→自動起動させるアプリケーション を開いて  


* 一番上にある Cinnamon Settings Daemon - xrandr を無効にする
* ＋ボタンを押して、`xrandr` コマンドを追加する
* ただし、これをやると外部モニタを接続した場合等に問題が起きるらしいので、最初のやつは無効にしないで、実行遅延時間を１秒とかにして、`xrandr` を実行したほうが良いかもしれない。

### マウスカーソル

マウスカーソルは、 <a href="https://www.gnome-look.org/">https://www.gnome-look.org/ 等からダウンロードできる。  

zip形式でダウンロードできるので `~/.icons` に展開して、システム設定→テーマ で設定可能。  


* HiDPI環境で特に顕著だけれども、マウスカーソルが小さくなる。
* Mintならマウスの設定でマウスカーソルのサイズを変えられるが、大抵の場合、効かない。（DMZ-White （初期設定なのに！）, DMZ-Blackは効かない。Adwaitaは効く。）

### mozc周り
#### 表示が小さすぎるのをなおす

HiDPIにするとmozcの候補ウィンドウの文字がとても小さい。  

これは、タスクトレイにあるかな漢字インジケータの右クリック→現在の入力メソッドの設定  

外観 タブ内のフォントサイズをとりあえず 26 に変更。これで変換候補の文字が大きくなって見やすくなる。  

#### キーバインド

個人的な好みで、macと同じように、変換／無変換でかな漢字変換のON/OFFをしたいので、  

タスクトレイにあるかな漢字インジケータの右クリック→現在の入力メソッドの設定  

全体の設定 タブの `Show advanced option` にチェックを入れて、  

入力メソッドをオンに を 変換（Henkan）、入力メソッドをオフに を 無変換(Muhenkan) に設定する。  


これでON・OFF切り替えはできるようになるが、mozc のキーバインドの変換、無変換に割り当てられている  

ショートカットをすべて削除しておかないと、変換モードが唐突に直接入力になってしまったりするので  

mozcの設定で、無変換・変換キーに割り当てられているショートカットをすべて削除する。  

### テーマ類

ウィンドウ枠等の色とか、見た目とか。ただの好み。  

システム設定→テーマ から設定可能。  

#### テーマ

McOS_MJV_Cinnamon_2.0  

<a href="https://github.com/paullinuxthemer/McOS-Mint-Cinnamon-Edition">https://github.com/paullinuxthemer/McOS-Mint-Cinnamon-Edition  

テーマは `~/.themes` に展開して入れれば選択可能になる  


Mint-Y-Dark-BB  


<a href="https://github.com/smurphos/Window_Borders_Mint_19/">https://github.com/smurphos/Window_Borders_Mint_19/  

このテーマを入れると入る。標準のテーマのボタンを大きくしただけ。  

#### アイコン

Numix  

`sudo add-apt-repository ppa:numix/ppa -y &amp;&amp; sudo apt update &amp;&amp; sudo apt install -y numix-icon-theme-circle`  

テーマは `~/.icons` に展開して入れれば選択可能になる  

#### コントロール部分

Mint-Y-Darker-Red 標準で入っている  

#### マウスポインター

adwaita 標準で入っている  

#### デスクトップ

Silk、追加と削除からインストール可能  

### アプレット

* System monitor を追加。（Graphical Hardware monitorではない）

### グラフィックドライバの変更

注意：これをやってもそれほど高速化するわけではない。（チラツキだけは治ったが…）  

念の為、これをやる前にUEFI/BIOSの設定で、内蔵ビデオ用のメモリ割り当てが32MBになってたら  

もっと増やしてテストすることをおすすめする。  

なお、私は上記をやらずに、Quadro K620 （ヤフオク価格4000円）を買ってしまったので  

これ以上はわからない。  


Skylake、Kabylakeは標準のグラフィックドライバだと性能がイマイチなのと、マウスカーソルの点滅  

がどうしても気になったのでドライバを古いものに変更した。  


<a href="https://qiita.com/haruakio/items/8baca591c3d913eafca7">https://qiita.com/haruakio/items/8baca591c3d913eafca7  


要約:  

`/usr/share/X11/xorg.conf.d/20-intel.conf` に以下の内容のファイルを作る  

```
`Section "Device"
    Identifier "Intel Graphics"
    Driver "intel"
    Option "AccelMethod" "sna"
    Option "TearFree" "true"
    Option "DRI" "3"
EndSection
````


なお、この変更を行うと、 `xrandr` コマンドに指定する出力ポート名が `DP-1` から `DP1` というように  

ハイフンなしの名前に変更されるので注意。 `xrandr`に関してはそこだけ変更すればOK。  

なお、ログイン画面は盛大に表示が乱れるが、ログインしてしまえば問題ないので見なかったことにした。  

### カーネル

デスクトップ向けに調整されたカーネル。  

メモリの使い方がかなり変わる印象。 Bufferがあまり使われなくなって、Cacheに回る感じ。  

#### XanMod

<a href="https://xanmod.org/">https://xanmod.org/  

#### Liquorix Kernel

<a href="https://liquorix.net/">https://liquorix.net/  

