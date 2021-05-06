---
layout: post
title: "idangerous Swiper内にSELECTを置くと動作しない件の対応方法"
date: "2016-03-10 15:00:00 +0900"
categories: 
  - blog
---
## Swiperって？

Webページをスワイプ対応にするライブラリ。  

<a href="http://www.idangero.us/swiper/">http://www.idangero.us/swiper/  


この記事は、Swiper 3.1.2 で動作確認した。  

Ver 3未満の場合は別の方法が必要。  

## 問題

IE 11 / Edge で、スワイプエリア内のセレクトボックスが選択できなくなる。  

具体的には、ドロップダウンは表示されるが、選択できない状態になる。  

## 解決策

SELECTタグに、 class="swiper-no-swiping" を追加する。  

たったこれだけ。  

