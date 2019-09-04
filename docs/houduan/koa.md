# koa原理

## koa next()的原理
```js
let app = {};
app.middlewares = [];
app.use = function (cb){
  app.middlewares.push(cb)
}

app.use((next)=>{
  console.log(1)
  next()
  console.log(2)
})

app.use((next)=>{
  console.log(3)
  next()
  console.log(4)
})
// 第一种
function dispatch(index){
  if(index === app.middlewares.length) return ()=>{};
  let route = app.middlewares[index];//第一次的中间件
  route(()=>dispatch(index+1));                                                                                 
}
dispatch(0)

// 第二种
let fn = app.middlewares.reduceRight((a,b)=>{
  return ()=>b(a)
},()=>{})
let fn = app.middlewares.reduceRight((a,b)=>()=>b(a),()=>{})
fn()

// 第三种
let fn = app.middlewares.reduce((a,b)=>{
  return function(...args){
    return a(()=>b(...args))
  }
})
let fn = app.middlewares.reduce((a,b)=>(...args)=> a(() => b(...args)));
fn(()=>{})
```

- koa源码
- 4个文件
- koa/application.js
  - 核心编译文件(入口)
  - 里面有一个类 提供了2个方法 
    - use方法 
      - 处理next()方法
    - listen方法
      - 开启服务
  - createContext方法
    - 将实例挂在到ctx上
  - handleRequest方法
    - 处理请求数据的类型 加请求头
- koa/context.js
  - 上下文主要往ctx上挂载内容
  - 用的getter和setter
- koa/request.js
  - 将ctx.request赋值给this.req
- koa/response.js
  - 将响应的实例赋值给ctx.body  
- koa/application.js
```js
let EventEmitter = require('events');
let http = require('http');
let context = require('./context');
let request = require('./request');
let response = require('./response');
let Stream = require('stream');
class Application extends EventEmitter{
  constructor(){
    super();
    this.middlewares = [];
    this.context = Object.create(context);
    this.request = Object.create(request);
    this.response = Object.create(response);
  }
  createContext(req,res){
    let ctx = this.context;
    ctx.request = this.request; // 是koa内部自己封装的
    ctx.response = this.response;
    ctx.req = ctx.request.req = req; // ctx.req res是默认的请求和响应
    ctx.res = ctx.response.res = res;
    return ctx;
  }
  // 处理当前的请求的方法
  compose(ctx,middlewares){ // 处理了promise的逻辑
    function dispatch(index) {
      if(index === middlewares.length) return Promise.resolve();
      let middleware = middlewares[index];
      return Promise.resolve(middleware(ctx,()=>dispatch(index+1)))
    }
    return dispatch(0);
  }
  handleRequest(req,res){
    // 先要创建一个context对象
    let ctx = this.createContext(req,res);
    // 要把所有的中间件进行组合
    res.statusCode = 404;
    // res.setHeader('Content-Disposition', 'attachment');
    let p = this.compose(ctx,this.middlewares);
    // 我希望等待所有中间件执行完后 在取出ctx.body把结果响应回去
    p.then(function () {
      let body = ctx.body;
      if (body instanceof Stream) { // 先判断流，在判断是不是对象
        body.pipe(res); // 异步方法
      }else if(typeof(body) === 'number'){
        res.setHeader('Content-Type', 'text/plain;charset=utf8');
        res.end(body.toString());
      }else if(typeof body == 'object'){
        res.setHeader('Content-Type','application/json;charset=utf8');
        res.end(JSON.stringify(body));
      }else if(typeof body === 'string' || Buffer.isBuffer(body)){
        res.setHeader('Content-Type', 'text/plain;charset=utf8');
        res.end(body);
      }else{
        res.end(`Not Found`);
      }
    }).catch(e=>{
      this.emit('error',e);
    });
  }
  // 中间件方法 用来收集中间件的
  use(callback){
    this.middlewares.push(callback);
  }
  // 创建服务并监听端口号
  listen(...args){
    let server = http.createServer(this.handleRequest.bind(this));
    server.listen(...args);
  }
}
module.exports = Application;
```
- koa/context.js
```js
let proto = {

}
function defineGetter(property,key) {
  proto.__defineGetter__(key,function () {
    return this[property][key];
  });
}
function defineSetter(property,key) {
  // ctx.body = '123'  ctx.response.body = 123
  proto.__defineSetter__(key,function (value) {
    this[property][key] = value;
  });
};
defineGetter('request','path');
defineGetter('request','url');
defineGetter('response','body');
defineSetter('response','body');
module.exports = proto;
```
- koa/request.js
```js
let url = require('url')
module.exports = { // ctx.request.url => this=>ctx.request  
  get url(){
    return this.req.url
  },
  get path(){
    let {pathname} = url.parse(this.req.url,true);
    return pathname;
  }
}
```

- koa/response.js
```js
module.exports = {
  set body(val){
    this.res.statusCode = 200; // 调用ctx.body = xxxx 需要把状态设置成200
    this._body = val
  },
  get body(){
    return this._body
  }
}
```