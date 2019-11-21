# webpack
[[toc]]
## 概念
- webacpk是啥
  -  WebPack可以看做是模块打包机：它做的事情是，分析你的项目结构，找到JavaScript模块以及其它的一些浏览器不能直接运行的拓展语言（Scss，TypeScript等），并将其打包为合适的格式以供浏览器使用。
<img :src="$withBase('/img/webpack.jpeg')" >
  - 构建就是把源代码转换成发布到线上的可执行 JavaScrip、CSS、HTML 代码，包括如下内容。
    - 代码转换：TypeScript 编译成 JavaScript、SCSS 编译成 CSS 等。
    - 文件优化：压缩 JavaScript、CSS、HTML 代码，压缩合并图片等。
    - 代码分割：提取多个页面的公共代码、提取首屏不需要执行部分的代码让其异步加载。
    - 模块合并：在采用模块化的项目里会有很多个模块和文件，需要构建功能把模块分类合并成一个文件。
    - 自动刷新：监听本地源代码的变化，自动重新构建、刷新浏览器。
    - 代码校验：在代码被提交到仓库前需要校验代码是否符合规范，以及单元测试是否通过。
    - 自动发布：更新完代码后，自动构建出线上发布代码并传输给发布系统。
- webpack核心成员
  - Entry 入口,入口文件
  - Module 模块,一个文件对于一个模块,Webpack 会从配置的 Entry 开始递归找出所有依赖的模块。
  - Chunk 代码块,一个 Chunk 由多个模块组合而成，用于代码合并与分割
  - Loader 模块转换器,用于把模块原内容转换成新的内容
  - Plugin 拓展插件,在webpack构建的生命周期中 注入拓展逻辑 来改变构建结果
  - Output 输出结果
- webpack 基本搭建(基于webpack4)
  - npm install webpack webpack-cli -D
  - 创建src目录和dist/index.html(里面引入打包后的文件)
  - 创建webpack.config.js
  ```js
    const path=require('path');
    module.exports={
        entry: './src/index.js',//配置入口文件的地址
        output: {//配置出口文件的地址
            path: path.resolve(__dirname,'dist'),
            filename:'bundle.js'
        },
        module: {},//配置模块,主要用来配置不同文件的加载器
        plugins: [],//配置插件
        devServer: {}//配置开发服务器
    }
  ```
  - 配置开发服务器
  ```js
    npm i webpack-dev-server –D

    devServer:{
        contentBase:path.resolve(__dirname,'dist'),
        host:'localhost',
        compress:true,
        port:8080
     }
  ```
    - contentBase 配置开发服务运行时的文件根目录
    - host：开发服务器监听的主机地址
    - compress 开发服务器是否启动gzip等压缩
    -  port：开发服务器监听的端口
  - 在package.json 配置脚本
  - --open 是启动后打开浏览器
  ```js
    "scripts": {
      "build": "webpack --mode development",
      "dev": "webpack-dev-server --open --mode development "
    }
  ```
## 个个击破
  - loader?
    - 通过使用不同的Loader,Webpack可以要把不同的文件都转成JS文件,比如CSS、ES6/7、JSX等
    - test:正则匹配 拓展名
    - use:loader名称
    - include/exclude:屏蔽或者包含处理的文件夹  
    - query 为loader提供额外的设置选项
  - 三种写法
    ```js
    // loader 
    {
      test: /\.css/,
      loader:['style-loader','css-loader']
    }
    // use
    {
      test: /\.css/,
      use:['style-loader','css-loader']
    }
    // use+loader
    {
      test: /\.css/,
      include: path.resolve(__dirname,'src'),
      exclude: /node_modules/,
      use: [{
          loader: 'style-loader',
          options: {
              insertAt:'top'
          }
      },'css-loader']
    }
    ```
  - plugin
    - 模块代码转换的工作由 loader 来处理
    - 除此之外的其他任何工作都可以交由 plugin 来完成
    - html-webpack-plugin 我们希望自动能产出HTML文件，并在里面引入产出后的资源
      - minify 是对html文件进行压缩，removeAttrubuteQuotes是去掉属性的双引号
      - hash 引入产出资源的时候加上查询参数，值为哈希避免缓存
      - template 模版路径
### 处理html
  ```js
    npm i html-webpack-plugin -D

    plugins: [
      new HtmlWebpackPlugin({
        minify: {
          removeAttributeQuotes:true
      },
      hash: true,
      template: './src/index.html',
      filename:'index.html'
    })]
  ```
### 处理图片
  - file-loader 解决CSS等文件中的引入图片路径问题
  - url-loader 当图片小于limit的时候会把图片BASE64编码，大于limit参数的时候还是使用file-loader 进行拷贝
```js
npm i file-loader url-loader -D
{
  test:/\.(jpg|png|bmp|gif|svg|ttf|woff|woff2|eot)/,
    use:[
    {
      loader:'url-loader',
      options:{limit:4096}
    }
  ]
}
```
  - html-withimg-loader 在html中使用图片
  
  ```js
    npm i html-withimg-loader -D
    {
      test: /\.(html|htm)$/,
      use: 'html-withimg-loader'
    }
  ```
### 处理css
  - mini-css-extract-plugin 将css单独提取出来 link自动引入
  - filename 打包入口文件
  - chunkFilename 用来打包import('module')方法中引入的模块
```js
npm install --save-dev mini-css-extract-plugin
let MiniCssExtractPlugin =  require('mini-css-extract-plugin')

      plugins: [
        //参数类似于webpackOptions.output
        new MiniCssExtractPlugin({
            filename: '[name].css',
            chunkFilename:'[id].css'
        })
      ]

      {
        test: /\.css/,
        include: path.resolve(__dirname,'src'),
        exclude: /node_modules/,
        use: [{
          loader: MiniCssExtractPlugin.loader
        },'css-loader']
      }
```
  - optimize-css-assets-webpack-plugin 压缩css
```js
  let OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
  plugins:[
    new OptimizeCssAssetsPlugin(),
  ]
```
  - css&&img单独存放目录
    - outputPath 输出路径
    - publicPath指定的是构建后在html里的路径
```js
  output: {
        path: path.resolve(__dirname,'dist'),
        filename: 'bundle.js',
        publicPath:'/'
    }
  {
  test:/\.(jpg|jpeg|png|bmp|gif|svg|ttf|woff|woff2|eot)/,
  use:[
        {
          loader:'url-loader',
          options:{
            limit: 4096,
            outputPath: 'images',
            publicPath:'/images'
          }
        }
     ],
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name].css',
      chunkFilename:'css/[id].css'
    }),
}
```
  - less和sass
```js
npm i less less-loader -D
// less
@color:orange;
.less-container{
    color:@color;
}
// sass
$color:green;
.sass-container{
    color:green;
}
    // webpack配置
    {
      test: /\.less/,
      include: path.resolve(__dirname,'src'),
      exclude: /node_modules/,
      use: [{
          loader: MiniCssExtractPlugin.loader,
      },'css-loader','less-loader']
    },
    {
        test: /\.scss/,
        include: path.resolve(__dirname,'src'),
        exclude: /node_modules/,
        use: [{
            loader: MiniCssExtractPlugin.loader,
        },'css-loader','sass-loader']
    },
```
  - 处理css前缀
    - 为了浏览器的兼容性，有时候我们必须加入-webkit,-ms,-o,-moz这些前缀
    - Trident内核：主要代表为IE浏览器, 前缀为-ms
    - Gecko内核：主要代表为Firefox, 前缀为-moz
    - Presto内核：主要代表为Opera, 前缀为-o
    - Webkit内核：产要代表为Chrome和Safari, 前缀为-webkit
```js
npm i postcss-loader autoprefixer -D
// index.css
::placeholder {
    color: red;
}

// 创建postcss.config.js
module.exports={
    plugins:[require('autoprefixer')]
}

// webpack.config.js
{
   test:/\.css$/,
   use:[MiniCssExtractPlugin.loader,'css-loader','postcss-loader'],
   include:path.join(__dirname,'./src'),
   exclude:/node_modules/
}
```

### 处理js
  - 转义ES6/ES7/JSX
  - Babel其实是一个编译JavaScript的平台,可以把ES6/ES7,React的JSX转义为ES5
  - npm i babel-loader @babel/core @babel/preset-env  @babel/preset-react  -D
    - @babel/core 是babel的核心
    - @babel/preset-env 是babel插件集合 将高级的语法转换成 低级
  - npm i @babel/plugin-proposal-decorators @babel/plugin-proposal-class-properties  -D
    - @babel/plugin-proposal-class-properties 处理es7
  - npm i @babel/runtime @babel/plugin-transform-runtime @babel/polyfill -D
    - @babel/plugin-transform-runtime 处理generator(@babel/runtime跟他是一套)
    - @babel/runtime  
      - babel 在每个文件都插入了辅助代码，使代码体积过大
      - babel 对一些公共方法使用了非常小的辅助代码，比如 _extend
      - 默认情况下会被添加到每一个需要它的文件中。你可以引入 @babel/runtime 作为一个独立模块，来避免重复引入
    - @babel/polyfill 处理实例上的方法 'xx'.includes('a')
  - 将options里面的内容 可以创建一个.babelrc 文件
    ```js
      {
        "presets": ["@babel/preset-env"],
        "plugins": [
        [
          "@babel/plugin-transform-runtime",
          {
            "corejs": false,
            "helpers": true,
            "regenerator": true,
            "useESModules": true
          }
        ]
        ]
      }
    ```
