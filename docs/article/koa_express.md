# koa&&express
  [[toc]]
[代码-分支/jwt](https://github.com/xiaoqi7777/koa)

## koa
- koa是一个快速搭建web服务的框架，自身代码量很小，里面主要提供了2个方法，use和listen，一个中间件另一个就是监听端口开启服务。其拓展功能主要是通过中间件加进去。koa里面有用到2个核心内容，第一个是洋葱模型，主要说中间件思想，先执行的中间件最后才完成。可以类比js里的函数嵌套函数，父函数肯定是先执行，遇到子函数在执行，等待子函数执行完成，在执行父函数剩下的内容。这就是洋葱模型，先执行的中间件，也就是等其他中间件全部执行完成，在轮到他。第二个是代理，主要用到的就是setter和getter，当获取ctx.url的时候，会通过getter代理到ctx.req.url上。反过来给ctx.body设置值的时候，同时会用setter给ctx.res.body赋上值。接下来我们实现下koa原理，源码里面主要就4个文件，`application` 入口文件贯穿其他文件，`context` 做代理用的 将原生的ctx.req、ctx.res 和ctx.request、ctx.response进行关联，`request` 处理ctx.request,`response`处理ctx.response。

### 洋葱模型
- use 模拟中间件，每次都会把当前的函数加到middlewares中。最后执行的时候要按照 1=>3=>5=>6=>4=>2 的顺序打印出来，也就是第一个函数的参数是下一个函数，每一个next代表下一个函数。
- 下面我罗列了三种方式
  - 第一种是通过递归的方式，先将当前数组的第一个函数拿到，参数放第二个函数，通过index+1进行递归，当执行第二个函数的时候他的参数将是(()=>dispatch(2)),推出递归的条件是就`index`等于数组的长度，同时要返回一个()=>{} 空的函数，因为最后一个中间件 他也调用了next。
  - 第二种通过数组的`reduceRight`方法，也就是先拿到最后一个中间件，反过来执行，同样的最后一个中间件要接受一个空的函数，a是下一个中间件，b上一个中间件，正好将a传给b做参数
  - 第三种通过数组的`reduce`方法,他是也是数组最强大的api，他就是正过来执行，在执行fn的时候传递空函数即可
```js
let app = {}
app.middlewares = []
app.use = function(cb) {
    app.middlewares.push(cb)
}

app.use((next) => {
    console.log(1, next)
    next()
    console.log(2)
})

app.use((next) => {
    console.log(3, next)
    next()
    console.log(4)
})

app.use((next) => {
    console.log(5)
    next()
    console.log(6)
})

// 第一种
function dispatch(index) {
    // 防止溢出
    if (index === app.middlewares.length) return () => {}
    //第一次的中间件
    let route = app.middlewares[index]
    route(() => dispatch(index + 1))
}
dispatch(0)

// 第二种
let fn = app.middlewares.reduceRight((a, b) => {
    return () => b(a)
}, () => {})
fn()

// 第三种
let fn = app.middlewares.reduce((a, b) => {
    return (...args) => a(() => b(...args))
})
fn(()=>{})

```
### 代理
- 设置对象值的代理有好几种，访问器、__defineGetter__/__defineSetter__、defineProperty、proxy，下面我将演示前三种。根据不同的场景，选择合适的
```js
//  访问器
obj = {
  request: '123',
  get url1() {
    return this.request
  }
}
// defineProperty
Object.defineProperty(obj, 'url3', {
  get: function() {
    return this.request
  }
})
// __defineGetter__
obj.__defineGetter__('url2', function() {
  return this.request
})
obj
console.log(obj.url1)
console.log(obj.url2)
console.log(obj.url3)
```
### 源码解析
- koa使用的时候都是new koa ,所以我们将他写成一个class，继承events只要是为了用他订阅事件，这里主要对外提供了2个api，use和listen。use收集了所有的中间件，listen也就是简单的封装了下 调用了http.createServer，参数`req,res`抽离出来，主要处理中间件逻辑。
- handleRequest 里面的逻辑也就三步骤
  - 处理当前实例，原本实例上只有req和res。`context`主要就是代理的作用，将ctx.req 和ctx.request 对象下的值 进行双向绑定，一边变化，另一边数据进行同步。`request`主要就是获取的值 代理访问到req对象下中，同时还会增加一些原本req没有的属性，比如path解析路径。`response`也差不多，原生没有body，这里定义body拿到最后要返回的值,同时给设置值的时候，统一加上状态码200
  - 第二步，处理中间件，这里要注意异步，最后body的值肯定是等所有的中间件执行完成后，才能拿到最新的值。为了防止用户使用的时候不加async，我们给中间件返回值加上一个Promise.resolve，确保最后拿到的值可以then(如果都是同步的话，这里then会报错))。在使用use的时候 尽量在next 前面都加上await，要是不加，遇到后面中间件有异步处理的时候，body拿到的肯定不是最终的值。
  - 第三步就是肯定body的内容，给接口返回数据，不同的数据要设置不同的请求头，默认情况下都是下载请求头。最后通过catch获取中间件的异常，这里就用到了events的发布订阅。

