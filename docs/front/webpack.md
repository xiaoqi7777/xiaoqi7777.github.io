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
## resolveLoader解析loader路径的
```js
resolveLoader:{
  // 第三方模块默认 查找的位子
  modules:['node_modules',path.resolve(__dirname,'loaders')]
  // 配置别名
  alias:{
    // 在loader中使用 loader1 就指向 __dirname/loaders/loaders1.js
    loader1:path.resolve(__dirname,'loaders','loaders1')
  }
}
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
- 制作 webpack-pack
- webpack-pack/bin/index 入口文件
```js
#! /usr/bin/env node
// 1、获取webpack.config.js 配置文件
let path = require('path');

// 2、通过当前执行命令的目录 解析除webpack.config.js 在那儿执行就在那儿找webpack.config.js
let config = require(path.resolve('webpack.config.js')) 

// 主的类 Compiler 编译
let Compiler = require('../lib/Compiler.js')

// 根据用户创建的配置文件 进行编译
let compiler = new Compiler(config)

compiler.hooks.entryOption.call()

compiler.run()//开始运行
```
- webpack-pack/lib/Compiler 
- babylon 解析（parse）
  - Babylon 是 Babel 的解析器。最初是 从Acorn项目fork出来的。Acorn非常快，易于使用。
- @babel/traverse 
  - Babel Traverse（遍历）模块维护了整棵树的状态，并且负责替换、移除和添加节点。我们可以和 Babylon 一起使用来遍历和更新节点。
- @babel/generator
  - Babel Generator模块是 Babel 的代码生成器，它读取AST并将其转换为代码和源码映射
- webpack流程 
  - 1、获取配置文件(webpack.config.js)
  - 2、获取所有的资源(this.getSource =>只针对 require 引入的文件)
  - 3、buildMoudle 函数 获取每一个 绝对路径(moduleId)对应的代码(sourceCode) ast解析(this.parse)
  - 4、ejs配合模板渲染数据 ejs.render()
  - 5、根据配置文件的output 路径 将获取的数据写入
```js
// ejs 用来拼接字符串
// tapable 用来发布订阅
let path = require('path');
let fs = require('fs');
//  下面4个功能 ast  1) 转换树 2) 遍历树 3)更改树  4)输出代码
let babylon = require('babylon'); // 转换成树
let traverse = require('@babel/traverse').default; // 遍历树
let t = require('@babel/types'); // 更改树 es模块需要 多.default
let generator = require('@babel/generator').default;

let ejs = require('ejs');
let {SyncHook} = require('tapable')

