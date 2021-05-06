---
layout: post
title: "Blog移行の件"
date: "2020-09-24 13:37:13 +0900"
categories: 
  - blog
---

Qrunchさんがサービス終了されてしまうそうなので、自前でGhostをホストすることにしました。データの移行はまだ終わっていませんが、ぼちぼちやっていきます。  


ちなみに、オンプレミスのkubernetesクラスタ上で動作しています。  

URLを本番用のものに変えた時にリダイレクトループになってしまってかなり焦りました。  


<a href="https://ghost.org/faq/change-configured-site-url/">https://ghost.org/faq/change-configured-site-url/  


ぐぐったら思いっきりFAQでした。リバースプロキシが入っているのでヘッダをセットする必要があったという凡ミス。  


nginxの設定ファイルに以下を追記するとうまく行きます。  

```
`        proxy_set_header X-Forwarded-Host $http_host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
````

