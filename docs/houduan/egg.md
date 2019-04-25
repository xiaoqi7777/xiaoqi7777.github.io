# egg
[[toc]]

:::tip egg.js 流程
client => controller => server => mysql 
mysql => server => controller => cliect
:::


## 安装
  - cnpm i egg --save 上线用
  - cnpm i egg-bin --save-dev  开发用
## 配置启动脚本
  - "dev":"egg-bin dev"

## 跑通路由(目录结构)
```js      
      ├─app
      │  │─router.js
      │  ├─controller
      │  │      news.js
      ├─config
      │      config.default.js
      |─package.json
```
## 配置路由
```js      
  app/router.js
    module.exports = app => {
        const { router, controller } = app;
        router.get('/news', controller.news.index);
    }
```
## 编写控制器
```js
app\controller\news.js
  const { Controller } = require('egg');
  class NewsController extends Controller {
      async index() {
          this.ctx.body = 'hello world';
          // ctx.body 是响应体的对象
          // ctx.text 是响应体的文本
          // ctx.render 渲染
      }
  }
  module.exports = NewsController;
```
## 编写配置文件
```js
  exports.keys = 'zfpx';
```

- 访问
    |   文件	    |  app     |   ctx    |     service   |	config	    |    logger   	|  helper |
   | ----------- | ----------|  ----    | -----------   |  -----      |  ----         |  ----  |
    |  Controller  |	this.app |	this.ctx |	this.service |	this.config |	this.logger |	this.app.helper |
  |  Service	   |  this.app |	this.ctx |	this.service |	this.config |	this.logger	| this.app.helper |

## 静态文件中间件
- Egg 内置了 static 插件
- static 插件默认映射 /public/ -> app/public/ 目录
- 把静态资源都放到 app/public 目录即可

## 使用模板引擎
```js
      ├─app
      │  │─router.js
      │  ├─controller
      │  │      news.js   
      │  ├─public
      │  │  ├─css
      │  │  │      bootstrap.css  
      │  │  └─js
      │  │          bootstrap.js         
      │  └─view
      │          news.html       
      ├─config
      │   config.default.js
      │   plugin.js
```
- egg-view-nunjucks 模板引擎
```js
 cnpm install egg-view-nunjucks --save
 
 启用插件
 {ROOT}\config\plugin.js
  exports.nunjucks = {
      enable: true,
      package: 'egg-view-nunjucks'
  }

  配置模板
  {ROOT}\config\config.default.js
  module.exports=app => {
    let config={};
    config.keys='zfpx';
    config.view={
        defaultExtension: '.html',
        defaultViewEngine: 'nunjucks',
        mapping: {
            '.html':'nunjucks'
        }
    }
    return config;
  }

  编写模板
  app\view\index.html
  <div class="container">
    <div class="row">
        <div class="col-md-8 col-md-offset-2">
          {% for item in list%}
                <div class="panel panel-default">
                    <div class="panel-heading">
                      <h3 class="text-center">{{item.title}}</h3>
                    </div>
                    <div class="panel-body">
                        <img src="{{item.image}}" class="img-responsive center-block">
                    </div>
                    <div class="panel-footer">
                        <h3>{{item.createAt}}</h3>
                    </div>
                </div>
            {% endfor %}
        </div>
    </div>

  编写控制器
  app\controller\news.js
  const {Controller}=require('egg');
  class NewsController extends Controller{
      async index() {
          const {ctx}=this;
          const list=[
              {
                  id: '45154322_0',
                  title: '世界首富早晚是这个人，坐拥7家独角兽公司，估值破数万！',
                  url: 'http://tech.ifeng.com/a/20180904/45154322_0.shtml',
                  image:'http://p0.ifengimg.com/pmop/2018/0905/CFFF918B94D561D2A61FB434ADA81589E8972025_size41_w640_h479.jpeg'
              },
              {
                  id: '16491630_0',
                  title: '支付宝们来了！将来人民币会消失吗？',
                  url: 'http://finance.ifeng.com/a/20180907/16491630_0.shtml',
                  image:'http://p0.ifengimg.com/pmop/2018/0907/2AF684C2EC49B7E3C17FCB13D6DEEF08401D4567_size27_w530_h369.jpeg'
              },
              {
                  id: '2451982',
                  title: '《福布斯》专访贝索斯：无业务边界的亚马逊 令对手生畏的CEO',
                  url: 'https://www.jiemian.com/article/2451982.html',
                  image:'https://img1.jiemian.com/101/original/20180907/153628523948814900_a580x330.jpg'
              }
          ];
          await ctx.render('index',{list});
      }
  }
  module.exports=NewsController;
```