- application.js
```js
let EventEmitter = require('events')
let http = require('http')
let context = require('./context')
let request = require('./request')
let response = require('./response')
class Application extends EventEmitter {
  constructor(pops) {
    super()
    this.middlewares = []
    this.context = Object.create(context)
    this.request = Object.create(request)
    this.response = Object.create(response)
  }
  createContext(req, res) {
    let ctx = this.context
    ctx.request = this.request //request内部自己封装的
    ctx.response = this.response
    ctx.req = ctx.request.req = req
    ctx.res = ctx.response.res = res
    return ctx
  }
  compose(ctx, middlewares) {
    // 主要处理了 promise 的逻辑
    function fn(index) {
      if (index === middlewares.length) return Promise.resolve()
      let route = middlewares[index]
      // Promise.resolve这里的处理是防止 函数一定要返回promise
      return Promise.resolve(route(ctx, () => fn(index + 1)))
    }
    return fn(0)
  }
  handleRequest(req, res) {
    // 先要创建一个context对象
    let ctx = this.createContext(req, res)
    // 要把所有的中间件进行组合
    // this.middlewares[0](ctx)
    let p = this.compose(ctx, this.middlewares)
    res.statusCode = 404;
    res.setHeader('Content-Disposition', 'attachment');
    p.then(function() {
      let body = ctx.body;
      if (body instanceof Stream) { // 先判断流，在判断是不是对象
        body.pipe(res); // 异步方法
      } else if (typeof(body) === 'number') {
        res.setHeader('Content-Type', 'text/plain;charset=utf8');
        res.end(body.toString());
      } else if (typeof body == 'object') {
        res.setHeader('Content-Type', 'application/json;charset=utf8');
        res.end(JSON.stringify(body));
      } else if (typeof body === 'string' || Buffer.isBuffer(body)) {
        res.setHeader('Content-Type', 'text/plain;charset=utf8');
        res.end(body);
      } else {
        res.end(`Not Found`);
      }
    }).catch(e => {
      this.emit('error', e);
    });
  }
  use(cb) {
    this.middlewares.push(cb)
  }
  listen(...args) {
    let server = http.createServer(this.handleRequest.bind(this))
    server.listen(...args)
  }
}

module.exports = Application
```
- context.js
```js
let proto = {}

// 正向代理 获取ctx.xx 的时候 他会代理到ctx[property].xx上
function defineGetter(property, key) {
  proto.__defineGetter__(key, function() {
    console.log('==get', property, key)
    return this[property][key]
  })
}
// 反向代理  给ctx.body 赋值的时候 他会设置到ctx[property].body 上
function defineSetter(property, key) {
  proto.__defineSetter__(key, function(val) {
    console.log('xxxx=》', property, key)
    this[property][key] = val
  })
}
defineGetter('request', 'path')
defineGetter('request', 'url')
defineGetter('response', 'body')
defineSetter('response', 'body')

module.exports = proto
```
- request.js
```js
let url = require('url')
module.exports = {
  get url() {
    // 映射到原本的url
    return this.req.url
  },
  get path() {
    let { pathname } = url.parse(this.req.url, true)
    return pathname
  }
}
```
- response.js
```js
module.exports = {
  set body(val) {
    this.res.statusCode = 200;
    this._body = val
  },
  get body() {
    return this._body
  }
}
```

## express
### 上手
- 可以先打断点简单的看下源码,通过下的测试，打断点进行查看
- 可以看到常用的 creatApplication application Router Route Layer 这五个类
```js
let express = require('express')
let app = express()
app.get('/', function(req, res) {
  res.end('hello')
})
app.listen(3000)
```
- 他和koa 逻辑大致一样，2步骤
  - 1、先利用`http.createServer`创建一个服务，在里面写请求内容的逻辑
  - 2、在listen监听服务即可
