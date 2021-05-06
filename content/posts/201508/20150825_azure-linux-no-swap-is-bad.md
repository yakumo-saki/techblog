---
layout: post
title: "Azure上のLinuxのSwapがデフォルトオフの件"
date: "2015-08-25 15:00:00 +0900"
categories: 
  - blog
---
## 前置き

de:codeで聞いたTIPS。念のため自分の所のテスト機を調べたら  

主題の通り、Swapoffだったっぽいのでメモ。  

## 細かい話

Azure上のLinuxには必ず、Azure用エージェントをインストールするように  

なっている。  

で、そのAzure用エージェントがLinux起動時に自動的にディスクをマウントしている。  

と言うことは起動時にはディスクがないのでSwapも設定できない。  

（起動時のシーケンスがよく分からんけど、PXEみたいな雰囲気で起動してる？）  


というわけで、ディスクをマウントした後であれば、Swapを設定できるものの、  

デフォルト値では、Swapはオフになっているので、設定を変更すべき。とのこと。  

＃スピーカー氏は、NoSwapという漢らしい設定ですが、やめて下さい。  

＃YesSwapで使ってください。っていうなかなかナイスな表現をしてた。  

## どうすればいいか

/etc/waagent.conf というファイルがあるのでそこを編集。  

以下のような行を確認する。うちの環境では、それぞれ n , 0 と設定されていた。  

```
<code class="language-apache:/etc/waagent.conf">    # Create and use swapfile on resource disk.
    ResourceDisk.EnableSwap=y
    
    # Size of the swapfile.
    ResourceDisk.SwapSizeMB=1024
````

## やってみた。

編集前  

```
`              total        used        free      shared  buff/cache   available
Mem:           1678         343         179          88        1154        1010
Swap:             0           0           0

-------------------
reboot
-------------------

              total        used        free      shared  buff/cache   available
Mem:           1678         205         252           8        1220        1263
Swap:          1023           0        1023
````


と言うわけで、ちゃんとSwapが確保された。  

めでたしめでたし。  


2015/07/28 追記  

セッション動画が一般公開されたのでURLを追記しておきます。  

<a href="https://channel9.msdn.com/events/de-code/decode-2015/CDP-012">https://channel9.msdn.com/events/de-code/decode-2015/CDP-012  

