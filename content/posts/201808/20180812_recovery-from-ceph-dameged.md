---
layout: post
title: "Cephのデータに破損が見つかったメモ"
date: "2018-08-12 15:00:00 +0900"
categories: 
  - blog
---
## 

* Ubuntu 18.04
* Ceph mimic

## きっかけ

Cephのコンソールをみたら、以下のような表示が。  

実は一台OSDのシャットダウンが長いので、強制終了してしまったんですよね･･･  

```
`Overall status: HEALTH_ERR
OSD_SCRUB_ERRORS: 1 scrub errors
PG_DAMAGED: Possible data damage: 1 pg inconsistent
````

## 修復メモ

まず、今の状態は？とドキュメントを見てみると･･･  

<a href="http://docs.ceph.com/docs/mimic/rados/operations/health-checks/#pg-degraded">http://docs.ceph.com/docs/mimic/rados/operations/health-checks/#pg-degraded  


修復は↓を見ろ。ということなので飛んでみると  

<a href="http://docs.ceph.com/docs/mimic/rados/operations/pg-repair/">http://docs.ceph.com/docs/mimic/rados/operations/pg-repair/  

＼からっぽ／  

## 修復ログ

仕方ないので、ググりながら修復の指示を出してみます。  

### 状態を確認
```
`root@cephadmin:~# ceph health detail
HEALTH_ERR 1 scrub errors; Possible data damage: 1 pg inconsistent
OSD_SCRUB_ERRORS 1 scrub errors
PG_DAMAGED Possible data damage: 1 pg inconsistent
    pg 6.6 is active+clean+inconsistent, acting [2,3,4]
````


pg 6.6 （バージョンとかではなく、pgの6.6 というIDみたいです）がなんか不完全みたいな感じです。  

### 修復指示
```
`root@cephadmin:~# ceph pg repair 6.6
instructing pg 6.6 on osd.2 to repair
````


これだけです。 `ceph pg repair <pgid>` だそうなので、さきほど調べたpgidを入れました。  

しばらく待つと、Webのダッシュボードに以下のようなログが流れ、修復されました。  

```
`2018-08-13 12:37:13.549087 [INF]  Cluster is now healthy
2018-08-13 12:37:13.549072 [INF]  Health check cleared: PG_DAMAGED (was: Possible data damage: 1 pg inconsistent, 1 pg repair)
2018-08-13 12:37:13.549018 [INF]  Health check cleared: OSD_SCRUB_ERRORS (was: 1 scrub errors)
2018-08-13 12:35:43.367989 [ERR]  Health check update: Possible data damage: 1 pg inconsistent, 1 pg repair (PG_DAMAGED)
2018-08-13 12:20:57.095121 [INF]  Health check cleared: PG_DEGRADED (was: Degraded data redundancy: 15474/372066 objects degraded (4.159%), 10 pgs degraded, 13 pgs undersized)
2018-08-13 12:20:53.583490 [WRN]  Health check update: Degraded data redundancy: 77598/372066 objects degraded (20.856%), 24 pgs degraded, 30 pgs undersized (PG_DEGRADED) 
````