- 上面是简单的功能 先实现他(这里只是简单的弄了一个get请求)
  - 下面主要就实现了2个方法，get设置路由，listen监听开启服务
  - get 会收集所有的路由配置，放到router中
  - listen 在执行的时候 会创建`http.createServer` 通过req.url和router中的路径进行匹配,匹配到的 执行对应的回调,同时将当前的req,res 传给回调函数
```js
// 这是路由规则的窗口
let router = [
{
  path: '*',
  methods: '*',
  hander(req, res) {
    res.end(`Cannot ${req.methods} ${req.url}`)
  }
}]
let http = require('http')
let url = require('url')

function createApplication() {
  return {
    // get方法会把当前的路由数据放到router中
    get(path, hander) {
      router.push({
        path,
        method: 'get',
        hander
      })
    },
    listen() {
      let server = http.createServer((req, res) => {
        let { pathname } = url.parse(req.url)
        for (let i = 1; i < router.length; i++) {
          let { path, method, hander } = router[i]
          if (pathname == path && method == req.method.toLowerCase()) {
            return hander(req, res)
          }
        }
        router[0].hander(req, res)
      })
      server.listen.apply(server, arguments)
    }
  }
}
module.exports = createApplication
```
### 路由中间件
<img :src="$withBase('/img/expressMiddle.png')" >

```js
let express = require('express')
let app = express()
app.get('/1', function(req, res, next) {
  console.log('1')
  next()
}, function(req, res, next) {
  console.log('xxxxx')
  next()
})
app.get('/2', function(req, res, next) {
  console.log('2')
  next()
}).get('/3', function(req, res, next) {
  console.log('3')
  res.end('3')
  next()
})
app.listen(3000)
```
- 图片结合代码 描述路由中间件
- 正常情况下 路由会从上往下(或者从左往右)执行，上面代码写了3个路由，都是按顺序执行，他会先执行`/1`在执行`/2` 执行`/3`,但是需要调用next方法，next就是调用下一个中间件或者调用下一个路由。
- 但是注意`/1`里面有2个函数(中间件)，也就是说当前路由存放了2个中间件(可以存放更多中间件)，next执行就会调用下一个，如果不执行，后面的中间件就不会走，图片每个路由只有一个中间件，没有找到合适的图片。这个和koa的中间件类似。
- 路由执行完成后 还会返回他的实例 提供了链式写法。
- 在设计的时候，就要注意路由有2条线要走，第一条线贯穿整个路由，第二条线是单个路由所有的中间件
  - 第一条线 可以简单的理解为 每个路由下只有一个执行的方法，第一个路由匹配后在匹配第二个，这样下去
  - 第二条线  当某一条路由匹配成功后，里面多个执行函数，都通过next来调用下一个执行函数，要是不调用next就不会往下走  
- 文件设计
  - router/index.js 处理进来的路由，将所有的路由，存储到stack中，每一个路由(route)包括，path和路由里所有的处理函数(一群)
  - router/route.js 处理当前路径(path) 所有的函数， 进来的函数都会存到当前的stack中，每条存储的数据包括，method和当前处理函数(一个)
  - router/layer 处理当前一层的函数，包括路径(path)和要执行的函数。他是整个路由设计的核心，在`route`和`router`都用他处理
    - 第一个`router`是执行的每层路由，当匹配到路由(layer.path)，执行的layer的第二个参数(函数)。为什么传递进去的是`route.dispatch`(待会具体介绍)。
    - 第二个是`route`,也就是`route.dispatch`执行的内容。每个路由里面可能有多个执行函数，我们会先收集多有的方法和处理函数，函数和方法同样会通过`layer`处理，在加入到当前的stack中，里面有`dispatch`他的作用是循环执行当前的stack数据(清空当前stack数据)

