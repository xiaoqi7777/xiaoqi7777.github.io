# vue 汇总
[[toc]]

## 更新视图原理
- 数据劫持
- vue中的数据双向绑定  一个是对象 一个是数组 
- 对象要求数据先存在,否则无法更新视图
- 数组方法都是 vue内容进行重写了 但是length长度的变化和通过索引是无法更新的
- 数据变化后更新视图操作是异步执行的 调取vm.$el.innerHTML 值是没有变化的
- 可以通过vm.$nextTick 等视图更新后 获取的就是变化的值
- 以下修改 不会更新视图
  - vm.info.address = '1234' //原data下没有这个属性
  - vm.arr.length--  //数组长度变化
- 以下修改 都会更新视图
  - vm.info = {address:'123'} //赋值对象会 会被监控 可参考Observer.js
  - vm.arr.push(1)     // 数组方法的增减       
  - 在原有的对象内 新增数据 
  - vm.$set(vm.info,'address','22222')
```js
let obj = {
    age:'12',
    data:{
        name:'3333333'
    }
}
function observer(obj){
    if(typeof obj === 'object'){
        for(let key in obj){
            defineReactive(obj,key,obj[key])
        }
    }
}
function defineReactive(obj,key,value){
    // 如果value 是一个对象  则递归
    observer(value)
    Object.defineProperty(obj,key,{
        get(){
            console.log('get')
            return value
        },
        set(item){
            // 如果传入的值 是一个对象,也要拦截下
            observer(item)
            console.log('1数据更新了',item)
            value = item
        }
    })
}
observer(obj)
```
- 1、如果 后增加的属性 是不会触发setter访问器的, 同样vue后增加的属性 也不会刷新视图
  obj.data.s = 'sssssss' //不会出发数据更新
- 2、对象情况下
  - 修改obj 下面的属性 就会触发 数据更新了  因为传入的是一个对象 {s:"123"} 也会被监控
```js
  obj.data= {
      s:"123"
  }
```
- 3、数组情况下
  - defineProperty 只针对对象有用  数组无效, 这种情况下改写所有的数组, 以push为例
```js
  obj.arr = [1,2,3,4] 
  let arr = ['push','pop','shift','unshfit'] //dengdeng
  for (let i=0;i<arr.length;i++){
      let method = arr[i]
      let oldPush = Array.prototype[method]
      Array.prototype[method] = function(item){
          console.log('2数据更新了');
          oldPush.call(this,item)
      }
  }
  obj.arr[1] = '123'
  obj.arr.push(5) //如不改写,不会触发数据更新 
```

## vue实例上的方法
- vm.$el   
- vm.$mount() 做单元测试   
- vm.$options  vue内的属性选项
- vm.$nextTick(()=>{})
- vm.$watch('data1',(newValue,oldValue)=>{})


## 指令
- v-show 控制的是样式 不支持template  v-if 控制的是dom 支持template
- v-for 放在谁身上就循环谁(可以循环对象也可以数组) 里面key值作用
- 为啥data里面不能放方法(function) 因为里面的this 是window而不是vue实例
```js 
  //:key解析 
  <div v-if="flag">
    <span>珠峰</span>
    <input type="text" :key='1' />
  </div>
  <div v-else>
    <span>架构</span>
    <input type="text" :key='2' />
  </div>

  //如果不加key 那么flag 值变化的时候 input不会更新
  //加key 在diff 比较的时候 以便区别,用来区分元素
  //一般不用index作为key

  // 如果fn不传值 方法里面默认参数就是e, 如果传值 fn($event,a) $event也是e 固定写法 a就是别的参数 
  <input type="text" @input="fn" class="ss">
```
- 定义指令
  - Vue.directive有2中写法 第二个参数是对象 和 函数
