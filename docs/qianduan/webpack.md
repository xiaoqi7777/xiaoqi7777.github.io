# webpack

[[toc]]
- 安装
  - yarn add webpack webpack-cli -D(webpack 必安装的2个)
  - webpack可以进行0配置(npx webpack  默认会打包下文件src)

## 手动配置
- 创建webpack.config.js(文件名字默认的)
- 如果要修改webpack.config.js名字 就只能通过 pack.json 
  - 打包 "build":"webpack --config webpack.config.xxx.js"
  - 开启静态服务 "dev": "webpack-dev-server"
```js
path = require('path')
//生成html插件
let HTMLWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  devServer:{// 开发服务器的配置 默认8080
    port:3000, // 端口
    open:true, // 直接在浏览器打开
    progress:true,// 开启进度条
    contentBase:'./dist',//开启服务 指定路径
    compress:true//压缩
  },
  mode:"development",//模式 production development
  entry:{
    //ss 入口的名字
    ss:path.join(__dirname,'src/index.js')
  },//入口
  output:{
    //打包后的文件名 [name]指向 entry的ss 若只有路径 默认是main [hash:8] 后面会带一串字符 :8 长度是8  
    filename:'[name].[hash:8].js',
    path:path.join(__dirname,'dist'),//路径必须是一个绝对路径
  },
  plugins:[
    //数组放着所有的webpack插件
    new HTMLWebpackPlugin({
      template:'./src/index.html', //模板 路径
      filename:'index.html', // 生成的文件名字
      minify:{
        removeAttributeQuotes:true,// 删除html ""
        collapseWhitespace:true,// 生成一行
      },
      hash:true,//引入的文件生成hash
    })
  ],
  module:{
    // 模块
    rules:[//规则
      {
        // css-loader 主要解析 @import这类语法的
        // style-loader 他是把css  插入到head的标签底部
        // loader用法  一个用字符串 多个用[],顺序默认从右向左执行,从下向上
        //             还可以写成对象
        test:/\.css$/,
        use:[
          {
            loader:'style-loader',
            options:{//修改插入的方式
              insertAt:'top'
            }
          },
            'css-loader'
        ]
      },
      {
        // less 安装 yarn add less less-loader -D
        test:/\.less$/,
        use:[
          {
            loader:'style-loader',
            options:{//修改插入的方式
              insertAt:'top'
            }
          },
            'css-loader',
            'less-loader'//把less -> css
        ]
      }
    ]
  }
}
```

### css处理
  - 创建一个postcss.config.js

```js
// postcss.config.js
module.exports = {
  plugins:[require('autoprefixer')]
}

//  yarn add mini-css-extract-plugin -D  处理css
//  optimize-css-assets-webpack-plugin 压缩css
//  uglifyjs-webpack-plugin 压缩js
//  yarn add postcss-loader autoprefixer 处理css前缀
let MiniCssExtractPlugin = require('mini-css-extract-plugin')
let OptimizeCss = require('optimize-css-assets-webpack-plugin')
let UgligyJs = require('uglifyjs-webpack-plugin')

module.exports = {
  optimization:{//优化
    minimizer:[
      new OptimizeCss(), //压缩css
      new UgligyJs({
        cache:true,
        parallel:true,
        sourceMap:true
      }),//压缩js js需要babel处理不然会报异常
    ]
  },
  module:{
    rules:[
      {
        test:/.css$/,
        user:[
          MiniCssExtractPlugin.loader,// 和style-loader的区别 他是用插件抽离了在放到页面中
          'css-loader',
          'postcss-loader',
        ]
      },
      {
        test:/\.less$/,
        use:[
          MiniCssExtractPlugin.loader,
          'css-loader',
          'less-loader',//把less -> css
          'postcss-loader',
        ]
      }
    ]
  },
  plugins:[
    new MiniCssExtractPlugin({
      filename:'main.css'
    })
  ]
}
```