### 代码(只写了get)
- 入口 lib/express.js
```js
let Application = require('./application')
function createApplication() {
  return new Application()
}
module.exports = createApplication
```
- 实例 lib/application.js
```js
let http = require('http')
let Router = require('./router')
let slice = Array.prototype.slice

function Application() {
  this._router = new Router()
}
// 这里是收集作用
Application.prototype.get = function(path, ...handler) {
  // 所有的get请求 都传递给Router 集中处理
  this._router.get(path, ...handler)
  // 这里返回this 作用是链式调用
  return this
}

// 当请求进来进入下面方法
Application.prototype.listen = function() {
  let server = http.createServer((req, res) => {
    // done 当没有匹配到的时候 执行他
    function done(req, res) {
      console.log('cannot')
      res.end(`Cannot ${req.method} ${req.url}`)
    }
    // 里面所有的函数 req,res,done 就是这个传进去的
    this._router.handle(req, res, done)
  })
  server.listen.apply(server, arguments)
}
module.exports = Application
```
- 路由处理,这里就开始每次请求的路由,router 处理的所有路由
- lib/router/index.js  
```js
let Route = require('./route')
let Layer = require('./layer')
let url = require('url')

function Router() {
  this.statck = []
}

Router.prototype._route = function(path) {
  let route = new Route(path)
  // 每一个请求路径 都对应一个layer 
  // layer 第二个参数就是路由里面 对应的执行函数,每个路由对应的执行函数数量都不固定，所有通过route.dispatch去循环执行里面的所有函数
  let layer = new Layer(path, route.dispatch.bind(route))
  layer.router = route
  // 当前layout层结构  就是的 path和一堆处理函数
  this.statck.push(layer)
  return route
}
// 配置所有路由 都会被收集 
// 这里只有get 他对应的路由是唯一的 他会生成一个Route实例 ，然后在通过他内部get方法 收集所有的处理方法(handler)
Router.prototype.get = function(path, ...handler) {
  console.log('arguments', handler.length)
  // 往当前路由添加路由
  let route = this._route(path)
  // 当route添加handle
  // console.log('get luyou', handler, handler.length)
  route.get(handler)
}

// 当请求路由的时候 就执行里面的方法
Router.prototype.handle = function(req, res, out) {
  let index = 0;
  let self = this
  let { pathname } = url.parse(req.url, true)

  function next() {
    // 他会自动执行所有的路由 最后执行完成会 调用之前传递的done
    if (index >= self.statck.length) {
      return out(req, res)
    }
    let layer = self.statck[index++]
    // 判断路径 layer.match(pathname) 请求的path 和 layer里面存的path 一样
    // 判断方法 layer.router.handler_method 
    // 当方法和路径同匹配上的时候  就执行当前的路由
    if (layer.match(pathname) && layer.router && layer.router.handler_method(req.method)) {
      layer.handler_request(req, res, next)
    } else {
      // 当上一层执行完成 就走下一层router
      next()
    }
  }
  next()
}
module.exports = Router
```
- route 处理一层的路由
- lib/router/route.js
```js
let Layer = require('./layer')
function Route(path) {
  this.path = path
  this.stack = []
  this.methods = {}
}
// handler_method 判断Route是否有此方法
Route.prototype.handler_method = function(method) {
  method = method.toLowerCase()
  return this.methods[method]
}
// get 收集所有的 同路由下的  处理函数
Route.prototype.get = function(handlers) {
  for (let i = 0; i < handlers.length; i++) {
    let handler = handlers[i]
    // 每一个函数都要创建一个 layer
    let layer = new Layer('/', handler)
    this.methods['get'] = true
    layer.method = 'get'
    this.stack.push(layer)
  }
}
// dispatch 就是派发stack 所有的数据
Route.prototype.dispatch = function(req, res, out) {
  let index = 0;
  let self = this
  // next 会传递给下一个next 
  function next() {
    if (index >= self.stack.length) {
      return out(req, res)
    }
    let layer = self.stack[index++]
    if (layer.method === req.method.toLowerCase()) {
      // next接受的当前的next 会传递给下一个
      layer.handler_request(req, res, next)
    } else {
      next()
    }
  }
  next()
}
module.exports = Route
```
- 核心的 layer 处理函数
- lib/router/layer.js
```js
// 实例化的时候 都会传递路径(path)和处理函数(handler) 
function Layer(path, handler) {
  this.path = path
  this.handler = handler
}
// 判断这一层 和传入的路径 是否匹配
Layer.prototype.match = function(path) {
  return this.path == path;
}
// handler_request 做了封装 原来的处理函数都会接受到 req,res,next 三个参数 next就是每次循环当前的stack时创建的next 函数 也就是调用自身
Layer.prototype.handler_request = function(req, res, next) {
  this.handler(req, res, next)
}
module.exports = Layer
```

### 补充路由方法
- 前面只有get方法，剩下的都一样只是做一个循环，可以用 methods 库进行循环
  - methods 包含所遇方法 是一个数组
- 对比
```js
// 只有get
Application.prototype.get = function(path, ...handler) {
  // 所有的get请求 都传递给Router 集中处理
  this._router.get(path, ...handler)
  // 这里返回this 作用是链式调用
  return this
}

// 所有方法
methods.forEach(method => {
  Application.prototype[method] = function(path) {
    this.lazyrouter()
    // 把path和处理函数 都传递给 处理路径
    this._router[method].apply(this._router, slice.call(arguments))
    return this
  }
})
```