```js
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
```
  - 语法监测
```js
npm install eslint eslint-loader babel-eslint --D
//创建 .eslintrc.js 
module.exports = {
    root: true,
    //指定解析器选项
    parserOptions: {
        sourceType: 'module'
    },
    //指定脚本的运行环境
    env: {
        browser: true,
    },
    // 启用的规则及其各自的错误级别
    rules: {
        "indent": ["error", 4],//缩进风格
        "quotes": ["error", "double"],//引号类型 
        "semi": ["error", "always"],//关闭语句强制分号结尾
        "no-console": "error",//禁止使用console
        "arrow-parens": 0 //箭头函数用小括号括起来
    }
}
// webpack.config.js
module: {
  //配置加载规则
  rules: [
      {
          test: /\.js$/,
          loader: 'eslint-loader',
          enforce: "pre",
          include: [path.resolve(__dirname, 'src')], // 指定检查的目录
          options: { fix: true } // 这里的配置项参数将会被传递到 eslint 的 CLIEngine   
      },
  ]
} 
```
## 进阶篇
  - webpack通过配置可以自动给我们source maps文件，map文件是一种对应编译文件和源文件的方法
    - source-map 把映射文件生成到单独的文件，最完整最慢
    - cheap-module-source-map 在一个单独的文件中产生一个不带列映射的Map
    - eval-source-map 使用eval打包源文件模块,在同一个文件中生成完整sourcemap
    - cheap-module-eval-source-map sourcemap和打包后的JS同行显示，没有映射列
    ```js
    devtool:'eval-source-map'
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
    - clean-webpack-plugin 清除文件下的内容
    - copy-webpack-plugin 复制文件
    - bannerPlugin 内置的 加商标
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
            '/api':''// /api会被替换成""
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
    - extensions 指定extension之后可以不用在require或是import的时候加文件扩展名,会依次尝试添加扩展名进行匹配
    - alias  每当引入bootstrap模块的时候，它会直接引入bootstrap,而不需要从node_modules文件夹中按模块的查找规则查找
    - modules 对于直接声明依赖名的模块（如 react ），webpack 会类似 Node.js 一样进行路径搜索，搜索node_modules目录
    - mainFields 默认情况下package.json 文件则按照文件中 main 字段的文件名来查找文件
    - mainFiles 当目录下没有 package.json 文件时，我们说会默认使用目录下的 index.js 这个文件，其实这个也是可以配置的
  ```js
  const bootstrap = path.resolve(__dirname,'node_modules/_bootstrap@3.3.7@bootstrap/dist/css/bootstrap.css');
    resolve:{
      // 解析 当我们import第三方模块 先去那儿找 
      modules:[path.join(__dirname,'node_modules')],
      // 引入文件没有加后缀 会按照这个数组配置查找
      extensions:['.js','.css','.json','.vue']
      // 文件入口 默认是index.js 
      mainFiles:['index'],
      //  当我们 import 'bootstrap'
      mainFields:['style','main'],//默认找pack.json 的main 这个配置会先去找style选项
      alias:{//别名  //  当我们 import 'bootstrap' 他会去找'bootstrap/dist/css/bootstrap.css'
        "bootstrap":bootstrap
      }

    }
  ```
### resolveLoader解析loader路径的
    - resolve.resolveLoader用于配置解析 loader 时的 resolve 配置,默认的配置：
  ```js
    resolveLoader:{
      // 第三方模块默认 查找的位子
      modules:['node_modules',path.resolve(__dirname,'loaders')],
      extensions:[ '.js', '.json' ],
      // 配置别名
      alias:{
        // 在loader中使用 loader1 就指向 __dirname/loaders/loaders1.js
        loader1:path.resolve(__dirname,'loaders','loaders1')
      }
    }
  ```

### 全局环境变量
    - 在js中直接获取的值
    - 如果配置的值是字符串，那么整个字符串会被当成代码片段来执行，其结果作为最终变量的值
    - 如果配置的值不是字符串，也不是一个对象字面量，那么该值会被转为一个字符串，如 true，最后的结果是 'true'
    - 如果配置的是一个对象字面量，那么该对象的所有 key 会以同样的方式去定义
    - JSON.stringify(true) 的结果是 'true'
  - 区分环境变量
    - 一套开发时使用，构建结果用于本地开发调试，不进行代码压缩，打印 debug 信息，包含 sourcemap 文件
    - 一套构建后的结果是直接应用于线上的，即代码都是压缩后，运行时不打印 debug 信息，静态文件不包括 sourcemap
    - webpack 4.x 版本引入了 mode 的概念
    - 当你指定使用 production mode 时，默认会启用各种性能优化的功能，包括构建结果优化以及 webpack 运行性能优化
    - 而如果是 development mode 的话，则会开启 debug 工具，运行时打印详细的错误信息，以及更加快速的增量编译构建
  - webpack 时传递的 mode 参数,是可以在我们的应用代码运行时，通过 process.env.NODE_ENV 这个变量获取
  ```js
    let webpack = require('webpack')
    plugins:[
      new webpack.DefinePlugin({
        // DEV:`1+1`,console.log(DEV)//2
        // DEV:`'1+1'`,console.log(DEV)//1+1
        DEV:JSON.stringify('dev')
      })
    ]
    // console.log(DEV) ==> 'dev'
  ```
### 合并webpack
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
### 优化
    - noParse 不解析第三方库
      - 使用 noParse 进行忽略的模块文件中不能使用 import、require、define 等导入机制
      - exclude/include 解析的时候 排除哪些/包含哪些
    - IgnorePlugin 引入包的时候 忽略哪些文件
    
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
### 多入口
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
### 对图片进行压缩和优化
    - image-webpack-loader 可以帮助我们对图片进行压缩和优化
  ```js
  npm install image-webpack-loader --save-dev
  {
    test: /\.(png|svg|jpg|gif|jpeg|ico)$/,
    use: [
      'file-loader',
      {
        loader: 'image-webpack-loader',
        options: {
          mozjpeg: {
            progressive: true,
            quality: 65
          },
          optipng: {
            enabled: false,
          },
          pngquant: {
            quality: '65-90',
            speed: 4
          },
          gifsicle: {
            interlaced: false,
          },
          webp: {
            quality: 75
          }
        }
      },
    ]
  }
  ```
## tapable 
  - Webpack本质上是一种事件流的机制，它的工作流程就是将各个插件串联起来，而实现这一切的核心就是Tapable，webpack中最核心的负责编译的Compiler和负责创建bundle的Compilation都是Tapable的实例
  - 同步
    - SyncHook 
    - SyncBailHook 遇到返回值是undefined 才继续执行
    - SyncWaterfallHook 瀑布 上一个函数有返回值就会传递给下一个做参数
    - SyncLoopHook 循环执行 遇到某个不返回undefined的监听函数会多次执行
  - 异步
    - AsyncParallelHook 异步并行 等cb都执行完成 才会打印end
    - AsyncSeriesHook 异步穿行 一个个执行
    - AsyncSeriesWaterfallHook 异步有关联 上一个返回非undefined值 下一个才会执行 否则直接end
    - tapable库 注册三种方法 tap(同步) tapAsync(cb) tapPromise(注册是promise)
    - 对应调用的方法 call callAsync promise

<!-- <img :src="$withBase('/img/tapable.png')" > -->

### 1、SyncHook 串行同步执行,不关心返回值
```js
//let {SyncHook}=require('tapable');
class SyncHook{
    constructor() {
        this.tasks=[];
    }
    tap(name,task) {
        this.tasks.push(task);
    }
    call() {
        this.tasks.forEach(task=>task(...arguments));
    }
}
let queue = new SyncHook(['name']);
queue.tap('1',function(name){
  console.log(name,1);
});
queue.tap('2',function(name){
  console.log(name,2);
});
queue.tap('3',function(name){
  console.log(name,3);
});
queue.call('ok');
```
### 2、SyncBailHook 串行同步执行，有一个返回值不为null则跳过剩下的逻辑
```js
//let {SyncBailHook}=require('tapable');
class SyncBailHook{
    constructor() {
        this.tasks=[];
    }
    tap(name,task) {
        this.tasks.push(task);
    }
    call() {
        // for (let i=0;i<this.tasks.length;i++){
        //     let ret=this.tasks[i](...arguments);
        //     if (ret)
        //         break;
        // }
        let i=0,ret;
        do {
            ret=this.tasks[i++](...arguments);
        } while (!ret);
    }
}
let queue = new SyncBailHook(['name']);
queue.tap('1',function(name){
  console.log(name,1);
  return 'Wrong';
});
queue.tap('2',function(name){
  console.log(name,2);
});
queue.tap('3',function(name){
  console.log(name,3);
});
queue.call('ok');
```
### 3、SyncWaterfallHook  瀑布 上一个函数有返回值就会传递给下一个做参数
```js
class SyncWaterfallHook{
    constructor() {
        this.tasks=[];
    }
    tap(name,task) {
        this.tasks.push(task);
    }
    call() {
        let [first,...tasks]=this.tasks;
        tasks.reduce((ret,task)=>task(ret),first(...arguments));

        //this.tasks.reduce((a,b) => (...args) => b(a(...args)))(...arguments);
    }
}
let queue = new SyncWaterfallHook(['name']);
queue.tap('1',function(name,age){
  console.log(name,age,1);
  return 1;
});
queue.tap('2',function(data){
    console.log(data,2);
    return 2;
});
queue.tap('3',function(data){
  console.log(data,3);
});
queue.call('ok',9);
```
### 4、SyncLoopHook 监听函数返回true表示继续循环，返回undefine表示结束循环
```js
//let {SyncHook}=require('tapable');
class SyncLoopHook{
    constructor() {
        this.tasks=[];
    }
    tap(name,task) {
        this.tasks.push(task);
    }
    call(...args) {    
        this.tasks.forEach(task => {
            let ret=true;
            do {
                ret = task(...args);
            }while(ret == true || !(ret === undefined))
        });
    }
}
let queue = new SyncLoopHook(['name']);
let count = 0;
queue.tap('1',function(name){
    console.log(count++);
    if(count==3){
        return;
    }else{
        return true;
    }
});
queue.call('ok');
```
### 5、AsyncParallelHook 异步并行执行钩子
  - 5.1、tap
```js
//let {AsyncParallelHook}=require('tapable');
class AsyncParallelHook{
    constructor() {
        this.tasks=[];
    }
    tap(name,task) {
        this.tasks.push(task);
    }
    callAsync() {
        let args=Array.from(arguments);
        let callback=args.pop();
        this.tasks.forEach(task => task(...args));
        callback();
    }
}
let queue = new AsyncParallelHook(['name']);
console.time('cost');
queue.tap('1',function(name){
    console.log(1);
});
queue.tap('2',function(name){
    console.log(2);
});
queue.tap('3',function(name){
    console.log(3);
});
queue.callAsync('sg',err=>{
    console.log(err);
    console.timeEnd('cost');
});
```
  - 5.2、tapAsync
```js
//let {AsyncParallelHook}=require('tapable');
class AsyncParallelHook{
    constructor() {
        this.tasks=[];
    }
    tapAsync(name,task) {
        this.tasks.push(task);
    }
    callAsync() {
        let args=Array.from(arguments);
        let callback=args.pop();
        let i=0,length = this.tasks.length;
        function done(err) {
            if (++i == length) {
                callback(err);
            }
        }
        this.tasks.forEach(task => {
            task(...args,done);
        });
    }
}
let queue = new AsyncParallelHook(['name']);
console.time('cost');
queue.tapAsync('1',function(name,callback){
    setTimeout(function(){
        console.log(1);
        callback();
    },1000)
});
queue.tapAsync('2',function(name,callback){
    setTimeout(function(){
        console.log(2);
        callback();
    },2000)
});
queue.tapAsync('3',function(name,callback){
    setTimeout(function(){
        console.log(3);
        callback();
    },3000)
});
queue.callAsync('sg',err=>{
    console.log(err);
    console.timeEnd('cost');
});
```
- 5.3、tapPromise
```js
//let {AsyncParallelHook}=require('tapable');
class AsyncParallelHook{
    constructor() {
        this.tasks=[];
    }
    tapPromise(name,task) {
        this.tasks.push(task);
    }
    promise() {
        let promises = this.tasks.map(task => task());
        return Promise.all(promises);
    }
}
let queue = new AsyncParallelHook(['name']);
console.time('cost');
queue.tapPromise('1',function(name){
    return new Promise(function(resolve,reject){
        setTimeout(function(){
            console.log(1);
            resolve();
        },1000)
    });

});
queue.tapPromise('2',function(name){
    return new Promise(function(resolve,reject){
        setTimeout(function(){
            console.log(2);
            resolve();
        },2000)
    });
});
queue.tapPromise('3',function(name){
    return new Promise(function(resolve,reject){
        setTimeout(function(){
            console.log(3);
            resolve();
        },3000)
    });
});
queue.promise('sg').then(()=>{
    console.timeEnd('cost');
})
```
### 6、AsyncParallelBailHook 带保险的异步并行执行钩子
  - 6.1、tap 
```js
//let {AsyncParallelBailHook} = require('tapable');
class AsyncParallelBailHook{
    constructor() {
        this.tasks=[];
    }
    tap(name,task) {
        this.tasks.push(task);
    }
    callAsync() {
        let args=Array.from(arguments);
        let callback=args.pop();
        for (let i=0;i<this.tasks.length;i++){
            let ret=this.tasks[i](...args);
            if (ret) {
                return callback(ret);
            }
        }
    }
}
let queue=new AsyncParallelBailHook(['name']);
console.time('cost');
queue.tap('1',function(name){
    console.log(1);
    return "Wrong";
});
queue.tap('2',function(name){
    console.log(2);
});
queue.tap('3',function(name){
    console.log(3);
});
queue.callAsync('sg',err=>{
    console.log(err);
    console.timeEnd('cost');
});
```
- 6.2、tapAsync
```js
//let {AsyncParallelBailHook} = require('tapable');

