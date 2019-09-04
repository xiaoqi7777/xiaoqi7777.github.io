# http
[[toc]]

## http
- http创建 简易服务
- http.get 发送get请求
  - let http = require('http')
  - let app = http.createServer(function(req,res){})
  - app.listen(80)})
```js
let http = require('http')

//req 相当于是客户端的请求  可读流
//res 是代表响应的东西      可写流
http.createServer(function(req,res){
  // 设置请求头
  res.setHeader('Access-Control-Allow-Orign','*')
  console.log(req.method)
  //请求头 都是小写 content-type
  console.log(req.headers) // 是一个对象

  //怎么获取 传递过来的请求体
  //相当于取请求体 取数据  也就是 req是可读流   on('data')
  //没有请求体 不会触发data事件
  let arr = []
  req.on('data',function(data){
    arr.push(data)
      console.log('获取到的请求体',data)
  })
  req.on('end',function(data){
    console.log(Buffer.concat(arr).toString())
    // res.write('hello')
    // res.end(); //表示结束了
    res.statusCode = 200
    res.end('hello')// 他会先调用write写入 在调end返回
  })
}).listen(3000,'localhost',function(data){
  console.log('3000端口启动了')
})
```
### requset
- 创建一个客户端
```js
let client = http.request({
  host:'localhost',
  method:'post',
  port:3000,
  path:'/user',
  headers:{
    name:'zfpx'
  }
},function(){

})
// 请求体
client.end('age=9')
```

## url
<img :src="$withBase('/img/httpurl.png')" >
- 格式：http://user:pass@wwww.example.jp:80/dir/index.html?uid=1#ch1
- http 协议，user:pass 登陆信息，wwww.example.jp 服务器地址，80 端口号，dir/index.html 文件路径，uid查询参数,ch1 hash发送的时候 后台拿不到

## 状态码
| 类别 | 原因短语 |
| ------------- |:-------------:| -----:|
| 1XX |	Informational(信息性状态码)	|
| 2XX |	Success(成功状态码)	|
| 3XX |	Redirection(重定向)	|
| 4XX |	Client Error(客户端错误状态码)	|
| 5XX	| Server Error(服务器错误状态吗) |

### 2xx 成功
- 200(OK 客户端发过来的数据被正常处理
- 204(Not Content 正常响应，没有实体
- 206(Partial Content 范围请求，返回部分数据，响应报文中由Content-Range指定实体内容

### 3XX 重定向 
- 301(Moved Permanently) 永久重定向
- 302(Found) 临时重定向，规范要求方法名不变，但是都会改变
- 303(See Other) 和302类似，但必须用GET方法
- 304(Not Modified) 状态未改变 配合(If-Match、If-Modified-Since、If-None_Match、If-Range、If-Unmodified-Since)
- 307(Temporary Redirect) 临时重定向，不该改变请求方法

### 4XX 客户端错误
- 400(Bad Request) 请求报文语法错误
- 401 (unauthorized) 需要认证
- 403(Forbidden) 服务器拒绝访问对应的资源
- 404(Not Found) 服务器上无法找到资源

### 5XX 服务器端错误 
- 500(Internal Server Error)服务器故障
- 503(Service Unavailable) 服务器处于超负载或正在停机维护

## 首部