### 增加 use 中间件
- 1、中间件其实和路由一样 区别是 use 的path可有可无,有的时候 就是挂载了路由容器,没的时候就是一个执行函数,而路由有path和执行函数
- 2、路由和中间件 都是一起执行的,也就是说route 和 use 收集的时候都存放在一起 执行的时候就一起跑
- 3、express.Router() 会创建一个新的路由容器或者说路由系统

- 首选要路由容器,此前Route是一个无返回的构成函数,执行的时候没有返回数据,现在要将他改成一个方法挂载到 express下面,用来创建一个新的路由容器,给中间件使用
- 修改Route 原则 技能被new 又能执行的时候返回数据对象
```js
// 以前的Route
function Router() {
  this.statck = []
}
  // 挂载方法
  Router.prototype.get = ()=>{} 
  // 挂载处理
  Router.prototype.handle = ()=>{}

// 现在的Route  此写法的Router 两用 既可以new 也可以直接执行
function Router(){
  function router(){
  }
  // router 继承 proto的属性
  Object.setPrototypeOf(router, proto)
  router.statck = []
  return router
}

let proto = Object.create(null)
proto.use = ()=>{}
proto.get = ()=>{}
proto.handle = ()=>{}
```
- 收集use 同样创建Layer 实例将他存放到 statck里面 和 router一样,用layer.router 来区别中间件和路由,中间件 是没有route 所有给undefined
```js
proto.use = function(path, handler) {
  if (typeof handler != 'function') {
    handler = path
    path = '/'
  }
  let layer = new Layer(path, handler)
  layer.router = undefined; // 我们正是通过layer有没有route来判断是中间件 还是路由
  this.statck.push(layer);
}
```

- 处理use 当匹配到当前层的时候  用`layer.router`判断是路由层还是中间层,上面说过 中间件的router都是undefined 
- 这里要对路径做处理,如果中间件有多层路径的时候 例如`app.use('/user', user)`。用`req.url = req.url.slice(removed.length)`重新截取url 在执行
- 截取之后,再次执行的时候 req.url 是缺失的 所以需要在次添加。`if(removed.length > 0)`这个条件就是中间件再次执行的时候 进入，将url给添加上
```js
proto.handle = function(req, res, out) {
  // slashAdded是否添加过/ removed指的是被移除的字符串
  let index = 0;
  let self = this;
  let slashAdded = false;
  let removed = '';
  let { pathname } = url.parse(req.url, true)
  // err 是接受错误处理
  function next(err) {
    if (removed.length > 0) {
      req.url = removed + req.url;
      removed = "";
    }
    if (index >= self.statck.length) {
      return out(req, res, err)
    }
    let layer = self.statck[index++]
    // 当前一层router
    if (layer.match(pathname)) {
      if (!layer.router) { //这一层是中间件层
        removed = layer.path;
        req.url = req.url.slice(removed.length)
        if (err) {
          layer.handler_error(err, req, res, next)
        } else {
          layer.handler_request(req, res, next)
        }
      } else {
        // 是路由
        if (layer.router && layer.router.handler_method(req.method)) {
          layer.handler_request(req, res, next)
        } else {
          // 下一层router
          next(err)
        }
      }
    } else {
      next(err)
    }
  }
  next()
}
``` 
### 路径参数
- 作用
  - 1、配置的路由是`app.get('/user/:uid/:name',function(){})`,当请求`localhosst://user/1/sg`的时候 uid和name能匹配到1和sg
  - 2、批量处理路径参数 
  