### js
- babel
```js
  // yarn add babel-loader @babel/core @babel/preset-env
  // babel-loader 将语法转换
  // @babel/core 核心模块
  // @babel/preset-env 将高级的语法转换成 低级
  // @babel/plugin-proposal-class-properties 处理es7 
  
  // 下面两个是一起的
  // yarn add  @babel/plugin-transform-runtime -D //处理 generator
  // yarn add @babel/runtime //生成依赖 

  // yarn add @babel/polyfill  //生成依赖  处理实例上的方法 'xx'.includes('a')
  
  // yarn add eslint eslint-loader -D 
  module:{
    // 模块
    rules:[//规则 顺序默认从右向左执行,从下向上
      {
        test:/\.js$/,
        use:{
          loader:'eslint-loader',
          options:{
            enforce:'pre'//设置执行顺序 previoues提前 默认是普通 post后面
          }
        },
      },
      {
        test:/\.js$/,
        use:{
          loader:'babel-loader',
          options:{// 用babel-loader 需要把es6->es5
            presets:['@babel/preset-env'],// 这个是大插件的集合
            plugins:[// 可选
              ["@babel/plugin-proposal-decorators",{"legacy":true}],//处理装饰器
              ['@babel/plugin-proposal-class-properties',{"loose":true}],//处理class
              "@babel/plugin-transform-runtime"

            ]

          }
        }
      },
    ]
  }
```

### jquery&&全局问题
```js
  // 引入第三方模块 cnpm i -S jquery
  1、 expose-loader 暴露到window上  //window.$可以获取到
    cnpm i -D expose-loader
    rules:[
      {
        test:require.resolve('jquery'),
        use:'expose-loader?$'
      }
    ]

  2、  webpack 插件的ProvidePlugin属性
      let webpack = require('webpack')
      new webpack.ProvidePlugin({
        //提供插件 在每个模块中都注入$
        $:'jquery'
      })
  3、cnd引入 import $ from 'jquery' jquery不打包
    externals:{
      jquery:"$"
    }  
```

### 图片处理
- 1、在js中创建图片来引入
- 2、在css引入 backgroud('url')
- 3、<img src='' alt=''/>
```js
  // js引入 import logo from './1.jpeg'; 会将图片转换成hash戳
  // 打包:默认会在内部生成一张图片 到build目录下  把生成的图片名字返回回来
  // file-loader 不用了 
  {
    test:/\.(png|jpeg|gif)$/,
    use:'file-loader'
  },
  // url-loader 多用这个
  //  url-loader 可以处理base64 当我们图片小于多少K用base64 来转化 否则用file-loader产生真实的图片
  {
    test:/\.(png|jpeg|gif)$/,
    use:{
      loader:'url-loader',
      options:{
        limit:200*1024,
        outputPath:'img/'
      }
    }
  },
  // html-withimg-loader处理html里面引入图片
  {
    test:/.html$/,
    use:'html-withimg-loader'
  },
```

### 文件分类打包
```js
  // css /css 就是文件夹
  new MiniCssExtractPlugin({
    filename:'/css/main.css'
  }),
  // img   outputPath:'img/' 指定输出文件 base64就不会打包进来
  {
    test:/\.(png|jpeg|gif)$/,
    use:{
      loader:'url-loader',
      options:{
        limit:1,
        outputPath:'img/'
      }
    }
  },
  // 公共路径 打包出来 都会带这个
  output:{
    publicPath:'http//www.xxx.com'
  }
  // 或者只在图片上加公共路径
    {
    test:/\.(png|jpeg|gif)$/,
    use:{
      loader:'url-loader',
      options:{
        limit:1,
        outputPath:'img/',
         publicPath:'http//www.xxx.com'
      }
    }
  },
```

## 高级配置

### 多页配置
```js
let path = require('path');
let HTMLWebpackPlugin = require('html-webpack-plugin')
module.exports = {
  //多入口
  mode:'development',
  entry:{
    home:'./src/index.js',
    other:'./src/other.js',
  },
  output:{
    // [name] 就是一个变量 代表 entry的key值
    filename:'[name].js',
    path:path.resolve(__dirname,'dist')
  },
  plugins:[
    // 默认都会引入到html里面,要加chunks
    new HTMLWebpackPlugin({
      template:'./index.html',
      filename:'home.html',
      chunks:['home']
    }),
    new HTMLWebpackPlugin({
      template:'./index.html',
      filename:'other.html',
      chunks:['other']
    })
  ]
}
```
### source-map
- devtool：
  - 1、source-map
    - 源码映射 会单独生成一个source map文件 会标识 当前报错的列和行 打包会生成一个文件 大而全
  - 2、eval-source-map
    - 不会产生单独的文件 但是可以显示行和列 
  - 3、cheap-module-source-map
    - 不会产生列 但是是一个单独的映射文件
  - 4、cheap-module-eval-source-map
    - 不会产生文件 集成在打包后的文件 不会产生列
