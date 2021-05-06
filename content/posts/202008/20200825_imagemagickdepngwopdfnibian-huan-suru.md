---
layout: post
title: "ImageMagickでPNGをPDFに変換する"
date: "2020-08-25 04:08:00 +0900"
categories: 
  - blog
---
## 前提

* Linux Mint 20 (Ubuntu 20.04)

### TL;DR;

* `convert henkan-moto.png henkan-saki.pdf`

### エラーが出た場合

何もしていなければ、以下のエラーが表示されるはず。  

```
`convert-im6.q16: attempt to perform an operation not allowed by the security policy `PDF' @ error/constitute.c/IsCoderAuthorized/408.
````


`/etc/ImageMagick-6/policy.xml` を編集する。末尾のところに以下のような部分があるのでコメントアウト  

```
`<!--    ←これを追加してコメントアウト
  <policy domain="coder" rights="none" pattern="EPS" />
  <policy domain="coder" rights="none" pattern="PDF" />
  <policy domain="coder" rights="none" pattern="XPS" />
コメントアウト終わり -->
````


これで、png -> pdf に変換が可能になる。  

が。別にファイルサイズが縮んだりするわけではない（むしろファイルサイズが大きくなる）  

