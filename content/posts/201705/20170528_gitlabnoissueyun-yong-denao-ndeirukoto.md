---
layout: post
title: "GitLabのIssue運用で悩んでいること"
date: "2017-05-28 15:00:00 +0900"
categories: 
  - blog
---
## 本文書の目的

完全にポエムです。悩みを書き連ねただけです。  

GitLabでもGitHubでも同じことになるのではないかと思います。  

この文書に有用な情報は含まれません。  

## 前提条件

* SIer
* テスト担当者が存在する
* 顧客とGitLabを共有できない（ので別の不具合管理表Excelがある）

### お約束事項

プルリクエスト（以下PR。GitLabではマージリクエストだが通りが良いのでPRと呼ぶ）  

## 運用

基本的な運用フローとして、  

バグ発生→Issue作成→担当者修正→テスト担当者テスト→リリース  

ソースコードの修正フローは  

開発者ブランチ→PR→developmentにマージ→社内検証環境[develop]→客先環境[master]  


というフローで開発しているが、Issueの運用がイマイチうまく行っていない気がする。  

と言うことでつらい所を列挙する。  

＃ただ、元々使っていたRedmineの時に比べれば色々とよくなっているとは思っている。  

＃なのでGitlabがダメっていう話では全然ないです。  

### チケットのClose＝テスト完了問題

テスト担当者にテスト依頼をした時点で、開発者的にはテストが完了して、さらに  

PRもマージ済み。なので、次回リリース時の更新に変更が含まれてしまうが、それまでに  

テスト担当者のテストが間に合わないと、開発者のテストだけで客先にリリースされて  

しまう。（しまった）。かといって、PRをマージしないと社内の検証環境にも反映できないし、  

社内検証環境→客先環境のリリースに関門を作るのは負荷的に不可だし…  

わざわざ、テスト通ってないIssueのPRを客先リリース前にrevertするのもちょっと…  


GitLab CI の動画を見ると、PRを自動的にステージング環境にデプロイしてテストすればOK  

PRの画面からデプロイするブランチも変えられるよ！みたいな図になっているけれども、  

テスト担当者がブランチの内容までちゃんと理解してないとダメか・・・みたいな状態になっている。  

### 課題管理表との整合性がとれない

顧客とのやりとり用Excelの内容がGitLabに自動反映されない。  

マージ後にわざわざXLSシートに色々書き込みするとか面倒。何より、Excelシートじゃ  

やりとりが全然残らない、検索つらい。なのでGitLabで出来るだけやりたいが、同期がつらい。  

課題管理表の新しいIssueをGitLabに転記する作業が割と面倒。  

これは解決策が簡単で、顧客にもGitLab使って貰えばいいと分かっているけれども、  

担当者に説明するのはしんどいUIしてる（なにせ英語。英語の壁は意外と高い）  

### Markdownがつらい

GitHubフレーバーのMarkdownはつらくないが、GitLabのMarkdownは純粋なMarkdownなので  

文章中の改行がそのまま反映されない。文末にスペース2個入れて改行か、brタグ書くか  

改行を2個連打するかのどれかをする必要がある。これがつらい。本当につらい。  

元々はGitHubフレーバーだったのになぜ改悪したのか、これがわからない。  

というより、Markdownの仕様としてなぜこんな（2スペース）仕様にしたのか理解できない。  

### Issueの粒度が揃わない

例えば、同一仕様の画面が3個あったとして、（悪い事だけれど）内容はコピペだったとする。  

ある人は、画面一個= 1 Issue として3個のIssueを切った。  

またある人はIssue本文にチェックボックスを入れて、1 Issueとした。  

個人的にはチェックボックスのが好きだけれども、どっちかに揃えたい。これはプロジェクト  

開始時にちゃんと話をすれば良かった。という話ではあるけれども。  

### タグの管理がつらい その１　タグ管理

標準で、GitHubと同じタグが作成されるが、タグの説明がプロジェクトごとなので標準化しにくい。  

英語のタグだと分かりづらいので日本語化したタグを全プロジェクトに配りたいが、それは今の所  

できない。仕方ないので、手で入れているが、なんだかなぁ。  

＃標準のタグのセットみたいなのを定義できるが、既存プロジェクトには反映されない。新規なら反映される？  

### タグの管理がつらい その２　ワークフロー

ワークフローにあわせてタグを付け外しして欲しいが、周知されておらずタグが適当になっている。  

<table>
<thead>
<tr>
<th>ステージ
<th>期待するタグ操作


<tbody>
<tr>
<td>Issue作成
<td>bugとか分類タグを付ける

<tr>
<td>担当者修正
<td>QAタグ付ける

<tr>
<td>テスト担当者テスト
<td>Issueクローズ


