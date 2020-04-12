# react-router
[[toc]]
## router 实现的原理
- router 一般都是利用hash和history api 进行实现的
### hash
- hash 变化的时候 `hashchange`事件可以监听到
```js
  <a href="#/a">去a</a>
  <a href="#/b">去b</a>
  window.addEventListener('hashchange',()=>{
    console.log(window.location.hash);
  })
```
### history
- window.history 下面有很多属性,所有的url 他会保存在一个栈内,他下面的api一般都是操作这个栈
  - state 保存数据 默认是空
  - length 栈的长度(url的个数)
  - back 跳到上一个
  - forward 跳到下一个
  - go(x) 跳到那个一个路径 x是索引
  - pushState(data,title,url) 往路径队列推送一个状态(title 可传可不传)
    - data 会修改当前history.state
  - replaceState 对比上一个  这个方法替换之前的 上面的添加新的
- onpopstate 出栈监听 (监听弹出状态的事件  出栈 点击浏览器的前进后对都会触发),没有进栈事件需要自己定义
```js
window.onpushstate = function(state,title,url){
  console.log(state)
}
let oldPush = window.history.pushState
window.history.pushState = function(state,title,url){
  oldPush.call(window.history,state,title,url)
  window.onpushstate(state,title,url)
}
function push(to){
  window.history.pushState({to},null,to)
}
```
## react-router 
- 根据他的用法来解析原理,他内部主要也是利用了contextAPI 进行传值,这里的BrowserRouter 和HashRouter 都一样
- Link 是用来跳转路由用的 实际就是一个a标签后面再说
- Route 和 Router 是里面的核心,一般情况当路由匹配的时候,Route是专门渲染组件的,每个路由渲染的组件中的this.props 都有路由传递的一堆数据
- 数据格式{location:{},history:{},match:{}}
  - Router 提供的
    - location 一般都是路由跳转时候传的url 和 一些状态参数
    - history 保存着一些方法(比如 push) 用来修改路由
  - Route 提供的
    - match 路由匹配成功后 一些url相关的信息
```js
import {BrowserRouter as Router,Route, Link} from './react-router-dom'
render(
  return(
      <Router>
        <>
          <Link to={{pathname:'/',state:{title:'首页'}}}>首页</Link>
          <Route path='/' component={Home} exact></Route>
        </>
      </Router>
  )
)
```
### HashRouter
- 他主要操作浏览器的url,有几个点
- 1、`window.addEventListener('hashchange',()=>{})` 是用来监控浏览器hash值的变化,只要浏览器的hash变化 都会执行这个函数 更新最新的浏览器信息(location)
- 2、通过`context`api传递 location和history,location存储着当前浏览器的信息,history保存的操作浏览器的api
```js
import React from 'react'
import Context from './context'
class Rt extends React.Component{
  state = {
    location:{pathname:window.location.hash.slice(1),state:null}
  }
  locationState = null
  componentWillMount(){
    window.location.hash = window.location.hash||'/';//默认值
    window.addEventListener('hashchange',()=>{
      this.setState({
        location:{
          ...this.state.location,
          pathname:window.location.hash.slice(1),
          state:this.locationState
        }
      })
    })
  }
  // 永远不要在render内操作修改state 会无限重复渲染
  render(){
    let that = this;
    let value = {
      location:that.state.location,
      history:{
        // 定义一个history对象  有一个push方法用来跳转路径
        push(to){
          if(that.message){
            let confirm = window.confirm(that.message(typeof to == 'object'?to:{pathname:to}));
            if(!confirm) return;
          }
          if(typeof to === 'object'){
            let {pathname,state} = to
            that.locationState = state;
            window.location.hash = pathname;
          }else{
            that.locationState = '';
            window.location.hash = to;
          }
        },
        block(message){
          console.log('message',message)
          that.message = message
        }
      }
    }
    return (
        <Context.Provider value={value}>
          {this.props.children}
        </Context.Provider>
    )
  }
}
export default Rt
```
### BrowserRouter
- browserRouter 和 hashRouter 格式差不多 就是url的修改操作更换了api
- 之前的 原来的监控hash更改 onpushstate/onpushstate 事件
  - onpushstate(state,title,url) 进栈,他会往url栈内添加一个数据,原生不支持 需要配合window.history.pushState(state,title,url)
  - onpopstate(state,title,url)  出栈,url栈内少一个数据,原生支持,点击浏览器的前进后对都会触发 需要配合window.history.pushState(state,title,url)
