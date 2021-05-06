---
layout: post
title: "TypeScriptをコンパイルしてwebpackで一つにまとめる"
date: "2019-12-30 05:38:00 +0900"
categories: 
  - blog
---
# 手順メモ
## 前提
<table>
<thead>
<tr>
<th>ディレクトリ名
<th>用途


<tbody>
<tr>
<td>./src
<td>ソースディレクトリ

<tr>
<td>./build
<td>ts -> js にトランスパイルされたものを仮置きするディレクトリ

<tr>
<td>./public/lib/
<td>実際にブラウザが読み込むjsを置くディレクトリ



## 必要なものをインストール

* npm i typescript -g
* npm i webpack -g
* npm i webpack-cli -g

## typescript→javascript準備
### tsconfig.json編集
```
`{
  "compilerOptions": {
	  "experimentalDecorators": true,
    "module": "commonjs",
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "outDir": "./build/",         ※ ここだけ直す
    "sourceMap": true,
    "strict": true,
    "target": "es2017"
  },
  "compileOnSave": true,
  "include": [
	"src",
  ]
}
````

### テスト

srcに適当に index.ts のようなファイルを置いて、 `tsc` を実行する。  

./build/index.js が出来ていればOK。複数ファイル置いても全部トランスパイルされることを  

確認する。  

## javascriptを1ファイルにパックする
### webpack.config.js 編集
```
`// output.pathに絶対パスを指定する必要があるため、pathモジュールを読み込んでおく
const path = require('path');

module.exports = {
  // development or production。
  mode: 'development',
  resolve: {
    alias: {
      // vue はフルコンパイラー入りが必要
      'vue$': 'vue/dist/vue.esm.js' // 'vue/dist/vue.common.js' for webpack 1
    }
  },
  // エントリーポイントの設定
  entry: './build/index.js',
  // 出力の設定
  output: {
    // 出力するファイル名
    filename: 'index.js',
    // 出力先のパス
    path: path.join(__dirname, './public/lib')
  }
};
````

### テスト

`webpack` を実行すると ./public/lib/index.js が出力されることを確認する。  

## 蛇足

一番書きたかったのはここ  

### 変更したらいちいち手動でコンパイルするの？

少しの間手動でやっていたのですが面倒過ぎます。  

なのでどうにかしようと思います。…ファイルの変更を監視するオプションは tsc にはありません。  

webpackにはあります。と言うことは、 typescriptのトランスパイルもwebpackにやって貰う必要があります。  

#### webpack用 ts-loaderをインストール

* `npm i ts-loader --save-dev`
* `npm i typescript --save-dev`

#### webpackでtypescriptをトランスパイルする設定

webpack.config.jsに以下を加えます。蛇足ですが、カンマ等にはお気を付け下さい。  

```
<code class="language-js">// 追加
  resolve: {  
    extensions: ['.ts', '.js'],
  },

// 追加
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {loader: 'ts-loader'}
        ]
      }
    ]
  }

// 変更。tscによりトランスパイルされたjsではなく、tsを直接見る
  //entry: './build/main/main.js',
  entry: './main/main.ts',

````

#### webpackによるトランスパイルテスト

`webpack` で、トランスパイルまで行われることを確認する。  

tsc + webpack と出力は変わらない。  

#### ソース変更を監視させる

`webpack --watch`  

これでソースの変更を監視して自動でトランスパイル等をやってくれるようになる。  

### vue cli で作ったプロジェクトをwebpackでやろうとしたらコケた

* `@Prop() private msg!: string;`
* TS6133: 'msg' is declared but its value is never read.


privateではなく、protectedにすればよい。  