```js
let path = require('path');
let HTMLWebpackPlugin = require('html-webpack-plugin')
module.exports = {
  mode:'development',
  entry:{
    home:'./src/index.js',
  },
  devtool:'source-map',
  module:{
    rules:[
      {
        test:/\.js$/,
        use:{
          loader:'babel-loader',
          options:{
            presets:['@babel/preset-env']
          }
        }
      }
    ]
  },
  output:{
    filename:'[name].js',
    path:path.resolve(__dirname,'dist')
  },
  plugins:[
    new HTMLWebpackPlugin({
      template:'./index.html',
      filename:'other.html',
    })
  ]
}
```
### watch&&监控打包
- watch作用监控打包 修改代码就会重新打包
```js
  watch:true,
  watchOptions:{// 监控的选项
    poll:1000, // 每秒问我 1000次
    aggregateTimout:500, // 防抖 我一直输入代码 停止输入后的500
    ignored:/node_modules/  // 不需要进行监控那个文件 
  }
```

### 小插件
- cleanWebpackPlugin
  - clean-webpack-plugin
- copyWebpackPlugin
  - copy-webpack-plugin
- bannerPlugin内置的 
```js
  //删除dist文件
  let CleanWebpackPlugin =  require('clean-webpack-plugin')
  plugins:[
      new CleanWebpackPlugin(),    
  ]
  //拷贝文件
  let CopyWebpackPlugin = require('copy-webpack-plugin')
  plugins:[
      new CopyWebpackPlugin([
        {from:'./doc',to:'./'}
      ]),    
  ]
  // 版权声明
  let webpack = require('webpack')
    plugins:[
      new webpack.BannerPlugin('make xxxx')//打包的js文件都加入()内的话 
  ]
```

### 跨域
- 重写的方式 把请求代理到express 服务器
```js
devServer:{// 开发服务器的配置 默认8080
    port:3000, // 端口
    open:true, // 直接在浏览器打开
    progress:true,// 开启进度条
    contentBase:'./dist',//开启服务 指定路径
    compress:true//压缩
  // 1代理
  proxy:{//配置代理
    '/api':{
      target:'http://localhost:3000',
      pathRwerite:{
        'api':''// api会被替换成""
      }
    }
  },
  //2 模拟数据
  before(app){//提供的方法 钩子
    app.get('/user',(req,res)=>{
      res.json({name:'xxx'})
    })
  },
  //3 在服务端 不用代理 在服务端启动webpack 端口用服务端端口
  // yarn add webpack-dev-middleware  可以在服务端启动webapck
  // express 启动服务 连带着开启webpack
  let express = rquire('express')
  let app = express();
  let webpack = require('webpack');
  // 中间件
  let middle = require('webpack-dev-middleware')
  let config = require('./webpacl.config.js')
  let compiler =  webpack(config)

  app.middle(compiler)

  app.get('/user',(req,res)=>{
    res.json({name:'xxx'})
  })
  app.listen(3000)
}
```
### resolve&&解析
```js
  resolve:{
    // 解析 当我们import第三方模块 先去那儿找 
    modules:[path.join(__dirname,'node_modules')],
    // 引入文件没有加后缀 会按照这个数组配置查找
    extensions:['.js','.css','.json','.vue']
    // 文件入口 默认是index.js 
    mainFiles:[],
    //  当我们 import 'bootstrap'
    mainFields:['style','main'],//默认找pack.json 的main 这个配置会先去找style选项
    //  当我们 import 'bootstrap' 他会去找'bootstrap/dist/css/bootstrap.css'
    alias:{//别名 
      boostrap:'bootstrap/dist/css/bootstrap.css'
    }

  }
```
### 环境变量
- 在js中直接获取的值
```js
let webpack = require('webpack')
plugins:[
  new webpack.DefinePlugin({
    // DEV:`1+1`,console.log(DEV)//2
    // DEV:`'1+1'`,console.log(DEV)//1+1
    DEV:JSON.stringify('dev')
  })
]
```
### 区分不用环境&&合并webpack
- webpack-merge
 - 这个插件就是用来合并的