```js
  app.param('name', function(req, res, next, val, name) {
    req.user = { id: 1, name: 'zfpx' }
    next()
  })
  app.param('name', function(req, res, next, val, name) {
    req.user.name = 'zfpx2'
    next()
  })
```
- 用法
```js
let express = require('../express/express')
const app = express()

// 用来批量处理路径参数 
app.param('name', function(req, res, next, val, name) {
  req.user = { id: 1, name: 'zfpx' }
  next()
})
app.param('name', function(req, res, next, val, name) {
  req.user.name = 'zfpx2'
  next()
})
// 路径参数 因为参数在路径里面
app.get('/user/:uid/:name', function(req, res) {
  console.log(req.params) // 路径参数对象
  console.log(req.user)
  res.end('user')
})

app.listen(3000)
```
- 他有2个功能 第一个是匹配路径 第二个是批量处理路径参数
- 匹配路径 在`route/index`的时候判断`layer.match(pathname)`请求的url是否与layer里面存这的url匹配。match 匹配的时候通过`this.router` 来识别 是正常的路径还是use。`pathToRegexp`用来解析路由的(下面有方法原理)。`this.reg.exec(url)`获取的是所有配置分组项,也就是说有动态路径的时候才会返回true。同时还路径参数和对进行匹配 存放到`this.params`中。
- layer.js
```js
let pathToRegexp = require('path-to-regexp')
function Layer(path, handler) {
  this.path = path
  this.handler = handler
  // 存放 动态路径 匹配的值
  this.keys = []
  this.reg = pathToRegexp(this.path, this.keys)
}
Layer.prototype.match = function(url) {
  // 路由
  if (this.path == url) {
    return this.path == url
  }
  // 路径参数
  if (this.router) {
    this.params = {}
    let matchRs = this.reg.exec(url)
    if (matchRs) {
      for (let i = 1; i < matchRs.length; i++) {
        let key = this.keys[i - 1].name
        this.params[key] = matchRs[i]
      }
      return true
    }
  }
  // 中间件
  if (!this.router) {
    return url.startsWith(this.path)
  }
}
Layer.prototype.handler_request = function(req, res, next) {
  this.handler(req, res, next, 'n2')
}
Layer.prototype.handlerErr_request = function(err, req, res, done) {

  if (this.handler.lengtg == 4) {
    return done(err)
  }
  this.handler(err, req, res, done)

}
module.exports = Layer
```
- 批量处理路径参数
  - 第一步 先保存`proto.param`传递进来的函数，将相同name的保存到同一个数组中
  - 第二步 在路径匹配 执行回调函数的时候 进行拦截处理
  - 第三步 就是执行`process_params`函数,也就是处理之前保存的paramCallbacks数组中的数据,最后在执行上面的回调函数
```js
// proto.param 将所有的类路径参数 全部保存起来,相同的 全部存到同一个数组中 
proto.param = function(name, cb) {
  if (!this.paramCallbacks[name]) {
    this.paramCallbacks[name] = []
  }
  this.paramCallbacks[name].push(cb)
}


// 处理
proto.handle = function(req, res, done, a1) {
// ..... 
// 当路径匹配到，执行回来的时候 用 self.process_params方法对回调做拦截 
if (layer.router && layer.router.handle_method(req.method)) {
    req.params = layer.params
    self.process_params(layer, req, res, function() {
      layer.handler_request(req, res, next)
    })
  } else {
    next(err)
  }
// .....
}


proto.process_params = function(layer, req, res, done) {
  let paramCallbacks = this.paramCallbacks
  // layer.keys保存着所有的动态路由
  let keys = layer.keys
  // 当keys 没有的时候 直接返回
  if (!keys && keys.length == 0) {
    done()
  }

  let keyIndex = 0;
  let key = null;
  let name = null;
  let cbs = null;
  let val = null;

  function param() {
    if (keyIndex == keys.length) {
      return done()
    }
    key = keys[keyIndex++]
    name = key.name
    //  paramCallbacks[name] 存放的是多个情况
    cbs = paramCallbacks[name]
    val = req.params[name]
    if (!val || !cbs.length == 0) {
      return done()
    }
    execCallback()
  }
  let cbIndex = 0

  function execCallback() {
    let cb = cbs[cbIndex++]
    if (!cb) {
      return param()
    }
    cb(req, res, execCallback, val, name)
  }
  param()
}
```
-  里面用到一个库 `pathToRegexp` 专门用来解析路由匹配的,给他传递一个url(路径)和keys(空的数组),他返回匹配的正则,同时将路径参数寸放到keys中
```js
let path = '/user/:uid/:name';
let keys = []

function pathToRegexp(path, keys) {
  return path.replace(/\:([^\/]+)/g, ($1, $2, $3) => {
    keys.push({
      name: $2,
      replace: false
    })
    return '\:([^\/]+)'
  })
}

let rs = pathToRegexp(path, keys)
let str = '/user/123/weqw'
let a = rs.exec(str)
console.log(keys)
```

