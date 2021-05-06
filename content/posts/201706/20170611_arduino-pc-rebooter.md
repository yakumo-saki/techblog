---
layout: post
title: "Raspberry Piで遠隔リブート装置を作ってみた (Arduino)"
date: "2017-06-11 15:00:00 +0900"
categories: 
  - blog
---
## 前提

リレーのハードウェアは  

<a href="http://qiita.com/yakumo/items/ecf7686fc4eada4177f7">http://qiita.com/yakumo/items/ecf7686fc4eada4177f7  


これで作ったものを流用しています。実際は、多少バージョンが上がっていますが、基本同じものです。  

ハードウェア的なバージョンアップ点は以下  


1 入れ物の上にヘッダピンを3連*2で付けて（ホットボンドでネチョ固定）PCケース側の電源ボタンも使用可能に  

2 リレーの片側しか使っていなかったのを両側使うように変更 (適当なGPIOピンを IN2 に繋いだだけ）  


1をやるのに半田ごてをにぎりましたが、ピンを一本接触させた状態でネチョ固定すれば半田付け不要だと  

思われます。というか何でもいいから3本の間で電気が通ればOK  

## 動機

Raspberry Pi をPCのケースに入れるとものすごく邪魔。もう少し小さくならないものか･･･  

あと消費電力的にも結構大きいし、これはちょっと。という事でArduino(ESPr Developer)にしました。  

## 材料

ESPr Developer（ピンソケット実装済） - スイッチサイエンス - <a href="https://www.switch-science.com/catalog/2652/">https://www.switch-science.com/catalog/2652/  2580  


ジャンパワイヤ（前回と同じ）  

## ピン接続

* VOUT -> リレーモジュールのVCC
* 3V3 -> リレーモジュールのJD-VCC(JD-VCCの隣の方)
* GND -> リレーモジュールのGND(IN1の隣の方)
* IO4 -> リレーモジュールのIN1
* IO5 -> リレーモジュールのIN2

## スケッチ

以下の雰囲気で。実際は、AdvancedWebServerのサンプルを改造して、Web APIで  

電源ON/OFFが出来るようにしました。  

```
<code class="language-c">#define RELAY_PIN 4

void setup() {
  Serial.begin(115200);
  Serial.println("setup done");
}

void loop() {
    Serial.println("Switch ON");
    pinMode(RELAY_PIN, OUTPUT); // これだけでリレーが作動する
    delay(3000)
    pinMode(RELAY_PIN, INPUT); // これで元に戻る
}
````

# 実際に使っている構成
## 追加した部品

* 5mm 赤色LED <a href="http://akizukidenshi.com/catalog/g/gI-04111/">http://akizukidenshi.com/catalog/g/gI-04111/
* 電子ブザー <a href="http://akizukidenshi.com/catalog/g/gP-04497/">http://akizukidenshi.com/catalog/g/gP-04497/
* ＬＥＤ光拡散キャップ（５ｍｍ）　白　（オプション） <a href="http://akizukidenshi.com/catalog/g/gI-01120/">http://akizukidenshi.com/catalog/g/gI-01120/


ちなみに、電子ブザーはめちゃくちゃうるさいので圧電ブザーのが良いと思います。安いですし。  

あと、秋月電子の店舗に行く場合は、Webショップの画面の左下にある店舗情報というリンクに、実際モノがどこに置いてあるか細かく書いてあるのでそれをメモってから行くことをオススメします。  

店員さんに聞けば場所教えてくれますが、店員さんも同じ画面を見るという。（型番指定時）  

## 部品の接続

* ESPr DeveloperのI15とGNDに電子ブザーを接続（ピンソケットに直接差しています）
* ESPr DeveloperのI16とGNDに5mm LEDを接続（ピンソケットに直接差しています）

## スケッチ

なんか長い感じですが、AdvancedWebServerのスケッチの小改造でしかありません。  

ssid , password , mDNSのホスト名は、ご自分のものに書き換えて下さい。  

mDNSを有効にしているので、この例だと、<a href="http://esp8266.local/ping">http://esp8266.local/ping のような形でアクセスできます。  

※ macOSの場合は標準でOK。Linux、Windowsの場合は要設定。(Windows10なら標準？）  


というか、文字列定数ってどうやったら定義できるんでしょう？調べたけれどもよくわかりませんでした。  

```
<code class="language-c">#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266WebServer.h>
#include <ESP8266mDNS.h>

const char *ssid = "WIFI-SSID";
const char *password = "WIFI-PSK";

ESP8266WebServer server ( 80 );

#define LED_PIN 16
#define POWER_PIN 4
#define RESET_PIN 5
#define BUZZER_PIN 15

#define LONG 5000
#define SHORT 1000

bool powerSwitch = false;
bool resetSwitch = false;

void setup ( void ) {
  pinMode ( LED_PIN, OUTPUT );
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);

  digitalWrite ( LED_PIN, HIGH );
  digitalWrite ( BUZZER_PIN, LOW );

  Serial.begin ( 115200 );
  WiFi.begin ( ssid, password );
  Serial.println ( "" );

  Serial.println ( "WiFi initializing" );

  int connection_count = 0;
  // Wait for connection
  while ( WiFi.status() != WL_CONNECTED ) {
    if (connection_count > (10 * 2) ) {
      digitalWrite ( BUZZER_PIN, HIGH );
      connection_count--;
    }
    delay ( 500 );
    
    Serial.print ( "." );
    
    connection_count++;

    if (connection_count > (10 * 2) ) {
      digitalWrite ( BUZZER_PIN, LOW );
      delay ( 500 );
      Serial.print ( "." );
    }
  }

  Serial.println ( "" );
  Serial.print ( "Connected to " );
  Serial.println ( ssid );
  Serial.print ( "IP address: " );
  Serial.println ( WiFi.localIP() );

  if ( MDNS.begin ( "esp8266" ) ) {
    Serial.println ( "MDNS responder started" );
  }

  server.on ( "/ping", handlePing );
  server.on ( "/power", handlePower );
  server.on ( "/reset", handleReset );
  server.onNotFound ( handleNotFound );
  server.begin();
  Serial.println ( "HTTP server started" );

  // 接続OK音
  digitalWrite ( LED_PIN, LOW );
  digitalWrite ( BUZZER_PIN, HIGH );
  delay ( 1500 );
  digitalWrite ( BUZZER_PIN, LOW );

  Serial.println ( "setup complete!" );
  
}