```js
  //输入的数值 只要3个
  <input type="text" v-model='msg' v-split.xx='msg' />
    Vue.directive('split',function(el,bindings,vnode){
      let ctx = vnode.context;//获取上下文
      ctx[bindings.expression] = el.value.slice(0,3) 
    }
  })

  <input type="text"  v-split.xx='msg' />
  //下面增加了v-model='msg'
  Vue.directive('split',{
    bind(el,bindings,vnode){
      //el 当前dom bindings申明指令的参数 vnode.context上下文
      let ctx = vnode.context;
      el.addEventListener('input',(e)=>{
        let val = e.target.value.slice(0,3);//输入框中的内容 
        ctx[bindings.expression] = val //将输入的值复制给当前的msg
        el.value = val
      })
      el.value = ctx[bindings.expression].slice(0,3)
    }
  })

  // 获取焦点
  Vue.directive('focus',{
    bind(el){
      Vue.nextTick(()=>{
        el.focus();
      })
    }
  })
```

### select/radio/checkbox
```js
  // select  v-model绑定option中的value   option标签中间的显示的给客户看 value给程序员看 
  <select v-model='selectValue'> 
    <!-- 默认 请选择 -->
    <option value="0" disabled>请选择</option>
    <option v-for='list in lists' :value="list.id">{{list.value}}</option>
  </select>

  //radio 当前的radioValue== 男 那么就会自动选中
  男:<input type="radio" v-model="radioValue" value="男">
  女:<input type="radio"  v-model="radioValue" value="女">
  {{radioValue}}

  //checkbox checkboxValues初始值为数组  当不给value的时候 默认值 false/true 给了value才是他的值
  游泳: <input type="checkbox" v-model="checkboxValues" value="游泳">
  健身: <input type="checkbox" v-model="checkboxValues" value="健身">
  {{checkboxValues}}
```

## 修饰符
- v-model.number
- v-model.number.trim
- @keyup.enter
  - 键盘修饰符 @keyup='fn' input按下键盘就触发fn .enter修饰符就是(按下enter键的时候触发)

## 过滤器
```js
{{name | capitalize(1)}}
Vue.filter('capitalize',(value,val)=>{
    console.log('canshu',value,val)
    return value
})
```
## 属性绑定-class
```js
// class 绑定 对象时 isRed为ture class才为red 数组时 可以显示多个
<div :class="{ red: isRed }"></div>
<div :class="[classA, classB]"></div>
<div :class="[classA, { classB: isB, classC: isC }]">
```

## computed&&watch&&methods
- methods 只要方法放在页面上  页面上任何数据变化 该方法都会执行一次  没有缓存
- computed 和 watch 区别 computed不支持异步 watch可以
- computed 可以缓存
- watch
```js
 watch:{
  //全写
  firstMsg:{
      handler(){
          console.log('firstMsg 变化了')
      },
      immediate:true,//绑定的时候 立即执行(默认不会)
  },
  //简写
  lastMsg(){
      console.log('lastMsg 变化了')
  }
  },
```
- computed
```js

//全选 用computed做
<input type="checkbox" v-model='checkAll'>
<input type="checkbox" v-for='(check,index) in checks' :key='index' v-model='check.value' >
computed:{
// Object.defineProperty来实现

// 全写 computed的set方法在 checkbox 能用到
// 当checkbox 被点击的时候 触发set()
checkAll:{
    get (){
        return this.checks.every(item => item.value)
    },
    set(val){
        this.checks.forEach(item =>{ item.value = val });
    }
}
},
```

## lifeCycle
```js
  beforeCreate(){
      //初始化自己的生命周期 获取children 和 parent,并且绑定自己的事件
      //不能操作属性和方法
      console.log(this,this.$data)
  },
  created(){
    // 可以获取数据和调用方法
      console.log(this.$data,this.data)
  },
  beforeMount(){
      //第一次调用 函数渲染之前
      console.log('挂载前')
  },
  mounted(){
      //获取真是的dom
      console.log('挂载后')
  },
  beforeUpdate(){
      console.log('更新前')
  },
  updated(){//一般不要操作数据 可能会导致死循环
      console.log('更新后')
  },
  beforeDestroy(){
      //当前实例还可以用,这儿一般清除定时器
      console.log('销毁前')
  },
  destroyed(){
      // 实例上的方法 监听都被移除掉
      console.log('销毁后')
  },
  //触发 销毁 第一种路由切换 第二种 vm.$destroy()
```

