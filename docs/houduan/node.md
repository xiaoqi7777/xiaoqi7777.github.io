# node
[[toc]]
## fs(有Sync是同步  无是异步) 
**1、fs.access('文件名字') 判断文件是否存在**

**2、fs.readdir('m') 读取根文件下的 m文件下面的文件 返回一个数组 没有则是空数组**

**3、let r = fs.stat('m') 读取根文件下的 m文件的状态**
```javascript
  r.size 文件的大小
  r.isDirectory() 判断文件是不是目录
  r.isFile() 判断文件是不是文件
```   
**4、fs.rmdir('m') 删除m目录fs.unlink('m') 删除m文件**

**5、fs.open('text.js','r',(err,fdr)=>{}) 打开文件**
```javascript
      //'r' 做什么  flag:'r'/'w'			
      //回调  fdr 打开文件的标示 是一个数字
    fs.read(fdr,buf,0,bufLength,null,(err,bytesRead,data)=>{})
      //fdr 			打开文件 的一个标示
      //buf 			临时存储的一个流空间
      //0   			读取buf的开始位子
      //bufLength 读取buf的长度
      //null      文件开始读取的位子
      //回调      bytesRead参数是 实际读取的字节数
    fs.write(fdr,buf,0,bufLength,null,(err,data)=>{}) //参数同上
    fs.close(fdr)
```

**6、fs读/写**
```js
//  异步读取
fs.readFile(path[, options], callback)
/*
  options
    encoding
    flag flag 默认 = 'r'
  fs.readFile('1.js','utf8',(err,item)=>{
    console.log('item',item)
  })
*/
// 同步读取
fs.readFileSync(path[, options])
// 异步写入
fs.writeFile(file, data[, options], callback)
/*
  options
    encoding
    flag flag 默认 = 'w'
    mode 读写权限，默认为0666

  let fs = require('fs');
  fs.writeFile('./1.txt',Date.now()+'\n',{flag:'a'},function(){
    console.log('ok');
  });
*/
// 同步写入
fs.writeFileSync(file, data[, options])
// 追加文件
fs.appendFile(file, data[, options], callback)
/*
  fs.appendFile('./1.txt',Date.now()+'\n',function(){
    console.log('ok');
  })
*/
// 拷贝文件
function copy(src,target){
  fs.readFile(src,function(err,data){
    fs.writeFile(target,data);
  })
}

```



## path

**1、__dirname表示的是当前的文件所在的文件夹**

**2、path.resolve(__dirname,'test.js')   这两个都一样 用来拼接地址**

**3、path.join(__dirname ,'test.js')**

```javascript
  path.resolve和path.join区别(第二个参数是否带/)
  path.resolve(__dirname,'/index.html') //e:\index.html
  path.join(__dirname,'/index.html') //e:\study\node\index.html
```

**4、path.extname(1123.js)               输出.js(找后缀)**

**5、path.basename('1.min.js','.js')     输出1.min(通过后缀 找文件路径)**

**6、path.relative 从绝对路径里面找相对路径**

**7、path.dirname 找父路径  path.dirname('./src/a.js') =>./src **

```js
// 当前在c:/index/a/b/c 知道c:/index  获取/a/b/c
let c = path.relative(c:/index,c:/index/a/b/c)
// c == a/b/c  主要a前面没有/
```


## process

**1、process.pid       node进程**

**2、process.exit()    停止当前进程(node中断)**

**3、process.cwd()     查找当前绝对定位的目录(vscode当前打开的文件夹和git当前文件)**

**4、process.chdir()   改变工作目录**

**5、process.nextTick  异步跟promise差不多(里面不能递归)**

**6、process.env.NODE_ENV  暂时不会**

**7、process.argv      暂时不会**

**8、process.stdin标准输入 是一个可读流  在控制台上操作**
```javascript
  process.stdout.write('123') //在控制台输入123
   // 0d 0a  代表换行 回撤
```
**9、process.stdout标准输出 是一个可写  将内容输出到控制台**


## url

**url 模块下的parse(url,boolean) 能解析 url  boolean为true时 取到的query是一个对象(?后面的)**
```javascript
let {pathname,query} = url.parse('http://www.baidu.com:8080/s?a==1',true)
console.log(pathname,query) // /s { a: '=1' }
```

## vm
**vm.runInThisContext(fn)  沙箱 fn放在一个独立的虚拟环境中(在require源码会用到)**
```javascript
let b = 2;
console.log('b',b) // 2
let fn = `(function a(){let b = 1;console.log('b2',b)})()`;
let vm = require('vm');
vm.runInThisContext(fn); //2
```

