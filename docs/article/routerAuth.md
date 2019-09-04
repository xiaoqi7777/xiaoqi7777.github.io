
# routerAuth
[[toc]]
[代码-分支/auth](https://github.com/xiaoqi7777/jwt)
## 路由权限 
- 根据不同的用户 返回不用的路由权限接口
- 大致说下流程，首先登陆账号后 后端要返回给前端一个用户权限的数据
- 前端 根据数据提取 菜单和权限数据
- route通过权限数据 动态的添加路由
- 菜单则用来渲染页面

### 后端数据结构

- 后端根据不同账号返回不用的数据
  - 接口看下图，说下下面参数作用
  - pid对应着上父级的id,所以pid和id是一对cp，-1代表是根
  - id代表当前的数据，auth用来过滤前端路由的，auth 包含前端路由的name就显示，不包含就 过滤掉前端路由，name就是显示名字
  - 下面数据 给前端 要转换成2分数据
    - 1、以pid为树根(可以有多个)，id为树枝，然后把其他的挂上去 形成一个树结构，用来渲染路由菜单
    - 2、把所有的auth 存起来，用来过滤前端路由
```js
menuList: [
    { pid: -1, name: '购物车', id: 1, auth: 'cart' },
    { pid: 1, name: '购物车列表', id: 4, auth: 'cart-list' },
    { pid: 4, name: '彩票', id: 5, auth: 'lottery' },
    { pid: 4, name: '商品', id: 6, auth: 'product' },
    { pid: -1, name: '商店', id: 2, auth: 'shop' },
    { pid: -1, name: '个人中心', id: 3, auth: 'store' }
  ]
})
```
## 前端处理
- 入口main.js 做权限校验。
- `hasPermission`用来判断是否有权限
- `dispatch(getNewRoute)`用来获取动态路由，他在store里面请求数据，然后在过滤router.js 里面的准备好的路由
- 过滤好的路由 通过`router.addRoutes()`动态添加进去，注意后面要next 跳转出去，否则 不会进行路由跳转 
```js
// 权限校验
router.beforeEach(async (to, from, next) => {
  if (!store.state.hasPermission) { // 如果没有权限
    // 获取需要添加的路由
    let newRoutes = await store.dispatch('getNewRoute')
    // 动态添加路由
    router.addRoutes(newRoutes)
    // console.log('to2', to)
    next({ ...to, replace: true })// 保证一定会跳过去
  } else {
    next()
  }
})
```

- 首先处理router.js
- 默认到处2个路由 一个是首页加载的home,另一个是匹配所有的，返回Not Found
- authRoutes 先默认定义一份路由动态加载(可以把所有的权限都放进去，也可以分几个对象，后期都是要过滤的)
```js
export const authRoutes = [ // 权限路由
  {
    path: '/cart',
    name: 'cart',
    component: () => import('@/views/Cart'),
    children: [
      {
        path: 'cart-list',
        name: 'cart-list',
        component: () => {
          console.log('cart-list')
          return import('@/views/CartList')
        },
        children: [
          {
            path: 'lottery',
            name: 'lottery',
            component: () => import('@/views/Lottery')
          },
          {
            path: 'product',
            name: 'product',
            component: () => import('@/views/Product')
          }
        ]
      }
    ]
  }
]
export default new Router({ // 默认导出 首页和404页面
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '*',
      component: {
        render: h => h('h1', {}, 'Not Found')
      }
    }
  ]
})
```
- 路由配置好，获取后端数据进行过滤，获取数据集中存放到store
- store.js 里面就一个getNewRoute方法用来获取权限(menuList)，也就是上面的数据结构
- 第一步先将数据转换成树状(根据pid和id),得到菜单`menu`和权限`auths`，menu是用来生成菜单(页面导航)，auths用来过滤路由配置的
- 第二步通过`formatList`将之前写好的路由配置 通过auths进行过滤，最后返回registerRoutes 动态生成路由
```js
const getTreeList = (menuList) => {
  let routeMap = []
  let menu = []
  let auths = []
  // 确保pid顺序是从小到大 方便下面的数据映射
  menuList.sort((a, b) => a.pid - b.pid)
  menuList.forEach(item => {
    auths.push(item.auth)
    item.children = []
    routeMap[item.id] = item
    if (item.pid === -1) { // 是根节点
      menu.push(item)
    } else {
      if (routeMap[item.pid]) {
      routeMap[item.pid].children.push(item)
      }
    }
  })
  return { auths, menu }
}
const formatList = (authRoutes, auths) => {
  // console.log('authRoutes', authRoutes)
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
        hasPermission: false,
        menuList: []
    },
    mutations: {
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
        let registerRoutes = formatList(authRoutes, auths)
        commit('setPermission')
        return registerRoutes
      }
    }
})
```
- 接着就处理菜单，菜单的数据是树状，需要用到动态组件
- `$store.state.menuList`就是之前获取的菜单第一个pid为-1的 他将循环多个一级菜单
- menu.vue 菜单
```html
<template>
 <el-menu default-active="2" class="el-menu-vertical-demo">
  <template v-for="(item,index) in $store.state.menuList" >
    <MenuItem :key='index' :menu='item'></MenuItem>
  </template>
</el-menu>
</template>

<script>
import MenuItem from './MenuItem'
export default {
  components: {
    MenuItem
  },
}
</script>
```
- 一级菜单有children 就要循环自己
- `el-submenu`和`el-menu-item`的index是关联的 但是不能和其他子菜单相同 所以赋值auth 作为识别
- 另外说下`el-submenu`定义的是菜单，`el-menu-item`定义的是可以点击的，所以将`router-link`放到其中
- `name:'MenuItem'`是用来循环自身的
- MenuItem.vue
```html
<template>
  <div>
    <el-submenu v-if="menu.children.length" :index="menu.auth">
      <template slot="title">{{menu.name}}</template>
      <template v-for="(item,index) in menu.children">
        <MenuItem :key='index' :menu='item'></MenuItem>
      </template>
    </el-submenu>
    <el-menu-item :index="menu.auth">
      <router-link :to="{name:menu.auth}">{{menu.auth}}-{{menu.name}}</router-link>
    </el-menu-item>
</div>

</template>

<script>
export default {
  name: 'MenuItem',
  props: ['menu'],
}
</script>
```