class AsyncParallelBailHook{
    constructor() {
        this.tasks=[];
    }
    tapAsync(name,task) {
        this.tasks.push(task);
    }
    callAsync() {
        let args=Array.from(arguments);
        let finalCallback=args.pop();
        let count=0,total=this.tasks.length;
        function done(err) {
            if (err) {
                return finalCallback(err);
            } else {
                if (++count == total) {
                    return finalCallback();
                }
            }
        }
        for (let i=0;i<total;i++){
            let task=this.tasks[i];
            task(...args,done);
        }
    }
}
let queue=new AsyncParallelBailHook(['name']);
console.time('cost');
queue.tapAsync('1',function(name,callback){
    console.log(1);
    callback('Wrong');
});
queue.tapAsync('2',function(name,callback){
    console.log(2);
    callback();
});
queue.tapAsync('3',function(name,callback){
    console.log(3);
    callback();
});
queue.callAsync('sg',err=>{
    console.log(err);
    console.timeEnd('cost');
});
```
- 6.2、tapPromise
```js
//let {AsyncParallelBailHook} = require('tapable');

class AsyncParallelBailHook{
    constructor() {
        this.tasks=[];
    }
    tapPromise(name,task) {
        this.tasks.push(task);
    }
    promise() {
        let args=Array.from(arguments);
        let promises = this.tasks.map(task => task(...arguments));
        return Promise.all(promises);
    }
}
let queue = new AsyncParallelBailHook(['name']);
console.time('cost');
queue.tapPromise('1',function(name){
    return new Promise(function(resolve,reject){
        setTimeout(function(){
            console.log(1);
            resolve();
        },1000)
    });
});
queue.tapPromise('2',function(name){
    return new Promise(function(resolve,reject){
        setTimeout(function(){
            console.log(2);
            reject();
        },2000)
    });
});

queue.tapPromise('3',function(name){
    return new Promise(function(resolve,reject){
        setTimeout(function(){
            console.log(3);
            resolve();
        },3000)
    });
});