## 读取远程接口服务
- 在实际应用中，Controller 一般不会自己产出数据，也不会包含复杂的逻辑，复杂的过程应抽象为业务逻辑层 Service
- 添加配置
```js
    config.default.js
    config.news={
            newsListUrl: 'https://xxx/news',
    }

    编写Service 
      app/service/news.js
      const {Service}=require('egg');
      class NewsService extends Service {
          async list() {
              const {ctx}=this;
              const {newsListUrl}=this.config.news;
              const result=await ctx.curl(newsListUrl,{
                  method: 'GET',
                  dataType:'json'
              });
              return result.data.data;
          }
      }
      module.exports=NewsService;

    编写控制层
      app/controller/news.js
      const {Controller}=require('egg');
      class NewsController extends Controller{
          async index() {
              const {ctx,service}=this;
              const list=await service.news.list();
              await ctx.render('index',{list});
          }
      }
      module.exports=NewsController;
```
## 扩展工具方法
- 框架提供了一种快速扩展的方式，只需在app/extend目录下提供扩展脚本即可
- Helper 函数用来提供一些实用的 utility 函数。
- 访问方式 通过 ctx.helper 访问到 helper 对象
```js
  app\extend\helper.js
    const moment=require('moment');
    moment.locale('zh-cn');
    exports.fromNow=dateTime => moment(new Date(dateTime)).fromNow();

  app\controller\news.js
    list.forEach(item => {
        item.createAt=ctx.helper.fromNow(item.createAt);
        return item;
    });

  app\view\index.html
    时间: {{helper.fromNow(news.createAt)}}
```

## 中间件
```js
  // 进路由之前 都会先走中间件
  app/middleware/robot.js
    module.exports=(options,app) => {
        // options 对应 config.robot
        return async function(ctx,next) {
          // user-agent 获取浏览器的信息
            const source=ctx.get('user-agent')||'';
            const matched=options.ua.some(ua => ua.test(source));
            if (matched) {
                ctx.status=403;
                ctx.body='你没有访问权限';
            } else {
                await next();
            }
        }
    }
  
  config.default.js
    config.middleware=[
        'robot'
    ]
    config.robot={
        ua: [
            /Chrome/
        ]
    }
```
## 运行环境
- 框架有两种方式指定运行环境：
  - 通过 config/env 文件指定，该文件的内容就是运行环境，如 prod。
  - 通过 EGG_SERVER_ENV 环境变量指定。
  - 框架提供了变量 app.config.env 来表示应用当前的运行环境。
  - 支持按环境变量加载不同的配置文件，如 config.local.js， config.prod.js 等等

| EGG_SERVER_ENV |	  说明     |
|  -------       |     ----    |
| local	         | 本地开发环境 |
| prod	         |  生产环境    |
```js
  // cross-env 可以兼容windows和mac
  npm install  cross-env --save-dev

  "scripts": {
      "dev": "cross-env EGG_SERVER_ENV=local  egg-bin dev",
      "debug": "egg-bin debug"
  }
```

## 单元测试
- power-assert 断言 (egg都内置了)
- mochajs 测试
- 测试目录
  - 约定test 目录为存放目录
  - 测试脚本文件统一按 ${filename}.test.js 命名，必须以 .test.js 作为文件后缀。 一个应用的测试目录示例：

