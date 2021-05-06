---
layout: post
title: "SpringBoot(1.2くらい)を使っていてハマった事"
date: "2016-02-27 15:00:00 +0900"
categories: 
  - blog
---
## はじめに

Spring Boot 1.2.5 を使いはじめてハマった事をメモします。  

既にご存じかとは思いますが、以下のQiitaがとても良くまとまっているので  

ご紹介します。  

＃1.2.8でも同じようにハマれるのを確認しています  


SpringBoot(with Thymeleaf)チートシート[随時更新]  

<a href="http://qiita.com/uzresk/items/31a4585f7828c4a9334f">http://qiita.com/uzresk/items/31a4585f7828c4a9334f  

## Whitelabel Error Pageを置き換えたい

エラーメッセージだけを読むと、適当なコントローラーをつくって  

/error のリクエストマッピングを作成すればよさそうに思えるが、  

実際やってみると、マッピングが重複している的なエラーで起動すらできなくなる。  

正解は、 /error をマッピングするControllerは ErrorController を  

継承しなければならない。  

こんな感じ。このコントローラーにエラーじゃないマッピングを含むことはOK。  

当然だが、コンポーネントスキャンの範囲内に作らないとダメ。  

```
<code class="language-java">@Controller
public class ErrController implements ErrorController {

    private static final String PATH = "/error";

    @RequestMapping("/404")
    String notFoundError() {
        return "error/404"; // templates/error/404.html
    } 

	@RequestMapping(PATH)
	String home() {
		return "error/general";
	}

	@Override
	public String getErrorPath() {
		return PATH;
	}

}
````

### 実は

/template/error.html を作れば自動的にそれが使用される。  

※ 少なくとも Springboot 1.3.5 で確認  


2017/01/27 追記  

コメントでご指摘頂きましたが、 error.html　を作成するとエラーページが置き換わるのは、Thymeleafを  

使用している時のみとのこと。 @syukai さんご指摘ありがとうございました。  

## 独自のFormatterを追加したい

Formatterを作って、そのクラスに @Component を付けるだけ。  

@ComponentScan範囲にいれば、自動的に登録される。  

ググると FormattingConversionServiceFactoryBean 使って登録みたいな  

事が書いてあるが、Springbootでは自動登録される。  

＃逆に、自動登録されては困るときは色々と考えないといけないんでしょう  

## Form Validationをしたいがフォーム View表示の為に必要なデータがある

これ、意外とどこにも無くてハマったのですが、Form Validationは普通に  

Springbootに付いてます。カスタムバリデーションも書けます。  

それは良いけれど、フォーム画面を表示するのにmodelに何かをセットしないと  

いけない場合の事は意外と書かれてません。これで正しいのかはわかりませんが、  

フォーム表示時のメソッドを普通のメソッドとして呼び出せば上手くいきます。  

親切なことに、フォームオブジェクト上のバリデーションに失敗した項目は  

nullが入っていますが、それを上書きして別の値を入れたとしても無視され、  

入力した（結果エラーとなった値）が画面に表示されます。  

```
<code class="language-java">// Controller
// フォーム表示
	@RequestMapping(value="", method = RequestMethod.GET)
    String showForm(@ModelAttribute TestForm form, Model model) {
       // フォームに初期値をセット
       form.setValue("default");
    
       model.addAttribute("dbdata", hoge.getData());
       return "testview";
    }

	@RequestMapping(value="", method = RequestMethod.POST)
    String formPost(@ModelAttribute TestForm form, BindingResult result,Model model) {

       if (result.hasErrors()) {
           // ここでmodel.addAttributeしないといけないが、
           // 処理としては普通に画面を表示するときと同じ場合なので同じことを書きたくない
           
           // 良さそうな例
           // 普通にメソッドとして呼べば良い
           return showForm(form, model);  
           
           // ダメだったパターン（リダイレクト）
           return "redirect:/testForm";   // 入力エラーの値が引き継がれない

           // ダメだったパターン２
           return "redirect:testview";   // modelの値が引き継がれない（当然）

       }

		（略）
       return "completeview";
    }

````

```
<code class="language-html"><form method="post" th:action="@{/test}" 
      th:object="${testForm}">
      
	<input type="text" name="value" class="form-control"
						      		 th:field="*{value}" />
	エラー表示は省略。
</form>

````

## ControllerAdviceで例外を拾って処理をしたらステータスコードが405

@ResponseBody の付け忘れ。これが付いてないとテンプレートを探しに行って  

しまっている模様。  

```
`o.s.web.servlet.PageNotFound : Request method 'POST' not supported
````


これ、 ＠ResponseStatus を平然と無視するのでかなり焦った。  

## RestControllerでAjaxでリクエストするAPIを作ったが実装部より前で例外

CSRFフィルタに引っかかってないかチェック。  

## Java 8 Date and Time をJSONにシリアライズするとき例外

jackson JSR-310を入れれば良い。  

pom.xmlに以下を追加  

```
<code class="language-xml">        <dependency>
			<groupId>com.fasterxml.jackson.datatype</groupId>
			<artifactId>jackson-datatype-jsr310</artifactId>
		</dependency>
````

## バリデーションエラー時、 input type="password" の項目の値が空になる

セキュリティ的にあえて復元しないようになっているのかもしれない。  

回避するには、とりあえず、 input type="text" としておいて、JSで切替。  