## components
- 通信
  - 1、props和$emit
  - 2、$attrs和$listeners
  - 3、$parent和$children
  - 4、$refs获取实例
  - 5、父组件中通过provider来提供变量,用Inject接受
  - 6、envetBus平级组件数据传递
  - 7、vuex状态管理
- 属性传递
  -  msg属性取出来的值 都是String  加:  引号里面是啥就传啥类型 不加:一律按String处理 
```html
  <my-button :msg='123' :a='3' :arr="[1]"></my-button>
```
- 子组件 this.$attrs 获取所有的父组件传递的属性
  - v-bind=$attrs 绑定所有的属性
  ```html
   <button v-bind='$attrs' @click="btn">触发1</button> 
  ```
```js
  props:{
    msg:{
        type:Number,
        default:123
    },
    arr:{
        type:Array,
        // 数组或者对象 必须写成函数返回的形式
        default:()=>([1,3])
    },
    a:{
        type:Number,
        validator(val){
            //属性校验器,val就是传递过来的值 
            //true说明正常 false说明传值不满足
            return true
        }
    }
  },
```
- 方法传递
  - 给组件绑定事件 需要加.native  不加就认为是一个普通的属性, 他会绑定给儿子最外层标签
  - $listeners 获取父组件传递所有的方法
  - v-on=$listeners 绑定所有的方法
```html
  <!-- 父组件 @click='btn' => this.$on('click',btn)-->
  <btn-button a='123' b='sss' @click='btn'></btn-button>
  <!-- 子组件 -->
  <button v-bind='$attrs'>v-bind将父级所有的属性绑定到当前</button> 
  <button @click="$emit('click')">emit触发click方法</button> 
  <button @click="$listeners.click">触发父级click的方法</button> 
  <button v-on="$listeners">v-on将父级所有的方法绑定到当前</button> 
```
### 组件通信
- _uid:每个组件都有唯一的id 
- 平级通信
```js
//子组件 methods
change(){
  this.$parent.cut(this._uid)
}
//父组件 methods
cut(id){
  this.$children.forEach(child => {
    if(child._uid == id){
      //  可以确定是哪一个子组件
      //  对child做处理
    }
  })
}
```
- provide通信 
  - provide 在上游 提供  inject下游接受  多少层都可以获取到
```js
  //和data 同级
  // 申明
  provide:{
      m1:'根组件提供'
  },
  // 获取
  inject:['m1']
```
- ref
  - 如果遇到循环 就是多个元素 数组的形式
```js
  // 声明
  <div ref="my">dom</div>
  //获取
  this.$refs.my // 当前dom

  // 循环
  <div v-for='item in 3'>
      <div ref='my'>12</div>
  </div>
  this.$refs.my //[div, div, div]

  //组件上添加ref
  <Item ref="my"></Item>
  this.$refs.my //就是当前组件的实例 可以调取里面的方法
```

## 插槽
- 组件中间写了 template (有slot='item' 就是具名插槽)  要是直接写的东西对应slot中
```html
<!-- 子组件 -->
<l-item>
    <template slot='item'>
        <!-- 组件_uid 是组件唯一id -->
        <i-item title='node'>1号组件</i-item>
        <i-item title='react'>2号组件</i-item>
        <i-item title='vue'>3号组件</i-item>
    </template>
</l-item>

<!-- 父组件 -->
<slot name='item'></slot>
```

