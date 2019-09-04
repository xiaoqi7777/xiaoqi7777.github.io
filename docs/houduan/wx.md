# 微信公众号
[[toc]]

## 对接微信后端
- 服务器配置
  - 位子:基本配置->服务器配置
  - 服务器地址(URL) 地址是自己服务器可以方位的路径
  - 加密选择文明模式 (sha1算法)
  - 首次接入 看 firstAuthentication路由,get方式 基本就用这一次
## 服务器接受微信端的信息
  - 跟首次接入一样的firstAuthentication路由 用post,往后的接收消息基本用这个
  - 与微信交流的格式不是JSON,是XML
    - 主要用 xml-js 库来转换
    - xml2js(xml转js) js2xml(js转换xml)
  - 接收微信的消息 raw-body 库处理,也可以监听流,自己写 里面有写(与raw-body在一块被注释了)
  - 和微信交流常用字符
    - ToUserName 发给谁
    - FromUserName 是谁发的
    - CreateTime 时间戳
    - MsgType 类型
    - Content 内容
## 回复消息
  - 微信回复的消息类型 大概7种 文字,图片,图文,视频,语音等
  - 在wecaht/tpl中 我用 ejs 和 heredoc 封装了 在wecaht/text有调用的方法 传入一个对象
  - 主要xml格式 官网里面有坑 语法里面没有空格  官网例子有空格
## 获取 access_token 票据
  - access_token是公众号的全局唯一接口调用凭据，公众号调用各接口时都需使用access_token
  - 获取的 access_token 我把他写到本地了
  - 特点 7200m 失效
  - getToken=>wxInit/index.js
## 页面的菜单设置
  - 写一个JSON 通过接口提交就可以了
  - 如果手机没有显示 取消重新关注即可
  - createMenu => wxInit/index.js
## 微信网页授权
  - 微信网页授权是auth验证
  - 前端 设置(看官网配置)
    - redirect_uri 就是前端网站自己
    - scope 选一种
    - 初始化的时候 跳转这个地址就会进行验证
  - 认证后 通过url获取当前的code 传给后端,后端用他可以换取openid,微信自身支付需要他
## SDK签名(很多接口都需要用它照片,录音等)
  - sdk前面需要4个参数进行签名
    - nonce_str 生成签名的随机串
    - timeStamp 生成签名的时间戳
    - jsapiTicket 用普通票据换的sdk票据
    - url 当前网站 #及其后面的不要
  - sdkSignHandle SDK签名算法
    - 字典排序 用&连接
    - 在用sha1算法即可
### 前端处理 
  - index.html 引入 
  ```js
  <script src="http://res.wx.qq.com/open/js/jweixin-1.4.0.js"></script>
  ```
  - 前端获取签名,时间戳,随机串等
  - 设置wx.config
    - jsApiList里面填写使用的接口
    - 具体看官网
## 支付(扫码和微信自身支付)
- 扫描 
    - 提前准备 一些参数 官网上有
  - 获取 商品支付信息和key 进行签名算法(util.wxSign)
    - 算法
      - 将订单商品进行排序(按照key值)
      - 用querystring库将他变成字符
      - 字符串+&key='key'
      - 通过md5进行签名 即可
  - 签名和商品转换成xml 发给微信(下单)
  - 接收到的参数转换成js 里面有一个 code_url
  - 用 qrcode 将code_url转换成一个 二维码发给前端显示
- h5支付
  - 需要 openid 获取openid 的时候 赋值给order上 
   - 提前准备 一些参数 官网上有
  - 获取 商品支付信息和key 进行签名算法(util.wxSign)
    - 算法
      - 将订单商品进行排序(按照key值)
      - 用querystring库将他变成字符
      - 字符串+&key='key'
      - 通过md5进行签名 即可
  - 签名和商品转换成xml 发给微信(下单)
  - 接收到的参数转换成js 里面有一个 prepay_id
  - 用prepay_id 和一些参数 再次进行md5 加密
  - 最后接口返回一个json格式就可以了
-  支付完成 微信会有一个支付信息的信息发过来 getNotifyUrl接口
## 代码(sdk验证&&auth验证&&支付)
- dist
  - 前端代码
- router
  - util.js
  - wxpay.js
- wechat
  - text.js
  - tpl.js
- wxInit
  - index.js
  - util.js
- app.js
- config.js
- logger.js