- 把之前的`window.location.hash`更改成`window.history.pushState`其他的差不多了
```js
import React from 'react'
import Context from './context'
let pushState = window.history.pushState;
window.history.pushState = (state,title,url)=>{
  pushState.call(window.history,state,title,url);
  window.onpushstate.call(this,state,url)
}
class Rt extends React.Component{
  state = {
    location:{pathname:window.location.pathname,state:null}
  }
  // locationState = null
  componentWillMount(){
    window.onpopstate = (event) => {
      this.setState({
        location:{
          ...this.state.location,
          pathname:window.location.pathname,
          state:event.state
        }
      })
    }
    window.onpushstate = (state,pathname) => {
      this.setState({
        location:{
          ...this.state.location,
          pathname,
          state
        }
      })
    }    
  }
  // 永远不要在render内操作修改state 会无限重复渲染
  render(){
    let that = this;
    let value = {
      location:that.state.location,
      history:{
        // 定义一个history对象  有一个push方法用来跳转路径
        push(to){
          if(that.message){
            let confirm = window.confirm(that.message(typeof to == 'object'?to:{pathname:to}));
            if(!confirm) return;
          }
          if(typeof to === 'object'){
            let {pathname,state} = to
            // that.locationState = state;
            // window.location.hash = pathname;
            window.history.pushState(state,'',pathname);
          }else{
            // that.locationState = '';
            // window.location.hash = to;
            window.history.pushState(null,'',to);
          }
        },
        block(message){
          console.log('message',message)
          that.message = message
        }
      }
    }
    return (
        <Context.Provider value={value}>
          {this.props.children}
        </Context.Provider>
    )
  }
}
export default Rt
```
### Route
- Route标签是在Router标签内使用的 他主要的功能是接收 contextAPI传递过来的数据 和 this.props传递的数据 进行路由匹配,渲染那个组件
- 他会给渲染的组件传递一个对象包括(Router的location和history) 以及match(里面是一些匹配的路由配置的信息,路径参数等等)
- `Component`,`render`,`children`区别在这里很好的体现
  - Component 就是正常的渲染一个组件
  - render 是一个方法,他会执行并且返回(值是一个函数)
  - children if(rs) 判断了 不管true还是false 都会走children函数,区别是路径匹配到 传递的props会携带param路径参数
```js
import React, { Children } from 'react'
import RouterContext from './context'
import {pathToRegexp} from 'path-to-regexp'
class Rt extends React.Component{
  static contextType = RouterContext
  render(){
    let {pathname} = this.context.location;
    let {path='/',component:Component,exact=false,render,children} = this.props
    let paramNames =[];
    // exact 是false 就是非完整匹配
    let regexp = pathToRegexp(path,paramNames,{end:exact});
    let rs = pathname.match(regexp)
    let props={
      location:this.context.location,
      history:this.context.history
    }
    if(rs){
      paramNames = paramNames.map(item=>item.name);
      let [url,...values] = rs
      let params = {};
      for(let i=0;i<paramNames.length;i++){
        params[paramNames[i]] = values[i]
      }
      props.match = {
        params,
        path,
        url,
        isExact:url===pathname,
      }
      if(Component){
        return <Component {...props}/>
      }else if(render){
        return render(props);
      }else if(children){
        return children(props);
      }else{
        return null
      }
    }else{
      if(children){
        return children(props)
      }else{
        return null;
      }
    }
  }
}
export default Rt
```
### link
- link就是返回的一个a标签 内部调用Router的history.push api进行跳转路由
```js
import React from 'react'
import RouterContext from './context';
class Rt extends React.Component{
  static contextType = RouterContext
  render(){
    return (
      <a {...this.props} onClick={()=>this.context.history.push(this.props.to)}>{this.props.children}</a>
    )
  }
}
export default Rt
```
### Redirect
- Redirect 做重定向的 直接调用push进行跳转
```js
import React from 'react'
import RouterContext from './context'
class Rt extends React.Component{
  static contextType = RouterContext
  render(){
    // 他不返回任何东西 直接跳走
    this.context.history.push(this.props.to);
    return null
  }
}
export default Rt
```