class Compiler{
  constructor(config){
    // 配置文件
    this.config = config
    // 需要获取当前执行命令的绝对路径
    this.root = process.cwd()
    // 找到配置文件中的入口
    this.entry = config.entry
    // 入口文本的id
    this.entryId;
    //所有的依赖列表
    this.modules = {},

    this.hooks = {
      entryOption: new SyncHook(),
      run: new SyncHook(),
      compile:new SyncHook(),
      afterCompile:new SyncHook(),
      afterPlugins:new SyncHook(),//插件都执行完成后调用此方法
      emit:new SyncHook(),//文件发射出来了
      done:new SyncHook()
    }
    if(Array.isArray(config.plugins)){
      config.plugins.forEach(p=>{
        // 每个插件都需要有一个apply方法
        p.apply(this);//每个插件都能拿到compiler对象
      })
    }
    this.hooks.afterPlugins.call();

  }
  getSource(modulePath){//获取资源
    // 需要判断 modulePath 是否是less文件
    // 获取规则
    let rules = this.config.module.rules;//所有的规则
    let content = fs.readFileSync(modulePath,'utf8');
    for(let i=0;i<rules.length;i++){
      let rule = rules[i]
      let {test,use} = rule
      let len = use.length - 1;//默认定位到最后一个loader
      if(test.test(modulePath)){
        // 这个路径需要用loader来解析
        function normalLoader(){
          // loader 可以是一个路径 本质是一个函数
          let loader = require(use[len--]);
          content = loader(content);
          if(len>=0){
            normalLoader();//递归来解析loader
          }
        }
        normalLoader()

      }
    }
    return content
  }
  // 创建模块
  // 第一个是绝对路径 第二个是否是主入口
  buildMoudle(modulePath,isEntry){
    // 文件源代码
    let source = this.getSource(modulePath)
    // modulePath 目前是绝对路径 path.relative在绝对路径中找相对路径
    let moduleId = './' + path.relative(this.root , modulePath)
    // console.log('==',moduleId,'-',source)
    if(isEntry){
      //如果是主模块
      this.entryId = moduleId
    }
    // AST语法解析 写一个专门的方法来解析源代码
    // 处理当前模块的父路径 path.dirname
    // sourceCode就是转换后的代码
    let {sourceCode,dependencies} = this.parse(source,path.dirname(moduleId)) // 取到的就是./src
    this.modules[moduleId] = sourceCode;
    // 需要拿到当前文件的依赖 递归搜索依赖
    dependencies.forEach(dep=>{
      this.buildMoudle(path.join(this.root,dep))
    });
    // console.log('sourceCode',dependencies)
  }
  // yarn add babylon @babel/traverse @babel/generator @babel/types
  parse(source,parentPath){
    let ast = babylon.parse(source)
    let dependencies = [];//存放依赖关系的
    traverse(ast,{
      CallExpression(p){
        let node = p.node;
        // 找到require
        if(node.callee.name === 'require'){ //取到名字
          node.callee.name = '__webpack_require__';
          let moduleName = node.arguments[0].value;
          moduleName = moduleName + (path.extname(moduleName)?'':'.js')
          moduleName = './' + path.join(parentPath,moduleName)
          // 把依赖添加进去
          dependencies.push(moduleName)
          // 替换变量名
          node.arguments = [t.stringLiteral(moduleName)]
        }
      }
    })
    let sourceCode = generator(ast).code;
    return {sourceCode,dependencies}
    // ast 1) 转换树 2) 遍历树 3)更改树  4)输出代码
    // esprima es-travarse esCodegen(webpack用的这个) 语法转换
    // babel(babylon  @babel/traverse  @babel/types @babel/generator) 对应上面的1-4
  }
  // 开始运行
  run(){
    this.hooks.run.call()
    // 1、创建模块 需要根据当前的绝对路径
    this.hooks.compile.call()
    this.buildMoudle(path.resolve(this.root,this.entry),true);
    this.hooks.afterCompile.call()
    // console.log(this.entryId,this.modules)
    // 2、创建完后 把成功的文件写出来
    this.emitFile();//发射文件
    this.hooks.emit.call();
    this.hooks.done.call()
  }
  emitFile(){
    // 模板内容
    let content = this.getSource(path.resolve(__dirname,'temp.ejs'))
    // 
    let str = ejs.render(content,{
      modules:this.modules,
      entryId:this.entryId
    }) 
    // 写入打包到的文件中
    let main = path.join(this.config.output.path,this.config.output.filename);
    fs.writeFileSync(main,str)

  }
}

module.exports = Compiler
```

- webpack-pack/lib/temp.ejs 
```js
 (function(modules){
  var installedModules = {};
  function __webpack_require__(moduleId){
    if (installedModules[moduleId]) {
      return installedModules[moduleId].exports;
    }
    var module = installedModules[moduleId] ={
      i: moduleId,
      l: false,
      exports: {}
    };

    modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
   
    module.l = true;

    return module.exports;
  }
  return __webpack_require__(__webpack_require__.s = "<%-entryId%>");

 })({
    <%for(let key in modules){%>
      "<%-key%>":
      (function (module,exports,__webpack_require__){
        eval(`<%-modules[key]%>`);
      }),
    <%}%>
 })

```

## 手写loader
- loader组成 pitch + normal
  - loader里面的 
    - this.resourcePath 获取匹配到文件的路径
    - loaderUtils = require('loader-utils')  options = loaderUtils.getOptions(this); options 是当前webpack配置的选项
      - let filename = loaderUtils.interpolateName(this,'[hash].[ext]',{content:source})  根据图片格式生成图片路径
      - this.emitFile(filename,source) // 发射文件
    - 同步 用return source 返回数据  异步用 cb = this.async()  cb(err,source) 返回数据
    - validateOptions = require('schema-utils') 创建骨架 用来比较传递进来的骨架是否类似
    - loader 默认是字符串  当前loader.raw = true 将字符串转换成二进制流

```js
// 3个loader
// loader1 文件
function loader1 (source){ //normal
  console.log('1111')
  return source
}
loader1.pitch = ()=>{ //pitch
  console.log('loader1')
}