```js
  test
  ├── controller
  │   └── news.test.js
  └── service
    └── news.test.js
```
-  测试运行工具 
 - 统一使用 egg-bin 来运行测试脚本， 自动将内置的 Mocha、co-mocha、power-assert，nyc 等模块组合引入到测试脚本中， 让我们聚焦精力在编写测试代码上，而不是纠结选择那些测试周边工具和模块。
```js
  "scripts": {
      "test": "egg-bin test",
      "cov": "egg-bin cov"
    }
```

### mock
- egg.js单独为框架抽取了一个测试 mock 辅助模块：egg-mock， 有了它我们就可以非常快速地编写一个 app 的单元测试，并且还能快速创建一个 ctx 来测试它的属性、方法和 Service 等。
```js
  cnpm i egg-mock -D
```

### app 
- 在测试运行之前，我们首先要创建应用的一个 app 实例， 通过它来访问需要被测试的 Controller、Middleware、Service 等应用层代码。
```js
  // test/controller/home.test.js
  const { app, mock, assert } = require('egg-mock/bootstrap');

  describe('test/controller/news.test.js', () => {

  });
```
### 钩子函数
```js
  describe('egg test', () => {
    before(() => console.log('order 1'));
    before(() => console.log('order 2'));
    after(() => console.log('order 6'));
    beforeEach(() => console.log('order 3'));
    afterEach(() => console.log('order 5'));
    it('should worker', () => console.log('order 4'));
  });
```
### ctx
-  test/controller/news.test.js
```js
    const { app, mock, assert } = require('egg-mock/bootstrap');
    describe('test/controller/news.test.js', () => {
      it('should get a ctx', () => {
        const ctx=app.mockContext({
              session: {
                user:{name:'zfpx'}
            }
        });
        assert(ctx.method === 'GET');
        assert(ctx.url==='/');
        assert(ctx.session.user.name == 'zfpx');
      });
    });
```

### 异步测试
- test/controller/news.test.js
```js
  //egg-bin 支持测试异步调用，它支持多种写法
  it('promise',() => {
    return app.httpRequest().get('/news').expect(200);
  });
  it('callback',(done) => {
      app.httpRequest().get('/news').expect(200,done);
  });
  it('async',async () => {
      await app.httpRequest().get('/news').expect(200);
  });

```

### Controller 
- test/controller/user.test.js
- app.httpRequest()是 egg-mock 封装的 SuperTest 请求实例
### 准备数据
-  app/router.js
```js
  router.get('/add',controller.user.add);
  router.post('/doAdd',controller.user.doAdd);
```
- app/controller/user.js
```js
    const {Controller}=require('egg');
    let users=[];
    class UserController extends Controller{
        async index() {
            let {ctx}=this;
            await ctx.render('user/list',{users});
        }
        async add() {
            let {ctx}=this;
            await ctx.render('user/add',{});
        }
        async doAdd() {
            let {ctx}=this;
            let user=ctx.request.body;
            user.id=users.length>0?users[users.length-1].id+1:1;
            users.push(user);
            ctx.body = user;
        }
    }
    module.exports=UserController;
```
### user.test.js
- test/controller/user.test.js
```js
  const { app, mock, assert } = require('egg-mock/bootstrap');
  it('test post',async () => {
      let user={username: 'zfpx'};
      app.mockCsrf();
      let response=await app.httpRequest().post('/doAdd').send(user).expect(200);
      assert(response.body.id == 1);
  });
```


### service 
- Service 相对于 Controller 来说，测试起来会更加简单
- 我们只需要先创建一个 ctx，然后通过 ctx.service.${serviceName} 拿到 Service 实例， 然后调用 Service 方法即可。
- test/service/user.test.js
```js
  const { app, mock, assert } = require('egg-mock/bootstrap');
  const {app,assert}=require('egg-mock/bootstrap');
  describe('test/service/news.test.js',() => {
      it('newsService',async () => {
          let ctx=app.mockContext();
          let result=await ctx.service.news.list(1,5);
          assert(result.length == 3);
      });
  });
```

