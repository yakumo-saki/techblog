---
layout: post
title: "Apache POIでスタイルを作りすぎると開けないExcelファイルが出来てしまう"
date: "2016-03-18 15:00:00 +0900"
categories: 
  - blog
---
## Apache POIとは

Java向けのExcelファイル操作ライブラリです。xls/xlsx両対応。  

公式サイトはこちら <a href="https://poi.apache.org">https://poi.apache.org  

.NET版のNPOIもあり、ほぼ同じ構成なので同じように当てはまる事象と思われます。  

## 前提として

POIのセルのスタイルの設定方法については以下のQiitaを読んで下さい、  


<a href="http://qiita.com/unishakoooo/items/58a8c2d3a178c965ee94">http://qiita.com/unishakoooo/items/58a8c2d3a178c965ee94  

Apache POIでセルスタイルを設定すると他のセルにまで適用される  

## そもそも開けないExcelとは

POIで帳票を作成する際に、セルの罫線などの書式をCellStyleというクラスで扱いますが  

これは、Workbook（ワークブック=xls(x)ファイルそのもの)の所有物です。  


上記の通り、createStyleすれば新しいスタイルを作って、セルに適用できるのですが、  

ワークブック内のスタイルの数には制限があります。  


* xlsの場合 4000個くらい
* xlsxの場合 64000個


Excel の仕様および制限 - Excel  

<a href="https://support.office.com/ja-jp/article/Excel-%E3%81%AE%E4%BB%95%E6%A7%98%E3%81%8A%E3%82%88%E3%81%B3%E5%88%B6%E9%99%90-16c69c74-3d6a-4aaf-ba35-e6eb276e8eaa">https://support.office.com/ja-jp/article/Excel-の仕様および制限-16c69c74-3d6a-4aaf-ba35-e6eb276e8eaa  


で、これを超えるとファイルを開く際にExcelがエラーを表示してファイルが開けなくなります。  

## で、何が問題なのか

workbook.createCellStyle();　するとスタイルが一個作成されます。  

例えば、セルの色が黄色なセルが5000個あって、全てのセルで毎回 createCellStyle() すると  

開けない.xlsが出来上がってしまいます。  

＃この場合、上記のQiitaの最初の通り、Styleのインスタンスを使い回せば何の問題もありません  


スタイルのパターンが少ない場合はStyleのインスタンスを使い回しする方法でなんとかなりますが、  

例えば、テンプレートファイルがあって、そこに色を付ける処理をする際は、セルごとにStyleを  

生成するしかありません。そして、色を付けるセルが4000を超えると、またしても開けない.xlsの  

できあがりになります。  

## ではどうするか

セルのスタイルが同じである場合は、CellStyleのインスタンスを使い回すようにして下さい。  

・・・。  

なんて事をいちいち書いてたら納期遅れか徹夜一直線です。  

POIの開発チームは親切にも対策を用意してくれています。  

CellUtil.setCellStyleProperty() です  

```
`// 普通に書くとこうなりますが、これだとスタイルが必ず新しく作られてしまう
CellStyle cellStyle = cell.getCellStyle();
CellStyle newStyle = workbook.createCellStyle();
newStyle.cloneStyleFrom(cellStyle);
style.setFillPattern(CellStyle.SOLID_FOREGROUND);
style.setFillForegroundColor(IndexedColors.YELLOW.getIndex());
cell.setCellStyle(newStyle);

// CellUtil#setCellStylePropertyを使えば、同一スタイルをdistinctしてくれます！
CellUtil.setCellStyleProperty(cell, book, CellUtil.FILL_PATTERN, CellStyle.SOLID_FOREGROUND);
CellUtil.setCellStyleProperty(cell, book, CellUtil.FILL_FOREGROUND_COLOR, IndexedColors.YELLOW.getIndex());
````

## まとめ

CellUtilにはこれ以外にも、getRow()など便利なメソッドがあります。  

＃素のsheet.getRow()はrowがないとnullが返るが、このメソッドは自動で新規作成してくれる  

と言うより、個人的見解ですが・・・  

POIの *Util(CellUtil以外にもいくつかあります） にメソッドがある操作は、そっちを使った  

方が幸せになれます。  

＃というか、落とし穴おおすぎー  

