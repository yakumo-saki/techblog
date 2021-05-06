---
layout: post
title: "Elasticsearchが1ノードでConditionがYellowな時の直し方"
date: "2019-12-05 13:48:00 +0900"
categories: 
  - blog
---
## 環境

* Elasticsearch 6.4 (Basicライセンス)

## 状態

とりあえずインストールを行い、ほぼデフォルト値で運用してある程度のインデックスが溜まった状態。  

ネタ元はmetricbeatやfilebeat。Condition　Yellowと表示はされるが、問題なく動作している。（ようだ）  

## ではどうするか

やるべきことは2つある。  

1: 既存のインデックスのレプリカ数を0に変更する。  

2: 新しく作られるインデックスのレプリカ数を0に設定する。  

### 実行前の注意点

これらの操作を行うと、elasticsearchの負荷が一時的に上がります。  

しかも、そのままConditionがRedになってしまい、しばらく検索クエリを受け付けない状態にすらなりました。  

メモリ量がそれなりに必要なようで、ログをみるとGCを連発してほぼ、処理が進まない状態になりました。（1.5GB割り当て）  

そのため、メモリ量を増加（2GB）したところ素直に終わりました。インデックス量はおよそ50GBでした。  

大事な環境で実行する際は、テンプレート名を * ではなく、ある程度絞ってテスト実行することをおすすめします。  

＃ 例えば、 `metricbeat-*-2018.10.2*` のように  

### 既存のインデックスのレプリカ数を0に変更する。

すべてのインデックスのレプリカ数を変更してよいのであれば、以下のコマンドで設定できる。  

```
<code class="language-bash">$ curl -H "Content-Type: application/json" -XPUT localhost:9200/*/_settings -d '{"number_of_replicas":0}'
{"acknowledged":true}
````

### 新しく作られるインデックスのレプリカ数を0に設定する。

新しく作られるインデックスは、 template_1 というテンプレートから作られるようなのでその設定を変更する。  

```
<code class="language-bash">$ curl  -H "Content-Type: application/json" -XPUT localhost:9200/_template/template_1 -d '
{
    "template" : "*",
    "settings" : {
        "number_of_shards" : 1, "number_of_replicas" : 0
    }
}'
{"acknowledged":true}
````

## 参考にした記事
### はじめてのElasticsearchクラスタ

<a href="https://www.slideshare.net/snuffkin/elasticsearch-107454226">https://www.slideshare.net/snuffkin/elasticsearch-107454226  


* シャード、レプリカの概念
* 割り当てられていないレプリカ、シャードがあると Condition = Yellow になるということ
* デフォルトのレプリカ数は1なので必ず複数ノードにデータがなければならない
* レプリカ数は、インデックスごとに設定される。

### [Elasticsearch]Cluster Healthのstatus が yellow となる

<a href="https://qiita.com/toshihirock/items/38649fc7310436b2a580">https://qiita.com/toshihirock/items/38649fc7310436b2a580  


* curl <a href="http://localhost:9200/%EF%BC%88%E3%82%A4%E3%83%B3%E3%83%87%E3%83%83%E3%82%AF%E3%82%B9%E5%90%8D%EF%BC%89/_settings?pretty">http://localhost:9200/（インデックス名）/_settings?pretty でインデックスごとの設定が取得できる。

### 出典失念

* 次のバージョンのElasticsearchではレプリカ数のデフォルト値は0になる
* elasticsearchをスモールスタートしてはいけないということはないので、ノード1台でもOK