### Switch
- 只返回 一个配置的route
- 内部把所有的route 收集进行处理 只要满足条件 就返回退出
```js
// 用法
<Switch>
  <Route path="/" exact component={Home} />
  <Route path="/user" component={User} />
  <Route path="/profile" component={Profile}/>
  <Redirect to="/" />
</Switch>

import React from 'react'
import {pathToRegexp} from 'path-to-regexp'
import RouterContext from './context'
class Rt extends React.Component{
  static contextType = RouterContext
  render(){
    let {pathname} = this.context.location;//当前地址栏中的路径 
    let children =Array.isArray(this.props.children)?this.props.children:[this.props.children];
    for(let i=0;i<children.length;i++){
      let child = children[i];
      let {path='/',exact=false} = child.props;
      let paramNames = [];
      let regexp = pathToRegexp(path,paramNames,{end:exact})
      let rs = pathname.match(regexp);
      if(rs){
        return child // react元素
      }
    }
    return null
  }
}
export default Rt
```

### withRouter
- 就是一个普通的组件 通过Route包装给他 操作路由的等方法
```js
import React from 'react'
import Route from './Route'
export default function(WrappedComponent){
  return props=><Route path='/' component={WrappedComponent} />
}
```
### Prompt
- 在组件内使用 Prompt(他也是一个组件) 只要给when 传递一个true 在跳转路由的时候就会 提示下是否跳转(保护作用)
```js
// 使用
<Prompt
  when={this.state.blocking}
  message={location=>`你确定要跳转到${location.pathname}嘛`}
/>
<div>
  <label>用户名</label>
  <input ref={this.userNameRef} 
    onChange={event=>this.setState({blocking:this.state.blocking.block||event.target.value.length>0})}/>
</div>
<div>
  <label>邮箱</label>
  <input ref={this.emailRef}
    onChange={event=>this.setState({blocking:this.state.blocking.block||event.target.value.length>0})}/>
</div>
// ---------------------------------------------
import React from 'react'
import RouterContext from './context'
class Rt extends React.Component{
  static contextType = RouterContext
  componentWillUnmount(){
    this.context.history.block(null) 
  }
  render(){
    let history = this.context.history;//从上下文中 获取历史对象 
    const {when,message} = this.props
    if(when){
      history.block(message)
    }else{
      history.block(null);
    }
    return null
  }
}
export default Rt
```
## connected-react-router
- 作用 可以在store操作 router 里面方法,组件一般是一个纯ui组件,所有的逻辑都放到store的actions中
- 用法
  - step1
  - 1、在reducers进行改造,这里引入 history 他将替代原来的 Router,他们都一样,这里单独拎出来而已,都是提供路由监控和一些参数
  - 2、添加一个reducer 将 history上的一些参数 放到store内
  ```js
    // history
    import {createBrowserHistory,createHashHistory} from 'history'
    let history = createHashHistory()
    export default history;
  ```
  ```js
    import {combineReducers} from 'redux'
    import counter from './counter'
    + import {connectRouter} from 'connected-react-router'
    + import history from '../history'
    let reducers = combineReducers({
      counter,
    +   router:connectRouter(history)
    })
    export default reducers
  ```
  - step2
  - 1、给store添加一个中间件,routerMiddleware的主要功能 是对`action.type`做一个拦截处理,执行history上的push方法进行跳转路由
  ```js
    import {createStore,applyMiddleware} from 'redux';
    import reducers from './reducers';
    + import {routerMiddleware} from 'connected-react-router'
    import history from '../store/history'
    // let store = createStore(reducers);
    // let store =applyMiddleware(routerMiddleware(history))(createStore)(reducers);
    + let store = createStore(reducers,applyMiddleware(routerMiddleware(history)));
    // 测试用
    window.store = store;
    export default store;
  ```

  - step3
  - 1、处理入口文件,将原来的`Router`组件修改为`ConnectedRouter`并且传入 history。
  - 整体流程:
  - 1、`ConnectedRouter`组件的功能 是通过history.listen(每次路径变化都会走这个函数)函数给reducers(`connectRouter`)派发一个事件传入路由的信息,这样store里面就有了一个router对象,里面保存着路由的相关信息
  - 2、在组件中 调用`goHome` 他是通过push 返回一个action,而push 内部返回的实际是往中间件派发对应的action({type:'CALL_HISTORY_METHOD'})
  - 3、`routerMiddleware`中间件会拦截 push的操作,解析传递进来`method,path`执行 history 上面的push方法
  ```js
    import React from 'react';
    import Home from './components/Home'
    import Counter from './components/Counter'
    import {HashRouter as Router,Route,Link} from 'react-router-dom'
    import {Provider} from 'react-redux'
    import store from './store'
    + import {ConnectedRouter} from 'connected-react-router'
    import history from './store/history'
    export default class Rt extends React.Component{
      render(){
        return(
          <Provider store={store}>
            // <Router>
            <ConnectedRouter history={history}>
              <>
                <Link to='/'>Home</Link>
                <Link to='/counter'>Counter</Link>
                <hr></hr>
                <Route path='/' exact={true} component={Home}></Route>
                <Route path='/counter'  component={Counter}></Router>
              </>
            </ConnectedRouter>
          </Provider>
        )
      }
    }
  ```
  ```js
    // actions  counter.js 在store中操作router
    import * as types from '../actions-types'
    + import {push} from 'connected-react-router'
    export default {
      increment(){
        return {type:types.INCREMENT}
      },
      decrement(){
        return {type:types.DECREMENT}
      },
      + goHome(){
        + return push('/');
      +}
    }
  ```