```
<code class="language-js">	$(document).ready(function () {
		$("#password").attr("type", "password");
	});
````

## formをバインディングする際の検証エラーで処理が中断される

BindingResultを書いたつもりなのに、そこまで処理が来ない。  

理由は簡単、BindingResultは @Valid なフォームの次に書かないと無効。  

```
<code class="language-java">// これはダメ
@RequestMapping
String hoge(@Valid TestForm form, Model model, BindingResult result) {}

// これはOK
@RequestMapping
String hoge(@Valid TestForm form, BindingResult result, Model model) {}
````

## デフォルトでは全てのBeanがシングルトン

Controllerも、Serviceもシングルトン。  

と言うことは、インスタンス変数に状態を保存すると他のリクエストの情報と混ざる可能性がある。  

Serviceに @Scope("prototype") を指定すれば良いかというとそうではない。  

prototypeは要求されたら新しいインスタンスを生成して返す。という動作だが、そもそも  

ControllerがSignletonなので、最初に生成されたインスタンスがずっと使われ続ける。  

基本的にはSingletonで動作しても問題ないように作るべき。  

※Singletonで動いても問題ない（＝スレッドセーフ）に作る為にはどうすれば良いのか？  

※ご参考：<a href="http://qiita.com/yoshi-naoyuki/items/507c5c3ea6027033f4bb">http://qiita.com/yoshi-naoyuki/items/507c5c3ea6027033f4bb  


HttpSession に関しては特段の配慮がされているので、フィールドに入れて@AutowiredしてもOK  

<a href="http://qiita.com/yakumo/items/294c23c6c3ae6c5b3fdf">http://qiita.com/yakumo/items/294c23c6c3ae6c5b3fdf  

## ファイルアップロードしようとしたらファイルが入ってこない

<a href="http://blog.okazuki.jp/entry/2015/07/17/202941">http://blog.okazuki.jp/entry/2015/07/17/202941  

上記URLのように正しく書いたつもりが、FormのMultiFileがnullになる。  

原因は簡単、 formタグに enctype="multipart/form-data" を書き忘れるとこうなる。  

ログを見ると、 StringからMultiFileにコンバートできなかった的なエラーが出ている。  

## Thymeleafで input type="hidden"に値をセットしようとしたら入らない

th:fieldを使うと、form内容とHTML上のフォームの値が紐付いてしまう。  

th:valueで値を入れたい場合は、th:fieldではなく、普通にname="name"で名前を合わせる。  

```
<code class="language-html"><!-- これはダメ -->
<input type="hidden" th:field="*{somefield}" th:value="${bean.value}" />

<!-- これはならOK -->
<input type="hidden" name="somefield" th:value="${bean.value}" />
````

## ビューを表示するたびにVelocityがエラーを吐く

hoge.vm が存在しません的なもの。Velocityのオートコンフィグをしないように  

しないといけないらしい。  

```
<code class="language-java">@SpringBootApplication
@EnableAutoConfiguration(exclude = { DataSourceAutoConfiguration.class,VelocityAutoConfiguration.class })
````

## logger出力をフォーマットしたい

logger.debugFormat("value of A is {0}",A); みたいなの。  

slf4jを使っているなら、次の通り。  

```
<code class="language-java">logger.debugFormat("value of A is {}",A);
````


<a href="http://www.slf4j.org/faq.html#logging_performance">http://www.slf4j.org/faq.html#logging_performance  

## application.ymlにゼロ埋めの数字を書くと8進数扱いされる

そのまんま。  

```
<code class="language-yaml">testVal: 0030
````


なんて書いたりすると、その値が8進数扱いされてしまう。文字列あたりにするのが良い。  

```
<code class="language-yaml">testVal: '0030'
````

## jarにパッケージングした時だけTemplateErrorが発生する

Thymeleafのテンプレートのパスを指定する際に、 / から始めるとそうなる。  

これは、 <em>th:include や <em>th:replace のパスについても同様。  


SpringBoot 1.5.x でも修正されていない。（今後も修正されない模様）  

<a href="https://github.com/spring-projects/spring-boot/issues/1744">https://github.com/spring-projects/spring-boot/issues/1744  


何がタチ悪いかというと、IDE上で動かしているときはファイルシステムからテンプレートを  

読むため、普通に動いてしまう。 jarにパッケージングした際に突如に動かなくなる。  

## devtoolsを使う(1.3.0以降)

pom.xmlに以下を追記  

詳しくは、 <a href="http://qiita.com/IsaoTakahashi/items/f99d5f761d1d4190860d">http://qiita.com/IsaoTakahashi/items/f99d5f761d1d4190860d  

```
<code class="language-xml">	    <dependency>
	        <groupId>org.springframework.boot</groupId>
	        <artifactId>spring-boot-devtools</artifactId>
	    </dependency>
````


ただし、LiveReload機能とSpring-Loadedを一緒に使っても、LiveReloadが動いてしまうので  

排他利用になりそう。個人的にはSpring-Loadedの方が好き。  

でも、他にも便利機能があるのでdev-toolsの方がよいかなとは思った。  

## Request method 'POST' not supported

@RequestMappingがちゃんとあるか確認するのが第一。  

ちゃんとあるのであれば、CSRFフィルタに引っかかっている可能性が大。  

## formをsubmitしたのにCSRFフィルタにひっかかった

th:actionがないと、CSRFトークンが埋め込まれない。Javascriptで動的に変えるにしても  

ダミーのURLを書いておく必要がある。  

```
<code class="language-html"><form th:object="${HogeForm}">これはダメパターン</form>

<form th:action="@{'/dummy'} th:object="${HogeForm}">
    こうすればOK。トークンが自動で埋め込まれる。
</form>
````

