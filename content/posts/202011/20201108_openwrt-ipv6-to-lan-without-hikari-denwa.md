---
layout: post
title: "OpenWRTでIPv6をLANに通す（ひかり電話なし）"
date: "2020-11-08 13:40:57 +0900"
categories: 
  - blog
---

ネット上に情報が割とあるような無いようななのでまとめておく。  

当方の環境では、普通 `WAN` 6であるIPv6 WAN インターフェイスが `ONU6` という名前になっている  

## 前提条件
### その1 IPv6がWAN6にネットワークを割り当てているか確認

Luci（Web画面）の Network->Interface 画面で、以下のようにIPv6-PDが表示されているか確認する。  

ひかり電話の契約がない場合、表示されていないはず。  


<img src="/images/2020/11/2020-11-08_22-23.png" alt="2020-11-08_22-23" loading="lazy">  


表示されていない場合は、Interfaces画面のEdit->Advanced Settingsの  

`Custom delegated IPv6-prefix` に割り当てられているIPアドレスの前半4区切り分 /64 を入力する  

例えば `aaaa:bbbb:cccc:dddd:eeee:ffff:gggg:hhhh` であれば、`aaaa:bbbb:cccc:dddd/64` である。  


<img src="/images/2020/11/2020-11-08_22-25.png" alt="2020-11-08_22-25" loading="lazy">  


保存して反映するなり、OpenWRTを再起動するとIPv6-PDが表示されるようになっているはず。  

### その2 LAN の RA, NDP(roxy), dhcpv6をrelayにする

IPv6を配布したいネットワークのInterfaces画面の  

Edit->DHCP Server内のIPv6 Settingsを以下のようにする。  

<table>
<thead>
<tr>
<th>項目
<th>設定値


<tbody>
<tr>
<td>Router Advertisement-Service
<td>relay

<tr>
<td>DHCPv6-Service
<td>relay

<tr>
<td>NDP-Proxy
<td>relay

<tr>
<td>master
<td>チェックなし



### その3 WAN6 の LAN の RA, NDP(roxy), dhcpv6をrelayにする

この設定はLuciからできないのでSSH等で接続する必要がある。  


`vi /etc/config/dhcp` して、以下の設定を追記。  

```
<code class="language-/etc/config/dhcp">config dhcp 'ONU6' 
        option ra 'relay'      
        option dhcpv6 'relay'  
        option ndp 'relay'     
        option master '1'      
````


追記後、 `uci commit /etc/config/dhcp` を実行する  

### その4 (必要であれば)DNSサーバー順序の見直し

Network -> DHCP and DNS の General Settings画面で、`DNS Forwardings` の上の方にIPv6  

DNSサーバーを指定する。IPv4のDNSサーバーを指定していると、nslookupした時にIPv4の応答のみが  

帰ってきてしまう場合がある。(例えばso-netのIPv4のDNSはIPv6の回答をしないとされている）  

## 蛇足

その1はCLIで調べる方法がある。  

`ifstatus ONU6`  

IPv6-PDがない場合は、`ipv6-prefix` の中身が空になる。  

```
`	"ipv6-prefix": [
		{
			"address": "240b:10:9181:a200::",
			"mask": 64,
			"class": "ONU6",
			"assigned": {
				
			}
		}
	],
````