void loop ( void ) {
  server.handleClient();
}

void handleNotFound() {
  digitalWrite ( LED_PIN, HIGH );
  String message = "File Not Found\n\n";
  message += "URI: ";
  message += server.uri();
  message += "\nMethod: ";
  message += ( server.method() == HTTP_GET ) ? "GET" : "POST";
  message += "\nArguments: ";
  message += server.args();
  message += "\n";

  for ( uint8_t i = 0; i < server.args(); i++ ) {
    message += " " + server.argName ( i ) + ": " + server.arg ( i ) + "\n";
  }

  server.send ( 404, "text/plain", message );
  digitalWrite ( LED_PIN, LOW );
}

void handlePing() {
	digitalWrite ( LED_PIN, HIGH );
  // digitalWrite(BUZZER_PIN, HIGH);

	char temp[400];
	int sec = millis() / 1000;
	int min = sec / 60;
	int hr = min / 60;

	snprintf ( temp, 400,
    "{ \"uptime\": \"%02d:%02d:%02d\", \"uptimeMills\": \"%02d\" }\n"
    , hr, min % 60, sec % 60, millis()
	);
	server.send ( 200, "text/html", temp );
	digitalWrite ( LED_PIN, LOW );
  // digitalWrite(BUZZER_PIN, LOW );
}

void handlePower() {
  if (server.arg("type") == "long") {
    doSwitch(LONG, POWER_PIN);    
    sendJson("POWER", "long");
  } else {
    doSwitch(SHORT, POWER_PIN);    
    sendJson("POWER", "short");
  }
}

void handleReset() {
  doSwitch(SHORT, RESET_PIN);
  sendJson("RESET", "short");
}

void sendJson(String target, String duration) {
  String json = "";
  json += "{ ""result"": ""ok"", ""target"": """ + target + """, ""duration"": """ + duration + """}\n";
  server.send ( 200, "application/json", json );  
}

void doSwitch(int duration, int pin) {
  onoff(true, pin);
  delay(duration);
  onoff(false, pin);
  delay(100); // 一応リレーの切替速度 の問題で待っている。そんな連打はしないけれども
}

void onoff(bool onoff, int pin) {
  if (onoff == true) {
    Serial.println("Switch ON");
    pinMode(pin, OUTPUT);
    digitalWrite(BUZZER_PIN, HIGH);
    digitalWrite(LED_PIN, HIGH);  
  } else {
    Serial.println("Switch OFF");
    pinMode(pin, INPUT);
    digitalWrite(BUZZER_PIN, LOW);
    digitalWrite(LED_PIN, LOW);      
  }
}
````

## 実際の利用方

VPNでLANに入って、あとは前回のWebアプリを使用して制御を行っています。  

今回のスケッチのAPIも、Raspberry Piから直接制御していた時と互換にしてあるので、  

URL変更だけで簡単に切替ができました。 消費電力も低いようなので満足です。  


実際は、PCケースに入れて見たらWiFiの電波がつかめなかったり、Zabbixの設定に苦労したりと  

色々とあったのですが･･･　今の所ちゃんと動いてます。  