```js
  //创建 webpack.prod.js
  let {smart} = require('webpack-merge')
  let base = require('./webpack.base.js')
  module.exports = smart(base,{
    mode:'production'
  })

  //创建 webpack.dev.js
  let {smart} = require('webpack-merge')
  let base = require('./webpack.base.js')
  module.exports = smart(base,{
    mode:'development'
  })

  // 执行
  npm run build -- --config webpack.dev.js
  npm run build -- --config webpack.prod.js
```
## 优化
- noParse
  - 不解析第三方库
- exclude/include
  - 解析的时候 排除哪些/包含哪些
- IgnorePlugin
  - 引入包的时候 忽略哪些文件
```js
module:{
  //遇到很大的库 在知道他没有其他依赖的同时 可以不用解析他,节省时间
  noParse:/jquery/, 
  rules:{
    {
      test:/\.js&/
      exclude:/node_modules/,//js解析的时候 不去找node_modules
      include:path.join('src'),//include 解析的时候直接去src  一般二选一
    }
  }
}
// IgnorePlugin
// 使用moment的时候  所有的语言包可以引入了 给可以给他忽略 在手动所需要的语言
  // js中
  import moment from 'moment';
  //手动引入所需要的语言
  import 'moment/locale/zh-cn';

let webpack = require('webpack')
plugins:[
  new webpack.IgnorePlugin('/\.\/locale/',/moment/)
]
```

### 动态连接库
- 以react为例 先将react react-dom 打包出来 剩下的修改在打包
- 创建动态连接库
```js
// 创建 webpack.config.react.js
let path = require('path')
let webpack = require('webpack')
module.exports = {
  mode:'development',
  entry:{
    react:['react','react-dom'],
  }
  output:{
    finame:'_dll_[name].js',//产生的文件名字
    path:path.join(__dirname,'dist'),
    library:'_dll_[name]', //打包的文件就是 let ab={内容}
    libraryTarget:'var',
    /*
       不会挂到 var  会是exports[a] = function(){}()
       如果是commonjs 会是 var a  = function(){}()
       如果是commonjs2  会是module.exports = function(){}()
       如果是this   就是this[a] = function(){}()
       global 默认是window[a] = function(){}()
       var 是 var a  = function(){}()
    */ 
  },
  plugins:[
    // 动态连接库的清单 会生成一个manifest.json文件
    new webpack.Dllplugin({//规定好的 name = library
      name:'_dll_[name]',
      path:path.resolve(__dirname,'dist','manifest.json')
    })
  ]
}
```
- index.html 引入
```html
<script src='/_dll_react.js'></script>
```

- 引入动态连接库
```js
// 主配置 webpack.config.js 
let webpack = require('webpack')
plugins:[
  new webpack.DllReferencePlugin({
    manifest:path.resolve(__dirname,'dist','manifest.json')
  })
]
```
### 多线程打包
- happypack
```js
let Happypack = require('happypack')
module:{
  reule:[
    {
      test:/\.js$/,
      use:'Happypack/loader?id=js'
    }
  ]
}
plugins:[
  // css 也类似
  new Happypack({
    id:'js',
    use:{
      loader:'babel-loader',
      options:{// 用babel-loader 需要把es6->es5
        plugins:[// 可选
          '@babel/preset-env',
          '@babel/preset-react'
          ]
      }
  })
]
```

### webpack自带优化
- tree-shaking
- scope hosting
```js
// import 在生成环境下 会自动去除掉没用的代码(引用了 但是没有用到)
// 原理 tree-shaking 把没用到的代码 自动删除掉

// es6模块(require引入)会把结果放到defult上 打包的时候 不管用没用 都会打包进来

// scope hosting 作用域
let a = 1;
let b = 2;
let c = 3;
let d = a+b+c;// 在webpack中会自动省略一些 可以简化的代码
console.log(d)
```
### 抽离公共代码
```js
module.exports = {
  optimization:{// 分割代码块
    cacheGroups:{//缓存组
      common:{//公共的模块
        chunks:'initial',
        minSize:0,
        minChunks:2,//引用多2次以上就会抽离
      },
      vendor:{//第三方单独抽出
        priority:1,// 权重 增加
        test:/node_modules/,//把你抽离出来
        chunks:'initial',
        minSize:0,
        minChunks:2
      }
    }
  }
}
```
### 懒加载
-  @babel/plugin-syntax-dynamic-import
  - import('./xx.js') 返回的是一个then
  - vue.js 和 react 懒加载都基于这个
