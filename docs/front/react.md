
#  react 汇总
[[toc]]
- 安装
  - cnpm install create-react-app -g 脚手架
  - create-react-app reactdom  初始化项目

## 基础用法
```js
1、<Parent>xxx</Parent>
子组件 通过this.props.children 获取xxx

2、<Parent number={2}>xxx</Parent>
加{}传递的就是数值

3、let obj = {num:1} 组件传值
<Parent {...obj} n='2'></Parent>

4、<Counter><p>123</p></Counter>
    获取组件里面的子元素 => this.props.children
    渲染 一般不用map 因为 里面可能有一个 可能都有多个最终得到的结构都不一样
    官方有个方法 React.Children.map 第一个参数是this.props.children 第二个是要渲染的内容
    {React.Children.map(this.props.children,item=>{
        return <li>{item}</li>     
    })}

5、
  1、父传子 靠属性
  2、平级   靠公共的父组件
  3、跨级(祖孙) 靠Context api   祖传子-直接传   子传祖-用回调

6、Context api用法
    创建一个文件
    import React from 'react'
    let {Provider,Consumer} = React.createContext();
    export{Provider,Consumer}

    父级提供 value是固定的
        <Provider value={{r:传递的内容}}> 父级组件 </Provider>
    子级
        <Consumer>{({r})=>{
            return(<div>
                    <button onClick={()=>{
                        console.log('r',r)
                    }}>按键
                    </button>
                </div>)
        }}</Consumer>

7、ref
    声明
    input = React.createRef()
    绑定
    <input type='text' ref={this.input}/>
    获取
    console.log(this.input)

8、函数里面的别名
  let a  =  {s:"123"}
  function A({s:q}){
    console.log(q) //此时q就是s的别名 为123
  }
  A(a)

9、获取当前元素的节点
    <input type="text" ref={input=>this.content=input}/>
    console.log(this.content)
```
## 生命周期
<img :src="$withBase('/img/reactCycle.png')" >
[blog](https://www.cnblogs.com/qiaojie/p/6135180.html)
```js
开始阶段
  componentWillMount 组件将要渲染
  componentDidMount  组件渲染完成
  render             开始渲染
      只要调用setState  无论数据是否变化 都会调用render方法
变化
  shouldComponentUpdate(nextProps,nextState)
    //优化在这里做,返回ture 执行render() false不执行 

  componentDidUpdate  组件更新完成
  componentWillUpdate 组件将要更新

  componentWillReceiveProps 组件接受到了新的属性  (第一次不触发)
  componentWillUnmount  组件将要销毁 

  setState 在生命周期 开始阶段 和 将要接收新的属性调用 其他调用会无限循环

新的              
  getSnapshotBeforeUpdate(prevProps,prevState) 组件将要更新(把以前的替换了)
  //获取更新前的快照,必须有一个返回值(更新之前的属性,状态)会在componentDidUpdate第三个参数获取到
  static getDerivedStateFromProps(nextProps, prevState) 接受新的属性 (把以前的替换了)
  //第一次会触发,返回的是一个新的状态,没有显示调用setstate  返回的值直接盖上去
  //生命周期都是同步,获取数据 放在组件更新完成、将要更新发送都可以  反正是要渲染2次的     
```
## PropTypes验证
- import PropTypes from 'prop-types'
```js
  //部分
  export default class Types extends Component{
    static a = 'aaaaaaaaas'
    
    // 名字是死的  给类增加静态属性 //es7 才有的
    // defaultProps 和 父组件传递进来的 一样 都是this.props下的
    static defaultProps = {
        name:'1231'
    }
    //校验属性  只要是 this.props.下能获取到 都可以校验 (上面的name  也是)
    static propTypes = {
      age:PropTypes.string,
      name:PropTypes.string,
      sex:PropTypes.oneOf(['男','女']),
      fan:PropTypes.shape({
          a:PropTypes.number,
          b:PropTypes.string,
      }),
      //数组
      arr:PropTypes.arrayOf(PropTypes.string),
      //自定义校验
      number2(props,propName){
          //第一个是所有的this.props , propName指的就是number2
          if(props[propName]>100000){
              throw new Error('收益太低')
          }
      }
    }
    render(){
        // console.log('123',this.props)
        // console.log('123',Types.a)
        return (<div>
              types
        </div>)
        }
}
```
## setState 异步渲染问题
- setState用法
```js
  setState用法
    第一个参数是赋值 第二个参数是回调
    this.setState({number:this.state.number},()=>{
      this.setState(.......)
    })
    一般加异步是为了一个个执行 但都是后面覆盖前面
    用这个回调 也可以一个个执行 , 但这个是嵌套
      也可以,prevState是上次的结果
      this.setState((prevState)=>({number:prevState.number+1}))
      this.setState((prevState)=>({number:prevState.number+3}))

  add1 = ()=>{
      // 只会渲染一次
      this.setState({
          number:this.state.number+1
      })
      this.setState({
          number:this.state.number+3
      })
      this.setState({
          number:this.state.number+2
      })
  }
  add2 = ()=>{
    // 加异步  就会渲染多次
    setTimeout(()=>{
        this.setState({
            number:this.state.number+1
        })
        this.setState({
            number:this.state.number+3
        })
        this.setState({
            number:this.state.number+2
        })
    },1000)
  }
```
- setState原
```js
  // 默认是批量更新的   setstate 异步更新原理
  let isBatchingUpdate = true
let transcation = (component)=>{
    component.state = component.pendingState
    component.render();
    isBatchingUpdate = false
}

class My{
  constructor(){
      this.state = {number:0};//自己的状态
      this.pendingState = {...this.state}
  }
  setState(obj){
      if(isBatchingUpdate){
          //批量更新 这里直走一次  也就是后面覆盖前面
          // console.log('批量更新',obj)
          this.pendingState = {...this.pendingState,...obj}
      }else{
          //异步更新 这里走完 一次 在
          // console.log('异步更新',obj)
          this.pendingState = {...this.pendingState,...obj}
          // 每次都会回调自己
          transcation(this)
      }
  }
  update(){
    // frist 如果是异步先走 transcation  那么isBatchingUpdate为false setState就会走else里面
    //       如果是同步 就是直接调用 setState 走if(ture)

      setTimeout(()=>{
          this.setState({number:this.state.number + 1})
          this.setState({number:this.state.number + 3})
          this.setState({number:this.state.number + 2})
      },0)
      transcation (this)
      
  }
  render(){
      // console.log(this.state.number)
  }
}

  let my = new My()
  my.update()
```
## 路由
- 分hash #和 history h5api (刷新的时候页面不存在,一定会出现404的问题)
- h5api 就是 history.pushState('xx',null,'./a')
- history 只能通过popstate监听浏览器的前进和后退
- npm install react-router-dom
- BrowserRouter 和 HashRouter两种
```js
  import {HashRouter as Router,Route,Switch,Redirect,Link,NavLink} from 'react-router-dom'
  基本用法
    Router 可以切换 hash 和	history  要包裹在最外面
    Route  用来声明路由的
      <Route path='/'  exact={true} component={Home}/>  
					exact={true} 是完全匹配 若是下面有二级路由不能加 
					通过Route组件渲染出来的页面 有三个属性 history,lication,match 

    Redirect 重定向  当没有匹配到路由时候的跳转
      <Redirect to='/' />
    
    Switch 匹配到一个后就不会在匹配了
      <Switch>
        里面包裹 Route组件 和 Redirect组件
      </Switch>
      
    Link 标签用来跳转的 (一般对Link和NavLink第二次包装的时候 
      可以在他们前面都Route 标签 可以获取history,lication,match属性)
    <Link to='/'>首页</Link>

    NavLink 跟Link一样的
			只是当路由是当他被激活的时候  会加一个class='active'
        注意 to='/' 要加一个  exact={true}   不然点击别的时候 他也会加
          二级路由 不能写 exact
                
        path 和 to ="/" 最前面一定要加/
                 
			JS跳转路由	
			 	this.props.history.push('/user/list')
    
  路由传值
    <Route path='/user/:id'  exact={true} component={Home}/>  
		<link to={'/user/'+id}>跳转</Link>

  路由的高阶组件
    将Route 用组件包装做判断而已
      1、Route 默认情况下 直接 compoment={B} 之间渲染B组件   
      2、包装 <A><A> => A组件返回一个包装后的Route 组件, 可以在里面做拦截等逻辑
  
```
## render component children区别
- render和children 都是一个函数 他返回的结果被进行渲染  component返回一个组件
- children 不管路径没有没匹配到 都会渲染 如果是当前路径 则props.match 为ture	
  - 一般对NavLink做 二次处理 如果跳转的是当前 可以把active放到上级
- render 返回的是一个组件(函数) 
  - 一般对Route 进行二次处理 如果登陆就正常返回 否则 拦截等操作

## react-redux用法 && 原理
- 创建一个store
- actions 存放动作 => 导出的是一个对象 对象里面有操作的方法 方法返回对象  获得的对象传入reducers的第二个参数
- reducers 存放管理员 => 就是一个函数接受(state,aciton) 返回一个对象 修改store的数据
- index.js 导出store  将reducers传入redux里面的createStore中
- types.js 存放操作类型 操作的类型 避免写错 所以集中存放
  - redux 在创建的store的时候 将reducer(管理员放进去) 默认是执行一次dispatch state会接受默认值
  - 在组件内是通过调用store.dispatch 修改state里面的东西 store.getState获取state里面的值

- react-redux用法
- 入口文件引入store
```js
/**   
 * react-redux 在父级提供store 这样在每个组件中就不用引入store
 * 提供了 connnect和Provider方法
 */
import { Provider } from "react-redux";
import store from "./store";
ReactDom.render(
  <Provider store={store}>
  <>
    <Counter />
  </>
  </Provider>,
  window.root
);
```
- 下面的文件 引入connect
- connect 连接有两种写法
```js
import actions from '../store/actions/Counter'
// import {bindActionCreators} from 'redux';
import {connect} from 'react-redux'

class Counter extends Component {
  state = {
    number: ''
  };
  render() {
    console.log(this.props)
    return (
      <>
        <p>{this.props.number}</p>
        <div onClick={() => this.props.del(3)}>点击减少</div>
        <div onClick={() => this.props.add(3)}>点击增加</div>
      </>
    );
  }
}
//connect 方法执行2次后 返回的是一个组件
//第二个参数是原来的组件 会把redux中的状态映射到这个组件上
// 11 、connect 第一个参数
// let mapStateToProps = (state) => { //store.state
//   console.log('state',state)
//   return {
//     number : state.counter.number
//   }
// }
// 12、 简化1的写法
let mapStateToProps = (state) => ({...state.counter})
// 21 、connect 第二个参数
let mapDispatchToProps = (dispatch) => { //store.dispatch
  return{
    // store.dispatch({ type: "ADD", count: 3 })
    add:(num)=>dispatch(actions.add(3)),
    del:(num)=>dispatch(actions.del(3))
  }
}
export default connect(mapStateToProps,mapDispatchToProps)(Counter)

// 22 、简化2写法
// dispatch原本就是connect传递进来的  bindActionCreators 是redux方法接收 actions和dispatch 会包装成 1 返回的那种形式 

// function bindActionCreators(actions,dispatch){
//   let obj = {}
//   for(let key in actions){
//     obj[key] = (...args)=>dispatch(actions[key](...args))
//   }
//   return obj;
// }
// export default connect(mapStateToProps,(dispatch)=>bindActionCreators(actions,dispatch))(Counter)

// 3、如果connect 第一次执行的函数,如果第二个参数是对象类型,会自动内部调用bindActionCreators来实现
// export default connect(mapStateToProps,actions)(Counter)

```
## 中间件
### logger
```js
import {createStore} from '../redux';
import reducers from './reducers';
let store = createStore(reducers)
let dispath = store.dispatch;//缓存老的原始派发方法
sotre.dispath = function(action){
  console.log('老状态',store.getState())
  dispath(action);
  console.log('新状态',store.getState())
}
export default store

```

- 原理
- 创建react-redux/connect.js
```js
import Context from './context'
import React, { Component } from 'react'
import {bindActionCreators} from 'redux';

let connect =(mapS,mapD)=>(Component)=>{
  return ()=>{
    class Proxy extends React.Component{
      state = mapS(this.props.store.getState())
      componentDidMount() {
        this.unsub = this.props.store.subscribe(()=>{
          this.setState(mapS(this.props.store.getState()))
        })
      }
      componentWillUnmount(){
        this.unsub()
      }
      render(){
        let  d;
        if(typeof mapD === 'object'){
          d = bindActionCreators(mapD,this.props.store.dispatch)
        }else{
          d = mapD(this.props.store.dispatch)
        }
        return <Component {...this.state} {...d} ></Component> 
      }
    }
  return (<Context.Consumer>
    {({store})=>{
      return <Proxy store={store}></Proxy>
    }}
    </Context.Consumer>)
}
}
export default connect
```
- 创建react-redux/context.js
```js
import react from 'react'

let Context = react.createContext()

export default Context
```
- 创建react-redux/index.js
```js
import Provider from './provider'
import connect from './connect'
export {Provider,connect}
```
- 创建react-redux/provider.js
```js
import context from './context'
import React, { Component } from 'react'

export default class Provider extends React.Component{
  render(){
    return (
      <context.Provider value={{store:this.props.store}}>
      {this.props.children}
      </context.Provider>
    )
  }
} 

```

## couter&&todoList 例子
- 目录
- src
  - components
    - counter.js
    - List.js
  - store
    - actions
      - counter.js
      - list.js
    - reducers
      - counter.js
      - list.js
      - index.js
    - index.js
    - types.js
  - index.js
  - saga.js
- components/counter.js
```js 
import React from 'react'
import {connect} from 'react-redux'
import actions from '../store/actions/counter'
class Counter extends React.Component{
  render(){
    return (
      <div>
        <div>计数</div>
        <div>{this.props.count}</div>
        <button onClick={this.props.add}>添加</button>
        <button onClick={this.props.asyncAdd}>async 添加</button>
        <button onClick={this.props.sagaAdd}>saga 添加</button>
        
        <button onClick={this.props.del}>减少</button>
        <button onClick={this.props.asyncDel}>async 减少</button>
      </div>
    )
  }
}
let  mapStateToProps = (state)=>{
  return{
    count : state.counter.count
  }
}

let mapDispatchToProps = (dispatch)=>{
  //store.dispatch
  return{
    add:()=>{
      dispatch(actions.add(1))
    },
    asyncAdd:()=>{
        return dispatch(actions.add(1))
    },
    sagaAdd:()=>{
      // saga 异步
      dispatch(actions.sagaAdd(1))
    },
    del:()=>{
      dispatch(actions.del(1))
    },
    asyncDel:()=>{
      // thunk 异步
      setTimeout(()=>{
        return dispatch(actions.del(1))
      },1000)
    },
  }
}

export default connect(mapStateToProps,mapDispatchToProps)(Counter)
```
- components/List.js
```js
import React from 'react'
import {connect} from 'react-redux'
import actions from '../store/actions/list'
class List extends React.Component{
  render(){
    return (
      <div>
        <div>ToDo List</div>
        {this.props.count.map((item,index)=>{
          return (
            <div key={index}>
              {item}
            </div>
          )
        })}
        <button onClick={this.props.add}>添加</button>
      </div>
    )
  }
}
let  mapStateToProps = (state)=>{
  //store.getState()
  return{
    count : state.list.data
  }

}
let mapDispatchToProps = (dispatch)=>{
  //store.dispatch
  return{
    add:()=>{
      dispatch(actions.tolist(1))
    }
  }
}
export default connect(mapStateToProps,mapDispatchToProps)(List)
```
- store/actions/counter.js
```js
import * as Types from '../types'
export default {
    add(n){
      return {type:Types.INCREMENT,count:n}
    },
    sagaAdd(n){
      return {type:Types.SAGA_ADD,count:n}
    },
    del(n){
      return {type:Types.DECREMENT,count:n}
    },
}
```
- store/actions/counter.js
```js
import * as Types from '../types'
export default {
  tolist(data){
    return {type:Types.TOLIST,data}
  }
}
```
- store/reducers/counter.js
```js
import * as Tpyes from '../types'
export default function counter (state={count:0},actions) {
  console.log('进来了',actions)
    switch(actions.type){
      case Tpyes.INCREMENT:
        return {count:state.count+actions.count}
      case Tpyes.DECREMENT:
        return {count:state.count-actions.count}
    }
    return state
}
```

- store/reducers/list.js
```js
import * as Types from '../types'
export default function list (state={data:[]},actions) {
  console.log(actions)
    switch(actions.type){
      case Types.TOLIST:
      console.log(actions)
      return {data:[...state.data,actions.data]}
    }
    return state
}
```

- store/reducers/index.js
```js
import {combineReducers} from 'redux';
import counter  from './counter'
import list  from './list'
export default combineReducers({
  counter,
  list
})
```
- store/index.js
```js
import {createStore,applyMiddleware} from 'redux';
import reducer from './reducers';
import thunk from 'redux-thunk';
import createSagaMiddleware  from 'redux-saga'
import rootSaga from '../saga'
let sageMiddleware = createSagaMiddleware()
// sageMiddleware 是用来拦截对saga中间件请求的
let store = createStore(reducer,applyMiddleware(sageMiddleware));
sageMiddleware.run(rootSaga)
export default store
```
- store/types.js
```js
export const INCREMENT = 'INCREMENT'
export const TOLIST = 'TOLIST'
export const DECREMENT = 'DECREMENT'
export const SAGA_ADD = 'SAGA_ADD'
```
- index.js
```js
import React from 'react';
import ReactDOM from 'react-dom';
import Counter from './components/Counter';
import List from './components/List';
import {Provider} from 'react-redux'
import store from './store'
ReactDOM.render(
  <Provider store={store}>
    <Counter />
    <List />
  </Provider>
  , document.getElementById('root'));
```

- saga.js 
```js
import {takeEvery,put} from 'redux-saga/effects'
import * as Types from './store/types'

const delay = ms =>new Promise((res,rej)=>{
  setTimeout(res,ms)
})

// 这是saga的唯一入口
export default function * rootSaga(){
  //拦截或者监听SAGA_ADD动作,然后执行对应的workerSaga
  yield takeEvery(Types.SAGA_ADD,minus);
}

export function * minus() {
  //当yield一个promise的时候,程序不会立刻执行 等待时间 在执行
  yield delay(1000);//产出了一个promise
  //put相当于dispatch(action)
  yield put({type:Types.INCREMENT,count:1})
}
```

## redux 源码
```js
function CreateStore(reducer) {
  let state;
  let getState = () => state;
  let listeners = [];
  let dispatch = (action)=>{
    state = reducer(state,action)
    listeners.forEach(fn=>fn())
  }
  dispatch({type:'@INIT'})
  let subscribe = (fn)=>{
    listeners.push(fn)
    return ()=>{
      listeners = listeners.filter(l=>l!=fn)
    }
  }
  return {
    getState,
    dispatch,
    subscribe
  }
}

/*
 bindActionCreators 按照下面仿制的
let mapDispatchToProps = (dispatch) => { //store.dispatch
  return{
    del:(num)=>dispatch(actions.del(3))
  }
}
export default connect(mapStateToProps,mapDispatchToProps)(Counter)
*/
function bindActionCreators(actions,dispatch){
  let obj = {}
  for(let key in actions){
    obj[key] = (...args)=>dispatch(actions[key](...args))
  }
  return obj;
}

// combineReducers 合并reducer 用法
// import counter from './counter'
// import subtraction from './subtraction'
// import { combineReducers } from 'redux'
// export default combineReducers({counter,subtraction})

// 原理 
// reducers是单个reducer组成的
function combineReducers(reducers){
  // 这里的state是一个总的
  return function(state={},action){
    let obj = {}
    for(let key in reducers){
      //为什么state加key 因为这个要给用户点的 
      obj[key] = reducers[key](state[key],action)
    } 
   return obj
  }
}


// compose 原理
function add1(str){
  return '1' + str
}
function add2(str){
  return '2' + str
}
function add3(str){
  return '3' + str
}
// compose作用将参数传递给左边第一个 他的返回值在传递给左边的 一直下去
let rs = compose(add1,add2,add3)('zzz')
console.log(rs)// 123zzz

function compose(...fns){
  if(fns.length === 0) return args=>args;
  if(fns.length === 1) return fns[0];
  // fns.reduce((add1,add2)=>('zzz') => a(b('zzz')))
  // ...args 就是指 'zzz'
  return fns.reduce((a,b)=>(...args) => a(b(...args)))
}


// logger中间件 {getState,dispatch},dispatch,action 都是默认的 根据applyMiddleware 来的
function logger({getState,dispatch}){
  return function(next){
    return function(action){
      console.log('老状态',getState())
      next(action);
      console.log('老状态',getState())
    }
  }
}
//或者
let logger = store => dispatch => action=>{}

// 中间件的用法
 let store =  applyMiddleWare(logger)(createStore)(reducer);

// applyMiddleware中间件写法 模仿可以跟着中间件的用来的写,最终就是要返回一个store  
// 第一个参数就是中间件
function applyMiddleware(...middlewares){
  return function(createStore){
    return function(reducer){
      let store = createStore(reducer)
      //1
      let dispatch = ()=>{throw Error('xxx')}
      let middleswareApi = {
        getState:store.getState,
        // 这里的dispatch 为毛要加后面的  因为下面dispatch(3) 重新赋值后导致dispatch(1)变化 如果不加后面的 此处的dispatch始终等于 ()=>{throw Error('xxx')}
        dispatch:(...args)=>dispatch(...args)
      }
      const chain =  middlewares.map(middleware=>middleware(middleswareApi))
      // 3
      dispatch = compose(...chain)(store.dispatch)
      return {
        ...store,
        dispatch
      }
    }
  }
}


export { CreateStore, bindActionCreators, combineReducers, applyMiddleware};

```
## redux-thunk 原理
```js
function createThunkMiddleware() {
  return ({dispatch,getState })=>next=>action{
    if(typeof action == 'function'){
      // 传递过来的action是一个 函数
      return action(dispatch,getState )
    }else{
      return next(action)
    }
  }
}
const thunk = createThunkMiddleware();
thunk.withExtraArgument = createThunkMiddleware;

export default thunk;
```

## redux-saga 原理
- redux-saga是一个中间件
- 在reducers中所有的操作都是同步,reducers是纯函数
- sage采用Generator函数用来yield Effects
- Effects是一个简单的对象，该对象包含了一些给middleware解释执行的信息
- 可以通过使用effects API 如fork,call,take,put,cancel等来创建
- 步骤
  - 1、rootSaga 入口saga 是用来组织和调用别的saga的
  - 2、watcher saga监听被dispatch的actions,当接收到action或者知道其被触发时,调用worker执行任务
  - 3、worker saga做实际的工作,如调用api进行异步请求
  
- 用法
  - 在store入口使用
  - 创建一个saga文件
  - effect有很多方法(takeEvery,put,take,call,all,delay,cps,select)
    - all 类似promise.all 可以放多个
    - take 只监听(动作)一次 会阻塞 执行他会有一个返回值 就是监听的action,'*'监听所有(通配符)
    - put 派发动作(就时一个dispatch) take监听 put派发 take 和 put 不能传递一样的类型 会无线循环
    - takeEvery(action,Generator) takeEvery会监听action 去执行Generator 监听每一次 不会阻塞 他就等于take 和 put 都执行一次
    - delay 就是一个slepp传递一个时间 
    - cps 接收一个普通的方法
    - call 处理异步 接收一个promise的方法
    - select 执行返回仓库的状态(state)
```js
  // store/index 文件
  import createSagaMiddleware  from 'redux-saga'
  import rootSaga from '../saga'
  let sageMiddleware = createSagaMiddleware()
  //sageMiddleware放到中间件里面
  let store = createStore(reducer,applyMiddleware(sageMiddleware));
  //运行
  sageMiddleware.run(rootSaga)

  // src/saga 文件
  import {takeEvery,put,take,call,all } from './redux-saga/effect'
  import * as Types from './store/types'
  
  // rootSaga 是核心的 导出函数
  export default function * rootSaga(){
    for(var i=0;i<3;i++){
      console.log(`第${i}次`)
      // take监听一次 会触发 subscribe  
      // 默认rootSaga会执行一次  也就是take会被
      // take 里面的type 要和 按键触发的 type 一样 才能触发 put
      yield take(Types.SAGA_ADD)
      // put 当点击的时候 才触发他
      yield put({type:Types.INCREMENT,count:1})
    }
    console.log('结束了。。。')
  }
  // 或者
  // 定时器
  // const delay = ms =>new Promise((res,rej)=>{
  //   setTimeout(res,ms)
  // })
  // export default function * rootSaga(){
  //   //拦截或者监听SAGA_ADD动作,然后执行对应的workerSaga
  //   yield takeEvery(Types.SAGA_ADD,minus);
  // }

  // export function * minus() {
  //   //当yield一个promise的时候,程序不会立刻执行 等待时间 在执行
  //   yield delay(1000);//产出了一个promise
  //   //put相当于dispatch(action)
  //   yield put({type:Types.INCREMENT,count:1})
  // }
// call 一般异步用
  // const delay = ms =>new Promise((res,rej)=>{
  //   // setTimeout(res,ms)
  //   setTimeout(()=>{
  //       res('--',new Date())
  //   },ms);
  // })

  // export default function * rootSaga(){
  // let date = yield call(delay,1000)
  // }

// all 全部的意思 promise.all

  // function* helloSaga1(){
  //   console.log('helloSaga1')
  // }  
  // function* helloSaga2(){
  //   console.log('helloSaga2')
  // }  
  // export default function * rootSaga(){
  //   yield all([helloSaga1(),helloSaga2()]);
  //   console.log('the end')
  // }

  再派发的时候 只需要添加 type 对应的类型  每次触发 redux-saga就会拦截处理
   take(type)里面是拦截的类型
   put(actions) 里面真正dispatch的内容
```

- saga原理
  - 主要依靠co库 和 发布订阅模式
  - rootSage放到run(rootSage)执行了
  - createChannel 函数就是一个发布订阅 
  - take就是订阅 将每次接受的类型存储 => 触发 subscribe
  - takeEvery将得到的生成器 通过fork传递进去 在开器子进程 run(生成器) 最后子进程去publish
  - channel.publish(action) 就是拦截中间件的  检查传递进来的type和take里面的type是否一致
    - 若相同 执行listener(action) 也就是take传递的第二个参数  就是回调next() => put
- redux-saga/index
```js
export default function createSagaMiddleware(){

  //发布订阅
  function createChannel(){
    let events = {};
    function subscribe(actionType,listener){
     console.log('actionType',actionType)
      events[actionType] = listener
    }
    function publish(action){
     let listener = events[action.type]
     console.log('actionType',action)
      if(listener){
        // 默认只执行一次 所以要删除
        delete events[action]
        //  listener(action) 就是执行中间件的next(action)
        listener(action)
      }
    }
    return {subscribe,publish}
  }

  let channel = createChannel();

  function times(done,total){
    let count = 0;
    return function(){
      if(++count == total){
        done()
      }
    }
  }

  function sagaMiddleware(stroe) {
    function run(generator,finish) {
      // 执行生成器,得到迭代器
      let it =  typeof generator == 'function' ? generator():generator;

      function next(action){
        // value:effect => 将value改名为effect
        let {value:effect,done} = it.next(action);
        console.log('默认执行一次,也就是执行take 发布一下而')
        if(!done){
          if(typeof effect[Symbol.iterator] == 'function'){
              run(effect);
              next();
          }else if(effect.then){
            effect.then(next);
          }else{
            switch(effect.type){
                case 'take'://订阅某个动作类型
                    channel.subscribe(effect.actionType,next);
                    break;
                case 'put':
                    stroe.dispatch(effect.action)
                    next();
                    break;
                case 'fork':
                    // 接受到的是一个生成器 需要传给run处理
                    run(effect.task);
                    next();
                    break;
                case 'call':
                    effect.fn(...effect.args)
                    .then(next);
                    break;
                case 'all':
                    let final = times(next,effect.fns.length) 
                    effect.fns.forEach(fn=>run(fn,final));
                default:
                    break;
            }
        }
      }else{
        //全部完成后
          console.log('完成')
          finish && finish();
      }
      next();
    }
    sagaMiddleware.run = run;
    return function (next) {
      return function (action) {// store.dispatch 就等于执行最里面的函数
        channel.publish(action)//派发action
        next(action)
      }
    }
  }
  return sagaMiddleware
}
```
- redux-saga/effect.js
```js
export function  take(actionType){
    return {
      type:'take',
      actionType
    }
  }
export function  put(action){
    return {
      type:'put',
      action
    }
  }
export function fork(task){
  return {
    type:'fork',
    task
  }
}
/**
 * 1、不能阻塞当前的generator函数
 *  开启一个新的线程 就相当于单独重新run
 * fork   
 */
export function* takeEvery(actionType,task){
  yield fork(function *(){
    while(true){
      yield take(actionType)
      yield task();
    }
  })
}

export function call(fn,...args){
  return{
    type:'call',
    fn,
    args
  }
}

export function all(fns){
  return {
    type:'all',
    fns
  }
}
```
- src/saga
```js
import {takeEvery,put,take,call,all } from './redux-saga/effects'
import * as Types from './store/types'

/**
 * take 会阻塞  take 和 put 不能传递一样的类型 会无线循环
 */
// export default function * rootSaga(){
//   for(var i=0;i<3;i++){
//     console.log(`第${i}次`)
//     // take监听一次 会触发 subscribe  
//     // 默认rootSaga会执行一次  也就是take会被
//     // take 里面的type 要和 按键触发的 type 一样 才能触发 put
//     yield take(Types.SAGA_ADD)
//     // put 当点击的时候 才触发他
//     yield add()
//   }
//   console.log('结束了。。。')
// }

/**
 * takeEvery 不会阻塞 && call
 * takeEvery 第三个参数 会传递给 第二个参数(生成器)
 * 第二个参数 生成器最后一个参数 默认接收到的是action
 */
// const delay = ms =>new Promise((res,rej)=>{
//   // setTimeout(res,ms)
//   setTimeout(()=>{
//       res('--',new Date())
//   },ms)
  
// })
// // 这是saga的唯一入口
// export default function * rootSaga(){
//   //拦截或者监听SAGA_ADD动作,然后执行对应的workerSaga
//   yield takeEvery(Types.SAGA_ADD,add);
// }

// export function * add(action) {
//   //当takeEvery 没有传值的时候 默认就是action 若传递值 最后一个 也是acrion

//   //当yield一个promise的时候,程序不会立刻执行 等待时间 在执行
//   // let rs =yield delay(1000);//产出了一个promise
//   // console.log('rs',rs)
//   // 一般异步用 call
//   let date = yield call(delay,1000)
//   //put相当于dispatch(action)
//   yield put({type:Types.INCREMENT,count:1})
// }

/**
 * all
 */

 function* logger(){
   console.log('加1.。')
 }
 function* loggerWatcher(){
   yield takeEvery(Types.SAGA_ADD,logger)
 }

 function* add(){
   yield put({type:Types.INCREMENT,count:1})
 }
 function* addWatcher(){
   yield takeEvery(Types.SAGA_ADD,add)
 }
 // all 全部的意思 promise.all
export default function * rootSaga(){
  //拦截或者监听SAGA_ADD动作,然后执行对应的workerSaga
  yield all([loggerWatcher(),addWatcher()]);
  console.log('the end')
}
```
## typescript
- Typescript是Javascript的超集，遵循最新的ES5/ES6规范。TypeScript扩展了Javascript语法


## umi
- UmiJS是一个类 Next.JS 的 react 开发框架。
- 他基于一个约定，即 pages 目录下的文件即路由，而文件则导出 react 组件
- umi 里约定目录下有 _layout.js 时会生成嵌套路由
<img :src="$withBase('/img/umi.png')" >



## hooks

- Hook 是 React 16.8 的新增特性。它可以让你在不编写 class 的情况下使用 state 以及其他的 React 特性
- 以前时用class 才能用state 现在用函数就可以直接操作state
- 特点
  - 在可以用在函数组件中,并且可以在函数组件的多次渲染之间保持不变
### useState (useState可以定义多个)
  - useState有两种写法 useState(0)和useState(()=>{})
  - let [state,setState] = useState(0)
```js
import React,{useState} from 'react';
// 类
class Counter extends React.Component {
  constructor(props) {
      super(props);
      this.state = {
          number: 0
      };
  }
  render() {
      return (
          <div>
              <p>{this.state.number}</p>
              <button onClick={() => this.setState({ number: this.state.number + 1 })}>
                  +
        </button>
          </div>
      );
  }
}
// 函数
function Counter2(){
  // number,setNumber自己独有的
  const [number,setNumber] = useState(0);
  return (
      <>
          <p>{number}</p>
          <button onClick={()=>setNumber(number+1)}>+</button>
      </>
  )
}
export default Counter2;
```
- 每次渲染都是独立的闭包
- 函数式更新
- 如果新的 state 需要通过使用先前的 state 计算得出，那么可以将函数传递给 setState。该函数将接收先前的 state，并返回一个更新后的值
```js
function Counter2(){
  const [number,setNumber] = useState(0);
  function lazy(){
    setTimeout(()=>{
      // 每次获取的是当时的number 3秒后是调用的还是之前的number
      setNumber(number+1);
    },3000);
  }
  function lazyFunc(){
    setTimeout(()=>{
      // 每次获取的是最新的 number 3秒后是调用的是最新的 number
      setNumber(number=>number+1);
    },3000);
  }
  return (
      <>
          <p>{number}</p>
          <button onClick={()=>setNumber(number+1)}>+</button>
          <button onClick={lazy}>lazy+</button>
      </>
  )
}
```
- 惰性初始 state
- 如果你修改状态的时候,直接传的是老状态,则不重新渲染
```js
function Counter3(){
  const [{name,number},setValue] = useState(()=>{
    return {name:'计数器',number:0};
  });
  return (
      <>
          <p>{name}:{number}</p>
          <button onClick={()=>setValue({number:number+1})}>+</button>
      </>
  )
}
```

### memo&&PureComponent - useMemo&&usecallback
- 父组件变化,子组件不变化,子组件默认会重新渲染,可以用下面2个方法(都是react里面的)包装后就不会重新渲染
- memo针对函数 (子组件不接收值的情况下)
- PureComponent 针对类
- 为什么父组件重新渲染,子组件不变的情况下,子组件还需要重新渲染
  - 因为addClick 和 data 是父组件传递给子组件的,父组件有值变化整个组件会重新渲染导致addClick 和 data重新赋值
- useMemo&&usecallback 
  - 第二个参数要给,会监控他的值是否有变化
  - useMemo(针对变量) 会判断组件变化前后值是否有变化 没有变化就将上次的值传过去(默认情况下,重新生成的对象值不变但是引用地址变化了)
  - usecallback(针对方法) 原理同上
```js
// 子
function SubCounter({onClick=()=>{},data={number:0}}){
  console.log('zi')
  return(
    <button onClick={onClick}>{data.number}</button>
  )
}
SubCounter = memo(SubCounter)
// 父
let oldData,oldAddClick;
function counter(props){
  console.log('fu')
  const [name,setName] = useState('计数器')
  const [number,setNumber] = useState('计数器')

  const addClick = ()=>{
    setNumber(number+1)
  }
  console.log('addClick=',addClick == oldAddClick) //引用地址不一样 返回false
  oldAddClick = addClick;
  const  data = {number} 
  console.log('data=',data == oldData) //引用地址不一样 返回false
  oldData = data
    return(
      <>
        <input type='text' value={name} onChange={(e)=>setName(e.target.value)} />
        <SubCounter />
      </>
    )
}
// useMemo&&usecallback 配合memo的 修改后 
function SubCounter({onClick=()=>{},data={number:0}}){
  console.log('zi')
  return(
    <button onClick={onClick}>{data.number}</button>
  )
}
SubCounter = memo(SubCounter);
let oldData,oldAddClick;
const App = function counter(props){
  console.log('fu')
  const [name,setName] = useState('计数器')
  const [number,setNumber] = useState('计数器')

  const addClick = useCallback(()=>{
    setNumber(number+1)
  },[number])
  console.log('addClick=',addClick == oldAddClick)
  oldAddClick = addClick;
  const  data = useMemo(()=>({number}),[number]) 
  console.log('data=',data == oldData)
  oldData = data
  return (<>
      <input type='text' value={name} onChange={(e)=>setName(e.target.value)} />
      <SubCounter onClick={addClick} data={data}/>
    </>
  ) 
}
```
### useReducer
- useState 的替代方案。它接收一个形如 (state, action) => newState 的 reducer，并返回当前的 state 以及与其配套的 dispatch 方法
- 在某些场景下，useReducer 会比 useState 更适用，例如 state 逻辑较复杂且包含多个子值，或者下一个 state 依赖于之前的 state 等
```js
// useReducer 用法
const [state, dispatch] = useReducer(reducer, initialArg, init);
// 
const initialState = 0;

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return {number: state.number + 1};
    case 'decrement':
      return {number: state.number - 1};
    default:
      throw new Error();
  }
}
function init(initialState){
    return {number:initialState};
}
function Counter(){
    const [state, dispatch] = useReducer(reducer, initialState,init);
    return (
        <>
          Count: {state.number}
          <button onClick={() => dispatch({type: 'increment'})}>+</button>
          <button onClick={() => dispatch({type: 'decrement'})}>-</button>
        </>
    )
}
```
### useContext 
  - 接收一个 context 对象（React.createContext 的返回值）并返回该 context 的当前值
  - 当前的 context 值由上层组件中距离当前组件最近的 <MyContext.Provider> 的 value prop 决定
  - 当组件上层最近的 <MyContext.Provider> 更新时，该 Hook 会触发重渲染，并使用最新传递给 MyContext provider 的 context value 值
  - useContext(MyContext) 相当于 class 组件中的 static contextType = MyContext 或者 <MyContext.Consumer>
  - useContext(MyContext) 只是让你能够读取 context 的值以及订阅 context 的变化。你仍然需要在上层组件树中使用 <MyContext.Provider> 来为下层组件提供 context
  ```js
  const CounterContext = React.createContext();

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return {number: state.number + 1};
    case 'decrement':
      return {number: state.number - 1};
    default:
      throw new Error();
  }
}
function Counter(){
  let {state,dispatch} = useContext(CounterContext);
  return (
      <>
        <p>{state.number}</p>
        <button onClick={() => dispatch({type: 'increment'})}>+</button>
        <button onClick={() => dispatch({type: 'decrement'})}>-</button>
      </>
  )
}
function App(){
    const [state, dispatch] = useReducer(reducer, {number:0});
    return (
        <CounterContext.Provider value={{state,dispatch}}>
            <Counter/>
        </CounterContext.Provider>
    )

}
  ```
### effect
- useEffect 就是一个 Effect Hook，给函数组件增加了操作副作用的能力。它跟 class 组件中的 componentDidMount、componentDidUpdate 和 componentWillUnmount 具有相同的用途，只不过被合并成了一个 API
- 简单理解 每次渲染都会执行useEffect
- 下面例子,如果没有返回清除定时器,那么每次渲染一次就多开一个定时器,返回值在下次useEffect生效前执行
- 或者给useEffect第二个参数一个空数组,他会监视第二个参数是否有变化,空数组始终不会有变化,useEffect里面的函数就不会重新执行
```js
function Counter(){
  const [number,setNumber] = useState(0);
  // 相当于componentDidMount 和 componentDidUpdate
  useEffect(() => {
     console.log('开启一个新的定时器')
     const $timer = setInterval(()=>{
      setNumber(number=>number+1);
     },1000);
      return ()=>{
        console.log('销毁老的定时器');
        clearInterval($timer);
     } 
  });
  //   useEffect(() => {
  //    console.log('开启一个新的定时器')
  //    const $timer = setInterval(()=>{
  //     setNumber(number=>number+1);
  //    },1000);
  // },[]);
  return (
      <>
          <p>{number}</p>
      </>
  )
}
```
### useRef(函数里面用)&&createRef(类里面用)
- useRef返回一个可变的ref对象,其.current属性被初始化为传入的参数
- 返回的ref对象在组件的整个生命周期保持不变

```js
import {useRef,createRef} from 'react';
function Child(){
  const inputRef1 = createRef()// {current:''} 每次获取的对象不是同一个 值是一样的
  const inputRef = useRef()// {current:''} 每次获取的对象是一个 值是一样的
  function getFocus(){
    inputRef.current.focus()
  }
  return (
    <>
      <input ref={inputRef}>
      <button onClick={getFocus}> 获取焦点</button>
    </>
  )
}
```
### forwardRef
- 将ref从父组件中转发到子组件中的dom元素上
- 子组件接受props和ref作为参数
```js
function Child(props,ref){
  return (
    <input type="text" ref={ref}/>
  )
}
Child = forwardRef(Child);
function Parent(){
  let [number,setNumber] = useState(0); 
  const inputRef = useRef();
  function getFocus(){
    inputRef.current.value = 'focus';
    inputRef.current.focus();
  }
  return (
      <>
        <Child ref={inputRef}/>
        <button onClick={()=>setNumber({number:number+1})}>+</button>
        <button onClick={getFocus}>获得焦点</button>
      </>
  )
}
```
### useImperativeHandle 
- useImperativeHandle 可以让你在使用 ref 时自定义暴露给父组件的实例值
- 在大多数情况下，应当避免使用 ref 这样的命令式代码。useImperativeHandle 应当与 forwardRef 一起使用
```js
function Child(props,ref){
  const inputRef = useRef();
  useImperativeHandle(ref,()=>(
    {
      focus(){
        inputRef.current.focus();
      }
    }
  ));
  return (
    <input type="text" ref={inputRef}/>
  )
}
Child = forwardRef(Child);
function Parent(){
  let [number,setNumber] = useState(0); 
  const inputRef = useRef();
  function getFocus(){
    console.log(inputRef.current);
    inputRef.current.value = 'focus';
    inputRef.current.focus();
  }
  return (
      <>
        <Child ref={inputRef}/>
        <button onClick={()=>setNumber({number:number+1})}>+</button>
        <button onClick={getFocus}>获得焦点</button>
      </>
  )
}
```
### useLayoutEffect
- 其函数签名与 useEffect 相同，但它会在所有的 DOM 变更之后同步调用 effect
- 可以使用它来读取 DOM 布局并同步触发重渲染
- 在浏览器执行绘制之前useLayoutEffect内部的更新计划将被同步刷新
- 尽可能使用标准的 useEffect 以避免阻塞视图更新
```js
function LayoutEffect() {
    const [color, setColor] = useState('red');
    useLayoutEffect(() => {
        alert(color);
    });
    useEffect(() => {
        console.log('color', color);
    });
    return (
        <>
            <div id="myDiv" style={{ background: color }}>颜色</div>
            <button onClick={() => setColor('red')}>红</button>
            <button onClick={() => setColor('yellow')}>黄</button>
            <button onClick={() => setColor('blue')}>蓝</button>
        </>
    );
}
```
### 自定义hooks
- 只要说一个方法,方便名的前缀是use开头,并且在函数内使用hooks,那么他就是一个自定义的hooks
```js
import React,{useEffect,useState} from 'react'
import ReactDOM from 'react-dom'
function useNumber(){
  let [number,setNumber] = useState(0)
  useEffect(() => {
    setInterval(()=>{
      setNumber(number=>number+1)
    },1000)
  }, [])
  return  [number,setNumber]
}

function Counter1(){
  let  [number,setNumber] = useNumber()
  return (
      <div>
        <button onClick={()=>setNumber(number+1)}>{number}</button>
      </div>
      )
}
function Counter2(){
  let  [number,setNumber] = useNumber()
  return( 
      <div>
        <button  onClick={()=>setNumber(number+1)}>{number}</button>
      </div>
  )
}
const App = ()=>(<>
  <Counter1/>
  <Counter2/>
</>)

app.router(()=><App />);
```
## dva用法


- 流程图
- 脚手架
  - npm install dva-cli@next -g(1+ 的版本采用的umi)
  - dva new xx
  - cd xx
  - cnpm i styled-components -S
  - npm start
<img :src="$withBase('/img/dva.png')" >
- 自己搭建
  - create-react-app dva-app
  - cd dva-app
  - cnpm i dva -S
- 使用dva三步
  - 1、定义模型
  - 2、定义路由
  - 3、app.start(  '#root')开始把路由定义渲染到#root里
- 基本使用
```js
import React from 'react'
import dva,{connect} from 'dva'

// dva 其实就是一个函数
const = app = dva();

const delay = ms => new Promise(function(resolve){
  setTimeout(()=>{
    resolve()
  },ms)
})
const get = (url)=>{
  let rs = fetch(url).then(res=>res.json())
  return rs
}
// 定义模型
app.model({
  //里面的是 子状态
  namespace:'count',
  state:{number:0},
  reducers:{
    // key就是动作类型,当你向仓库派发add动作的时候,就会执行对应的reducer修改仓库中的状态d
    //相当于action type 参数是老状态 返回值是新状态
    add(state,{payload}){
      // 数据持久化
      let data = {number:state.number + payload}
      localStorage.setItem('number',JSON.stringify(data))
      return data
      },
    minus(state,{payload}){return {number:state.number - payload}}
  },
  effects:{
    //effect 里面放的是generator
    // 第一个参数里action动作对象 effects副作用 reudx-saga/effects
    *addAmount(action,{put,call}){
      // yield call(delay,1000);
      let rs =  yield call(get,'http://localhost:3001/amount');
      yield put({type:'add',payload:rs.data})
    }
  },
  // 订阅
  subscriptions:{
    setup({history,dispatch}){
      let todosStr = localStorage.getItem('todos')
      let data = todosStr?JSON.parse(todosStr):[]
      // Warning: dispatch: todos/load should not be prefixed with namespace todos
      // 在model时派发action,不需要加命名空间的前缀 默认就是, 可以省略
      // dispatch({type:'todos/load',payload:list})
      dispatch({type:'add',payload:data})
    }
  }
});

// connect里面传递action props就没有dispatch(2个方法不兼容)
// 默认都不传递  直接用dispatch type后面要配合匿名空间 
const App = connect(
  state=>state.count
)((props)=>(
  <div>
      <h2>{props.number}</h2>
      <button onClick={()=>props.dispatch({type:'count/addAmount'})}>+</button>
      <button onClick={()=>props.dispatch({type:'count/minusAmount'})}>-</button>
  </div>
))
app.router(()=><App/>);
app.start('#root')

```
- dva 原理
  - dome 和原理 配合看
```js
import React from 'react';
import dva,{connect} from './dva';
import {Router,Route} from './dva/router'
import {Link} from 'react-router-dom'
const app = dva();
const delay = ms => new Promise((resolve)=>{
  setTimeout(()=>{
    resolve()
  },ms)
})
app.model({
  namespace:'count',
  state:{number:0},
  reducers:{
    add(state){
      return {number:state.number+1}
    }
  },
  effects:{
    *asyncAdd({call,put},actions){
      yield call(delay,1000);
      console.log('jinali l ',actions)
      yield put({type:'count/add'})
    }
  }
});
const Count = connect(
  state => state.count
)(props=>( 
    <div>
      <button onClick={()=>props.history.goBack()}>返回</button>
         <p>{props.number}</p>
        <button onClick={()=>props.dispatch({type:'count/add'})}>+</button>
        <button onClick={()=>props.dispatch({type:'count/asyncAdd'})}>asyncAdd+</button>
    </div>
))
const Home = () =>(
  <div>
    <h3>Home</h3>
    <Link to='/count'>count</Link>
  </div>
) 

app.router(({history, app}) => (
  <Router history={history}> 
    <div>
      <Route exact path='/' component={Home} />
      <Route  path='/count' component={Count} />
    </div>
  </Router>
))
app.start('#root')
```
- dva/router.js
```js
import {Router,Route} from 'react-router';
export{
  Router,Route
}
```
- dva/index.js
```js
import React from 'react';
import {createStore,combineReducers,applyMiddleware} from 'redux';
import {Provider,connect} from 'react-redux';
import ReactDom from 'react-dom'
// import {takeEvery} from 'redux-saga/effects'
import * as effects from 'redux-saga/effects'
import createSagaMiddleware from 'redux-saga'
import { createHashHistory } from 'history'
// 普通导出 引入的时候需要结构
export {connect}
// 默认导出 引入直接用
export default function(){
  const _app={
    _store:null,//放所有的仓库
    _models:[],//这里面放着所有的模型
    model,//方法
    _route:null,//所有的路由配置
    router,//方法
    start,//方法
  }
  function model(m){
    //每次调用model 就将他存放到总的模型库里面
    _app._models.push(m)
  }
  function router(routerConfig){
    _app._router = routerConfig
  }
  const history = createHashHistory()
  function start(root){
    const App = _app._router({history,app:_app});
    // 每一个模型 都有namespace 都是状态树中的子属性, 都有一个子的reducer
    // combineReducers 合并的时候传入一个对象 key是属性名 值是处理函数

    let reducers = {};
    for(let m of _app._models){
      // key 是namespace的值 value是一个reducer函数
      reducers[m.namespace] = function(state=m.state,action){
        // action => 一般都是 'count/add'等等
        // 截取action / 后面名字  查看m.namespace 当前的reducers下是否有该名字(方法)
        let actionType = action.type;
        let [namespace,type] = actionType.split('/');
        // 当action里命名空间  和 当前方法命名空间 相同 才需要处理
        if(namespace == m.namespace){
          let reducer = m.reducers[type];
          // 此时说明有该方法 就执行
          if(reducer){
            return reducer(state,action)
          }
        }
          return state;
      }
    }
    let reducer = combineReducers(reducers);
    let sagaMiddleware = createSagaMiddleware()
    function* rootSaga(){
      for(let m of _app._models){
        for(let key in (m.effects)||{}){
          //监听每个动作发生,当动作发生的时候 执行对应的generator 任务
          // takeEvery(action,fn)
          // 第三个参数 effects 传递给 *asyncAdd()的第二个参数
          yield effects.takeEvery(m.namespace+'/'+key,m.effects[key],effects)
        }
      }
    }
    let store = createStore(reducer,applyMiddleware(sagaMiddleware))
    sagaMiddleware.run(rootSaga)
    ReactDom.render(
      <Provider store={store}>
        {App}
      </Provider>
      ,document.querySelector(root))
  }

  return _app
}

## 装饰器(高阶组件)
```js
@testable
class Person{

}
function testable(target){
  target.testable = true
}

console.log(Person.testable)
```

## dva配合ant
- antd 按需引入
  - npm install antd babel-plugin-import --save
- 然后在 .webpackrc 中添加如下配置：
```js
{
  "extraBabelPlugins": [
    ["import", {
      "libraryName": "antd",
      "libraryDirectory": "es",
      "style": true
    }]
  ]
}
```


## DOM DIFF
- DOM Diff比较两个虚拟DOM区别 比较两个对象的区别
- dom diff作用 根据2个虚拟对象创建出补丁，描述改变的内容，将这个补丁更新dom

- 差异计算
- 先序深度优先遍历

- 三种优化策略
  - 