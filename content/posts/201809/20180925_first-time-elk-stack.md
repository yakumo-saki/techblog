---
layout: post
title: "ELKスタックに入門してみた"
date: "2018-09-25 15:00:00 +0900"
categories: 
  - blog
---
# まえがき

この文章は割と未完です。現在進行形で試行錯誤している状態なので更新がまだ続いています。  

## はじめに

多分、余計な話は良いから中身読みたいと思うので、動機とかは後ろにまとめました。  

この文章は、セットアップ自体の手順より、ハマったところ、それを通じて分かったことを中心に記述します。  

## 前提

サーバーはすべてVMで、CPUコア数は Ryzen 1700 の1コアです。  

構築時のElasticのバージョンは 6.4 です。  

## 構成

* ログ基盤サーバー (2Core , 4GB RAM, 100GB SSD, Ubuntu 18.04LTS)
* その他いろいろなサーバー群 (Ubuntu 16.04, Windows Server 2016)

## ログ基盤サーバーの構築

elasticsearch, logstash をログ基盤サーバーにインストールした。公式ドキュメント通りなのでインストール自体は省略。ハマった所だけ書いていく  

### elasticsearchのlisten ip

初期設定は 127.0.0.1 みたいになっているので外からの接続を受け付けない。  

外向きのIPアドレスに変更する必要があった。ここで、外向きのIPアドレスを指定した場合、kibanaもLogstashも、接続先を外向きのIPアドレスを指定する必要がある。(localhostは通らない）  

今試したところ、 0.0.0.0 と指定すれば全インターフェイスにlistenしてくれます。これでいいかも。  

### kibana のdiscoveryを開くと何もでない

データがないからなので問題ない。あとで設定を変えれば表示されるのでくじける必要はないです。  

filebeat-* みたいな表示がされているが、これはIndex名で、RDBMSで言う所のテーブル名。*がついているのは普通にワイルドカードを表している。  

filebeat-2018.09.11 のように日付をつけたindexが作成（といってもデータ投入時に自動で作られるので手動で作ることはしません）されるとそれ全てに検索をかける。という意味のようです。  

日付をindex名に付けることで、古いログを捨てるのがとても簡単にできます。  

例えば `curl -X DELETE http://elasticsearch:9300/filebeat-2018.09.11` と叩けば消えてしまいます。あっという間だし、自動化も簡単。すごい便利。  

### kibanaの用語がよくわからない

discovery･･･データをとりあえず時系列で表示して抽出等してみる画面。Excelのピボットテーブルみたいな感じ。データさえ入っていればとりあえず表示できる。  

visualize･･･データをどう可視化するかを定義する。zabbixのグラフ一個が1 visualize  

dashboard･･･複数のvisualizeを組み合わせて画面を作ったもの  

Timelion･･･すごそう <a href="http://acro-engineer.hatenablog.com/entry/2016/02/04/121500">http://acro-engineer.hatenablog.com/entry/2016/02/04/121500  

APM･･･各アプリケーションにモジュールを入れると性能情報が取得できる･･･ぽい。  

Dev Tool･･･便利ツール。Grok Debuggerはlogstashの設定するときに便利  

Monitoring･･･ログ基盤自体のモニタリング。  

Management･･･elasticsearchのindexを一覧したり消したりできる。あとkibanaの設定。Index-patternの設定を変えればdiscoveryに色々表示できる。  

### X-Pack

以前のバージョンでは拡張機能を使う場合にはX-Packを入れる必要があった。この部分が商用だと有償だったみたいな経緯があってあちこちにX-Packという記述があるが、6.4では本体と一緒にインストールされるようになった。この部分は、ライセンスが異なったりするかもしれないので利用する際は注意が必要。  

## 可視化回り（サーバーの負荷状況等）
### metricbeatのインストール

何はともあれ、何かが可視化されないとモチベーションが沸かないので、`metricbeat` から試した。  

インストールは単純に、apt･･･ではない。いきなりの落とし穴があった。  

<a href="https://qiita.com/yakumo/items/c0804247ec95b3e03d10">https://qiita.com/yakumo/items/c0804247ec95b3e03d10  

要約：aptで入れたあと、tar.gzに入っている設定ファイルをコピーする必要がある。  

設定ファイルは `/etc/metricbeat/metricbeat.yml` で、必要なのはkibanaのURLとelasticsearchに接続するエンドポイントくらい。ハマりそうなのは以下の場所くらいか  

設定ファイルはサーバーが複数あってもまったく同じでOKなので、Ansibleで入れるのが楽  

```
`output.elasticsearch:
  # Array of hosts to connect to.
  hosts: ["192.168.10.20:9200"]
  protocol: "http"     # 内部なのでhttpsにしていない
````


設定変更後、一度だけどこかのサーバーで `metricbeat setup` を実行するとkibanaにダッシュボードが作成される。サーバーの追加はmetricbeatを入れるだけで自動的に認識される。  

簡単に、かなりのビジュアライズがされるのですごさを簡単に味わえる  

### 地味なポイント

metricbeat, packetbeat等は、データを構造化（決まった形）で送信するので、elasticsearchに直接繋いでOK。  

## いろいろなログをelasticsearchに入れる
### 前説

一番やりたいことだが最難関。  

何が難しいかというとログファイルは形式が一定ではない上に、どういう情報が含まれているのかも決まっていない。かといってそのままでは扱いにくいので、内容をある程度解釈してあげる必要がある（＝どう解釈するか設定が必要）。  

#### データの流れ

ログの取込には、filebeatsとlogstashが登場するが、役割は filebeatでログ内容を（ちょっとだけメタ情報を付加して（解釈はせずに） logstash に送信、logstashで内容を解釈して構造化した状態で保存。という流れが基本（細かくは蛇足参照）  

#### ログ形式

ログ出力側でログを構造化できるのであればそれを行った方がよい。  

個人的には LTSV形式おすすめ。( <a href="http://d.hatena.ne.jp/naoya/20130209/1360381374">http://d.hatena.ne.jp/naoya/20130209/1360381374 )  

容量的には多少大きくなるけれども、人間が読んでも読みやすく、機械にも優しいフォーマットだと思います。(なお、項目数が必ず一定である必要はありません。）  

後述しますが、普通にログを解釈するのは割と大変です。  

### index名

ログの種別ごとにindex名を切り替えたくなりますが、慣れるまでは辞めておきましょう。  

デフォルトのfilebeat-*を使わないと、kibanaのvisualizationが適用できません。  

幸い、いろいろな種類のログを混ぜても問題ないようにできています。  

※というより、ログ種別の区分用のフィールドが自動で付加されています。  

#### 蛇足

最初はまず1台分の1ログだけをターゲットにして、感じに慣れた方がよい。  

2ログを流し込もうとするとハマるので注意  

### 最初のログ取込： Nginxアクセスログ

満足度が高そうなのでNginxのアクセスログを取り込むことにした。  

#### nginxログ形式をLTSVに変更

全サービスが通過するリバースプロクシがあるのでそこに以下の設定を入れた。  

conf.d以下にある他の設定ファイルで access_log を指定している場合、そちらも設定変更が必要なことに注意  

```
<code class="language-/etc/nginx/nginx.conf">    log_format ltsv 'time:$time_iso8601\t'
                    'http_host:"$host"\t'
                    'remote_addr:$remote_addr\t'
                    'method:"$request_method"\t'
                    'request:"$request"\t'
                    'request_length:$request_length\t'
                    'status:$status\t'
                    'bytes_sent:$bytes_sent\t'
                    'body_bytes_sent:$body_bytes_sent\t'
                    'referer:"$http_referer"\t'
                    'user_agent:"$http_user_agent"\t'
                    'upstream_addr:"$upstream_addr"\t'
                    'upstream_status:$upstream_status\t'
                    'request_time:$request_time\t'
                    'upstream_response_time:$upstream_response_time\t'
                    'upstream_connect_time:$upstream_connect_time\t'
                    'upstream_header_time:$upstream_header_time';

    access_log  /var/log/nginx/access.log  ltsv;
````


設定してみるとわかるが、人間から見ても可読性は悪くない  

### filebeat インストール＆設定

filebeatのインストールと、 /etc/filebeat/filebeat.yml の設定は省略。  

ハマりどころとしては、 elasticsearchと logstashの出力はどちらか片方のみ。  

両方設定すると起動時に落ちます。filebeatは出力先を1つしか設定できません。  

※ファイルごとに1つとかではなく、サーバーごとに1つだけ。つらい。  

```
<code class="language-/etc/filebeat/module.d/nginx.yml">- module: nginx
  # Access logs
  access:
    enabled: true

    # Set custom paths for the log files. If left empty,
    # Filebeat will choose the paths depending on your OS.
    var.paths:
      - /var/log/nginx/access.log

  # Error logs
  # 複数ログを同時に送らないように enabled : false にしておく
  error:
    enabled: false

    # Set custom paths for the log files. If left empty,
    # Filebeat will choose the paths depending on your OS.
    var.paths:
      - /var/log/nginx/error.log
````

### logstash設定

logstashは conf.d 以下のファイルを読み込むので複数種類突っ込むときは  

それなりの書き方をしないと混ざる。  

なお、filebeatのnginxモジュールで送信するときに既に構造化はされていて、いくつかのメタ情報が付加されている。例えば、 [fileset][module] はfilebeatがセットしている値。  

元のログは message に格納されているので、そこをLTSVとして解釈して elasticsearchに投入。という流れ。  

```
<code class="language-/etc/logstash/conf.d/nginx.accesslog.conf">input {
    beats {
        port => 5400
    }
}

filter {

  if [fileset][module] == "nginx" {
    if [fileset][name] == "access" {

      kv {
        field_split => "\t"
        value_split => ":"
      }

      mutate {
        convert => ["request_length", "integer"]
        convert => ["status", "integer"]
        convert => ["bytes_sent", "integer"]
        convert => ["body_bytes_sent", "integer"]
        convert => ["upstream_status", "integer"]
        convert => ["request_time", "float"]
        convert => ["upstream_response_time", "float"]
        convert => ["upstream_connect_time", "float"]
        convert => ["upstream_header_time", "float"]
      }

      geoip {
        source => "remote_addr"
        target => "geoip"
        add_tag => [ "nginx-geoip" ]
      }

      date {
        match => [ "time" , "ISO8601" ]
      }

      useragent {
        source => "user_agent"
      }
    }
  }
}

output {
 elasticsearch {
   hosts => ["192.168.10.20:9200"]
   index => "%{[@metadata][beat]}-%{[@metadata][version]}-%{+YYYY.MM.dd}"
   document_type => "nginx_logs"
 }
}
````

#### 要注意；logstashのpipelineについて

ログが入力されてからどう処理するかの設定は /etc/logstash/pipelines.yml に定義されているが、デフォルトでは、全てのログが conf.d 以下の configファイル全てを通過する。  

なので、設定上で、どのログのときに処理を行うのかを判定する必要がある。  


私は思いっきり勘違いをしたのだが、上の設定で言うと、 port 5400 に飛んできたログは、このファイルの定義で解釈する。のではなく、どこから飛んできたログであろうと、conf.d 以下の全てのファイルの設定を通過するので必ず対象でなければ何も filterしないように書かなければいけないようだ。ようするに･･･ログ種別の分だけ if文が増える。 これはつらい。なので以下の記事参照･･･  

<a href="https://qiita.com/micci184/items/24e197a168891f089b3d">https://qiita.com/micci184/items/24e197a168891f089b3d  

でも、filebeatは出力先1個しか指定できない、どうすればいいの？  

# 蛇足
## 動機

最近、Mastodonを運用始めたり、色々とWebアプリを動かしていたりサーバーが増えたりでログを見るところまで手が回らなくなってきたので、ログ基盤というのを作ってみたくなった。  

※ ゆくゆくは、zabbixからKibanaに移行できたらなぁと思っている。  

## beatsではなくbeat

名前をよく間違えて怒られた。 metricbeat"s"とかfilebeat"s"ではなく単数形。  

## filebeatとlogstash

logstashは自分でログファイルを開いて解釈して、elasticsearchに入れるところまで出来る。  

ようするにlogstashが入ってるのであればfilebeatは不要。ではfilebeatはなんで存在するのかというと、logstashはJava製で、多機能で重量級なので全部のサーバーに入れるには重すぎる。  

なので、filebeatで最低現のメタ情報だけを付加して、後はどこかのlogstashに任せる。という運用がよい。  

## logstashの運用

（こういうことはできません）  

ログの種類1種類ごとにpipelineを1個つくって、別のポートで待受させて、filebeatでどこに投げ込むかを決めればスッキリするかなと思った（filebeatは出力先を1個しか指定できない）  

しかし、logstashはスッキリするけどfilebeat側がスッキリしないのであえてこうなってるのかなぁと思った。  

# 謝辞

Twitterで色々と教えて下さった  Jun Ohtaniさん ( <a href="https://twitter.com/johtani">https://twitter.com/johtani )  

多分、色々と教わらなかったらとっくに心折れてたと思います。ありがとうございます。  