## buffer
- 声明

**1、Buffer.alloc('12') 通过数组声明**

**2、Buffer.from('我')  通过存放数组或者字符**

- 方法 (跟数组类似,没有分割split)

**1、slice(是同组数都是浅拷贝 拷贝的是引用地址)**

**2、forEach** 

**3、copy** 

**4、concat(同数组)**

**5、indexOf(同数组)**
```javascript
  //concat用法
    concat([a1,a2,a3],n)
      例子(a1等代表的是Buffer,n代表的是截取多少字节,不写就是全部)
      let a1 = Buffer.from('我')
      let a2 = Buffer.from('ni')
      let r = Buffer.concat([a1,a2],n)
  //重写split方法
  Buffer.prototype.split = function(p){
    let arr = []
    let buf = Buffer.from(this)
    let len = Buffer.from(p).length
    let offset = 0
    let index = buf.indexOf(p)

    while(-1 != index){
      let target = this.slice(offset,index)
      arr.push(target)
      offset = len + index
      index = buf.indexOf(p,offset)
    }
    arr.push(this.slice(offset))
    return arr.toString()
  }
```

## events
**1、on('事件','函数')				监听**

**2、on('newListener','函数')    	监听 用户绑定的事件**

**3、once('事件','函数')    			监听一次**

**4、emit('事件')    				发布**

**5、prependListener('事件','函数')   插队到最前面**

**6、off('事件','函数')           	 删除**

**7、defaultMaxListeners      		事件总数**

## util

**1、util.inherits(girl类,people类) girl继承people原型上的方法**

**继承原型上的属性 公有属性(私有的不会继承)**

**2、n.call(obj,参数1) fn是方法 obj是对象(继承私有的)**

**3、stat = util.promisify(fs.stat) 将fs.stat方法包装成 promise 只能一个个添加 对应的还有一个mz**

**4、let fs = require('mz/fs') mz需要引入 mz将fs所有的方法转换成promise**

## stream
  **流:** 并不关系整体文件大小
 
  **分类:** 可读、可写、转换、双工流
```javascript
  //读流
  let rs = fs.createReadStream('./a.md',options)
    options(对象)
      flags:'r',
      encoding:null,
      autoClose:true,
      start:0,
      end:6, // 包前又包后
      highWaterMark:3 //默认64K 每次读取64k
      //默认情况下 非流动模式 如果监听了on('data')事件 就变成流动模式 
      //不停的读取文件 将文件读取完毕(最快的速度),之后触发on('end')事件
      rs.on('open',()=>{})
      rs.on('data',()=>{})
      rs.on('resume',()=>{})
      rs.on('pause',()=>{})
      rs.on('end',()=>{})
      rs.on('close',()=>{})
      rs.on('error',()=>{})
  //写流
  let ws = fs.createWriteStream('1.txt',options)
      options(对象)
        flags: 'w',
        encoding: 'utf8',
        autoClose: true,
        highWaterMark: 2 //默认16K 不是代表的每次能写16k  预计我用16k来写
      ws.write(Buffer.from('1'),'utf8',()=>{})
      ws.on('drain',()=>{})//drain 只有当我们写入的内容大于我们的预期，并且被清空后才会触发事件
  //pipe 边读边写
  let fs = require('fs')

  let rs = fs.createReadStream('1.txt',{
    highWaterMark:1
  })

  let ws = fs.createWriteStream('2.txt',{
    highWaterMark:4
  })
  //边读边写
  rs.pipe(ws)
```
## http
 http版本1.1

**长连接**
    每次请求的时候不会重新创建新的通道,会复用原来的通道
  
**管线化**
    数据并发(多个请求)
**url和uri**

- URI:统一资源标识符
- URL:统一资源定位符
- URN:统一资源命名符
    
**URL的格式**
```javascript
    http://user:pass@www.example.jp:80/dir/index.html?uid=1#ch1
    http            协议方案名
    user:pass       登陆信息(认证)
    www.example.jp  服务器地址
    80              端口
    dir/index.html  带层次的文件路径
    uid             查询字符串
    ch1             片段标识符(后端拿不到这个值)    
```
```javascript
  常用状态码:
    1XX(信息状态码 websocket才用)
    2XX(Success 成功状态码)
      200:正常返回
      204:返回的结果只有请求头 没有响应体
      206:分段传输
    3XX(Redirection 重定向)
      301:永久重定向
      302:临时重定向
      304:缓存
    4XX(Client Error 客户端错误状态码)
      401:没有权限
      403:登陆了 还是没有权限
      404:找不到资源
    5XX(Server Error 服务器错误状态码)
      500:服务器挂了
      503:负载均衡超标
```

  请求(一对)