## vue-cli
```js
  // 全局安装脚手架
  cnpm  i @vue/cli -g
  // 生成项目
  vue create my-project
```
## webpack配置
- webpack 文件隐藏着 
- 配置他 只需要创建vue.config.js 他会覆盖原有配置
```js
let path = require('path')
// 默认环境变量 NODE_ENV production development
module.exports = {
  //根据环境 设置请求路径
  publicPath:process.env.NODE_ENV === 'production' ? 'http://www.zf.com':'/',
  //打包的资源 集中放到一个独立文件
  assetsDir:'asserts',
  // 输出的目录 默认dist
  outputDir:'./my-dist',
  // 加这个才能使用template(一般都是render)  一般不使用体积会变大 设置false
  runtimeCompiler:true,
  // 打包 不在使用SourceMap 减少体积
  productionSourceMap:false,
  chainWebpack:config=>{
    //  可以获取到webpack的配置 在增加一些自己的功能
    //  配置目录别名 别名叫@   以后引用的@ 就直接代表src目录
    config.resolve.alias.set('@',path.resolve(__dirname,'src'))
  },
  // configureWebpack:{//会自动合并
  //   pluhins:[],
  //   module:{}
  // },
  devServer:{
    //开发 服务时 使用
    proxy:{
      '/api/getUser':{
        target:'http://localhost:3000',
        pathRewrite:{
          //vue中 请求 /api/getUser会找到这儿
          //下面配置 /api不会出现在真是请求路径中
          '/api':''
        }
      }
    }
  },
  // vue add style-resources-loader 会自动注入进来
  pluginOptions: {
    'style-resources-loader': {
      preProcessor: 'scss',
      patterns: [
        path.resolve(__dirname,'src/assets/common.scss')
      ]
    }
  }
}
```

## vue-router
- router/index.js
```js
  import Vue from 'vue'
  import VueRouter from 'vue-router'
  import routes from './routes'
  // 第三方插件引入后 要使用Vue.use() 

  Vue.use(VueRouter);// 注册了两个全局组件 router-link router-view
  // 会在每个组件上定义两个属性 $router $route this.$router this.$route

  export default new VueRouter({
    mode:'hash', //默认会出现一个#
    routes
  })
```
- router/routes.js
```js
import Home from '_v/Home.vue'
import Profile from '_v/Profile.vue'
import User from '_v/User.vue'
// 默认加载首页 其他的组件 在点击时懒加载
// 可能会有白屏
export default = [
  {
    path:'/home',
    name:'home',
    component:{
      default:Home,
      name:Profile,
      version:User
    }
  },
  {
    path:'/login',
    name:'login',
    // import返回的是一个 promise
    component:()=>import('_v/Login.vue')
    // component 其他的组件 在点击时懒加载
  },
  {
    path:'/profile',
    name:'profile',
    component:()=>import('_v/Profile.vue'),
  },
  {
    path:'/user',
    name:'user',
    component:()=>import('_v/User.vue'),
    meta:{ needLogin:true },//路由元信息
    children:[
      {
        path:'',
        component:()=>import('_v/userAdd.vue'),
      },
      {
        // 儿子路径默认不能j加/ 
        path:'add',
        name:'userAdd',
        component:()=>import('_v/userAdd.vue'),
      }
    ]
  },
]

//修改配置别名
chainWebpack:config=>{
  config.resolve.alias.set('_v',path.resolve(__dirname,'src/components'))
}
```
- App.vue
```html
<template>
  <div id='app'>
    <ul>
    <!-- 默认是a标签 tag可以设置  -->
      <li><router-link tag="span" :to="{name:'home'}">首页</router-link></li>
      <li><router-link :to="{path:'/profile'}">个人中心</router-link></li>
      <li><router-link>用户</router-link></li>
      <li><router-link>登录</router-link></li>
    <ul> 
    <!--  这个会显示匹配到的路由 -->
    <!-- 没名字 是默认  有名字会根据名字渲染  -->
    <router-view></router-view>
    <router-view name='name'></router-view>
    <router-view name='version'></router-view>
    
  </div>
</template>
```
- 钩子函数
  - 当组件切换时 会触发离开的钩子 beforeRouteLeave
  - 进入到一个新的页面里 组件内部 会触发一个方法 beforeRouteEnter
  - 当属性变化的时候 并没有重新加载组件 会触发beforeRouteUpdate
    - 钩子周期
    - beforeEach  如进入到新的页面
    - beforeEnter 进到路由的配置中
    - beforeRouterEnter 组件进入时的钩子
    - beforeResolve 解析完成
    - afterEach 当前进入完毕
  -组件渲染完成以后 会调用当前 beforeRouteEnter 回调方法