```js
// 页面点击 的时候 资源才加载进来
let button = document.createElement('button');
button.innerHTML = 'hello';
button.addEventListener('click',()=>{
  // es6 草案中的语法 jsonp实现动态加载文件
  // 会生成一个单独的js
  import('./source.js').then(data=>{
    console.log(data.default,'这里面才是结果')
  })
})
document.body.appendChild(button)

{
  test:/\.js$/,//默认查找所有的js
  use:{
    loader:'babel-loader',
    options:{
      presets:['@babel/preset-env'],
      // 插件安装 在js配置就可以了
      plugins:[
        "@babel/plugin-syntax-dynamic-import"
      ]

    }
  },
},
```

### 热更新
- 默认更新页面内容 页面会刷新
- 热更新 不会刷新页面 只会局部更新
  - import只能在顶部引用 不能在函数内引用
- require引入的数据都是 default属性下
```js
// 使用
import xx from './xxx.js';
if(module.hot){
  module.hot.accept('./source',()=>{
    // 更新成功 再次引入
    let str = require('./source')
  })
}

// 配置
devServer:{
  hot:true
},
plugins:[
  new webpack.HotModuleReplacementPlugin(),//热更新插件
  new webpack.NamedModulesPlugin(),//打印更新的模块路径
]
```

## tapable 
- SyncHook 同步
- SyncBailHook 遇到返回值是undefined 才继续执行
- SyncWaterfallHook 瀑布 上一个函数有返回值就会传递给下一个做参数
- SyncLoopHook 循环执行 遇到某个不返回undefined的监听函数会多次执行
- 同步
```js
// 同步
let {SyncHook, SyncBailHook,SyncWaterfallHook,} = require('tapable')

class Lesson1{
  constructor(){
    this.hooks = {
      // 必须传递一个值过去
      arch:new SyncHook(['name'])
    }
  }
  tap(){// 注册监听函数
    this.hooks.arch.tap('node',function(name){
      console.log('node',name)
    }),
    this.hooks.arch.tap('react',function(name){
      console.log('react',name)
    })
  }
  start(...args){
    this.hooks.arch.call(...args)
  }
}

let l = new Lesson1();
l.tap() //注册这两个事件
l.start('xxxxxxxx') //启动钩子


// 阻塞
class Lesson2{
  constructor(){
    this.hooks = {
      arch:new SyncBailHook(['name'])
    }
  }
  tap(){// 注册监听函数
    this.hooks.arch.tap('node',function(name){
      console.log('node',name)
      // return '想停止学习'
      //如是返回 undefined 就继续执行
    }),
    this.hooks.arch.tap('react',function(name){
      console.log('node',name)
    })
  }
  start(...args){
    this.hooks.arch.call(...args)
  }
}

let l = new Lesson2();
l.tap() //注册这两个事件
l.start('xx') //启动钩子

// 瀑布
class Lesson3{
  constructor(){
    this.hooks = {
      arch:new SyncWaterfallHook(['name'])
    }
  }
  tap(){// 注册监听函数
    this.hooks.arch.tap('node',function(name){
      console.log('node',name)//xx
      return '想停止学习'
      //如是返回 undefined 就继续执行
    }),
    this.hooks.arch.tap('react',function(name){
      console.log('node',name)//想停止学习
    })
  }
  start(...args){
    this.hooks.arch.call(...args)
  }
}

let l = new Lesson4();
l.tap() //注册这两个事件
l.start('xx') //启动钩子


class Lesson{
  constructor(){
    this.index= 0;
    this.hooks = {
      arch:new SyncLoopHook(['name'])
    }
  }
  tap(){// 注册监听函数
    this.hooks.arch.tap('node',function(name){
      console.log('node',name)
      return ++ this.index === 3? 'undefined' :'随便'
      //如是返回不是undefined 就一直循环 
    })

  }
  start(...args){
    this.hooks.arch.call(...args)
  }
}

let l = new Lesson4();
l.tap() //注册这两个事件
l.start('xx') //启动钩子
```
- 异步
- AsyncParallelHook 异步并行 等cb都执行完成 才会打印end
- AsyncSeriesHook 异步穿行 一个个执行
- AsyncSeriesWaterfallHook 异步有关联 上一个返回非undefined值 下一个才会执行 否则直接end
- tapable库 注册三种方法 tap(同步) tapAsync(cb) tapPromise(注册是promise) 
  - 对应调用的方法 call callAsync promise
