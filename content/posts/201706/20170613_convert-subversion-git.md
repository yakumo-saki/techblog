---
layout: post
title: "Subversionからgitに引越してみた"
date: "2017-06-13 15:00:00 +0900"
categories: 
  - blog
---
# 前書き
## 残念なお話

Subversionの複数のリポジトリを一気に移行する手段はありません。  

一個ずつ地道にやるしかありません。  

## 前提条件

* Subversionのサーバーにアクセス可能、またはダンプが取得可能なこと。
* 作業用PCにgitがインストールされていること
* 作業用PCにSubversionがインストールされていること

## 動作確認環境

* Subversionサーバー CentOS 5 Subversion 1.8
* 作業用PC macOS Sierra Subversion 1.9.4  git 2.11.0

# Subversionサーバー上での作業

svnadmin dump を使ってダンプを取得する。  

```
<code class="language-shell-session:Subversionダンプ取得">svnadmin dump /opt/svn/reponame/ > svndump.dump
````


このダンプファイルは後で使いますので、作業するPCに持ってくる必要があります。  

サーバー上でやるならそのままでOKです。  

# 作業PC上での作業
## Subversionリポジトリの準備

gitに変換する対象だけが含まれたSubversionリポジトリを作業用PC上に準備します。  

### 履歴のクリーニング

ゴミファイルがコミットされた履歴があったので、削除します。  

※最新版からは消されていても、履歴に含まれているとgit clone に時間がかかる原因になります。  


ここの手順はオプションです。の時点ではまだSubversionのダンプファイルに対しての作業です。  

gitは一切関係ありません。  

```
<code class="language-shell-session:ダンプファイルから不要なファイルを削除する">svndumpfilter exclude /document/ /sql/ /trunk/ruby/vendor/bundle/ /trunk/ruby/tmp/ < svndump.dump > svndump-clean.dump

excludeの後には、履歴からも削除するファイル (or ディレクトリ名)を列挙します。数に制限はありません。
````

### ダンプファイルのロード

作業用PC内に、Subversionのリポジトリを作り、ダンプファイルをロードします。  

※ 履歴のクリーニングを行ったのであれば、クリーニング済みのダンプファイルを使用します。  

```
<code class="language-shell-session"># subversionリポジトリ作成
svnadmin create svnruby

# ダンプファイルのロード
svnadmin load svnruby/ < svndump-clean.dump 
````

### ローカルにSubversionサーバーを立てる

svn => git 変換時に file:// は使用できないので、サーバーをローカルに立ち上げる。  

```
<code class="language-shell-session:SVNサーバーの起動">svnserve -d -R --foreground --root svnruby/

# ターミナルが占拠されるので、以降の作業は別ウィンドウで行う
````

## gitリポジトリへの変換

いよいよ、変換していきます。  

### Subversionアカウント名->gitメールアドレスの読み替えファイルを作る

Subversionのコミット者は、アカウント名が記録されますが、gitでは、 名前 <メールアドレス> なので  

対応表が必要です。ここでは、 svnauthors という名前で以下のような内容のファイルを作りました。  

※私の場合は redmineと連携していたので、redmineのユーザー一覧から簡単に作る事ができました。  

このファイルは履歴に対する変換表なので、現在いないユーザーでも履歴に含まれるのであれば設定が  

必要です。（適当な人に振っても良いと思いますが）  

```
<code class="language-ini:svnauthors">svnuser1 = Subversion user 1 <svnuser1@example.jp>
svnuser2 = Subversion user 2 <svnuser2@example.jp>
````

### gitリポジトリ生成

とりあえず、gitリポジトリの生成だけします。  

```
<code class="language-shell-session">git svn init -s --prefix=svn/ svn://localhost/ gitruby/
````

### Subversion -> git

Subversionリポジトリ内容をgitに変換（取込）します。  

```
<code class="language-shell-session">cd gitruby
git svn fetch -A ../svnauthors
````


変換というか取込はSubversionのリポジトリから1コミットずつ取得して、その内容をそのままgitにコミットしていくイメージです。  

コミット数・規模に応じて時間がかかります。  

### gitのupstreamにpush

サーバーにpushというと怒られそうなのですが、まぁサーバーに送ります。  

実行前に、git branches でブランチを確認したり、中身がまともかどうかを確認したりした方が良いでしょう。  

よさそうであれば、以下で push できます。よさそうでなかった場合は蛇足を読んで頂ければ。  

```
<code class="language-shell-session">git remote add origin http://gitserver.example.jp/gitlab/TEST/test.git
git push
````

# 完了後の確認

githubなりなんなりで確認して下さい。  

お疲れ様でした。  

# 参考にしたページ

git-svnでSVN→Gitへの移行をやってみたログ  

<a href="http://qiita.com/hidekuro/items/4727715fbda8f10b6b11">http://qiita.com/hidekuro/items/4727715fbda8f10b6b11  


SubversionからGitへ移行してみた  

<a href="http://qiita.com/EichiSanden/items/326bdac596485baa6086">http://qiita.com/EichiSanden/items/326bdac596485baa6086  


仕事で使ってる巨大SVNレポジトリをGithubに移管するためにやったことまとめ  DQNEO起業日記   <a href="http://dqn.sakusakutto.jp/2012/10/svn-git-github-migration.html">http://dqn.sakusakutto.jp/2012/10/svn-git-github-migration.html  

# 蛇足

普通ならこれでOKですが、変換したSVNリポジトリは /trunk/ が空で、/branches/ruby に最新ソースが入るという  

ちょっと意味不明な構成になっていました。本来であれば、 git svn init 直後に、 .git/config ファイルを修正  

することで、適切に取込ができるのですが、幸い branches は git のブランチとして取り込まれるのでそのまま取込を  

実行して、後で直すという作業をしています。以下はその作業ログです。  

さらに言うと、この取込をpushする作業も何度もやっており、今までの履歴を全部消し飛ばしてやり直しというシチュエーションです。  

※ gitサーバー側はgitlabを使っており、 master ブランチを unprotect 済み、  

※ 使用するgitアカウントはプロジェクト管理者権限をもっています。  

```
<code class="language-shell-session">$ git branches
remotes/svn/ruby

$ git checkout remotes/svn/ruby
Note: checking out 'remotes/svn/ruby'.

You are in 'detached HEAD' state.（略)

$ git checkout -b master
Switched to a new branch 'master'

$ ls -l
（ファイルが存在するか確認)

$ git remote add origin http://gitserver.example.jp/gitlab/TEST/test.git

$ git push -f

$ git push -f origin master
（ユーザー名パスワード聞かれる）
（中略）
 + adff8c3...eafd1ace master -> master (forced update)
````


作業終了後は、gitlab上で･･･  


* developブランチを作る
* protect branch (master &amp; develop)
* デフォルトブランチを develop にする  

作業完了です。（この辺、開発ルールによるのでご参考程度）