```html
  <btton @click='toList'>跳转</btton>

  <script>
    1、组件内
      methods:{
        toList(){
          //vue.use(VueRouter)  里面有2个东西 $router $route 
          //带r存的都是方法  不带r存的都是属性
          this.$router.push('/user/list')
        }
      }
      //钩子函数  与data同级
      beforeRouteLeave(to,from,next){
        // next()//往下走
      }
      beforeRouteEnter(to,from,next){
        // 此方法中不能拿到this
        // from.name //可以拿到name 对应路由的名字
        next(vm=>{
          console.log('实例',vm)// 组件渲染完成后 会调用当前beforceRouteEnter方法
        })
      }
    2、全局 在main.js里面
      router.beforeEach((to,from,next)=>{
        console.log(to.matched)//获取当前路由所有匹配的路径 是一个数组
        console.log(to.meta)//获取路由元信息
        // 查看路由元 信息 是否有needLogin
        let flag = to.matched.some(match=>{
          return match.meta && match.meta.needLogin
        })

        if(flag){ //需要登录
          let isLogin = localStorage.getItem('login')// ajax 看一下用户是否登录过
          if(isLogin){
            //如果用户已经登录 并且访问 的还是登录页面
            next();
          }else{
            next('/login');//没有登录 去登录页面 
          }
        }else{ //不需要登录
          next();
        }

      })
      router.beforeResolve((to,from,next)=>{
        // 当前路由解析后会跳转的钩子
        console.log('xxx')
        next();
      })
      router.afterEach(()=>{
        console.log('xxx')
      })
  </script>
```
- 带参数跳转
```html
  1、<!-- 问好传递参数 -->
    <li><router-link to="/user/detail?id=1">用户1</router-link></li>

    <script>
      //获取 
      this.$route.query.id

      当网页中id值变化的时候 组件不会重新加载
      1、可以用watch监听
        watch:{
          $route(){
            console.log('xx')
          }
        }
      2、beforeRouterUpdate(to,from,next){
          console.log('xx')
          next()
      }
    </script>
  2、<!-- 路由的路径传递 -->
    在routes定义
    {
      path:'detail/id'
    }
    <li><router-link to="/user/detail/1">用户1</router-link></li>

    <script>

      //获取 
      this.$route.params.id

    </script>
```

## vuex
- 创建
- store/index.js
```js
  import Vue from 'vue';
  import vuex from 'vuex';

  import actions from './actions'
  import mutations from './mutations'
  import state from './state'
  import getters from './getters'

  import user from './modules/user'

  Vue.use(vuex)
  // 只要页面中注入了store 每个实例上都会存在一个属性 $store
  export default new vuex.Store({
    strict:process.env.NODE_ENV != 'production',// 校验更改状态的合法性
    actions,
    mutations,
    state,
    getters,
    modules:{
      user
    }
  })
  // this.$store.state.lesson
  // this.$store.state.user.userName
```
- store/state.js && store/getters.js && store/mutations.js && store/actions.js
```js
  // state
  export default {
    lesson:'珠峰课程',
    className:'1-1'
  }
  // getters
  export default {
    getNewName(state){
      return '高级'+state.lesson
    }
  }
  // mutations 和 store/modules/user.js类似
  export default {
    
  }
  // actions
  export default {
    
  }
```

- store/modules/user.js
```js
export default {
  namespaced: true, //启动 独立的命名空间
  state: {
    userName: 'userName'
  },
  getters: {

  },
  mutations: {
    // 第一个参数永远是state
    change_userName(state,payload) {
      // alert(1)
      state.userName = payload
      console.log(state,payload)
    }
  },
  actions: {
    change_userNameAction({commit},payload){
        setTimeout(()=>{
          commit('change_userName',payload)
          //在action中可以多次触发mutations
        },1000)
    }
  }
}
```

- 使用
```js
  // 只要页面中注入了store 每个实例上都会存在一个属性 $store
  import {mapState,mapGetters,mapMutations,mapActions} from 'vuex'
  computed:{
    // 默认的
    ...mapState(['lesson','className']),
    // user 是子模块的名字
    ...mapState('user',['userName']),
    //第二个参数是对象 当前直接 获取 u 
    // ...mapState('user',{u:(state)=>state.userName})
    ...mapGetters(['getNewName'])
  },
  methods: {
    ...mapMutations('user',['change_userName']),
    ...mapActions('user',['change_userNameAction']),
    btn(){
      this['change_userName']('sg')
      this['change_userNameAction']('sgt')
      // this.$store.commit('user/change_userName','jwt')
      // this.$store.dispatch('user/change_userName','jwt')
    }
  },

```