### Extend 测试 
- 应用可以对 Application、Request、Response、Context 和 Helper 进行扩展。 我们可以对扩展的方法或者属性针对性的编写单元测试。
- egg-mock 创建 app 的时候，已经将 Application 的扩展自动加载到 app 实例了， 直接使用这个 app 实例访问扩展的属性和方法即可进行测试。
-  app/extend/application.js 
```js
  let cacheData={};
  exports.cache={
      get(key) {
          return cacheData[key];
      },
      set(key,val) {
          cacheData[key]=val;
      }
  }
```
- test/app/extend/cache.test.js

```js
  const { app, mock, assert } = require('egg-mock/bootstrap');
  describe('test/app/extend/cache.test.js', () => {
      it('cache',async () => {
          app.cache.set('name','zfpx');
          assert(app.cache.get('name') == 'zfpx');
    });
  });
```

### context
- Context 测试只比 Application 多了一个 app.mockContext() 步骤来模拟创建一个 Context 对象。
- app\extend\context.js
```js
  exports.language=function () {
      return this.get('accept-language');
  }
```
- test/app/extend/context.test.js
```js
  const { app, mock, assert } = require('egg-mock/bootstrap');
  describe('test/app/extend/context.test.js',() => {
      let language="zh-cn";
      it('test language',async () => {
          const ctx=app.mockContext({headers: {'Accept-Language':language}});
          //console.log('ctx.lan',ctx.lan())
          assert(ctx.language() == language);
    });
  });
```

### Request
- 通过 ctx.request 来访问 Request 扩展的属性和方法，直接即可进行测试。 app\extend\request.js
```js
  module.exports={
      get isChrome() {
          const userAgent=this.get('User-Agent').toLowerCase();
          return userAgent.includes('chrome');
      }
  }
```
- test\extend\request.test.js
```js
  const { app, mock, assert } = require('egg-mock/bootstrap');
  describe('test/app/extend/request.test.js',() => {
      it('cache',async () => {
          const ctx=app.mockContext({
              headers: {
                  'User-Agent':'I love Chrome'
              }
          });
          assert(ctx.request.isChrome);
    });
  });
```

### response
- Response 测试与 Request 完全一致。 通过 ctx.response 来访问 Response 扩展的属性和方法，直接即可进行测试。 
- app\extend\response.js
```js
  module.exports = {
    get isSuccess() {
      return this.status === 200;
    },
  };
```
- test\extend\response.test.js
```js
  describe('isSuccess()', () => {
    it('should true', () => {
      const ctx = app.mockContext();
      ctx.status = 200;
      assert(ctx.response.isSuccess === true);
    });

    it('should false', () => {
      const ctx = app.mockContext();
      ctx.status = 404;
      assert(ctx.response.isSuccess === false);
    });
  });
```

### Helper
- Helper 测试方式与 Service 类似，也是通过 ctx 来访问到 Helper，然后调用 Helper 方法测试
- app\extend\helper.js
```js
  module.exports = {
    money(val) {
      const lang = this.ctx.get('accept-language');
      if (lang.includes('zh-cn')) {
        return `￥ ${val}`;
      }
      return `$ ${val}`;
    },
  };
```

- test\extend\helper.test.js
```js
  describe('money()', () => {
    it('should RMB', () => {
      const ctx = app.mockContext({
        // 模拟 ctx 的 headers
        headers: {
          'Accept-Language': 'zh-cn',
        },
      });
      assert(ctx.helper.money(100) === '￥ 100');
    });

    it('should US Dolar', () => {
      const ctx = app.mockContext();
      assert(ctx.helper.money(100) === '$ 100');
    });
  });
```