module.exports = loader1

// loader2 文件
function loader1 (source){
  console.log('222')
  return source
}
loader1.pitch = ()=>{
  console.log('loader3')
}

module.exports = loader1


// loader3 文件
function loader1 (source){
  console.log('333')
  return source
}
loader1.pitch = ()=>{
  console.log('loader3')
}
module.exports = loader1


rules:[
  {
    test:/.js$/,
    use:{
      loader:['loader1','loader2','loader3']
    }
  }
]
// 正常情况下没有pitch 执行顺序应该是 loader3=>loader2=>loader1=>
// 加入pitch loader1.pitch => loader2.pitch => loader3.pitch =>loader3=>loader2=>loader1
/* 
  pitch作用 
  若返回一个 字符串 那么跳过后面的pitch 和跳过当前的loader 进入下一个loader
  比如 loader2.pitch return一个字符串 loader1.pitch => loader2.pitch =>loader1 (loader3.pitch =>loader3=>loader2 不会执行)
*/
```
- 写法
- 顺序问题 从右到左 从下到上
- loader的分类 
  - pre 在前面(enforce:pre,enforce来设置顺序)
  - post 在后面
  - normal 中间的
  - 顺序pre->normal->inline->post
  - inline-loader 内联loader 在代码中使用 不在webacpk内配置
```js
//1 、
rules:[
  {
    test:/.js$/,
    use:{
      loader:['loader1','loader2','loader3']
    }
  }
]
//2 、
rules:[
  {
    test:/.js$/,
    use:{
      loader:'loader1'
    }
  },
    {
    test:/.js$/,
    use:{
      loader:'loader2'
    }
  },
    {
    test:/.js$/,
    use:{
      loader:'loader3'
    }
  }
]
3、
// 创建 inline.js
function inlineLaoder (source){
  console.log('inline------------------',source)
  return source
}
module.exports = inlineLaoder

// index.js
let a = require('!!inline!./1.js')
// 内联loader 只有在引用的时候处理 其他情况下不处理  在前面家前缀有不同的效果 inline loader不会每个文件都处理
// -! 不会让文件 在去通过pre + normal loader来处理了
// ! 没有normal
// !! 上面都不要 只要inline 来处理
```

- loader 接受content('文件内容')
  - 1、loader 都是函数 参数就是所有文件的内容
  - 2、最后一个loader需要 返回一个js脚本的字符串 去执行
  - 3、每个loader只做一件内容 为了使loader在个人难过场景链式使用
  - 4、每一个loader都是一个模块
  - 5、每个loader都是无状态的 确保loader在不同模块转换之间不保持状态
```js
//  原理 
 getSource(modulePath){//获取资源
    // 需要判断 modulePath 是否是less文件
    // 获取规则
    let rules = this.config.module.rules;//所有的规则
    let content = fs.readFileSync(modulePath,'utf8');
    for(let i=0;i<rules.length;i++){
      let rule = rules[i]
      let {test,use} = rule
      let len = use.length - 1;//默认定位到最后一个loader
      if(test.test(modulePath)){
        // 这个路径需要用loader来解析
        function normalLoader(){
          // loader 原理
          let loader = require(use[len--]);
          // content 文件内容
          content = loader(content);
          if(len>=0){
            normalLoader();//递归来解析loader
          }
        }
        normalLoader()
      }
    }
    return content
  }
