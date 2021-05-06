---
layout: post
title: "Docker上で動いているMastodonをkubernetesクラスタに移動した作業メモ"
date: "2019-12-20 14:04:00 +0900"
categories: 
  - blog
---
## 本稿のスコープ外

* Kubernetes(以下 k8s）クラスタの構築方法
* Mastodonの初期設定
* kustomizeのインストール


※ 多少読み替えて頂ければ、dockerではないMastodonも移行できるはず  

## 前提条件

* kubectlが実行可能なこと
* kustomize が使用可能なこと
* 以降元dockerコンテナのファイルを持ってこれること

## 作業手順

実は移行自体はそれほど難しくありません。  

移行が必要なのは、PostgreSQLのDBだけです。redisのデータも移行した方がよいですが、  

移行しなくてもその時点のSidekiqのジョブが失われる程度で、恐らく誰も気づきません。  

※ 管理者的には、Sidekiq画面のジョブ数がリセットされるのが残念かな？程度  

### kubernetesクラスタ上にPodを生成

Deployment定義をgithubに公開しています。  

<a href="https://github.com/yakumo-saki/k8s-mastodon-deployment">https://github.com/yakumo-saki/k8s-mastodon-deployment  

私のインスタンスは、Glitch EditionなのでDockerイメージ名が違いますが、基本的に  

公開しているDeploymentをそのまま使用しています。  

複数インスタンス持ちなので、myinstanceをコピーして foundation としました。  


`foundation/kustomize.yaml` は以下のように書き換えました。  

```
<code class="language-yaml">namePrefix: foundation-
commonLabels:
  app: foundation

resources:
  - ../base
configMapGenerator:
  - name: config
    env: env.production
    files:  
    literals:
````


`env.production` ファイルは稼働中のインスタンスからそのまま持ってきます。  

その上で、`DB_HOST` `REDIS_HOST` を変更します。  

### base/kustomization.yaml変更

DBを戻し終わるまでは、Web, Streaming, Sidekiqには起動して欲しくありません。  

そのため、一時的に `./base/kustomization.yaml` を変更します。  

```
<code class="language-yaml">resources:
  - db-service.yaml
  - db-pvc.yaml
  - db-statefulset.yaml
  - web-sidekiq-pvc.yaml
  - redis-service.yaml
  - redis-pvc.yaml
  - redis-deployment.yaml
  #- web-service.yaml             ここから下をコメントアウト
  #- web-deployment.yaml
  #- streaming-service.yaml
  #- streaming-deployment.yaml
  #- sidekiq-deployment.yaml
````


ここまでできたら、  

foundationディレクトリで  

```
<code class="language-bash">$ kustomize build | kubectl apply -f -

configmap/foundation-config-4dm8g6h6gm created
（略）
````

### 移行元インスタンス停止

（リハーサルなら止めなくてよい）  

*DBとRedisコンテナ以外* を停止します。  

### DB, redis バックアップ取得
```
<code class="language-bash"># 移行元インスタンスのdockerが動いてるところで
$ docker exec mastodon_db_1 pg_dumpall > pg_dumpall.sql

# このコマンドはredisへのアクセスが停止します。（短時間ですが）
$ docker exec mastodon_redis_1 redis-cli save
OK

$ docker cp mastodon_redis_1:/data/dump.rdb .
````


`pg_dumpall.sql` `dump.rdb` ファイルは、kubectlを使用可能なPCにコピーしておいて下さい。  

### DBバックアップをk8s上のDBに戻す
```
<code class="language-bash">$ kubectl cp pg_dumpall.sql foundation-db-0:pg_dumpall.sql

$ kubectl exec -it foundation-db-0 sh
$$ psql
root=# \i pg_dumpall.sql
（どばっと、DUMP取込のログが出る）
root=# quit

# SQLファイルを消しておかないとサーバーの容量を食うため（コンテナ再起動で消えますが）
$$ rm pg_dumpall.sql
````

### Redisバックアップをk8s上のDBに戻す

redisのバックアップは、 /data/dump.rdb を上書きするだけです。  

しかし、一つ落とし穴があります。 それは、redis稼働中にdump.rdbを上書きしても、  

redisをシャットダウンする際に上書きされるという罠です。  

なので、一旦redis-serverを起動しないようにします。  

`./base/redis-deployment.yaml` を編集。  

```
<code class="language-yaml:./base/redis-deployment.yaml">(略）
     containers:
        - name: redis
          image: redis:5.0-alpine
          command: ["tail", "-f", "/dev/null"]   # この行追加（またはコメントアウト解除）
          resources:
            requests:
              memory: "16M"
          livenessProbe:
          #  exec:                               # ここをコメントアウト
          #    command:
          #    - redis-cli
          #    - ping

(略）
````

```
<code class="language-bash">$ kubectl get pod して、 foundation-redis-* のpod を探す。
$ kubectl cp dump.rdb foundation-redis-xxxx:dump.rdb_new

$ kubectl exec -it foundation-redis-xxxx sh

$$ ps aux
PID   USER     TIME  COMMAND
    1 root      0:00 tail -f /dev/null    # redis-server が動いていないことを確認
   52 root      0:00 sh
   72 root      0:00 ps aux

$$ ls -lh
-rw-r--r--    1 redis    redis         92 Aug 16 05:06 dump.rdb
-rw-r--r--    1 501      dialout     5.3M Aug 16 05:28 dump.rdb_new  # 所有者が違う！

$$ cp dump.rdb_new dump.rdb
$$ chown redis.redis dump.rdb
````

### 一時的に変更した設定ファイルの復元

* 編集した `./base/redis-deployment.yaml` を元に戻します。
* 編集した `./base/kustmization.yaml` を元に戻します。


元に戻したら、いよいよ起動を行います。  

```
<code class="language-bash">kustomize build | kubectl apply -f -
````

### 動作確認

とりあえず、 `curl [外向きのIP等]:3000` して何かが帰ってくればOKとします。  

### リバースプロクシの設定変更

動作確認ができたら、リバースプロクシの設定を変更しましょう。  

## 積み残し
### favicon

マウントしないといけないのですが、本稿では色々と事情があり割愛しています。  

## 蛇足
### .env.production じゃなくて env.productionにリネームしたのなんで？

`.env.production` だと `ls` したときに表示されないからです。 `ls -a` すれば見えますが。  

個人的に見えないファイルが重要っていうのはあんまり好きではないので。。単純に好みですね  