- app.js(入口文件)
```js
const  Koa = require('koa')
const Router = require('koa-router');
const path = require('path')
const bodyparser = require('koa-bodyparser')  
const static = require('koa-static')

const wxInit = require('./wxInit')
wxInit.entryFn()

const router = new Router();
const app = new Koa()

let routerWx = require('./router/wx')

// post 提交处理
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))

// 静态文件处理
app.use(static(
  path.join( __dirname,  '/dist')
))

router.use('/wx',routerWx.routes())

app.use(router.routes(),router.allowedMethods())
app.listen(3000,()=>{
  console.log('跑起来了')
})
```
- config.js 配置文件
```js
var config = {
  wechat:{
    appID : 'wx3df629936bf31f75',
    appSecret : '036989030fec913af6365b7695ffa918',
    token : 'sg92322',
  },
  wxpay:{
    mch_id: '1511047841',
    key: 'gmklNxpgLPCQrOxji2HzIThpAfiyIVx7 ',
    notify_url: 'http://tsml520.cn/wx/getNotifyUrl',
    unifiedorder:'https://api.mch.weixin.qq.com/pay/unifiedorder'
  }
}
module.exports = config
```
- loggers日志文件
```js
var bunyan = require('bunyan');
function make_logger(app_name) {
  let logger = bunyan.createLogger({
    name: app_name,
    streams: [{
      type: 'rotating-file',
      path: './logs/'+app_name+'.log',
      period: '1d',   // daily rotation
      count: 3,        // keep 3 back copies
      level: 'trace'
    }
  ]
  });
  return logger;
}
const logger = make_logger('sg_wxgzh');
module.exports = logger
```

- wxInit/index.js 初始化
```js
const axios = require('axios')
const fs = require('fs')
const path = require('path')
let util = require('./util')
let pathAdress = path.join(__dirname,'../txt.js')

let data ={
  "button":[
  {    
       "type":"click",
       "name":"今日歌曲",
       "key":"V1001_TODAY_MUSIC"
   },
   {
      "type":"view",
      "name":"我的网站",
      "url":"http://tsml520.cn"
   },
   {
        "name":"菜单",
        "sub_button":[
         {
              "type":"pic_photo_or_album",
              "name":"11",
                "key":"V1001_GOOD"
          },
          {
              "type":"scancode_waitmsg",
              "name":"扫码",
                "key":"V1002_GOOD"
          },
         {
            "type":"location_select",
            "name":"发送位子",
            "key":"V1003_GOOD"
         },
         {
          "type":"pic_sysphoto",
          "name":"拍照",
          "key":"V1004_GOOD"
          },
         {
          "type":"pic_weixin",
          "name":"弹出相框",
          "key":"V1005_GOOD"
          },
      ]
    }]
}

// 获取票据
async function  getToken(){
  let appID ='wx3df629936bf31f75'
  let appSecret ='036989030fec913af6365b7695ffa918';
  let api = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appID}&secret=${appSecret}`
  let data = await axios.get(api)
  data = data.data
  let time2h = new Date().getTime()/1000
  let expires = data.expires_in

  time2h = (time2h+expires-200) 
  let accessToken = data.access_token
  let accessData = [time2h,accessToken].join('=')

  await util.writeFile(pathAdress,accessData)

  return accessToken
}

// 检查token是否有效
async function validToken(){
  let accessData =await util.readFile(pathAdress)
  accessData = accessData.split('=')
  let time2h = accessData[0]
  let accessToken = accessData[1]
  
  let currentTime2h = new Date().getTime()/1000

  if(time2h>currentTime2h){
      return accessToken
  }else{
      return await getToken()
  }
}

// 定义菜单
async function createMenu(){
  let accessToken =await validToken()
  console.log('get accessToken',accessToken)

  let api = ` https://api.weixin.qq.com/cgi-bin/menu/create?access_token=${accessToken}`
  let rs = await axios.post(api,data)
  rs = rs.data
  console.log('createMenu',rs)
}
//获取sdk
async function sdkToken(){
  let ACCESS_TOKEN = await validToken()
  let api = `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${ACCESS_TOKEN}&type=jsapi`
  let rs = await axios.get(api)
  return rs.data.ticket
}

async function entryFn(){
  await getToken()
  await createMenu()
}

module.exports = {
  entryFn,
  validToken,
  sdkToken
}
```
- wxInit/util.js 处理token的读写
```js
let fs = require('fs')
let path = require('path')
let pathAdress = path.join(__dirname,'../txt.js')

