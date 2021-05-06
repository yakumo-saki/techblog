---
layout: post
title: "Typescriptの覚え書き"
date: "2017-05-14 15:00:00 +0900"
categories: 
  - blog
---
## 先にお詫び

自分用のメモなので大分荒い部分があります。ごめんなさい。  

そしてかなりあやふやです。間違い見つけたら是非教えて下さい。  

## 外部モジュールか、内部モジュールか
### 内部モジュール

module MyModule {} 形式。別のファイルに分ける必要はない。コンパイル結果を1ファイルに  

まとめて出力するときに使う。  

tsconfig等で outFile: を指定する場合こちらを使うぽい。 ※実験してません。  


import文を書くと自動的に外部モジュール扱いになる模様。  

### 外部モジュール

1ファイル＝1モジュール。コンパイル結果は、 .ts1ファイルに付き .js 1ファイル。  

使用する際は、 import mymodule = require('./MyModule'); みたいな感じで使う。  

モジュールのファイル名がモジュール名として扱われる。  

```
<code class="language-ts:MyClass.ts">export class MyClass {
  test:string
}
````

```
<code class="language-ts:app.ts">import MyClass = require('./MyClass'); // ./入れないとダメ

var test = new MyClass.MyClass();  // 名前がイマイチ
````

#### 外部モジュールの際、モジュール名の名前空間を切って欲しくない場合の記述
```
<code class="language-ts:MyClass.ts">class MyClass {  // export class　にしない
  test:string
}
export = MyClass; // exportに入れた部分だけexportされる
                  // exportできるのは1つだけ
````

```
<code class="language-ts:app.ts">import MyClass = require('./MyClass'); // ./入れないとダメ
var test = new MyClass();  // すっきり!
````

# その他覚え書き
## 所感

基本的には外部モジュールを使っておけば良いんじゃないかなというのが今の所の感想です。  

Web向けだとロード時間の問題とかがあるのでそう単純ではなさそうですが。  

Electronであればレンダラプロセスでも標準で require 使えますし、そうでなければ  

require.js を入れれば良いのではないかなと。  

## gulp

開発にはgulpとか使うと思うのですが、Typescriptのコンパイルはgulpプラグインに  

任せない方が幸せになれました。具体的には gulp-shell を使って、  

tsconfig -u で tsconfig.json の中の filesGlob に書いたディレクトリ内の  

ファイル一覧で files を更新して貰って、tsc -p ./path/to/tsconfig/ で  

コンパイルさせるとIDEと設定の整合性が取れて良い感じです。  

こうすると、 /// reference　タグを書かずに型が参照できて見た目がスッキリします。  

```
<code class="language-json:tsconfig.json">{
    "compileOnSave": true,
    "compilerOptions": {
        "target": "es5",
        "module": "commonjs",
        "noImplicitAny": false,
        "removeComments": true,
        "preserveConstEnums": true,
        "outDir": "../../app/"
    },
    "filesGlob": [
        "*/**/*.ts",
        "**/*.tsx",
        "**/*.ts"
    ],
    "files": [ 略 ]
}
````

## sourceMap

tsconfig.json で sourceMap: true と指定すると、 .mapファイルが生成されるようになり、  

ブラウザの開発者ツールでソースを見た時、Typescriptがそのまま表示されるようになる。  

確認した限りでは、ソースのPathは相対パスなので、ユーザー名が漏れるような事故は起きなそう。  

## function

Typescriptで function () { } と書くと割と不幸になりがち。  

通常はそれほど困ったことにはなりませんが、class内でcallbackを指定するときは、  

() => {} で書いておかないと、thisがあらぬ所を差してしまい困ったことになります。  

ハマった例を以下にメモしておきます。これ、コンパイル後の出力を見るとすぐにわかるのですが、  

() => { } で書くと、自動的に this を _this に保存して、関数内の this を _this に  

自動的に置換してくれています。  

```
<code class="language-ts:sample.ts">class MyClass {

  private instanceVariable = 'ABC';

  method1() {
    needCallbackMethod(this.callback1); // callback1の書き方によってはNG

    needCallbackMethod( () => { this.callback1() }); // OK

    needCallbackMethod(function() {
      console.log(this.instanceVariable); // NG! this -> Global 
    }

    needCallbackMethod(() => {
      console.log(this.instanceVariable); // OK! 
    }

  }

  callback1() {
    console.log(this.instanceVariable);  // NG! this -> Global
  }

  callback1 = () => {
    console.log(this.instanceVariable);  // OK!
  }

}
````

# 参考にしたURL

これさえやれば大丈夫! TypeScriptのImportが取っ付きにくい人向け  

<a href="http://qiita.com/armorik83/items/d93fb9c80c489f0fabcf">http://qiita.com/armorik83/items/d93fb9c80c489f0fabcf  

本文とコメント欄、どちらも参考になります。  


TypeScriptで複数ファイル構成する2つの方法 - teppeis blog  

<a href="http://teppeis.hatenablog.com/entry/2014/05/typescript-external-modules">http://teppeis.hatenablog.com/entry/2014/05/typescript-external-modules  

export = ; はこちらに書いてありました。  

