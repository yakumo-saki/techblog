---
layout: post
title: "MavenリポジトリにないJARをよしなに扱いたい"
date: "2017-05-18 15:00:00 +0900"
categories: 
  - blog
---
## 前提条件

Apache Maven 3.3.3  

## どんなときに嬉しいの？

ojdbc7.jar （Oracle JDBCドライバ) ってMavenのリポジトリにないけど、それをよしなに  

扱う事ができます。しかもあんまり面倒ではない方法で  

## 何をするか

ローカルにMavenリポジトリ（といってもただのディレクトリとファイル）を作ってそこをpom.xmlから指定します。  

後は普通にdependencyで指定するだけ。  

## どんなコマンド打てばいいの？

プロジェクトのルートディレクトリにいる前提で以下のような感じのコマンドを打つ。見た目の為に改行してますが、実際は1行で打って下さい。  

当然ですが、jar一個に対して一回コマンドを実行する必要があります。  

jarのバージョンアップがあったら、バージョンを変えてもう一回コマンド実行すればよさそうです。  

```
<code class="language-shell-session">mvn org.apache.maven.plugins:maven-install-plugin:2.5.2:install-file 
-Dfile=./lib/ojdbc7.jar
-DgroupId=com.oracle
-DartifactId=ojdbc7
-Dversion=1.0
-Dpackaging=jar
-DlocalRepositoryPath=./m2repo
````


上から解説します。  

1行目。実行してるだけなのでそのままでOK  

2行目。リポジトリに入れたいjarのパス  

3行目。グループID。好きに入れれば良いが、 pom.xmlのdependencyでも同じ値を指定する必要あり。  

4行目。アーティファクトID。好きにして良いが以下同文  

5行目。バージョン。好きにして良いが以下同文  

6行目。このままでOK  

7行目。ローカルリポジトリのパス。このパスをそのままバージョン管理に入れてしまえばいい。  


※この例では、プロジェクトルート/lib/ojdbc7.jar をローカルリポジトリに格納しようとしているが、  

※格納後は lib/ojdbc7.jar ローカルリポジトリから参照されるので不要。  

※./m2repo//ojdbc7.jarが使われるようになる。  

## pom.xmlへのローカルリポジトリ追加
```
<code class="language-xml">    <dependencies>
        <!-- ここの記述は追加時の記述に合わせる -->
        <dependency>
            <groupId>com.oracle</groupId>
            <artifactId>ojdbc7</artifactId>
            <version>1.0</version>
        </dependency>
    </dependencies>
    <repositories>
        <repository>
            <snapshots>
                <enabled>false</enabled>
            </snapshots>
            <id>localrepo</id>
            <name>localrepo</name>
            <!-- ここの記述はリポジトリのパスに合わせる -->
            <url>file://${basedir}/m2repo</url>
        </repository>
    </repositories>
````

## まとめ

これだけの事を調べるのに1時間くらい費やしてしまった。  

この方法を使えば、最初の人だけが苦労するだけで後の人は何も考えずに開発できるのでオススメです。  

でも、OracleさんがjdbcドライバをMaven Centralに公開してくれればもっと楽なんですが…  