function readFile(_path,encoding='utf8'){
    return new Promise((resolve,reject)=>{
        fs.readFile(_path,encoding,(err,context)=>{
            console.log('err',err)
            resolve(context)
        })
    })
   
}
async function writeFile(_path,context){
  let a = await  fs.writeFile(_path,context,(err)=>{
      console.log('err',err)
  })
}
module.exports = {
    readFile,
    writeFile
}
```
- wechat/text.js 微信聊天
```js
var tpl = require('./tpl')
exports.textReply = (ctx,data)=>{
  // 回复处理-------------
  let ToUserName = data.FromUserName
  let FromUserName = data.ToUserName
  let Content = data.Content


  var info = {}
  var type = 'text'
  info.content = Content
  info.createTime = new Date().getTime()
  info.msgType = type
  info.toUserName = ToUserName
  info.fromUserName = FromUserName

  let rs = tpl.compiled(info)
  ctx.body = rs
  // ctx.body = `
  // <xml> 
  //   <ToUserName><![CDATA[${ToUserName}]]></ToUserName> 
  //   <FromUserName><![CDATA[${FromUserName}]]></FromUserName> 
  //   <CreateTime>${new Date().getTime()}</CreateTime> 
  //   <MsgType><![CDATA[text]]></MsgType> 
  //   <Content><![CDATA[${Content}]]></Content> 
  // </xml>
  // `
}
```
- wechat/tpl.js 封装回复信息
```js
// 作用编译模板
var ejs = require("ejs");
// 作用写模版
var heredoc = require("heredoc");
var tpl = heredoc(function() {
  /* 
    <xml> <ToUserName><![CDATA[<%= toUserName %>]]></ToUserName> 
    <FromUserName><![CDATA[<%= fromUserName %>]]></FromUserName> 
    <CreateTime><%= createTime %></CreateTime>
    <MsgType><![CDATA[<%= msgType %>]]></MsgType> 
    <% if (msgType === 'text') { %> 
      <Content><![CDATA[<%= content%>]]></Content> 
    <% } else if (msgType === 'image') {%>
      <Image>
        <MediaId><![CDATA[<%= content.mediaId %>]]></MediaId>
      </Image>
    <% } else if (msgType === 'voice') {%>
      <Voice>
        <MediaId><![CDATA[<%= content.mediaId %>]]></MediaId>
      </Voice>
    <% } else if (msgType === 'video') {%>
      <Video>
        <MediaId><![CDATA[<%= content.mediaId %>]]></MediaId>
        <Title><![CDATA[<%= content.title %>]]></Title>
        <Description>< ![CDATA[[<%= content.description %>]]></Description>
      </Video>
    <% } else if (msgType === 'music') {%>
      <Music>
        <Title><![CDATA[<%= content.title %>]]></Title>
        <Description><![CDATA[<%= content.description %>]]></Description>
        <MusicUrl><![CDATA[<%= content.musicUrl%>]]></MusicUrl>
        <HQMusicUrl><![CDATA[<%= content.hqMusicUrl%>]]></HQMusicUrl>
        <ThumbMediaId><![CDATA[<%= content.thumbMediaId %>]]></ThumbMediaId>
      </Music>
    <% } else if (msgType === 'news') {%>
      <ArticleCount><%= content.length %></ArticleCount>
      <Articles>
      <% content.forEach(function(item){%>
        <item>
          <Title>< ![CDATA[<%= item.title%>]]></Title> 
          <Description>< ![CDATA[<%= item.description%>]]></Description>
          <PicUrl>< ![CDATA[<%= item.picUrl%>] ]></PicUrl>
          <Url>< ![CDATA[<%= item.url%>] ]></Url>
        </item>
      <% }) %>
      </Articles>
    <% } %>
  </xml>
*/
});
var compiled = ejs.compile(tpl)
exports = module.exports = {
  compiled
}
```

- router/wx.js 路由
```js
const Router = require('koa-router')
const moment = require('moment');
const axios = require('axios')
//产生随机数
const randomstring = require('randomstring');
// xml和js互相转化
const xmljs = require('xml-js');
//回复
const wechat = require('../wechat/text')
const wx = require('../wxInit')

const qrcode = require('qrcode');
const util = require('./util')
const config = require('../config')
const router = new Router();
const root_logger = require('../logger')
const logger = root_logger.child({ tag: 'router' });

let nonce_str = randomstring.generate(32) // 随机字符串
let timeStamp = moment().unix().toString() //时间戳
let out_trade_no = moment().local().format('YYYYMMDDhhmmss') //商户订单号

let appSecret = config.wechat.appSecret;
let appid = config.wechat.appID;
let notify_url = config.wxpay.notify_url;
let key = config.wxpay.key;
let mch_id = config.wxpay.mch_id;
let unifiedorder = config.wxpay.unifiedorder;
let sign = '' //签名
let body = '商品名称'
let total_fee = '1'
let detail = '商品详情'
let trade_type = 'NATIVE'
let product_id = nonce_str


