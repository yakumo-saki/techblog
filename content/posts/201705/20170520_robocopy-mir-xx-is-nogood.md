---
layout: post
title: "Robocopyの /MIR と /xx を一緒に指定してはいけない"
date: "2017-05-20 15:00:00 +0900"
categories: 
  - blog
---

** 環境  

Windows Server 2012 R2  


** 何をしたかったか  

subversionでチェックアウトしてきたディレクトリをデプロイ用ディレクトリにコピーしたかった。  

完コピーしたかった  


** コマンドライン  

```
<code class="language-bat:間違ったコマンドライン">robocopy c:from c:to /MIR /XX /NP /NDL /NFL /nc /ns
````

```
<code class="language-bat:正しいコマンドライン">robocopy c:from c:to /MIR /NP /NDL /NFL /nc /ns
````


** /XXを指定すると何が起きるか  

宛先フォルダにしかないファイルが無視されるため、 /MIR を指定すると暗黙で指定される /PURGE  

が機能しなくなる。  

