# jwt
  [[toc]]
[代码-分支/jwt](https://github.com/xiaoqi7777/jwt)

- JWT(json web token)是为了在网络应用环境间传递声明而执行的一种基于JSON的开放标准。
- 场景
  - 身份认证在这种场景下，一旦用户完成了登陆，在接下来的每个请求中包含JWT，可以用来验证用户身份以及对路由，服务和资源的访问权限进行验证。
  - 信息交换在通信的双方之间使用JWT对数据进行编码是一种非常安全的方式，由于它的信息是经过签名的，可以确保发送者发送的信息是没有经过伪造的

## 结构
- JWT包含了使用.分隔的三部分
- Header 头部
  - 在header中通常包含了两部分：token类型和采用的加密算法。
  - { "alg": "HS256", "typ": "JWT"} 
- Payload 负载
  - 负载就是存放有效信息的地方。这个名字像是指货车上承载的货物，这些有效信息包含三个部分
  - 标准中注册的声明
    -  iss: jwt签发者
    -  sub: jwt所面向的用户
    -  aud: 接收jwt的一方
    -  exp: jwt的过期时间，这个过期时间必须要大于签发时间,这是一个秒数
    -  nbf: 定义在什么时间之前，该jwt都是不可用的.
    -  iat: jwt的签发时间
  - 公共的声明
    - 公共的声明可以添加任何的信息，一般添加用户的相关信息或其他业务需要的必要信息.但不建议添加敏感信息，因为该部分在客户端可解密
  - 私有的声明
    - 私有声明是提供者和消费者所共同定义的声明，一般不建议存放敏感信息，因为base64是对称解密的，意味着该部分信息可以归类为明文信息
  - 负载例子 
    - { "sub": "1234567890", "name": "zfpx", "admin": true} 
    - 上述的负载需要经过Base64Url编码后作为JWT结构的第二部分
- Signature 签名
  - 创建签名需要使用编码后的header和payload以及一个秘钥
  - 使用header中指定签名算法进行签名
  - 例如如果希望使用HMAC SHA256算法，那么签名应该使用下列方式创建
  ```js
    HMACSHA256( base64UrlEncode(header) + "." + base64UrlEncode(payload), secret) 
  ```
  - 签名用于验证消息的发送者以及消息是没有经过篡改的
  - 完整的JWT 完整的JWT格式的输出是以. 分隔的三段Base64编码
  - 密钥secret是保存在服务端的，服务端会根据这个密钥进行生成token和验证，所以需要保护好。

## 前端
- vue&&aioxs
- /src/api/AjaxRequest.js
```js
import axios from 'axios'
class AjaxRequest {
    constructor () {
        this.baseURL = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '/'
            // this.baseURL = 'http://localhost:3000'
        this.timeout = 2000
    }

    request (config) { // 设置请求的方法
        const instance = axios.create({
                baseURL: this.baseURL,
                timeout: this.timeout
            })
            // 设置拦截
        instance.interceptors.request.use(config => {
                config.headers.Authorization = `${localStorage.getItem('token')}`
                return config
            }, (err) => {
                Promise.reject(err)
            })
            // 设置响应拦截
        instance.interceptors.response.use(res => res.data, err => Promise.reject(err))
        return instance(config)
    }
}

export default new AjaxRequest()
```
- /src/api/index.js
```js
import axios from './AjaxRequest'
export const getTest = () => axios.request({ method: 'get', url: '/test' })
export const login = (username) => axios.request({ method: 'POST', url: '/login', data: { username } })
export const validate = () => axios.request({ method: 'get', url: '/validate' })
export default axios
```
- views/home.vue
```html
<template>
  <div class="home">
    首页111111111
  </div>
</template>
```
- views/login.vue
```html
<template>
  <div class="home">
    login
    <input v-model="user">
    <button @click='btn'>登录</button>
  </div>
</template>

<script>
export default {
  name: 'login',
  data () {
    return {
      user: ''
    }
  },
  methods: {
    btn () {
      this.$store.dispatch('login', this.user).then(() => {
        this.$router.push('/profile')
      })
    }
  }
}
</script>
```
- views/profile.vue
```js
<template>
  <div class="home">
    profile
  </div>
</template>

<script>
export default {
  name: 'profile'
}
</script>
```
- App.vue
```html
<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/login">Login</router-link> |
      <router-link to="/profile">Profile</router-link>
    </div>
    <router-view></router-view>
  </div>
</template>
```
- main.js
```js
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

Vue.config.productionTip = false
Vue.use(ElementUI)
// 登录验证
router.beforeEach(async (to, from, next) => {
    if (to.path === '/') {
        next()
    }
    const flag = await store.dispatch('validate')
    // 首次没有登陆
    if (flag) {
        if (to.path === '/login') {
            next('/')
        } else {
            next()
        }
    } else {
      let flag = to.matched.some(item => item.meta.needLogin)
      console.log('========', flag)
      if (flag) {
        next('/login')
      } else {
        next()
      }
    }
})

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app')
```
- router.js
```js
import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import Login from './views/login.vue'
import Profile from './views/profile.vue'

Vue.use(Router)
export default new Router({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: [{
            path: '/',
            name: 'home',
            component: Home
        },
        {
            path: '/login',
            name: 'login',
            component: Login
        },
        {
            path: '/profile',
            name: 'profile',
            component: Profile,
            meta: { needLogin: true }
        },
        {
            path: '/parent',
            name: 'parent',
            component: Parent
        },
        {
            path: '/children',
            name: 'children',
            component: Children
        }
    ]
})
```
- store.js
```js
import Vue from 'vue'
import Vuex from 'vuex'
import Axios, { login, validate } from './api/index'
import { authRoutes } from './router'
Vue.use(Vuex)

const getTreeList = (menuList) => {
  let menu = []// 用来渲染菜单的
  let routeMap = {}
  let auths = []
  menuList.forEach(m => {
    auths.push(m.auth)
    m.children = []
    routeMap[m.id] = m
    if (m.pid == -1) { // 是根节点
      menu.push(m)
    } else {
      // 找父级 将值传递进去
      if (routeMap[m.pid]) {
        routeMap[m.pid].children.push(m)
      }
    }
  })
  return { auths, menu }
}
const formatList = (authRoutes, auths) => {
  return authRoutes.filter(route => {
    if (auths.includes(route.name)) {
      if (route.children) {
        route.children = formatList(route.children, auths)
      }
      return true
    }
  })
}
// hasPermission 权限相关的
export default new Vuex.Store({
    state: {
        username: '',
        hasPermission: false,
        menuList: []
    },
    mutations: {
        setUserName (state, username) {
            state.username = username
        },
        setMenuList (state, menu) {
          state.menuList = menu
        },
        setPermission (state) {
          state.hasPermission = true
        }
    },
    actions: {
      // 发起请求,请求后端数据
      async getNewRoute ({ commit, dispatch }) {
        // 获取权限
        let { menuList } = await Axios.request('/roleAuth')
        // 需要把后端的数据扁平化
        let { auths, menu } = getTreeList(menuList)
        commit('setMenuList', menu)
        let needRoutes = formatList(authRoutes, auths)
        commit('setPermission')
        return needRoutes
        // console.log('list', authRoutes, auths)
      },
      async login ({ commit }, username) {
          const r = await login(username)
          if (r.code === 1) {
              return Promise.reject(r)
          }
          localStorage.setItem('token', r.token)
          commit('setUserName', r.username)
      },
      async validate ({ commit }) {
          const r = await validate()
          if (r.code === 1) {
              return false
          }
          commit('setUserName', r.username)
          localStorage.setItem('token', r.token)
          return true
      }
    }
})
```
## 后端
- sever.js
```js
let express = require('express')
let app = express()
let bodyParser = require('body-parser')
let jwt = require('./jwt')
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:8082')
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
    if (req.method.toLowerCase() === 'options') {
        return res.end()
    }
    next()
})
app.use(bodyParser.json())
let secret = 'zfjg'
app.get('/test', (req, res) => {
    let obj = { test: 'test' }
    obj = JSON.stringify(obj)
    res.end(obj)
})
app.post('/login', (req, res) => {
  console.log('/login')
    let { username } = req.body
    if (username === 'admin') { // 如果访问的是admin 种植cookie
        res.json({
            code: 0,
            username: 'admin',
            token: jwt.sign({ username: 'admin', exp: Date.now() + 1000 * 5 }, secret)
        })
    } else {
        res.json({
            code: 1,
            data: '用户名不存在'
        })
    }
})
app.get('/validate', (req, res) => {
    let token = req.headers.authorization
    console.log('token', token)

    try {
      let rs = jwt.verify(token, secret)
      console.log('rs', rs)
        res.json({
          username: rs.username,
          code: 0, // 延长tokne的过期时间
          token: jwt.sign({ username: 'admin', exp: Date.now() + 1000 * 5 }, secret, {
              // expiresIn: 20
          })
      })
    } catch (error) {
      return res.json({
          code: 1,
          data: 'token失效了'
      })
    }
})

app.listen(3000)
```
- jwt.js
```js
const crypto = require('crypto')

// 编码
function encode (payload, key) {
    let header = { type: 'JWT', alg: 'sha256' }// 声明类型和算法
    var segments = []// 声明一个数组
    segments.push(base64urlEncode(JSON.stringify(header)))// 对header进行base64
    segments.push(base64urlEncode(JSON.stringify(payload)))// 对负载进行base64
    segments.push(sign(segments.join('.'), key))// 加入签名
    return segments.join('.')
}

// 加密
function sign (input, key) {
    return crypto.createHmac('sha256', key).update(input).digest('base64')
}

// 解码
function decode (token, key) {
    if (!token) {
      throw new Error('verify failed')
    } else {
      var segments = token.split('.')
      var headerSeg = segments[0]
      var payloadSeg = segments[1]
      var signatureSeg = segments[2]

      var header = JSON.parse(base64urlDecode(headerSeg))
      var payload = JSON.parse(base64urlDecode(payloadSeg))
      // 验证签名算法
      if (signatureSeg != sign([headerSeg, payloadSeg].join('.'), key)) {
          throw new Error('verify failed')
      }
      // 过期时间verify
      if (payload.exp && Date.now() > payload.exp) {
          throw new Error('Token expired')
      }
      return payload
    }
}

function base64urlEncode (str) {
    return Buffer.from(str).toString('base64')
}

function base64urlDecode (str) {
    return Buffer.from(str, 'base64').toString()
}

module.exports = {
    sign: encode,
    verify: decode
}
```
