# 视频

## 直播原理
  - 1、pc/android/ios 采集
  - 2、压缩编码(视频h264/音频AAC)
  - 3、字幕叠加
  - 4、推流
  - 5、CDN
    - 可以直接给播放时使用
## 视频格式
  - mp4   浏览器一般都识别
  - webm  Chorme/Fifox 识别 
  - hls   Safari 识别
  - flv   (B站)

## 直播协议
  - HLS协议(格式HLS)
  - RTMP协议(格式也是ts)
  - HTTP-FLV协议(格式.flv)

## HLS协议
- m3u8是一个纯文本文件
- m3u8文件里面可以放ts文件 也可m3u8文件
- m3u8分类
  - live playlist 动态列表
    - 直播 几秒后重新请求m3u8文件 有新的文件
  - event playlist 静态列表(基本没人用)
  - vod playlist  全量列表
    - 点播  拿到一刻起 不变化
- 原理(通讯:http协议)
  - 对应HLS协议来说 他会先下发一个M3U8文件，M3U8文件会有很多的索引,告诉你有哪些片段,这些片段是可以播放的,之后就是更新问题,片段会有一个时段,他会在在所有片段播放前,重新请求新的m3u8文件(这个是浏览器默认行为)
```js
             - segment-1.ts
video - M3U8 - segment-2.ts
             - segment-3.ts
             - segment-4.ts
/* 总结: 对应HLS协议来说 他会先下发一个M3U8文件
         M3U8文件会有很多的索引,告诉你有哪些片段,
         这些片段是可以播放的,之后就是更新问题,
         片段会有一个时段,他会在在所有片段播放前
         重新请求新的m3u8文件(这个是浏览器默认行为)
*/
```
-  live playlist 动态列表
- m3u8文件
```js
#EXTM3U //版本
#EXT-X-VERSION:6 //版本的声明
#EXT-X-TARGETDURATUION:10 //默认的时长
#EXT-X-MEDIA-SEQUENCE:26 //序号 没变化一次他就会加1
#EXTINF:9.1 //告诉下面时长是多少
http://xxxx

```
-  vod playlist  全量列表
```js
#EXTM3U //版本
#EXT-X-VERSION:6 //版本的声明
#EXT-X-TARGETDURATUION:10 //默认的时长
#EXT-X-MEDIA-SEQUENCE:26 //序号 没变化一次他就会加1
#EXT-X-PLAYLIST-TYPR:VOD // 表明是点播
#EXTINF:9.1 //告诉下面时长是多少
http://xxxx
#EXT-X-ENDLIST //表面结束
```

### hls协议-ts文件 
- ts文件
- 先要找一个PAT的包 他告诉你去找PMT
- PMT 他会告诉你下面TS哪些是视频和音频
- 所有的TS 组成一个PES
```js
    PAT (包) 
    PMT     
    TS
    TS
    TS
```
## RTMP协议
- 原理(通讯:tcp协议)
```js
pc
Andriod  <- TCP  <- CDN <- 源
ios
```
## HTTP-FLV协议
- 原理(通信:http协议)
```js
pc
Andriod  <- HTTP  <- CDN <- 源
ios
```

## video详解


## 播放器选型
- video.js
- hls.js
- flv.js