---
layout: post
title: "MinioのバックエンドをAzure Blob Storageに移行する作業メモ"
date: "2019-12-16 13:59:00 +0900"
categories: 
  - blog
---
## ご注意

* Azure Blob Storage は S3互換ではありません
* Multipart-uploadには対応できません。（要するにMastodonには使えません）

## はじめに

移行の動機は以下の通り  


* Mastodonの運用に使っているMinio（自鯖）が存在しているがクラウドに出したくなった
* 普通に考えると Wasabi あたりに移行するところだが、Azureの無料枠があったのでAzure Blob Storageをバックエンドにしたかった

## 設計

* Azule Blob StorageはS3 APIでアクセスできないので、ゲートウェイを設置する必要がある。
* Minio を Azure gateway モードで動かすことで実現できる。

## 事前作業
### minioのセットアップ

<a href="https://az.minio.io/">https://az.minio.io/ に従うと、Azure上にVMを立てて、その上でMinioを動かす手順になっていますが、  

そんなことをしたら課金額が大変な事になってしまうので、VPSで動かすことにします。  


<a href="https://docs.min.io/docs/minio-gateway-for-azure.html">https://docs.min.io/docs/minio-gateway-for-azure.html こちらの手順ではDockerを使っていますが、  

Minioはそもそもバイナリ1個なのでdockerにする必要もないので、直接いれることにします。  


・バイナリをダウンロード ( `wget https://dl.min.io/server/minio/release/linux-amd64/minio ` )  

・実行権限付与 ( `chmod +x minio` )  

### Azure Blob Container側の設定

ポータルから実施した。　IAMでストレージ管理者権限をつけておくこと  

ストレージの作成と、コンテナの作成はポータルが十分にわかりやすいので省略。  

## 移行作業
### minioを停止

バックアップ中にファイルが増えるとそのファイルを転送するのが困難なので停止。  

Minio自体を止めるとバックアップできないのでここは悩みどころ。外部からのアクセスは停止しつつ、  

内部IPにたいしてバックアップするようにして回避したが、よく考えれば書込アクセスを停止すればよいので、  

HTTP PUT,POST,PATCH,UPDATEあたりを拒否すればよかったのではないかとも思う。  

### バックアップ

mc mirror を使った (mc = minio client)  

### Azureに転送

転送方法は複数考えられる。  

Azure Blob StorageがS3互換のストレージからのデータコピーが可能なのでそれを使う（今回未使用）  

Microsoft Azure Storage Explorer を使う <a href="https://azure.microsoft.com/ja-jp/features/storage-explorer/">https://azure.microsoft.com/ja-jp/features/storage-explorer/  

AzCopyを使う  


今回は Azure Storage Explorerを使用した。  


ここでの注意点は、兎にも角にも、azcopy を裏で使うツールを使うこと。Azure Storage Explorerを使用するとGUIで  

操作できて楽だが、必ずメニューの Preview -> Use Azcopy for improved upload and download にチェックを入れること  

（起動時に、黄色いバーで有効にするか聞いてくるのでそこで Enableボタン を押しても可能)  

### Mastodon設定変更

（本筋と関係ない手順です）  

`env.production`で、AWS_ACCESS_KEY_ID＝ストレージ名、AWS_SECRET_ACCESS_KEY＝キー をセットする。  

### Minio再開

転送完了後、minioを再開する。  

### アクセスポリシー設定

minio client をダウンロードしておく  

```
`# azuregw は自分の好きな名前で良い
mc config host add azuregw http://[server] storage名 キー

# azure blob storageを使う場合、download以外の値を指定すると Not implementedになる
mc policy --recursive download azuregw/コンテナ名/
````

## トラブル事例
### 権限がつかない

<img src="/images/2020/09/57812b93c813ee5df6fc0638644a6d71.png" alt="57812b93c813ee5df6fc0638644a6d71" loading="lazy">  


ストレージ管理者権限がIAMについていない場合にこうなりました。  

### MinIOへのアクセスが minio/ にリダイレクトされる

アクセスポリシーが設定されていないので認証が必要→minioブラウザにリダイレクトされる。  