```js
// 异步 并行钩子 需要等待所有的并发异步事件执行后在执行回调方法
// 注册方法 分为 tap/tapAsync 
let {AsyncParallelHook,AsyncSeriesHook} = require('tapable')
class Lesson1{
  constructor(){
    this.index= 0;
    this.hooks = {
      arch:new AsyncParallelHook(['name'])
    }
  }
  tap(){// 注册监听函数
    this.hooks.arch.tapAsync('node',(name,cb)=>{
     setTimeout(()=>{
       console.log('node',name)
       cb()
     },1000)
    })
  }
  start(...args){
    this.hooks.arch.callAsync(...args,function(w){
      console.log('end')
    })
  }
}

let l = new Lesson2();
l.tap() //注册这两个事件
l.start('xx') //启动钩子

// 异步串行
class Lesson{
  constructor(){
    this.index= 0;
    this.hooks = {
      arch:new AsyncParallelHook(['name'])
    }
  }
  tap(){// 注册监听函数
    this.hooks.arch.tapPromise('node',(name)=>{
     return new Promise((resolve,reject)=>{
      setTimeout(()=>{
        console.log('node',name)
        resolve()
      },1000)
     })
    })

  }
  start(...args){
    this.hooks.arch.promise(...args).then(()=>{
      console.log('end')
    })
  }
}

let l = new Lesson2();
l.tap() //注册这两个事件
l.start('xx') //启动钩子

class Lesson3{
  constructor(){
    this.index= 0;
    this.hooks = {
      arch:new AsyncSeriesHook(['name'])
    }
  }
  tap(){// 注册监听函数
    this.hooks.arch.tapPromise('node',(name)=>{
     return new Promise((resolve,reject)=>{
      setTimeout(()=>{
        console.log('node',name)
        resolve()
      },1000)
     })
    })

  }
  start(...args){
    this.hooks.arch.promise(...args).then(()=>{
      console.log('end')
    })
  }
}

let l = new Lesson3();
l.tap() //注册这两个事件
l.start('xx') //启动钩子

// AsyncSeriesWaterfallHook 异步
class Lesson4{
  constructor(){
    this.index= 0;
    this.hooks = {
      arch:new AsyncSeriesWaterfallHook(['name'])
    }
  }
  tap(){// 注册监听函数
    this.hooks.arch.tapPromise('node',(name)=>{
     return new Promise((resolve,reject)=>{
      setTimeout(()=>{
        console.log('node',name)
        resolve('1')
      },1000)
     })
    })
    this.hooks.arch.tapPromise('react',(name)=>{
      return new Promise((resolve,reject)=>{
       setTimeout(()=>{
         console.log('react',name)
         resolve()
       },1000)
      })
     })
  }
  start(...args){
    this.hooks.arch.promise(...args).then(()=>{
      console.log('end')
    })
  }
}

let l = new Lesson4();
l.tap() //注册这两个事件
l.start('xx') //启动钩子

```

## 手写webapck
- npx webpack  
  - 会去找node_modules/.bin/webpack

- 制作webpack包(下面有)
- npm link webpack-pack 就引入到本地了 他会出现在node_modules/.bin/webpack-pack
- 直接运行 npm webpack-pack 就可以运行webpack-pack里面的代码(类似npx webpack 打包一样)
- 获取cmd输入命名行的路径=> proccess.cwd() 
- 本地生成npm包(类似 webpack)
```js
 创建本地文件  npm init -y

 创建 bin/webpack-pack.js
  输入=>
  #! /usr/bin/env node
  console.log('12')

  package.json
  输入=>
  "bin": {
    "webpack-pack": "./bin/webpack-pack.js"
  }
  
  运行 npm link
```