::: tip
get / post / put / delete / options(预发射/试探性,在跨域的时候用到) / head

资源url (/form/entry/)

 协议版本(HTTP/1.1)

  Host: hacker.jp  请求头
  
  Connection: keep-alive 
  
  Connection-Type:application/x-www-form-urlencoded
  
  Content-Length:16
:::
     


**模拟最简陋的client**
```javaScript
// node中核心模块 http模块 专门用来创建http服务的
let http = require('http');
// http.get 他只能发送get请求（没有请求体）
// post localhost:3000/path
let client = http.request({
  host:'localhost',
  method:'post',
  port:3000,
  path:'/user?a=1&b=2#hash',
  headers:{
    name:'seven',
    'Content-Type':'application/x-www-form-urlencoded'
  }
},function (res) {
  res.on('data',function (data) {
    console.log(data.toString(),'xxx');
  })
});
// 请求体
client.end('age=9');
```

**搭建最简陋的server**
```javaScript
let http = require('http');
//req 相当于是可以端的请求 可读流
//res 是代表稍后我要写响应 可写流
http.createServer(function (req,res) {
  // 请求的方法就是大写的
  console.log(req.method);//POST
  // 从/后面到#前面的部分(浏览器环境) 
  console.log(req.url);// /user?a=1&b=2
  // 请求头都是小写的 content-type
  console.log(req.headers); // 对象

  let arr = [];
  // 如果有请求体会触发on('data')事件，如果没有请求体会触发on('end')事件，不管有没有请求体 end事件都会触发
  req.on('data',function (data) {
    console.log('请求替')
    arr.push(data);
  });
  req.on('end',function () {
    console.log(Buffer.concat(arr).toString()); //接收的数据
    res.statusCode = 200;
    res.end('hello'); // 表示结束了
  })
}).listen(3001,'localhost',function () {
  console.log('3000端口启动了')
});
```
## 后端接受的数据
- 主要有3大类，第一个json，第二个form表单，第三个file类型
- 每个数据格式都有对应的请求头
- json => "Content-Type":"application/json"
- form => "Content-Type":"application/x-www-urlencoded"
- file => 在html的form表单中 必须添加`enctype="multipart/form-data"`
- express 接受后端数据，主要是post提交(包含以上三种类型)
```js
let express = require('express');
let bodyParser = require('body-parser');
let multer = require('multer')
let fs =require('fs')
let path = require('path')
let app = express();
// 处理json格式的请求体
app.use(bodyParser.json());
// 处理表单格式的请求体
app.use(bodyParser.urlencoded({extended:true}));
// 文件上传 upload req.file获取文件的流   dest req.file 获取的保存路径
let upload = multer({upload:'upload/'})
// var storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null,path.join(__dirname,'/upload'))
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + "-" + file.originalname)
//   }
// })
// let upload = multer({storage:storage})

app.post('/post',(req,res)=>{
  let body = req.body
  console.log(body)
  res.send(body)
})
app.post('/form',(req,res)=>{
  let body = req.body
  res.send(body)
})
// 只有一个文件类型的用upload.single('avatar') 处理
app.post('/upload',upload.single('avatar'),(req,res)=>{
  // req.file 里面存放的文件类型的数据
  // req.body 里面存放的普通类型的数据
  console.log(req.body.name,typeof req.body)
  console.log(req.file); //req.filr 指的是请求体formData里的avatar 字段对应的文件内容
  // console.log(req.file.buffer); //req.filr 指的是请求体formData里的avatar 字段对应的文件内容
  if(req.file){
    fs.writeFileSync(path.join(__dirname,`upload/${req.file.originalname}`),req.file.buffer)
  }
  
  res.send(req.body)
})
app.listen(4000)
```
### 客户端

## 常用的库

**1、let mime = require('mime')**
```js
// 获取文件的后缀
  mime.getType('引入文件')
```
**2、let fs = require('mz/fs')**

mz需要引入 mz将fs所有的方法转换成promise

**3、require('querystring').parse(str,'&@','#=')**
```javaScript
后面两个参数默认是 '&' '='
let str = 'username#=123&@password#=456'
let obj = require('querystring').parse(str,'&@','#=')
console.log(obj)//{ username: '123', password: '456' }
```
**4、方法拷贝**
- 把一个对象的属性 拷贝到另一个对象上去
- express 源码用到这个
```js
var mixin = require('merge-descriptors');
mixin(app, EventEmitter.prototype, false);
mixin(app, proto, false);
```