### 模板引擎
- 将数据和模板进行渲染
- 用法
```js
let express = require('../express/express')
const path = require('path')
const ejs = require('../express/html.js')
const app = express()
const fs = require('fs')
let url = require('url')

// views是用来设置模板存放根目录
app.set('views', path.resolve(__dirname, 'views'))
// 设置模板引擎 如果render没有指定模板后台名 会以这个作为后缀名
app.set('view engine', 'html')

// 用来设置模板引擎,遇到html结尾的模板用html来进行渲染
app.engine('html', ejs)


app.use(function(req, res, next) {
  res.render = function(name, options) {
    // 模板后缀
    let ext = '.' + app.get('view engine')
    // 模板文件的名字
    name = name.indexOf('.') == -1 ? name + ext : name
    // 模板位子
    let filepath = path.join(app.get('views'), name)
    // 通过模板后缀 获取对应的渲染引擎
    let render = app.engines[ext]
    function done(err, rs) {
      res.setHeader('Content-Type', 'text/html')
      res.end(rs)
    }
    render(filepath, options, done)
  }
  next()
})

// 当客户端以get方式访问/路径的时候执行对应的回调函数
app.get('/', function(req, res, next) {
  // render 第一个参数是模板的相对路径 模板名称 数据对象
  res.render('index', { title: 'helloxx', user: { name: 'zfxp' } })
})

app.listen(3000)
```
## express 插件
### body-parser 
- 里面包含了req.body的实现 他就是 将获取的数据解析成
```js
function bodyParser () {
    return function (req,res,next) {
        var result = '';
        req.on('data', function (data) {
            result+=data;
        });
        req.on('end', function () {
            try{
                req.body = JSON.parse(result);
            }catch(e){
                req.body = require('querystring').parse(result);
            }
            next();
        })
    }
};
```

### 触发 options 条件
- options 发送的不是get和post 并且带请求头的话  会先发一个options请求,来确认能不能访问 在发送
- 使用了PUT、DELETE、CONNECT、OPTIONS、TRACE、PATCH方法
- 人为设置了非规定内的其他首部字段，如果Content-Type设置text/plain无效

### cors 跨域 && http常用请求头
- `Access-Control-Allow-Origin`:`*` 当设置*的时候 cookie 会有问题
- `Access-Control-Allow-Headers`:`xx` 允许携带的请求头
- `Access-Control-Allow-Methods`:`PUT,POST` 允许那些请求方式 (post和get是默认)
- `Access-Control-Allow-Credentials`:true 允许携带凭证(cookies)
- `Access-Control-Expoes-Headers`:`` 允许获取请求头
- `Access-Control-Max-Age`:`10` 允许预检存活的时间 10s内 options 请求只会发一次

```js
function cors() {
  return function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', "*")
    //允许携带哪个头访问我
    res.setHeader('Access-Control-Allow-Headers', 'name')
    //允许哪个方法访问我 默认post get
    res.setHeader('Access-Control-Allow-Methods', 'PUT')
    //允许携带cookie  但是Access-Control-Allow-Origin 不能设置 * 其他都可以
    res.setHeader('Access-Control-Allow-Credentials', true)
    //允许前端获取哪个头
    res.setHeader('Access-Control-Expose-Headers', 'name,ss')
    //预检的存活时间 10s内 options请求只会发一次  
    res.setHeader('Access-Control-Max-Age', 10)
    if (req.method.toLowerCase() == 'options') {
      res.end()
    }
    next()
  }
}
```
### post 三种提交方式
- json
- 请求头 `('Content-Type', 'application/json')`
  - request和axios一样都是用来发送请求数据
- 后端用 body-parser 接收即可
```html
<!-- js版本发送 -->
<!DOCTYPE html>
<html lang="en">

<body>
  <div>112</div>
  <script>
    let ajax = new XMLHttpRequest()
    ajax.open('post', 'http://localhost:3001/post', true)
    ajax.setRequestHeader('Content-Type', 'application/json')
    ajax.onreadystatechange = function() {
      if (ajax.readyState == 4) {
        if (ajax.status == 200) {
          console.log(ajax.responseText)
        }
      }
    }
    let data = { "data": "xxx" }
    data = JSON.stringify(data)
    ajax.send(data)
  </script>
</body>
</html>
<!-- node版本 -->
<script>
let request = require('request')
let options = {
  url: 'http://localhost:3001/post', //路径
  method: 'POST', //请求方式
  json: true, //希望返回的数据格式 是json格式
  headers: { //请求头
    "Content-Type": "application/json"
  },
  body: {
    name: 'sg',
    age: 18
  }
}

request(options, function(err, response, body) {
  console.log('err', err)
  console.log('status', response.statusCode)
  console.log('success', body)
})
</script>
```
- 表单格式 
- 请求头`('Content-Type','application/x-www-urlencoded')`
- html表单提交的时候 不涉及跨域  因为不需要返回值
```html
<!DOCTYPE html>
<html lang="en">
<body>
  <form method="POST" action="http://localhost:3001/form">
    <input type="text" name='name'>
    <input type="text" name='age'>
    <input type="submit" value="提交">
  </form>
</body>
</html>

<script>
let request = require('request')
let options = {
  url: 'http://localhost:3001/form', //路径
  method: 'POST', //请求方式
  json: true, //希望返回的数据格式 是json格式
  headers: { //请求头
    "Content-Type": "application/x-www-urlencoded"
  },
  form: {
    name: 'sg',
    age: 18
  }
}
// 表单用form 类似body
request(options, function(err, response, body) {
  console.log('err', err)
  console.log('status', response.statusCode)
  console.log('success', body)
})
</script>
```