## connected-react-router 实现原理
- 里面主要有2对cp `ConnectedRouter,connectRouter`,`push,routerMiddleware`,
- 1、ConnectedRouter 组件初始化的时候 往 connectRouter(reducer) 派发一个router初始化操作
- 2、routerMiddleware 是中间件拦截 push的操作,push 是组件操作action,跳转路由,中间件拦截到后会调用history的push方法
### ConnectedRouter
```js
import React, { Component } from 'react';
import {LOCATION_CHANGE} from './constants'
import {ReactReduxContext} from 'react-redux'
import {Router} from 'react-router';// react-router 是浏览器端的Router
// HashRouter
export default class ConnectedRouter extends Component{
  static contextType = ReactReduxContext
  componentDidMount(){
    // 每当路径发生变化之后 都会执行此监听函数 并传入二个参数 新的路径新的动作
    this.props.history.listen((location,action)=>{
      this.context.store.dispatch({
        type:LOCATION_CHANGE,
        payload:{
          location,
          action
        }
      })
    })
  }
  render(){
    let {history,children} = this.props
    return(
      <Router history={history}>
        {
          children
        }
      </Router>
    )
  }
}
```
### connectRouter
```js
import {LOCATION_CHANGE} from './constants'
export default function(history){
  let initState = {action:history.action,location:history.location};
  return function(state=initState,action){
    switch(action.type){
      case LOCATION_CHANGE:
        return action.payload;
      default:
        return state
    }
  }
}
```
### constants
```js
// 向仓库中的路由中间件派发动作时用这个action type
export const CALL_HISTORY_METHOD = '@@router/CALL_HISTORY_METHOD';
// 当路径发生变更时,要向仓库派发这样一个动作
export const LOCATION_CHANGE = '@@router/LOCATION_CHANGE'
```

### index
```js
import routerMiddleware from './routerMiddleware';
import connectRouter from './connectRouter';
import push from './push';
import ConnectedRouter from './ConnectedRouter';
export {
  routerMiddleware,// 创建路由中间件的函数
  connectRouter,// 创建reducer的函数 都接收一个history参数
  push,// 用来返回一个 跳转路径的action
  ConnectedRouter,//是一个路由容器 
}
```
### push
```js
import {CALL_HISTORY_METHOD} from './constants'
export default function(path){// dispatch(push(path))
  return {
    type:CALL_HISTORY_METHOD,
    payload:{
      method:'push',
      path
    }
  }
}
```
### routerMiddleware
```js
import {CALL_HISTORY_METHOD} from './constants'
export default function(history){
  return ({dispatch,getState})=>next=>action=>{
    if(action.type === CALL_HISTORY_METHOD){
      let {method,path} = action.payload
      history[method](path)
    }else{
      next(action);
    }
  }
}
```