## axion && jwt 使用
- 搭建server.js
- jwt 原理 
  - 后端: 用户信息 + 密钥(后端存放) + 过期时间(等) = 组成一个加密的token
  - 前端: 登录后获取token,每次发送请求 的时候 将token放在 Authorization 请求头上,后端判断是否有效(过期,正确性等)
```js
let express = require('express')
let app = express()
//jwt jsonwebtoken的库
// jwt.sign 加密 jwt.verify解密
let jwt = require('jsonwebtoken')

var bodyParser = require('body-parser');//解析,用req.body获取post参数
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

let whitList = ['http://localhost:8080']
app.use((req,res,next)=>{
    let origin = req.headers.origin
     if(whitList.includes(origin)){
        res.setHeader('Access-Control-Allow-Origin',origin)
        res.setHeader('Access-Control-Allow-Headers','name,xx,Authorization,Content-Type')
        res.setHeader('Access-Control-Allow-Methods','PUT')
        res.setHeader('Access-Control-Allow-Credentials',true)
        res.setHeader('Access-Control-Expose-Headers','name,ss,xx')
        res.setHeader('Access-Control-Max-Age',10)
        if(req.method === 'options'){
            res.end()
        }
    }
    next()
})

app.get('/user',(req,res)=>{
  setTimeout(()=>{
    res.json({name:1})
  },2500)
})
const secret = 'cf'
app.post('/login',(req,res)=>{
  let {username} = req.body
  if(username === 'admin'){
    res.json({
      code:0,
      username:'admin',
      //加密 发送给前端
      token:jwt.sign({username:'admin'},secret,{
        expiresIn:5
      })
    })
  }else{
    res.json({
      code:1,
      data:'用户名不存在'
    })
  }
})

app.get('/validate',(req,res)=>{
  let token = req.headers.authorization;
  //解密 获取token
  jwt.verify(token,secret,(err,decode)=>{
    if(err){
      return res.json({
        code:1,
        data:'token失效了'
      })
    }else{
      // 只要用户路由刷新 token就延时 20秒  
      res.json({
        username:decode.username,
        code:0,
        token:jwt.sign({username:'admin'},secret,{
          expiresIn:20
        })
      })
    }
  })
})

app.listen(3000,()=>{
    console.log('listen start')
})
```

- axios封装 和 loading
  -axiosn封装 api抽离
- libs/ajaxRequest
```js
  import axios from 'axios';
  import store from '../store'
  import {getLocal} from './local'
  // 当第一次请求 显示loding 剩下的时候就不调用了
  // 当都请求完毕后 隐藏loading
  class AjaxRequest{
    constructor(){
      //  请求路径 根据开发和生产区分
      this.baseURL = process.env.NODE_ENV == 'production'?'/':'http://localhost:3000';
      //  超时
      this.timeout = 3000;
      this.queue = {};//存放每次的请求 处理loading
    }
    merge(options){
      return {...options,baseURL:this.baseURL,timeout:this.timeout}
    }
    setInterceptor(instance,url){
      // 每次请求时 都会加一个loading效果 
      // 更改请求头
      instance.interceptors.request.use(config=>{
        // 加请求头 getLocal从本地存储获取token
        config.headers.Authorization=getLocal('token');
        if(Object.keys(this.queue).length === 0){
          store.commit('showLoading')
        }
        this.queue[url] = url
        return config
      })
      instance.interceptors.response.use(res=>{
        delete this.queue[url]; // 每次请求成功后 都删除队列里的路径
        if(Object.keys(this.queue).length === 0){
          store.commit('hideLoading')
        }
        return res.data
      })
    }
    request(options){
      // 返回axios实例
      let instance = axios.create(config);
      // 对请求和拦截做处理
      this.setInterceptor(instance,options.url)
      // 将所有的参数合并
      let config = this.merge(options);
      return instance(config)
    }
  }
export default new AjaxRequest
```
- /api/user
```js
import axios from '../libs/ajaxRequest';

export const getUser = () => {
  return axios.request({
    url:'/user',
    method:'get'
  })
};

export const login = (username) => {
  return axios.request({
    url:'/login',
    method:'post',
    data:{
      username
    }
  })
}

export const validate = () => {
  return axios.request({
    url:'/validate',
    method:'get',
  })
}
```