```
- 实现自己的loader 
  - 作用:每个文件都加上自己想要注释的内容
- banner-loader
```js
// banner-loader 编写
let loaderUtils = require('loader-utils')
// loaderUtils可以获取loader下面的options
let validateOptions = require('schema-utils')
// 创建骨架 用来比较传递进来的骨架是否类似
let fs = require('fs')
function loader(source){
  // 是否开启缓存
  this.cacheable(false)
   let options =  loaderUtils.getOptions(this)
   // 异步用this.async返回 否则直接用return
   let cb = this.async()
   let schema = {
     type:'object',
     properties:{
       text:{
         type:'string',
       },
       filename:{
         type:'string'
       }
     }
   }
   validateOptions(schema,options,'banner-loader')
   if(options.filename){
     // 自动添加文件依赖  webapck开启watch:true 作用 依赖文件变化wenpack会重新打包
     this.addDependency(options.filename)
     fs.readFile(options.filename,'utf8',(err,data)=>{
        cb(err,`/**${data}**/${source}`)
      })
    }else{
      cb(null,`/**${options.text}**/${source}`)
    }
}
module.exports = loader;

//  webapck配置
watch:true,
module:{
  rules:[
    {
      test:/\.js$/,
      use:{
        loader:'banner-loader',
        options:{
          presets:{
            text:'珠峰',
          },
          filename:path.resolve(__dirname,'banner.js')
        }
      }
    }
}
// 创建banner.js文件  输入=> songge
```
- babel-loader实现
  - yarn add @babel/core @babel/preset-env
```js
let babel = require('@babel/core')
let loaderUtils = require('loader-utils')
function loader(source){
  // this 当前上下文
  let options =  loaderUtils.getOptions(this);
  let cb = this.async();
  babel.transform(source,{
    ...options,
    sourceMap:true,
    filename: this.resourcePath.split('/').pop()
  },(err,result)=>{
    cb(err,result.code.result.map)
  })
}
module.exports = loader
```
- less-loader 
```js
  // less 模块
  let less = require('less');
  function loader(source){
    let css;
    // 转换的过程,同步 
    less.render(source,(err,output)=>{
      css = output.css
    });
    // css = css.replace(/\n/g,'\n')
    return css
  }
  module.exports = loader
```

- style-loader
```js
function loader(source){ //source less-loader转换后的结果
  //最终的loader需要 返回一个js脚本的字符串
  let str = `
  let style = document.createElement('style');
  style.innerHTML = ${JSON.stringify(source)}
  document.head.appendChild(style)
  `
  return str
}
module.exports = loader
```
- file-loader
```js
let loaderUtils = require('loader-utils')

// 他要导出一个路径
function loader(source){
  console.log('source',source)
  // 根据图片格式生成图片路径
  let filename = loaderUtils.interpolateName(this,'[hash].[ext]',{content:source})
  this.emitFile(filename,source);// 发射文件
  return `module.exports = "${filename}"`
}
loader.raw = true // 将源码转换成二进制
module.exports = loader
```
-url-loader
```js

let loaderUtils = require('loader-utils')
let mime = require('mime')
function loader(source){
  let options = loaderUtils.getOptions(this);
  let limit = options.limit
  if(limit && limit >source.length){
    // this.resourcePath 文件路径
    return `module.exports = "data:${mime.getType(this.resourcePath)};
    base64,${source.toString('base64')}"`
  }else{
    return require('./file-loader').call(this,source)
  }
}
loader.raw = true
module.exports = loader
// base64 格式 data:image/jpeg;base64,xxxxx;
```

## webpack 流程
- 1、webpack.config.js 解析 成一个对象
- 2、compiler编译 compiler=webpack(options); webapck初始化
  - a、创建Compiler对象
  - b、注册NodeEnvironmentPlugin插件
  - c、挂在options中的plugins插件
  - d、使用webpackOtptionApply初始化基础插件
- 3、run(开始编译)
  - a、调用compile开启编译
  - b、创建Compilation对象
    - 1、负责整体编译过程
    - 2、内部保留对compiler对象引用this.compiler
    - 3、this.entries入口
    - 4、this.modules 所有模块
    - 5、this.chunks 代码块
    - 6、this.assets 所有的资源
    - 7、template
- 4、buildMoudle分析入口文件创建模块对象
  - 1、获取所有资源
  - 2、AST语法解析 
  - 3、递归搜索依赖
- 5、emitFile();//发射文件

## 手写plugin
- 插件都是类 作用监听每个钩子上的事件
  - 每个插件都要有一个apply 方法
  - 插件都是类 this 就是compile对象

```js
  //原理
  if(Array.isArray(config.plugins)){
    config.plugins.forEach(p=>{
      // 每个插件都需要有一个 apply 方法
      p.apply(this);//每个插件都能拿到 compiler(this) 对象
    })
  }
```
- 同步&&异步插件
```js
// 同步
class DonePlugin {
  apply(compiler){
    compiler.hooks.done.tap('DonePlugin',(stats)=>{
      console.log('编译完成~~')
    })
  }
}

module.exports = DonePlugin
// 异步
class AsyncPlugin {
  apply(compiler){
    console.log('222222222222')
    compiler.hooks.emit.tapAsync('AsyncPlugin',(compliation,cb)=>{
        setTimeout(()=>{
          console.log('编译完成~~22')
          cb()
        },1000)
    });
    compiler.hooks.emit.tapPromise('AsyncPlugin',(compliation)=>{
      return new Promise((resolve,reject)=>{
        setTimeout(()=>{
          console.log('编译完成~~333')
          resolve()
        },1000)
      })
  });
  }
}

module.exports = AsyncPlugin
```

```js
class P1  {
  apply(compiler){
    compiler.hooks.done.tap('p1',()=>{
      console.log('done')
    })
  }
}
class P2  {
  apply(compiler){
    compiler.hooks.afterCompile.tap('p2',()=>{
      console.log('afterCompile')
    })
  }
}
  plugins:[
    new P1(),
    new P2()
  ]
```
- FileListPlugin 显示文件名字 和大小插件
```js
class FileListPlugin{
  constructor({filename}){
    this.filename = filename
  }
  apply(compiler){
    // 文件已经准备好了 要进行发射
    compiler.hooks.emit.tap('compiler',(compilcation)=>{
        let assets = compilcation.assets;
        // assets 存放所有打包资源 打包之后 就是bundle.js文件和index.html文件 后面添加 就直接打包添加的文件
        // 格式[ [bundle.js,{}],[index.html,{}] ]
        let content = `## 文件名 资源大小 \r\n `
        Object.entries(assets).forEach(([filename,statObj])=>{
          content += `- ${filename}  ${statObj.size()} \r\n`
        })
        // 资源对象 下面的就是打包出来的文件
        assets[this.filename] = {
          source(){
            return content
          },
          size(){
            return content.length
          }
        }
    })
  }
}
module.exports = FileListPlugin
```
- InlineSourcePlugin 把外链的标签 变成内联的标签
```js
// 把外链的标签 变成内联的标签
const HtmlWebpackPlugin = require('html-webpack-plugin')
class InlineSourcePlugin{
  constructor(match){
    this.match = match;//正则
  }
  progressTage(tag,compilation){// 处理某一个数据
    let newTag,url;
    if(tag.tagName === 'link' && this.reg.test(tag.attributes.href)){
      newTag= {
        tagName:'style'
      }
      url = tag.attributes.href
    }
    if(tag.tagName === 'scfript' && this.reg.test(tag.attributes.src)){
      newTag= {
        tagName:'scfript'
      }
      url = tag.attributes.src
    }
    if(url){
      newTag.innerHTML = compilation.assets[url].source();//文件的内容放到innerHTML属性上面
      delete compilation.assets[url];// 删除掉原来应生成的资源
      return newTag
    }
    return tag;
  }
  progressTages(){// 处理引入标签的数据
    let headTags = [];
    let bodyTags = [];
    data.headTags.forEach(headTag => {
      headTags.push(this.progressTage(headTag,compilation));
    });
    data.bodyTags.forEach(bodyTag => {
      bodyTags.push(this.progressTage(bodyTag,compilation));
    });
    return {...data, headTags, bodyTags}
  }
  apply(compiler){
    // 要通过webpackPlugin来实现这个功能
    compiler.hooks.compilation.tap('MyPlugin',(compilation)=>{
      HtmlWebpackPlugin.getHooks(compilation).alterAssetTagGroups.tapAsync
      ('alterPlugin',(data,cb)=>{
        data = this.progressTages(data);
        cb(null,data)
      })     
    })
  }
}
```