queue.promise('sg').then(()=>{
    console.timeEnd('cost');
},err => {
    console.error(err);
    console.timeEnd('cost');
})
```
### 7、AsyncSeriesHook 异步串行钩子
  - 7.1、tap 
```js
let {AsyncSeriesHook} = require('tapable');
class AsyncSeriesHook{
    constructor() {
        this.tasks=[];
    }
    tap(name,task) {
        this.tasks.push(task);
    }
    callAsync() {
        for (let i=0;i<total;i++){
            let task=this.tasks[i];
            task(...args,done);
        }
    }
}
let queue = new AsyncSeriesHook(['name']);
console.time('cost');
queue.tap('1',function(name){
    console.log(1);
});
queue.tap('2',function(name){
    console.log(2);
});
queue.tap('3',function(name){
    console.log(3);
});
queue.callAsync('sg',err=>{
    console.log(err);
    console.timeEnd('cost');
});
```
- 7.2、tapAsync
```js
class AsyncSeriesBailHook{
    constructor() {
        this.tasks=[];
    }
    tapAsync(name,task) {
        this.tasks.push(task);
    }
    callAsync() {
        let args = Array.from(arguments);
        let finalCallback = args.pop();
        let index = 0, length = this.tasks.length;
        let next = () => {
            let task = this.tasks[index++];
            if (task) {
                task(...args, next);
            } else {
                finalCallback();
            }
        }
        next();
    }
}
let queue = new AsyncSeriesHook(['name']);
console.time('cost');
queue.tapAsync('1',function(name,callback){
   setTimeout(function(){
       console.log(1);
   },1000)
});
queue.tapAsync('2',function(name,callback){
    setTimeout(function(){
        console.log(2);
        callback();
    },2000)
});
queue.tapAsync('3',function(name,callback){
    setTimeout(function(){
        console.log(3);
        callback();
    },3000)
});
queue.callAsync('sg',err=>{
    console.log(err);
    console.timeEnd('cost');
});
```
- 7.3、tapPromise 
```js
class AsyncSeriesHook{
    constructor() {
        this.tasks=[];
    }
    tapPromise(name,task) {
        this.tasks.push(task);
    }
    promise() {
         //first是第一个函数， tasks是剩下的函数
        let [first, ...tasks] = this.tasks;
        return tasks.reduce((a, b) => {
            return a.then(() => b());
        }, first(...args));
    }
}
let queue=new AsyncSeriesHook(['name']);
console.time('cost');
queue.tapPromise('1',function(name){
   return new Promise(function(resolve){
       setTimeout(function(){
           console.log(1);
           resolve();
       },1000)
   });
});
queue.tapPromise('2',function(name,callback){
    return new Promise(function(resolve){
        setTimeout(function(){
            console.log(2);
            resolve();
        },2000)
    });
});
queue.tapPromise('3',function(name,callback){
    return new Promise(function(resolve){
        setTimeout(function(){
            console.log(3);
            resolve();
        },3000)
    });
});
queue.promise('sg').then(data=>{
    console.log(data);
    console.timeEnd('cost');
});
```
### 8、AsyncSeriesBailHook
  - 8.1、tap
```js
let {AsyncSeriesBailHook} = require('tapable');
let queue = new AsyncSeriesBailHook(['name']);
console.time('cost');
queue.tap('1',function(name){
    console.log(1);
    return "Wrong";
});
queue.tap('2',function(name){
    console.log(2);
});
queue.tap('3',function(name){
    console.log(3);
});
queue.callAsync('sg',err=>{
    console.log(err);
    console.timeEnd('cost');
});
```
- 8.2、tabAsync 
```js
//let {AsyncSeriesBailHook}=require('tapable');
class AsyncSeriesBailHook{
    constructor() {
        this.tasks=[];
    }
    tapAsync(name,task) {
        this.tasks.push(task);
    }
    callAsync() {
        let args=Array.from(arguments);
        let callback=args.pop();
        let i=0,size = this.tasks.length;
        let next=(err) => {
            if (err) return  callback(err);
            let task=this.tasks[i++];
            task?task(...args,next):callback();
        }
        next();
    }
}
let queue = new AsyncSeriesBailHook(['name']);
console.time('cost');
queue.tapAsync('1',function(name,callback){
   setTimeout(function(){
       console.log(1);
       callback('wrong');
   },1000)
});
queue.tapAsync('2',function(name,callback){
    setTimeout(function(){
        console.log(2);
        callback();
    },2000)
});
queue.tapAsync('3',function(name,callback){
    setTimeout(function(){
        console.log(3);
        callback();
    },3000)
});
queue.callAsync('sg',err=>{
    console.log(err);
    console.timeEnd('cost');
});
```
- 8.3、tapPromise 
```js
let {AsyncSeriesBailHook} = require('tapable');
let queue = new AsyncSeriesBailHook(['name']);
console.time('cost');
queue.tapPromise('1',function(name){
   return new Promise(function(resolve,reject){
       setTimeout(function(){
           console.log(1);
           //resolve();
           reject();
       },1000)
   });
});
queue.tapPromise('2',function(name,callback){
    return new Promise(function(resolve){
        setTimeout(function(){
            console.log(2);
            resolve();
        },2000)
    });
});
queue.tapPromise('3',function(name,callback){
    return new Promise(function(resolve){
        setTimeout(function(){
            console.log(3);
            resolve();
        },3000)
    });
});
queue.promise('sg').then(err=>{
    console.log(err);
    console.timeEnd('cost');
},err=>{
    console.log(err);
    console.timeEnd('cost');
});
```
### 9、AsyncSeriesWaterfallHook 
  - 9.1、tap
```js
let {AsyncSeriesWaterfallHook} = require('tapable');
let queue = new AsyncSeriesWaterfallHook(['name']);
console.time('cost');
queue.tap('1',function(name,callback){
    console.log(1);
});
queue.tap('2',function(data){
    console.log(2,data);
});
queue.tap('3',function(data){
    console.log(3,data);
});
queue.callAsync('sg',err=>{
    console.log(err);
    console.timeEnd('cost');
});
```
  - 9.2、tapAsync 
```js
//let {AsyncSeriesBailHook}=require('tapable');
class AsyncSeriesWaterfallHook{
    constructor() {
        this.tasks=[];
    }
    tapAsync(name,task) {
        this.tasks.push(task);
    }
    callAsync() {
        let args=Array.from(arguments);
        let callback=args.pop();
        let i=0,size = this.tasks.length;
        let next=(err,data) => {
            if (err) return  callback(err);
            let task=this.tasks[i++];
            if (task) {
                if (i==0) {
                    task(...args,next);
                } else {
                    task(data,next);
                }

            } else {
                callback(err,data);
            }
        }
        next();
    }
}
let queue = new AsyncSeriesWaterfallHook(['name']);
console.time('cost');
queue.tapAsync('1',function(name,callback){
   setTimeout(function(){
       console.log(1);
       callback(null,1);
   },1000)
});
queue.tapAsync('2',function(data,callback){
    setTimeout(function(){
        console.log(2);
        callback(null,2);
    },2000)
});
queue.tapAsync('3',function(data,callback){
    setTimeout(function(){
        console.log(3);
        callback(null,3);
    },3000)
});
queue.callAsync('sg',(err,data)=>{
    console.log(err,data);
    console.timeEnd('cost');
});
```
 - 9.3、tapPromise 
 ```js
let {AsyncSeriesWaterfallHook} = require('tapable');
class AsyncSeriesWaterfallHook {
    constructor() {
        this.tasks = [];
    }
    tapPromise(name, task) {
        this.tasks.push(task);
    }
    promise(...args) {
        //first是第一个函数， tasks是剩下的函数
        let [first, ...tasks] = this.tasks;
        return tasks.reduce((a, b) => {
            return a.then((data) => b(data));
        }, first(...args));
    }
}
let queue = new AsyncSeriesWaterfallHook(['name']);
console.time('cost');
queue.tapPromise('1', function (name) {
    return new Promise(function (resolve) {
        setTimeout(function () {
            console.log(name, 1);
            resolve(1);
        }, 1000);
    });
});
queue.tapPromise('2', function (data) {
    return new Promise(function (resolve) {
        setTimeout(function () {
            console.log(data, 2);
            resolve(2);
        }, 2000);
    });
});
queue.tapPromise('3', function (data) {
    return new Promise(function (resolve) {
        setTimeout(function () {
            console.log(data, 3);
            resolve(3);
        }, 3000);
    });
});
queue.promise('sg').then(err => {
    console.timeEnd('cost');
});
 ```
### 10、tapable用法
 ```js
  const {Tapable,SyncHook} = require("tapable");
  const t = new Tapable();
  t.hooks = {
      myHook: new SyncHook()
  };
  let called = 0;
  t.plugin("my-hook", () => called++);
  t.hooks.myHook.call();
  t.plugin("my-hook", () => called += 10);
  t.hooks.myHook.call();
  console.log(called);

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
## AST 语法解析
- webpack和Lint等很多的工具和库的核心都是通过Abstract Syntax Tree抽象语法树这个概念来实现对代码的检查、分析等操作的。通过了解抽象语法树这个概念，你也可以随手编写类似的工具
- 用途
  - 代码语法的检查、代码风格的检查、代码的格式化、代码的高亮、代码错误提示、代码自动补全等等
如JSLint、JSHint对代码错误或风格的检查，发现一些潜在的错误
IDE的错误提示、格式化、高亮、自动补全等等
  - 优化变更代码，改变代码结构使达到想要的结构
    - 代码打包工具webpack、rollup等等
    - CommonJS、AMD、CMD、UMD等代码规范之间的转化
    - CoffeeScript、TypeScript、JSX等转化为原生Javascript
