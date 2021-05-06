---
layout: post
title: "Rails の web_consoleの応答が404 Not Found になった時の対応"
date: "2017-05-18 15:00:00 +0900"
categories: 
  - blog
---
## 環境

Rails 4.2.6  

web_console 2.3.0  

## 原因

RAILS_RELATIVE_ROOT を設定した結果、web_consoleがたたくAPIの  

エンドポイントが変わっているにも関わらず、web_consoleがそれを認識していない。  

## 対応

以下の行を追記して、web_consoleのマウントポイントを設定する  

```
<code class="language-rb:config/environments/development.rb">config.web_console.mount_point = config.relative_url_root + '/web_console'
````

## 蛇足

修正されたようです。  