- file
- `enctype='multipart/form-data'`
```html
<!DOCTYPE html>
<html lang="en">
<body>
  <!-- 图片必须加 enctype="multipart/form-data" -->
  <!-- 最终提交的和3file.js文件中的formData 格式一样 -->
  <form enctype="multipart/form-data" action="http://localhost:3001/upload" method="POST">
    <input type="text" name="name">
    <input type="file" name="avatar">
    <input type="submit" value="提交">
  </form>
</body>
</html>

<script>
let request = require('request')
const fs = require('fs')
let path = require('path')
let url = 'http://localhost:3001/upload'
let formData = {
  name: 'sg',
  avatar: { //文件类型
    value: fs.createReadStream(path.join(__dirname, 'baidu.png')), // 这是一个可读流,存放头像的内容
    options: {
      filename: 'baidu.png',
      contentType: 'image/png'
    }
  },
}
// url formData 格式都是写死的
request.post({ url, formData }, function(err, response, body) {
  console.log('err', err)
  // console.log('status',response.statusCode)
  console.log('success', body)
})
</script>
```

- server.js
```js
// bodyParser 和 req.body 实现
let express = require('../express/express')
const path = require('path')
let multer = require('multer')
const app = express()
let url = require('url')
let bodyParser = require('body-parser');
let fs = require('fs')
app.use(cors())
// app.use(myBodyParser())
// 接收 json 格式
app.use(bodyParser.json())
// 处理表单格式的请求体
app.use(bodyParser.urlencoded({ extended: true }));
// 文件上传 upload req.file获取文件的流   dest req.file 获取的保存路径
let upload = multer({ upload: 'upload/' })
app.post('/post', function(req, res, next) {
  let str = req.body
  console.log('str', req.body)
  res.end('str')
})
app.post('/form', function(req, res, next) {
  let str = req.body
  console.log('form', req.body)
  res.end('form')
})
// 只有一个文件类型的用upload.single('avatar') 处理
app.post('/upload', upload.single('avatar'), (req, res) => {
  // req.file 里面存放的文件类型的数据
  // req.body 里面存放的普通类型的数据
  console.log(req.body.name, typeof req.body)
  console.log(req.file); //req.filr 指的是请求体formData里的avatar 字段对应的文件内容
  // console.log(req.file.buffer); //req.filr 指的是请求体formData里的avatar 字段对应的文件内容
  if (req.file) {
    // 将图片写入本地
    fs.writeFileSync(path.join(__dirname, `upload/${req.file.originalname}`), req.file.buffer)
  }

  res.end('file')
})
app.listen(3001)


// //  用来接收 post 参数
function myBodyParser() {
  return function(req, res, next) {
    let rs = []
    req.on('data', function(data) {
      rs += data
    })
    req.on('end', function(data) {
      try {
        req.body = JSON.parse(rs)
        console.log('11', req.body)
      } catch (e) {
        req.body = require('querystring').parse(rs)
        console.log('22', req.body)
      }
      next()
    })
  }
};

function cors() {
  return function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', "*")
    //允许携带哪个头访问我
    res.setHeader('Access-Control-Allow-Headers', 'Content-type,Content-type1')
    //允许哪个方法访问我 默认post get
    res.setHeader('Access-Control-Allow-Methods', 'PUT')
    //允许携带cookie  但是Access-Control-Allow-Origin 不能设置 * 其他都可以
    res.setHeader('Access-Control-Allow-Credentials', true)
    //允许前端获取哪个头
    res.setHeader('Access-Control-Expose-Headers', 'name,ss')
    //预检的存活时间 10s内 options请求只会发一次  
    res.setHeader('Access-Control-Max-Age', 1)
    if (req.method.toLowerCase() == 'options') {
      console.log('12312', req.method.toLowerCase())
      res.end()
    }
    next()
  }
}
```

## [expres中间件资源](https://cnodejs.org/topic/545720506537f4d52c414d87)