<img :src="$withBase('/img/ast.jpg')" >
- JavaScript Parser
  - JavaScript Parser，把js源码转化为抽象语法树的解析器。
  - 浏览器会把js源码通过解析器转为抽象语法树，再进一步转化为字节码或直接生成机器码。
  - 一般来说每个js引擎都会有自己的抽象语法树格式，Chrome的v8引擎，firefox的SpiderMonkey引擎等等，MDN提供了详细SpiderMonkey AST format的详细说明，算是业界的标准。
  - 常用的JavaScript Parser有
    - esprima
    - traceur
    - acorn
    - shift
  - esprima用法 [ast参考](https://astexplorer.net/)
    - 通过 [esprima](https://www.npmjs.com/package/esprima) 把源码转化为AST
    - 通过 [estraverse](https://www.npmjs.com/package/estraverse) 遍历并更新AST 
    - 通过 [escodegen](https://www.npmjs.com/package/escodegen) 将AST重新生成源码
```js
  cnpm i esprima estraverse escodegen- S

  let esprima = require('esprima');
  var estraverse = require('estraverse');
  var escodegen = require("escodegen");
  let code = 'function ast(){}';
  // 解析
  let ast=esprima.parse(code);
  let indent=0;
  function pad() {
      return ' '.repeat(indent);
  }
  // 遍历节点
  estraverse.traverse(ast,{
      enter(node) {
          console.log(pad()+node.type);
          if(node.type == 'FunctionDeclaration'){
              node.id.name = 'ast_rename';
          }
          indent+=2;
      },
      leave(node) {
          indent-=2;
          console.log(pad()+node.type);

      }
  });
  // 将AST重新生成源码
  let generated = escodegen.generate(ast);
  console.log(generated);
```
### 转换箭头函数
    - 访问者模式Visitor 对于某个对象或者一组对象，不同的访问者，产生的结果不同，执行操作也不同
  ```js
    //转换前
    const sum = (a,b)=>a+b
    //转换后
    // 实现
    let babel = require('@babel/core');
    let t = require('babel-types');
    const code = `const sum = (a,b)=>a+b`;
    // path.node  父节点
    // path.parentPath 父路径
    let transformArrowFunctions = {
        visitor: {
            ArrowFunctionExpression: (path, state) => {
                let node = path.node;
                let id = path.parent.id;
                let params = node.params;
                let body=t.blockStatement([
                    t.returnStatement(node.body)
                ]);
                let functionExpression = t.functionExpression(id,params,body,false,false);
                path.replaceWith(functionExpression);
            }
        }
    }
    const result = babel.transform(code, {
        plugins: [transformArrowFunctions]
    });
    console.log(result.code);
  ```
## loader解析
### loader运行的总体流程

<img :src="$withBase('/img/loader.jpg')" >

- loader配置
  - 匹配(test)单个 loader，你可以简单通过在 rule 对象设置 path.resolve 指向这个本地文件
  - 匹配(test)多个 loaders modules
  - alias 
```js
  {
    test: /\.js$/
    use: [
      {
        loader: path.resolve('path/to/loader.js'),
        options: {/* ... */}
      }
    ]
  }

  resolveLoader: {
    modules: [path.resolve('node_modules'), path.resolve(__dirname, 'src', 'loaders')]
  },

  resolveLoader: {
    alias: {
      "babel-loader": resolve('./loaders/babel-loader.js'),
      "css-loader": resolve('./loaders/css-loader.js'),
      "style-loader": resolve('./loaders/style-loader.js'),
      "file-loader": resolve('./loaders/file-loader.js'),
      "url-loader": resolve('./loaders/url-loader.js')
    }
  },
```
### 用法准则 
  - loaders 应该只做单一任务。这不仅使每个 loader 易维护，也可以在更多场景链式调用
  - 链式/利用 loader 可以链式调用的优势。写五个简单的 loader 实现五项任务，而不是一个 loader 实现五项任务
  - 无状态/确保 loader 在不同模块转换之间不保存状态。每次运行都应该独立于其他编译模块以及相同模块之前的编译结果。
  - loader 工具库
    - [loader-utils](https://github.com/webpack/loader-utils) 包。它提供了许多有用的工具，但最常用的一种工具是获取传递给 loader 的选项
    - [schema-utils](https://github.com/webpack/schema-utils) 包配合 loader-utils，用于保证 loader 选项，进行与 JSON Schema 结构一致的校验
  - 绝对路径
    - 不要在模块代码中插入绝对路径，因为当项目根路径变化时，文件绝对路径也会变化。loader-utils 中的 stringifyRequest 方法，可以将绝对路径转化为相对路径。
  - 同等依赖
    - 如果你的 loader 简单包裹另外一个包，你应该把这个包作为一个 peerDependency 引入
    - 
- API
  - webpack充分地利用缓存来提高编译效率
    - this.cacheable()
  ```js
    // 关闭该 Loader 的缓存功能 true则开启
    this.cacheable(false);
  ```

  - raw 
    - 默认的情况源文件是以 UTF-8 字符串的形式传入给 Loader,设置module.exports.raw = true可使用 buffer 的形式进行处理
    - 在默认的情况下，Webpack 传给 Loader 的原内容都是 UTF-8 格式编码的字符串。 但有些场景下 Loader 不是处理文本文件，而是处理二进制文件，例如 file-loader，就需要 Webpack 给 Loader 传入二进制格式的数据。 为此，你需要这样编写 Loader：
  ```js
    module.exports.raw = true;
    module.exports = function(source) {
      // 在 exports.raw === true 时，Webpack 传给 Loader 的 source 是 Buffer 类型的
      source instanceof Buffer === true;
      // Loader 返回的类型也可以是 Buffer 类型的
      // 在 exports.raw !== true 时，Loader 也可以返回 Buffer 类型的结果
      return source;
    };
    // 通过 exports.raw 属性告诉 Webpack 该 Loader 是否需要二进制数据 
    module.exports.raw = true;
  ```
### 获得 Loader 的 options
  ```js
  // webpack自带的工具包 
  const loaderUtils = require('loader-utils');
  module.exports = function(source) {
    // 获取到用户给当前 Loader 传入的 options
    const options = loaderUtils.getOptions(this);
    return source;
  };
  ```
### 异步处理
    - this.async();
  ```js
    // 让 Loader 缓存
    module.exports = function(source) {
        var callback = this.async();
        // 做异步的事
        doSomeAsyncOperation(content, function(err, result) {
            if(err) return callback(err);
            callback(null, result);
        });
    };
  ```
  - 同步处理
  - Loader有些场景下还需要返回除了内容之外的东西。
  ```js
    module.exports = function(source) {
      // 通过 this.callback 告诉 Webpack 返回的结果
      this.callback(null, source, sourceMaps);
      // 当你使用 this.callback 返回内容时，该 Loader 必须返回 undefined，
      // 以让 Webpack 知道该 Loader 返回的结果在 this.callback 中，而不是 return 中 
      return;
    };

    this.callback(
      // 当无法转换原内容时，给 Webpack 返回一个 Error
      err: Error | null,
      // 原内容转换后的内容
      content: string | Buffer,
      // 用于把转换后的内容得出原内容的 Source Map，方便调试
      sourceMap?: SourceMap,
      // 如果本次转换为原内容生成了 AST 语法树，可以把这个 AST 返回，
      // 以方便之后需要 AST 的 Loader 复用该 AST，以避免重复生成 AST，提升性能
      abstractSyntaxTree?: AST
    );
  ```
### 其他[API](https://webpack.js.org/api/loaders/)

  | 方法名        | 含义           |
  | ------------- |:-------------:| 
  | this.context     | 当前处理文件的所在目录，假如当前 Loader 处理的文件是 /src/main.js，则 this.context 就等于 /src | 
  | this.resource     | 当前处理文件的完整请求路径，包括 querystring，例如 /src/main.js?name=1。      | 
  | this.resourcePath | 当前处理文件的路径，例如 /src/main.js      |   
  | this.resourceQuery | 当前处理文件的 querystring      |   
  | this.target | 等于 Webpack 配置中的 Target      |   
  | this.loadModule | 但 Loader 在处理一个文件时，如果依赖其它文件的处理结果才能得出当前文件的结果时,就可以通过 this.loadModule(request: string, callback: function(err, source, sourceMap, module)) 去获得 request 对应文件的处理结果      |   
  | this.resolve | 像 require 语句一样获得指定文件的完整路径，使用方法为 resolve(context: string, request: string, callback: function(err, result: string)      |   
  | this.addDependency | 给当前处理文件添加其依赖的文件，以便再其依赖的文件发生变化时，会重新调用 Loader 处理该文件。使用方法为 addDependency(file: string)      |   
  | this.addContextDependency	 | 和 addDependency 类似，但 addContextDependency 是把整个目录加入到当前正在处理文件的依赖中。使用方法为 addContextDependency(directory: string)     |   
  | this.clearDependencies | 清除当前正在处理文件的所有依赖，使用方法为 clearDependencies()    |   
  | this.emitFile | 输出一个文件，使用方法为 emitFile(name: string, content: Buffer/string, sourceMap: {...})     |   
  | loader-utils.stringifyRequest |  把一个请求字符串转成一个字符串，以便能在require或者import中使用以避免绝对路径。如果你在一个loder中生成代码的话请使用这个而不要用JSON.stringify()      |   
  | loader-utils.interpolateName | 使用多个占位符或一个正则表达式转换一个文件名的模块。这个模板和正则表达式被设置为查询参数，在当前loader的上下文中被称为name或者regExp    |   

### loader实战
- 1、babel-loader
```js
let babel = require('@babel/core')
let loaderUtils = require('loader-utils')

function loader(source){
    let options = loaderUtils.getOptions(this)
    let cb = this.async()

    babel.transform(source,{
        ...options,
        sourceMap:true,
        filename: this.resourcePath.split('/').pop()
    },(err,rs)=>{
        cb(err,result.code.result.map)
    })
}
module.exports = loader
```
- 2、BannerLoader
```js
const loaderUtils = require('loader-utils');
const validateOptions = require('schema-utils');
const fs = require('fs');
function loader(source) {
    //把loader改为异步,任务完成后需要手工执行callback
    let cb = this.async();
    //启用loader缓存
    this.cacheable && this.cacheable();
    //用来验证options的合法性
    let schema = { 
        type: 'object',
        properties: {
            filename: {
                type: 'string'
            },
            text: {
                type: 'string'
            }
        }
    }
    //通过工具方法获取options
    let options = loaderUtils.getOptions(this);
    //用来验证options的合法性
    validateOptions(schema, options, 'Banner-Loader');
    let { text, filename } = options;
    if (text) {
        cb(null, text + source);
    } else if (filename) {
        fs.readFile(filename, 'utf8', (err, text) => {
            cb(err, text + source);
        });
    }
}
module.exports = loader;
```
- pitch
  - loader组成 pitch + normal
    - 比如a!b!c!module, 正常调用顺序应该是c、b、a，但是真正调用顺序是 a(pitch)、b(pitch)、c(pitch)、c、b、a,如果其中任何一个pitching loader返回了值就相当于在它以及它右边的loader已经执行完毕
    - 比如如果b返回了字符串"result b", 接下来只有a会被系统执行，且a的loader收到的参数是result b
    - pitch与loader本身方法的执行顺序图
    ```js
      |- a-loader `pitch`
        |- b-loader `pitch`
          |- c-loader `pitch`
            |- requested module is picked up as a dependency
          |- c-loader normal execution
        |- b-loader normal execution
      |- a-loader normal execution

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
            loader:[path.resolve('src/loaders/loader1'),
                   [path.resolve('src/loaders/loader2'),
                   [path.resolve('src/loaders/loader3')]
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
  - 处理css
    - css-loader 的作用是处理css中的 @import 和 url 这样的外部资源
    - style-loader 的作用是把样式插入到 DOM中，方法是在head中插入一个style标签，并把样式写入到这个标签的 innerHTML里
    - less-loader Compiles Less to CSS
  - less-loader.js
  ```js
    let less = require('less');
    module.exports = function (source) {
        let callback = this.async();
        less.render(source, { filename: this.resource }, (err, output) => {
            this.callback(err, output.css);
        });
    }
  ```
  - style-loader
  ```js
    let loaderUtils=require("loader-utils");
    function loader(source) {
        let script=(`
          let style = document.createElement("style");
          style.innerHTML = ${JSON.stringify(source)};
          document.head.appendChild(style);
        `);
        return script;
    } 
    //pitch里的参数可不是文件内容，而是文件的请求路径
    //pitch request就是你要加载的文件路径 //index.less
    loader.pitch = function (request) {
        let style = `
        var style = document.createElement("style");
        style.innerHTML = require(${loaderUtils.stringifyRequest(this, "!!" + request)});
        document.head.appendChild(style);
    `;
        return style;
    }
    module.exports = loader;
  ```
  - css-loader
  ```js
    function loader(source) {
        let reg = /url\((.+?)\)/g;
        let current;
        let pos = 0;
        let arr = [`let lists = [];`];
        while (current = reg.exec(source)) {
            let [matchUrl, p] = current;
            let index = reg.lastIndex - matchUrl.length;
            arr.push(`lists.push(${JSON.stringify(source.slice(pos, index))})`);
            pos = reg.lastIndex;
            arr.push(`lists.push("url("+require(${p})+")")`);
        }
        arr.push(`lists.push(${JSON.stringify(source.slice(pos))})`);
        arr.push(`module.exports = lists.join('')`);
        return arr.join('\r\n');
    }
    module.exports = loader;
  ```
  - exact-loader.js
  ```js
    //把CSS文件单独放置到一个文件中去，然后在页面中通过link标签去引入
    let loader = function (source) {
        //发射或者说输出一个文件，这个文件的内容 就是css文件的内容
        this.emitFile('main.css', source);
        let script = `
        let link  = document.createElement('link');
        link.setAttribute('rel','stylesheet');
        link.setAttribute('href','main.css');
        document.head.appendChild(link);
      `;
        return script;
    }
    module.exports = loader;
  ```
  - file-loader 并不会对文件内容进行任何转换，只是复制一份文件内容，并根据配置为他生成一个唯一的文件名。
    - 通过 loaderUtils.interpolateName 方法可以根据 options.name 以及文件内容生成一个唯一的文件名 url（一般配置都会带上hash，否则很可能由于文件重名而冲突）
    - 通过 this.emitFile(url, content) 告诉 webpack 我需要创建一个文件，webpack会根据参数创建对应的文件，放在 public path 目录下
    - 返回 module.exports = ${JSON.stringify(url)},这样就会把原来的文件路径替换为编译后的路径
  ```js
    const { getOptions, interpolateName } = require('loader-utils');
    function loader(content) {
        let options=getOptions(this)||{};
        let url = interpolateName(this, options.filename || "[hash]", {content});
        url = url  + this.resourcePath.slice(this.resourcePath.lastIndexOf('.'));
        //发射一个文件 向输出里保存一个文件
        this.emitFile(url, content);
        return `module.exports = ${JSON.stringify(url)}`;
    }
    loader.raw = true;
    module.exports = loader;
  ```
  - url-loader 
  ```js
  let { getOptions } = require('loader-utils');
  var mime = require('mime');
  function loader(source) {
      let options=getOptions(this)||{};
      let { limit, fallback='file-loader' } = options;
      if (limit) {
        limit = parseInt(limit, 10);
      }
      const mimetype=mime.getType(this.resourcePath);
      if (!limit || source.length < limit) {
          let base64 = `data:${mimetype};base64,${source.toString('base64')}`;
          return `module.exports = ${JSON.stringify(base64)}`;
      } else {
          let fileLoader = require(fallback || 'file-loader');
          return fileLoader.call(this, source);
      }
  }
  loader.raw = true;
  module.exports = loader;
  ```
  ###  测试待写

## plugin解析
- 插件向第三方开发者提供了 webpack 引擎中完整的能力。使用阶段式的构建回调，开发者可以引入它们自己的行为到 webpack 构建流程中。创建插件比创建 loader 更加高级，因为你将需要理解一些 webpack 底层的内部特性来做相应的钩子
- 为什么需要一个插件
  - webpack基础配置无法满足需求
  - 插件几乎能够任意更改webpack编译结果
  - webpack内部也是通过大量内部插件实现的
- 可以加载插件的常用对象

| 对象        | 钩子           | 
| ------------- |:-------------:| 
| Compiler      | run,compile,compilation,make,emit,done | 
| Compilation    | buildModule,normalModuleLoader,succeedModule,finishModules,seal,optimize,after-seal      | 
| Module Factory | beforeResolver,afterResolver,module,parser     | 
| Module      |  | 
| Parser      | program,statement,call,expression | 
| Template      | hash,bootstrap,localVars,render | 

###  创建插件
  - webpack 插件由以下组成：
    - 一个 JavaScript 命名函数。
    - 在插件函数的 prototype 上定义一个 apply 方法。
    - 指定一个绑定到 webpack 自身的事件钩子。
    - 处理 webpack 内部实例的特定数据。
    - 功能完成后调用 webpack 提供的回调。
### Compiler 和 Compilation
  - 在插件开发中最重要的两个资源就是compiler和compilation对象。理解它们的角色是扩展webpack引擎重要的第一步。
    - compiler 对象代表了完整的 webpack 环境配置。这个对象在启动 webpack 时被一次性建立，并配置好所有可操作的设置，包括 options，loader 和 plugin。当在 webpack 环境中应用一个插件时，插件将收到此 compiler 对象的引用。可以使用它来访问 webpack 的主环境。
    - compilation 对象代表了一次资源版本构建。当运行 webpack 开发环境中间件时，每当检测到一个文件变化，就会创建一个新的 compilation，从而生成一组新的编译资源。一个 compilation 对象表现了当前的模块资源、编译生成资源、变化的文件、以及被跟踪依赖的状态信息。compilation 对象也提供了很多关键时机的回调，以供插件做自定义处理时选择使用。
- 基本插件架构
  - 插件是由「具有 apply 方法的 prototype 对象」所实例化出来的。
  - 这个 apply 方法在安装插件时，会被 webpack compiler 调用一次。
  - apply 方法可以接收一个 webpack compiler 对象的引用，从而可以在回调函数中访问到 compiler 对象。
  ```js
  // 原理
    if (options.plugins && Array.isArray(options.plugins)) {
      for (const plugin of options.plugins) {
        plugin.apply(compiler);
      }
    }
  ```
  - 一个简单的插件结构如下：
  ```js
    class DonePlugin{
        constructor(options) {
            this.options=options;
        }
        apply(compiler) {
            compiler.hooks.done.tap('DonePlugin', ()=> {
                console.log('Hello ',this.options.name);
            });
        }
    }
    module.exports=DonePlugin;
  ```
  - 然后，要安装这个插件，只需要在你的 webpack 配置的 plugin 数组中添加一个实例：
  ```js
    const DonePlugin=require('./plugins/DonePlugin');
    module.exports={
        entry: './src/index.js',
        output: {
            path: path.resolve('build'),
            filename:'bundle.js'
        },
        plugins: [
            new DonePlugin({name:'sg'})
        ]
    }
  ```
  - 异步编译插件
    - 有一些编译插件中的步骤是异步的，这样就需要额外传入一个 callback 回调函数，并且在插件运行结束时，必须调用这个回调函数。
  ```js
  class CompilationAsyncPlugin{
    constructor(options) {
        this.options=options;
    }
    apply(compiler) {
        compiler.hooks.emit.tapAsync('EmitPlugin',function (compilation,callback) {
            setTimeout(function () {
                console.log('异步任务完成');
                callback();
            },500);
        });
    }
  }
  module.exports=CompilationAsyncPlugin;
  ```
  - 输出文件列表
  ```js
  class FileListPlugin{
      constructor(options) {
          this.options = options;
      }
      apply(compiler) {
          compiler.hooks.emit.tap('FileListPlugin', (compilation) =>{
              let filelist='## 文件列表';
              filelist = Object.keys(compilation.assets).reduce((filelist,filename)=>filelist+'\r\n- '+filename,filelist);
              compilation.assets[this.options.name?this.options.name:'filelist.md']={
                  source() {
                      return filelist;
                  },
                  size() {
                      return filelist.length
                  }
              }
          });
      }
  }
  module.exports=FileListPlugin;
  ``` 
## handWriteWebapck
### Webpack流程概括
  - 初始化参数：从配置文件和 Shell 语句中读取与合并参数，得出最终的参数； 开始编译：用上一步得到的参数初始化 Compiler 对象，加载所有配置的插件，执行对象的 run 方法开始执行编译；
  - 确定入口：根据配置中的 entry 找出所有的入口文件；
  - 编译模块：从入口文件出发，调用所有配置的 Loader 对模块进行翻译，再找出该模块依赖的模块，再递归本步骤直到所有入口依赖的文件都经过了本步骤的处理；
  - 完成模块编译：在经过第4步使用 Loader 翻译完所有模块后，得到了每个模块被翻译后的最终内容以及它们之间的依赖关系；
  - 输出资源：根据入口和模块之间的依赖关系，组装成一个个包含多个模块的 Chunk，再把每个 Chunk 转换成一个单独的文件加入到输出列表，这步是可以修改输出内容的最后机会；
  - 输出完成：在确定好输出内容后，根据配置确定输出的路径和文件名，把文件内容写入到文件系统。
  
- 钩子
  - entryOption 读取配置文件
  - afterPlugins 加载所有的插件
  - run 开始执行编译流程
  - compile 开始编译
  - afterCompile 编译完成
  - emit 写入文件
  - done 完成整体流程
- 编写示例项目
```js
  npm init -y
  yarn add webpack webpack-cli html-webpack-plugin

  // 编写webpack配置文件
  // webpack.config.js
  const path = require('path');
  module.exports = {
      mode: 'development',
      entry: './src/index.js',
      output: {
          path: path.resolve(__dirname, 'dist'),
          filename: 'bundle.js'
      },
      module: {
        // rules 里面的内容 等自己写的webpack增加loader解析后 在加入
        // rules: [
        //     {
        //     test: /.less$/,
        //     use: [
        //       path.resolve(__dirname,'loaders','style-loader'),
        //       path.resolve(__dirname,'loaders','less-loader'),
        //     ]
        //   }
        // ]
      },
      plugins: []
  }
  // 创建loaders/less-loader
    let less = require('less')
    function loader(source){
      let css = '';
      less.render(source,function(err,c){
        css = c.css
      })
      css = css.replace(/\n/g,'\\n')
      return css;
    }
    module.exports = loader
  // 创建loaders/style-loader
    function loader(source){
      let style = `
      let style = document.createElement('style')
      style.innerHTML = ${JSON.stringify(source)}
      document.head.appendChild(style)
      `
      return style;
    }
    module.exports = loader

    // 拿到的source 是有空格的 通过JSON.stringify 可以去掉
```
- 源文件
```js
// src/index.js
let a1=require('./a1');
console.log(a1);
// src/a1.js 
let a2=require('./base/a2');
module.exports='a1'+a2;
// src/base/a2.js
module.exports='a2';
```
-  产出bundle.js
```js
(function (modules) {
  var installedModules = {};
  function __webpack_require__(moduleId) {
    if (installedModules[moduleId]) {
      return installedModules[moduleId].exports;
    }
    var module = installedModules[moduleId] = {
      i: moduleId,
      l: false,
      exports: {}
    };

    modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
    module.l = true;
    return module.exports;
  }
  return __webpack_require__(__webpack_require__.s = "./src/index.js");
})
  ({

    "./src/a1.js":
      (function (module, exports, __webpack_require__) {
        eval("let a2 = __webpack_require__( \"./src/base/a2.js\");\r\nmodule.exports = 'a1' + a2;");
      }),
    "./src/base/a2.js":
      (function (module, exports) {
        eval("module.exports = 'a2';");
      }),

    "./src/index.js":
      (function (module, exports, __webpack_require__) {
        eval("let a1 = __webpack_require__(\"./src/a1.js\");\r\nconsole.log(a1);");
      })
  });
```
### 安装依赖包
- 1、准备
```js
  1、创建 webpackSg文件
  2、npm init -y
  3、修改package.json文件
      "bin": {
        "hardwebpack": "./bin/pack.js"
      },
  4、创建 bin/pack.js
```
- 2、入口文件处理(bin/pack.js)
```js
#! /usr/bin/env node
// 1、 需要找到当前执行名的路径  拿到webpakcc.config.js
let path = require('path')
// config 配置文件
let config = require(path.resolve('webpack.config.js'))
// let config = require(path.join(process.cwd(),'webpack.config.js'))
let Compiler = require('../lib/Compiler.js')
let compiler = new Compiler(config)

compiler.run()
```
- 3、创建lib/Compiler.js
  - 实现基本的 引入文件
```js
let fs = require('fs')
let path = require('path')

let babylon = require('babylon')
let t = require('@babel/types')
let traverse = require('@babel/traverse').default;
let generator = require('@babel/generator').default
let ejs = require('ejs')
// babylon 主要就是把源码  他里面有个方法叫parse 转换成ast
// @babel/traverse 遍历节点
// @babel/types 替换
// @babel/generator 生成结果
class Compiler {
  constructor(config) {
    // entry output
    this.config = config
    //1、需要保存入口文件的路径
    this.entryId; //'./src/index.js'
    //2、需要保存所有的模块依赖
    this.modules = {}
    this.entry = config.entry; // 入口文件
    this.root = process.cwd(); // 工作路径
  }
  run() {
    // 执行 并且创建模块的依赖关系,true代表主模块
    this.buildModlue(path.join(this.root, this.entry), true)
    console.log('=======3', this.modules, this.entryId)
    // 发射一个文件(打包后的文件)
    this.emitFile()
  }
  getSource(modulePath) {
    let content = fs.readFileSync(modulePath, 'utf8')
    return content
  }
  // 解析源码
  parse(source, parentPath) { // AST解析语法树
    // console.log(source,'==================>',parentPath)
    let ast = babylon.parse(source)
    let dependencies = []; //依赖的数组
    traverse(ast, {
      CallExpression(p) {
        let node = p.node; //对应的节点
        if (node.callee.name == 'require') {
          node.callee.name = '__webpack_require_';
          let moduleName = node.arguments[0].value; // 取到的就是模块的引用名字
          moduleName = moduleName + (path.extname(moduleName) ? '' : '.js')
          moduleName = './' + path.join(parentPath, moduleName)
          dependencies.push(moduleName)
          node.arguments = [t.stringLiteral(moduleName)]
        }
      }
    })
    let sourceCode = generator(ast).code

    // 附模块的加载 递归加载
    dependencies.forEach(dep => {
      this.buildModlue(path.join(this.root, dep), false)
    })
    return {
      sourceCode,
      dependencies
    }
  }
  // 构建模块
  buildModlue(modulePath, isEntry) {
    // 拿到模块的内容
    let source = this.getSource(modulePath)
    // 模块id modulePath = modulePath = this.root  
    let moduleName = './' + path.relative(this.root, modulePath)
    if (isEntry) {
      this.entryId = moduleName; //保存入口的名字
    }
    /**
     *  解析源码 对其改造
     *  1、将所有的require引入的内容 路径更改为src下
     *  2、将require 名字更改
     *  3、返回一个依赖列表
     * */
    let {
      sourceCode,
      dependencies
    } = this.parse(source, path.dirname(moduleName))
    // 把相对路径和模块中的内容 对应起来
    this.modules[moduleName] = sourceCode
  }
  emitFile() {
    // 用数据渲染  
    // 拿到输出到那个目录下
    let main = path.join(this.config.output.path, this.config.output.filename)
    let templateStr = this.getSource(path.join(__dirname, 'main.ejs'))
    let code = ejs.render(templateStr, {
      entryId: this.entryId,
      modules: this.modules
    });
    this.assets = {}
    // 资源中路径对应的代码
    this.assets[main] = code;
    fs.writeFileSync(main, this.assets[main])
  }
}
module.exports = Compiler
```
- 5、创建lib/main.ejs
```js
(function (modules) {
var installedModules = {};

function __webpack_require__(moduleId) {

if (installedModules[moduleId]) {
return installedModules[moduleId].exports;
}
var module = installedModules[moduleId] = {
i: moduleId,
l: false,
exports: {}
};

modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

module.l = true;

return module.exports;
}


return __webpack_require__(__webpack_require__.s = "<%-entryId%>");
})
({
<%for (let key in modules){%>
"<%-key%>":
(function(module, exports, __webpack_require__) {
eval(`<%-modules[key]%>`);
}),
<%}%>
});
```
- 6、做好的项目 通过 npm link 执行他 把当前的项目映射全局
- 7、在别需要打包的项目的引入 npm link webpackSg   执行npx webpackSg,他对应webpackSg package.json 的 bin配置的key 执行value路径里面的内容
### 8、增加loader解析功能
```js
// 修改 getSource
 getSource(moudlePath) {
  let rules = this.config.module.rules
  let source = fs.readFileSync(moudlePath, 'utf8')

  for(let i=0;i<rules.length;i++){
    let rule = rules[i]
    let {test,use} = rule
    let loaderIndex = use.length - 1
    if(test.test(moudlePath)){
      function next(){
        source = require(use[loaderIndex--])(source)
        if(loaderIndex >= 0){
          next()
        }
      }
      next()
    }
  }
  return source
}
```
### 9、增加plugin解析功能
```js 
// 修改constructor  emitFile run
 constructor(props) {
    this.config = props
    this.entry = props.entry // 文件入口
    this.entryId = null
    this.root = process.cwd() // 文件路径
    this.modules = {}
    this.hooks = {
      entryOption: new SyncHook(),
      afterPlugins: new SyncHook(),
      run: new SyncHook(),
      compile: new SyncHook(),
      afterCompile: new SyncHook(),
      emit: new SyncHook(["compiler"]),
      afterEmit: new SyncHook(),
      done: new SyncHook()
    }
    let plugins = options.plugins;
    if (plugins && plugins.length > 0) {
        plugins.forEach(plugin => plugin.apply(this));
    }
    this.hooks.afterPlugins.call();
  }
  emitFile() {
    this.hooks.emit.call(this, this);
    let main = path.join(this.config.output.path, this.config.output.filename)
    let ejsFile = this.getSource(path.join(__dirname, 'main.ejs'))
    let code = ejs.render(ejsFile, {
      entryId: this.entryId,
      modules: this.modules
    })
    this.assets = {}
    this.assets[main] = code
    fs.writeFileSync(main, this.assets[main])
    this.hooks.afterEmit.call();
    this.hooks.done.call();
  }
  run() {
    this.hooks.run.call(this);
    this.hooks.compile.call();
    // 执行创建模块依赖关系 
    this.moduleBuild(path.join(this.root, this.entry), true)
    this.hooks.afterCompile.call();
    // 发射文件
    this.emitFile()
  }
```
## 配置一个webpack-vue 支持ssr
- 创建webpack/webpack.config.js
- 创建webpack/webpack.client.js
- 创建webpack/webpack.server.js
- 创建文件vue相关的文件
- 安装相关依赖
  - yarn add webpack webpack-cli webpack-dev-server vue-loader vue-style-loader css-loader html-webpack-plugin @babel/core @babel/preset-env babel-loader vue-template-compiler webpack-merge
- 构建版本问题(具体看官网)
  - 完整版本 包含编译器和运行时的版本,
  - 编译器 用来将模板字符串编译成js渲染函数,也就是我们通常再在main.js 中的 new Vue 的时候 写的template. 
  - 运行时版本 用来创建Vue实例,渲染并处理虚拟dom等代码,基本上就时除去编译器的其他一切,我们通常用的脚手架就是运行时版本,如果在cli中的main.js new Vue 的时候写template就会报错,因为缺少编译器,处理template.运行版本比完整版体积要小大约30%.
  - 处理办法,安装的时候默认是引入运行版本,配置webpack将他修改成完整版本即可,
- css 要注意两点 默认情况支持scoped,如果要用css module 需要给css-loader配置
  ```js
  resolve:{
    alias:{
      "vue":"vue/dist/vue.esm.js"
    }
  }
  ```
- 支持vue
```html
<!-- src/index.html -->
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
  </head>
  <body>
    <div id="app"></div>
  </body>
  </html>
```
```js
// 创建src/index.js
import Vue from 'vue';
import App from './App.vue';

export default ()=>{
  let app = new Vue({
    // 用template要注意构建版本
    // template:<App/>
    render:(h)=>h(App)
  })
  return {app}
}

// src/client.js
import createApp from './index';
let {app} = createApp()
app.$mount('#app')


// src/App.vue
  <template>
    <div>
      <Bar></Bar>
      <Foo></Foo>
    </div>
  </template>

  <script>
  import Bar from './components/Bar.vue'
  import Foo from './components/Foo.vue'
    export default {
      components:{
        Bar,
        Foo
      }
    }
  </script>

  <style scoped>

  </style>
// src/router/index.js
  import Vue from 'vue';
  import VueRouter from 'vue-router';
  Vue.use(VueRouter);
  import Bar from './components/Bar.vue';
  import Foo from './components/Foo.vue';
  export default () => {
    let router = new VueRouter({
      mode: 'history',
      routes: [{
          path: '/',
          component: Bar,
        },
        {
          path: '/foo',
          component: Foo
        }
      ]
    });
    return router
  }
```
- 创建webpack相关的文件
```js
// 创建webpack/webpack.config.js
let path = require('path')
let VueLoaderPlugin = require('vue-loader/lib/plugin')
module.exports = {
  output: {
    filename: '[name].[hash].js'
  },
  module: {
    rules: [
    {
      test: /\.js$/,
      use: [{
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env']
        },
      }],
      exclude: /node_modules/

    }, {
      test: /\.css$/,
      use: ['vue-style-loader', 'css-loader']
    }, {
      test: /\.vue$/,
      use: ['vue-loader']
    }
  ]
  },
  resolve: {
    alias: { // 不加这个会 编译报错
      'vue': 'vue/dist/vue.esm.js'
    }
  },
  plugins: [
    new VueLoaderPlugin()
  ]
}
```
```js
// webpack/webpack.client.js
let htmlPluginWebpack = require('html-webpack-plugin')
let path = require('path')
let {
  smart
} = require('webpack-merge')
let base = require('./webpack.config')

module.exports = smart(base, {
  entry: {
    client: path.join(__dirname, '../src/client.js')
  },
  mode: "production",
  plugins:[
    new htmlPluginWebpack({
      template: path.join(__dirname, '../src/index.html'),
      filename: 'index.html'
    })
  ]
})
```

- 支持vue.srr
  - 在上面文件进行处理
```html
<!-- server.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Document</title>
</head>
<body>
  <!--vue-ssr-outlet-->
  <script src="./client.js"></script>
</body>
</html>
```
```js
// webpack/webpack.server.js
let path = require('path')
let htmlPluginWebpack = require('html-webpack-plugin')
let {
  smart
} = require('webpack-merge')
let base = require('./webpack.config')

module.exports = smart(base, {
  target:'node',//打包除的结果给node用
  mode: "production",
  entry:{
    server:path.join(__dirname,'../nodeServer.js')
  },
  output:{
    libraryTarget:'commonjs2'
  },
  plugins:[
    new htmlPluginWebpack({
      template: path.join(__dirname, '../src/index.html'),
      filename: 'server.html',
      excludeChunks: ['server']
    })
  ]
})
```
```js
  // src/client.js
  import createApp from './index';
  let {app} = createApp()
  
  // src/server.js
  import createApp from './main'
  export default ()=>{
  let {app} = createApp()
    return app 
  }

  // src/App.vue
  <template>
    <div id='app'>
      <Bar></Bar>
      <Foo></Foo>
    </div>
  </template>
```
```js
// node-server.js
let express = require('express');
let app = express()
let Vue = require('vue')
let fs = require('fs')
let path = require('path')
let VueServerRenderer = require('vue-server-renderer')
let serverBundle = fs.readFileSync('./dist/server.js','utf8')
let template = fs.readFileSync('./dist/server.html','utf8')

let render = VueServerRenderer.createBundleRenderer(serverBundle,{
  template
})

app.get('/',(req,res)=>{
  // 把渲染成功的字符串丢给客户端
  render.renderToString((err,html)=>{
    res.end(html)
  })
})
app.use(express.static(path.join(__dirname,'dist')))

app.listen(4000);
```