- libs/local
```js
export const setLocal = (key,value)=>{
  if(typeof value == 'object'){
    value = JSON.stringify(value);
  }
  localStorage.setItem(key,value)
}

export const getLocal = (key)=>{
 return localStorage.getItem(key)
}
```
- store
```js
import {login,validate} from '../api/user'
import {setLocal} from '../libs/local'
export default {
  namespaced: true, //启动 独立的命名空间
  state: {
    isShowLoading:false,
    username:'',
  },
  getters: {

  },
  mutations: {
    // 第一个参数永远是state
    showLoading(state){
      state.isShowLoading = true
    },
    hideLoading(state){
      state.isShowLoading = false
    },
    setUser(state,username){
      state.username = username;
    }
  },
  actions: {
    // 登录获取token
    async toLogin({commit},username){
      let rs = await login(username);
      if(rs.code === 0){
        //成功登录
        commit('setUser',rs.username)
        //将token保存到client 每次请求带上, 服务端校验token 如果token不正确 或者过期 没登录
        setLocal('token',rs.token)
      }else{
        return Promise.reject(rs.data)
      }
    },
    //查看 token是否有效
    async validate({commit}){
      let rs = await validate();
      if(rs.code === 0){
        commit('setUser',rs.username)
        setLocal('token',rs.token)
      }
      return rs.code === 0;//返回用户是否失效
    }
  }
}
```

- router.js
```js
import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '_v/Home.vue'
import App from './App'

Vue.use(VueRouter);
export default new VueRouter({
  mode:'hash', //默认会出现一个#
  routes:[
    {
      path:'/',
      name:'App',
      component:App
    },
    {
      path:'/login',
      name:'login',
      // import返回的是一个promise
      component:()=>import('_v/Login.vue')
    },
    {
      path:'/profile',
      name:'profile',
      component:()=>import('_v/Profile.vue'),
    },
    {
      path:'/user',
      name:'user',
      component:()=>import('_v/User.vue'),
      meta:{ needLogin:true },//路由元信息
      children:[
        {
          path:'',
          component:()=>import('_v/userAdd.vue'),
        },
        {
          // 儿子路径默认不能j加/ 
          path:'add',
          name:'userAdd',
          component:()=>import('_v/userAdd.vue'),
        }
      ]
    },
  ]
})
```
- main
```js
import Vue from 'vue'
import App from './App.vue'

import store from './store/index'
import router from './router'

Vue.config.productionTip = false

router.beforeEach(async (to,from,next)=>{
  // 根据router 配置的meta是否需要登录 在查看是否有效
  let flag = to.matched.some(match=>{
    return match.meta && match.meta.needLogin
  })

  if(flag){ //需要登录
    let rs =  await store.dispatch('validate')//根据rs返回的数据 查看tikon是否有效
    if(rs){
      //如果用户已经登录 并且访问 的还是登录页面
      next();
    }else{
      next('/login');//没有登录 去登录页面 
    }
  }else{ //不需要登录
    next();
  }
  next()
})

new Vue({
  render: h => h(App),
  store,
  router
}).$mount('#app')

```

- app.vue
```js
<span v-if="$store.state.isShowLoading"> 加载中 </span>
<router-view></router-view>
```

- login.vue
```html
    <input type="text" v-model="username" >
    <Button @click='login'>登录</Button>
    <span>
      当前登录用户:{{$store.state.username}}
    </span>
  <script>
    import {getUser} from '../api/user.js';
    import {mapActions} from 'vuex'

     methods:{
        ...mapActions(['toLogin']),
        login(){
          this['toLogin'](this.username);
        }
      }
  </script>
```