let order = {
  appid,
  mch_id,
  out_trade_no,
  body,
  total_fee,
  product_id,
  notify_url,
  nonce_str,
  trade_type,
}


// 微信发过来首次认证是get  以后接受消息都是post 同样的接口
router.get('/firstAuthentication',async (ctx,next)=>{
  // 
  let getData = ctx.query
  getData = util.signatureAuthentication(getData)
  if (getData.sha === getData.signature) {
    logger.info('first authentication pass =>get')
    // 是微信发过来的 将echostr返回过去就可以了
    ctx.body = getData.echostr
  } else {
    // 非微信
    ctx.body = 'wrong'
  }
  await next()
})

// 根据 code 换登录的openid
router.get('/getOpenId',async(x,next) => {
  let code = x.query.code
  let url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appid}&secret=${appSecret}&code=${code}&grant_type=authorization_code`
  let getData = await axios.get(url)
  logger.info(`get openId ${getData.data.openid}`)
  order.openid = getData.data.openid
  x.body = getData.data.openid
})

router.get('/sdk', async (ctx, next) => {
  let length = ctx.url.indexOf('?url=')
  let url = ctx.url.slice(length+'?url='.length)
  let jsapiTicket = await wx.sdkToken()
  logger.info(`sdk sign parameter,nonce_str=>${nonce_str},timeStamp=>${timeStamp},sdkToken=>${jsapiTicket},url=>${url}`)
  let rs = util.sdkSignHandle(nonce_str,timeStamp,jsapiTicket, url)
  ctx.body =  rs
})

router.post('/firstAuthentication',async (ctx,next)=>{
  let getData = ctx.query
  getData = util.signatureAuthentication(getData)
  if (getData.sha === getData.signature) {
    let xmlData = await util.parseXML(ctx)
    // textKey 和 cdataKey 配置 是为了获取的结果里面的key是转换成value 
    let options = {
      compact: true,
      textKey: 'value',
      cdataKey: 'value',
    };
    //xml转js
    let jsData = xmljs.xml2js(xmlData, options)
    //转正常用的对象
    jsData = util.transformXmlFn(jsData)
    logger.info(`接受的信息 ${jsData}`)
    //回复处理
    wechat.textReply(ctx,jsData)
  }else{
    ctx.body = 'wrong'
  }
})

//h5支付
router.post('/commonPay',async(ctx, next) => {
  let paySubmitInfo = ctx.request.body
  total_fee = order.total_fee = paySubmitInfo.money
  trade_type = order.trade_type = 'JSAPI'
  product_id = order.product_id = randomstring.generate(32)
  out_trade_no = order.out_trade_no = moment().local().format('YYYYMMDDhhmmss') 
  body = order.body = '暂时=>'+randomstring.generate(5)

  logger.info(`commonPay parameter`,order)

  sign =  util.wxSign(order, key)

  let xmlOrder = xmljs.js2xml({
    xml: { 
      ...order,
      sign
      }
    },{
      compact: true
    })
  // 下单
  let unifiedorderResponse  = await axios.post(unifiedorder, xmlOrder);

  let _prepay = xmljs.xml2js(unifiedorderResponse.data, {
        compact: true,
        cdataKey: 'value',
        textKey:'value'
      }) 

  //将获取的xml转换成js
  let prepay  = util.transformXmlFn(_prepay)
  logger.info(`支付返回的信息 ${prepay}`)

  let prepay_id = prepay.prepay_id

  let params;
  params = {
    appId:appid,
    timeStamp:timeStamp,
    nonceStr:nonce_str,
    package:`prepay_id=${prepay_id}`,
    signType : 'MD5'
  }
  //签名
  sign = util.wxSign(params,key)

  let obj = {
    appId:appid,
    timeStamp: timeStamp, //时间戳，自1970年以来的秒数
    nonceStr: nonce_str, //随机串
    package: prepay_id,
    signType: "MD5", //微信签名方式：
    paySign: sign //微信签名
  }

  ctx.body = obj
})

// 扫描支付
router.post('/scanPay', async (ctx, next) => {
  let paySubmitInfo = ctx.request.body
  total_fee = order.total_fee = paySubmitInfo.money
  trade_type = order.trade_type = 'NATIVE'
  product_id = order.product_id = randomstring.generate(32)
  out_trade_no = order.out_trade_no = moment().local().format('YYYYMMDDhhmmss') 
  body = order.body = '暂时=>'+randomstring.generate(5)

  logger.info(`commonPay parameter ${order}`)
  console.log('1支付商品的信息',order)
  //获取签名
  sign =  util.wxSign(order, key)
  //转换成 xml 格式
  let xmlOrder = xmljs.js2xml({
    xml: { 
      ...order,
      sign
      }
    },{
      compact: true
    })
  //请求统一下单接口 (2个参数 发送地址 xml格式的订单)
  let unifiedorderResponse  = await axios.post(unifiedorder, xmlOrder);
  
  //响应的 数据是一个xml格式的
  let _prepay = xmljs.xml2js(unifiedorderResponse.data, {
                  compact: true,
                  cdataKey: 'value',
                  textKey:'value'
                }) 
  //console.log('将获取的xml数据转换成js对象',_prepay)
  
  //将获取的xml转换成对象
  let prepay  = util.transformXmlFn(_prepay)
  logger.info('2调取支付微信返回的结果',prepay)
  console.log('2调取支付微信返回的结果',prepay)
  let code_url = prepay.code_url
  const qrcodeUrl = await qrcode.toDataURL(code_url, {
      width: 300
    });
  ctx.body = qrcodeUrl
})

router.post('/getNotifyUrl',async(ctx,next)=>{
  let xmlData = await util.parseXML(ctx)
  let options = {
    compact: true,
    textKey: 'value',
    cdataKey: 'value',
  };
  let jsData = xmljs.xml2js(xmlData,options)
  let payment = util.transformXmlFn(jsData)
  console.log('支付成功返回的数据',payment)
  const paymentSign = payment.sign
  delete payment.sign
  let key  = 'gmklNxpgLPCQrOxji2HzIThpAfiyIVx7'
  let newSign = util.wxSign(payment,key)

  const return_code = newSign===paymentSign?'SUCCESS':'FAIL' 
  const return_msg = newSign===paymentSign?'OK':'NO' 

  const reply = {
   xml:{
    return_code,
    return_msg
   }
  }
  const rs = xmljs.js2xml(reply, {
    compact: true
  });
  console.log('支付成功返回的微信的数据',rs)
  ctx.body = rs
})
module.exports = router
```
- router/util.js 加密等方法
```js
const querystring = require('querystring');
const crypto = require('crypto');
//加密
const sha1 = require('sha1')
const config = require('../config')
const getRweBody = require('raw-body')

let token = config.wechat.token

function signatureAuthentication(getData) {
  let {
    signature,
    timestamp,
    echostr,
    nonce
  } = getData

  let str = [token, timestamp, nonce].sort().join('')
  let sha = sha1(str)
  return {
    sha,
    signature,
    echostr
  }
}

function sdkSignHandle(noncestr,timestamp,ticket, url) {
  var data = [
      'noncestr=' + noncestr,
      'jsapi_ticket=' + ticket,
      'timestamp=' + timestamp,
      'url=' + url
  ]
  var str = data.sort().join('&')
  var signature = sha1(str)
  return {
      noncestr: noncestr,
      timestamp: timestamp,
      signature: signature
  }
}

function transformXmlFn(data) {
  let xml = data.xml
  let obj = {}
  for (let x in xml) {
    obj[x] = xml[x].value
  }
  return obj
}
async function parseXML(ctx) {
  // // 获取微信发过来的消息
  let xml = await getRweBody(ctx.req, {
    length: ctx.request.length,
    limit: '1mb',
    encoding: ctx.request.charset || 'utf-8'
  })
  return xml
  // return new Promise(function (resolve, reject) {
  //   let buffers = [];
  //   ctx.req.on('data', function (data) {
  //     buffers.push(data);
  //   });
  //   ctx.req.on('end', function () {
  //     // let ret = Buffer.concat(buffers);
  //     let ret = buffers
  //     resolve(ret.toString());
  //   });
  // });
}
// 签名算法
function wxSign(order, key) {
  //对参数进行排序  
  let sortedOrder = Object.keys(order).sort().reduce((total, valu) => {
    total[valu] = order[valu]
    return total
  }, {})

  //若是不加后面的参数 会导致结果被转换成百分比的形式
  let stringifiedOrder = querystring.stringify(sortedOrder, null, null, {
    encodeURIComponent: querystring.unescape
  })

  let stringifiedOrderWithKey = `${stringifiedOrder}&key=${key}`
  //计算签名
  let sign = crypto.createHash('md5').update(stringifiedOrderWithKey.trim()).digest('hex').toUpperCase();
  return sign
}
module.exports = {
  signatureAuthentication,
  sdkSignHandle,
  transformXmlFn,
  parseXML,
  wxSign
}
```