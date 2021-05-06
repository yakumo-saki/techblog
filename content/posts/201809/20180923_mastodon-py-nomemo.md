---
layout: post
title: "mastodon.py のメモ"
date: "2018-09-23 15:00:00 +0900"
categories: 
  - blog
---
## 背景

* 本来のドキュメントは <a href="https://mastodonpy.readthedocs.io/en/latest/index.html">https://mastodonpy.readthedocs.io/en/latest/index.html
* なんだけども、読んでも返り値とかはわかるけどもなんか書き方が感覚と違う
* なので、自分が使う分だけメモすることにした
* 認証不要で取得可能なものは、自分で直接HTTPリクエストを投げたほうが楽な気がする

# 使い方

`pip install mastodon` でインストール可能。  

## 初期化

以下の感じで初期化する。  

この例は、MastodonのWebから設定→開発を使って自分でクライアントを登録している場合の例。そうでないなら、クライアントの登録とアクセストークンの取得を行う必要がある。  

```
`from mastodon import Mastodon

mastodon = Mastodon(
    access_token = 'アクセストークン',
    client_id = 'クライアントキー',
    client_secret = 'クライアントシークレット',
    api_base_url = 'URL。例えば https://mstdn.jp'
)
````

## アクセストークンに紐づくアカウント情報の取得

`account = mastodon.account_verify_credentials()`  

返り値は <a href="https://mastodonpy.readthedocs.io/en/latest/index.html#user-dicts">https://mastodonpy.readthedocs.io/en/latest/index.html#user-dicts  

## 自分のアカウントのトゥートを取得

`toots = mastodon.account_statuses(account)`  


account は、前述の mastodon.account_verify_credentials() の返り値でも良いし、アカウントID（数字）でも良い。自動的に適切なものが使用される。  

なお、返り値は20件。  

## 一度取得したトゥートの続き、前、残り全部を取得する

取得したトゥートのdictをそのまま渡せば自動的に続きを取得できる。  

```
`next_toots = mastodon.fetch_next(toots)  
prev_toots = mastodon.fetch_previous(toots)

# 残り全部を取得する。ただしリクエストをループするので負荷注意。
# また、API リクエスト回数リミットも注意
remain_toots = mastodon.fetch_remaining(toots)
````

## トゥートの削除

`mastodon.status_delete(status_id)`  


負荷注意。Mastodonにおいて削除処理は意外と負荷が高いです。  

