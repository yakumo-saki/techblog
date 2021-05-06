---
layout: post
title: "zabbix の単位を K M G に丸めるのを禁止する"
date: "2019-12-10 13:53:00 +0900"
categories: 
  - blog
---
## 前提

zabbixに数値型のデータを投入したとき、 1000を超えると、1Kと表示されるようになる。(M Gも同様）  

大抵の場合、これはわかりやすいという意味で良い処理だと思う。  

しかし、気圧データを投入した際に、 `1021 hPa`　が `1.02KhPa` と表示されてしまうのは違和感がある。  

## なおしかた （Zabbix 4.0)

公式ドキュメントの（下記URL）の末尾に書かれている通りですが、  

<a href="https://www.zabbix.com/documentation/current/manual/config/items/item">https://www.zabbix.com/documentation/current/manual/config/items/item  


ホスト→アイテムの設定内の単位を設定する部分で、単位の先頭に `!` をつけるだけです。  

例えば、単位を `!hPa`　と指定すると、乗数の処理を行わなくなります。（もちろん、先頭の !　が表示されることはありません）  

## なおしかた （Zabbix 4.0以前)

ソースコードを書き換えるしかありません。具体的には、以下の行です。  

<a href="https://github.com/zabbix/zabbix/blob/3.2.4/frontends/php/include/func.inc.php#L618">https://github.com/zabbix/zabbix/blob/3.2.4/frontends/php/include/func.inc.php#L618  


`include/func.inc.php` の  

`$blackList = ['%', 'ms', 'rpm', 'RPM'];` に除外したい単位を追加します。  

例えば `$blackList = ['%', 'ms', 'rpm', 'RPM', 'hPa'];` のように追加します。  

## 蛇足

なお、単位に `!` を付けると丸められないのはダッシュボード内のグラフにも有効です。  

## 蛇足2

4.0未満ではソースコード中に、丸めない単位がハードコートされているのでそこを直すしかないようです。  

