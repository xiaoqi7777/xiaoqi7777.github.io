# redux
[[toc]]
## react-redux 用法
- 首先会创建一个仓库,仓库会返回getState(获取最新的state),dispatch(他接收一个action 修改当前最新的state),subscribe(注入的函数 等待dispatch执行后 会执行的函数)
- 当按键触发的时候 调用store.dispatch()传入action是一个对象格式
- reducer是处理函数 每一个组件一般都是一个单独的reducer,有多个的时候 用combineReducers进行绑定
- 1、创建仓库
```js
import reducer from './reducer'
import {createStore} from 'redux';
import logger from 'logger';
import reduxThunk from 'redux-thunk';
import reduxPromise from 'redux-promise';
let store = applyMiddleware(logger,reduxPromise,reduxThunk)(createStore)(reducer)
// 另一个写法 最终会转换成上面的形式
// let store = createStore(reducer,applyMiddleware(logger,reduxPromise,reduxThunk))
export default store;
```
- 2、创建action(多个,和组件对应)
```js
import  * as types from '../action-types'
function increment(payload){
  return {type:types.INCREMENT,payload}
}
function decrement(payload){
  return {type:types.DECREMENT,payload}
}
export default {increment,decrement}
```
- 3、创建reducer(多个,和组件对应)
```js
import * as types from '../action-types'
export default function reducer(state={number:0},action){
  switch(action.type){
    case types.INCREMENT2:
      return {number:state.number+action.payload*2};
    case types.DECREMENT2:
      return {number:state.number-action.payload*2};
    default :
      return state
  }
}
```
- 4、创建action-types.js
```js
export const INCREMENT = 'INCREMENT'
export const DECREMENT = 'DECREMENT'
```
- 5、组件
```js
// 父组件
import React from 'react';
import Counter1  from './counter1'
import {Provider} from 'react-redux'
import store from './store'
class counter extends React.Component{
  render(){
    return (<Provider store={store}>
        <Counter1/>
    </Provider>)
  } 
}
// 其他的子组件
import React from 'react'
import actions from './store/actions/counter2'
import * as types from './store/action-types'
import {connect} from 'react-redux'
class Counter extends React.Component{
  render(){
    return (
      <div>
          <p>{this.props.number}</p>
          <button onClick={()=>this.props.increment(1)}>+</button>
          <button onClick={()=>this.props.decrement(1)}>-</button>
      </div>
    )
  }
}
let mapStateToProps = state => state.counter2
export default connect(
  mapStateToProps,
  actions
)(Counter) 
```

## react-redux 原理
- 他提供了2个对象{Provider,connect} 第一个Provider包括父组件 传递store 第二个是connect 将修改state和操作dispatch和当前组件传入进去 进行绑定
- 他内部是用 context api 传递数据的
- Provider 组件继承 context.Provider 将store 传递下去
- connect 接收操作state dispatch 还有当前组件和context传递过来的store,在componentDidMount生命周期 通过store.subscribe 订阅state变化 然后将 state action操作 props 绑定到 返回的组件中
- `import {ReactReduxContext} from 'react-redux'` `ReactReduxContext`等于`connect` 他可以获取`Provider`提供的store参数
- connect内的代码 其他的简单就没有复制进来
```js
import React from 'react';
import {bindActionCreators} from '../redux'
import Context from './Context';
export default function(mapStateTopProps,mapDispatchToProps){
  return function(InnerComponent){
    return class extends React.Component{
        static contextType = Context // this.context = {store:store}
        constructor(props,context){
          super(props);
          this.state = mapStateTopProps(context.store.getState())
          if(typeof mapDispatchToProps == 'function'){
            this.actions = mapDispatchToProps(context.store.dispatch);
          }else if(typeof mapDispatchToProps == 'object'){
            this.actions = bindActionCreators(mapDispatchToProps,context.store.dispatch)
          }
        }
        componentDidMount(){
          this.unsubscribe = this.context.store.subscribe(()=>{
            this.setState(mapStateTopProps(this.context.store.getState()));
          })
        }
        componentWillUnmount(){
          this.unsubscribe()
        }
        render(){
          return <InnerComponent {...this.props} {...this.state} {...this.actions}/>
        }
      }
  }
} 
```


### createStore
```js
function CreateStore(reducer){
  let state;
  let getState = ()=>state;
  let listeners = []
  // action 是有格式要求的  第一个是纯对象 第二个是 有type属性
  let dispatch = function(action){
    state = reducer(state,action)
    listeners.forEach(fn=>fn())
  }
  dispatch({type:'@INIT'})
  // 订阅的都是 在dispatch后执行的函数
  let subscribe = (fn)=>{
    listeners.push(fn)
    // 删除自己 返回最新的 listeners
    return ()=>{
      console.log('end')
      listeners= listeners.filter(l=>l!==fn)
    }
  }
  return {
    getState,
    dispatch,
    subscribe
  }
}
module.exports = CreateStore
```
### applyMiddleware
```js
import {compose} from './index'
function applyMiddleware(...middlewares){
  return function(createStore){
    return function(reducer){
      let store = createStore(reducer)
      let dispatch;
      let middlewareAPI = {
        getState:store.getState,
        dispatch:(...args)=>dispatch(...args)
      }
      middlewares =middlewares.map(middleware=>middleware(middlewareAPI));
      // 这个dispatch 是包装后的dispatch 函数  当外面调用dispatch的时候 他实际会执行真正的dispatch
      // 里面的next就是 实际的dispatch  他会传入action 执行
      dispatch = compose(...middlewares)(store.dispatch)
      // 返回的是包装后的dispatch
      return {
        ...store,
        dispatch
      }
    }
  }
}
export default applyMiddleware
```
### compose
```js
export default function (...fns){
  if(fns.length === 0) return args=>args;
  if(fns.length === 1) return fns[0]
  return fns.reduce((a,b)=>(...args)=>a(b(...args)));
}
```

### bindActionCreators
```js
// 此方法只能接受一个actionCreator actionCreator是一个函数
function bindActionCreator(actionCreator,dispatch){
  return function(...args){
    return dispatch(actionCreator(...args))
  }
}
export default  function(actionCreators,dispatch){
  if(typeof actionCreators == 'function'){
    return bindActionCreator(actionCreators,dispatch)
  }
  const boundActionCreators = {};//bound是bind的过去式 完成式
  for(const key in actionCreators){
    boundActionCreators[key] = bindActionCreator(actionCreators[key],dispatch)
  }
  return boundActionCreators
}
```

### combineReducers
```js
export default function combineReducers(reducers){
  // reducer 是从老状态和action中得到新的状态
  return function(state={},action){
    let nextState = {};
    for(let key in reducers){
      nextState[key] = reducers[key](state[key],action)
    }
    return nextState
  }
}
```
## 中间件
- 格式 连着3个函数,第一个函数接收`{getState,dispatch}`,第二个接收next 就是dispatch(执行中间件),第三个是action(组件传递进来的一个作用)
- 一般中间件 都是在第三个函数内 对action 进行判断逻辑 处理
### logger
```js
export default function({getState,dispatch}){
  return function(next){//代表下一个中间件
    return function(action){
      // console.log('action',action)
      // console.log(getState())
      next(action)
      // console.log(getState())
    }
  }
}
```
### redux-thunk
```js
// action的用法
function asyncIncrement(payload){
  return function(dispatch,getState){
    setTimeout(() => {
      dispatch({type:types.DECREMENT1,payload})
    }, 1000)
  }
}

export default function({getState,dispatch}){
  return function(next){//代表下一个中间件 他是实际老的dispatch
    return function(action){
      if(typeof action === 'function'){
        return action(dispatch,getState)
      }
      next(action)
    }
  }
}
```
### redux-promise
```js
// action 的用法
function promiseIncrement(payload){// actionCreator action的创建函数
  return new Promise(function(resolve,reject){
    setTimeout(() => {
      resolve({type:types.INCREMENT1,payload})
    }, 1000);
  })
}

export default function({getState,dispatch}){
  return function(next){//代表下一个中间件 他是实际老的dispatch
    return function(action){
      if(action.then&&typeof action.then == 'function'){
        return  action.then(dispatch);
      }
      next(action);
    }
  }
}
```
## persist
- 在2个地方做处理 第一个是index入口文件把组件包裹下,第二个是store把reducer拦截下
- 入口文件
```js
import {PersistGate} from 'redux-persist/integration/react';
import {persistor,store} from './store'
class counter extends React.Component{
  render(){
    return (<Provider store={store}>
      <PersistGate persistor={persistor}>
        <Counter/>
      </PersistGate>
    </Provider>)
  } 
}

// PersistGate 的作用就是 调用执行下 this.props.persistor.initState 函数 然后将原来的组件原封不动的返回
export default class PersistGate extends React.Component{
  componentDidMount(){
    // 调用persisor的初始化状态的方法 要把local里的数据取出来,合并到状态树中
    this.props.persistor.initState()
  }
  render(){
    return this.props.children
  }
}
```
- store处理
```js
import { persistReducer,persistStore} from 'redux-persist'
import storage from 'redux-persist/lib/storage'
const persistConfig = {
  // localStorage.setItem('root')
  key:'root',
  storage
}
const persistedReducer = persistReducer(persistConfig,reducer)
// 中间件的原理 就是 拦截dispatch 做处理
let store = applyMiddleware(logger,reduxPromise,reduxThunk)(createStore)(persistedReducer)
let persistor = persistStore(store)
export {persistor,store};

// persistReducer 他的作用就是模仿一个reducer 然后将之前的reducer包装
// 当dispatch({type:'PERSIST_INIT'})就是取值 其他情况的时候就是设置值 页面刚进来的时候 默认就是进入到PERSIST_INIT(后面会dispatch)
export default function(persistConfig,reducer){
  //表示是否已经把localStorage里的值取出来赋给仓库状态 
  let initialzed = false
  let {storage,key} = persistConfig;
  return function(state,action){
    switch(action.type){
      case 'PERSIST_INIT':
        initialzed = true
        let value =  storage.getValue(key);
        if(value){
          state = Object.assign(JSON.parse(value));
        }
        return reducer(state,action)
      default:
        if(initialzed){
          state=reducer(state,action);
          storage.setValue(key,JSON.stringify(state));
          return state;
        }
        return reducer(state,action)
    }
  }
}
// persistStore 的功能就是派发 {type:'PERSIST_INIT'}  
// 当页面初始化的时候 会执行PersistGate组件的 initState 方法,此方法对应下面的store.dispatch({type:'PERSIST_INIT'}) 
// 派发 PERSIST_INIT 的时候 会走 storage.getValue 获取值 所以其他情况的dispatch 修改store.store的时候都触发storage.setValue()
function persistStore(store){
  let persistor = {
    ...store,
    initState(){
      store.dispatch({type:'PERSIST_INIT'});
    }
  }
  return persistor;
}
```

## saga base
### base-hand
- saga 是一个函数,执行返回的函数是一个redux中间件,函数有个run方法
- run的参数是generator函数,同时这个generator函数,是saga的入口配置文件,配置文件就想一个reducer能操作store
- 1、点击按钮 派发一个action 他会走中间件,`events.emit(action.type,action)`他就是一个小拦截的作用,不影响后面的中间件(如果只有next()执行那个会走进入下一个中间件)
- 2、run是一个函数 他接收的是一个generator函数(是使用saga的一个配置文件,后面再说)。run函数里面的next可以看做一个小的中间件,他是根据generator函数里面的内容执行的。next会自动执行 调用generator里面的 第一个yield。take和put方式 实际就是一个简单的包装,增加了一个type而已,第一个yield执行的时候 返回的type是TAKE,他走了`events`的订阅,而方法就是当前的next。
- 3、促使化的时候 订阅了,等点击的时候走到中间,执行`events`的emit,他会执行之前保存的next,再次执行generator函数,走到配置文件的 yield put函数,他返回的是一个type是一个PUT,就走case 'PUT',执行dispatch,这个dispatch和组件调用dispatch是一样的,同样他会进入到saga中间件 但是执行`events.emit` 没用,因为此时的action.type没有被订阅,这个是个的dispatch 就是真正的会修改store的。接着执行'put'的next,进入generator的下一个yield。流程就完了

- 简单的实现原理
- redux-saga/index
```js
let EventEmitter = require('events')
export default function(){
  let events = new EventEmitter()
   function sagaMiddleware ({getState,dispatch}){
    function run(generator){
      let it = generator();
      function next(action){
        let  {value:effect,done} = it.next(action)
        if(!done){
          switch(effect.type){
            case 'TAKE':
              events.once(effect.actionType,next)
              break;    
            case 'PUT':
              dispatch(effect.action)
              next();
            default:
              break;
          }
        }
      }
      next()
    }
    sagaMiddleware.run = run
    return (next)=>{
      return (action)=>{
        console.log('action.type',action.type)
        events.emit(action.type,action)
        return next(action)
      }
    }
  }
  return sagaMiddleware
}
```
- redux-saga/effects
```js
export function take(actionType){
 return {
   type:'TAKE',
   actionType
 } 
}
export function put(action){
  return {
    type:'PUT',
    action
  } 
 }
```
- 基础用法
- 配置
- store
```js
import {createStore,applyMiddleware} from 'redux';
import reducer from './reducer';
import createSagaMiddleware from '../redux-saga'
import rootSaga from './rootSaga'
+ let sagaMiddleware = createSagaMiddleware()

+ let store = createStore(reducer,applyMiddleware(sagaMiddleware))
+ sagaMiddleware.run(rootSaga);
export default store
```
- 使用saga的配置文件
```js
import {takeEvery,put,all,delay} from 'redux-saga/effects'
import * as types from './action-types';
// yield 出来的是指令对象 
export function* asyncIncrement(){
  yield delay(1000)
  // 如果yield出来了一个 put的返回值,saga中间件会向仓库派发真正的action
  yield put({type:types.INCREMENT})
}

// 他会监听 他不会 阻塞当前的saga 但是他永远不会结束
export function* watchAsyncIncrement(){
  yield takeEvery(types.ASYNC_INCREMENT,asyncIncrement);
}
function* helloSaga(){
  console.log('hello')
}
// saga 入口
export default function* rootSage(){
  yield all([
    helloSaga(),
    watchAsyncIncrement()
  ])
}
```
- 组件
```js
import React from 'react';
import actions from '../store/actions/counter'
import { connect } from 'react-redux';
class Counter extends React.Component{
  fn=()=> {
      console.log('11111')
  }
  render(){
    return(
    <>
      <p>{this.props.number}</p>
      <button onClick={this.props.increment}>++++</button>
      <button onClick={()=>{
        setTimeout(() => {
            this.props.increment()
        }, 1000);
      }}>1秒后加1</button>
      <button onClick={this.props.asyncIncrement}>saga+1</button>
    </>
    )
  }
}
export default connect(
  state=>state,
  actions
)(Counter)
```
- action-types
```js
export const INCREMENT = 'INCREMENT'
export const ASYNC_INCREMENT = 'ASYNC_INCREMENT'
```
### take
- 用法 `take(types.ASYNC__XX)` 用来订阅的 不会执行任何
- saga 函数第一个是默认执行的 所有上来我先take订阅一下时间。
- 内部执行到take的时候 会触发订阅事件`events.once(effect.actionType,next)`,中间件执行的时候每次都会执行`events.emit(action.type,action)`,如果事件对应上 就会触发next(下一个中间件)执行,他会走saga函数的下一个yield函数,所以组件内调用saga函数的types一般和take函数里面的types对应。组件调用一个 saga 函数往下走一次,调用2次 saga 才能走2次yield。他会阻塞进程
```js
// 用法
export default function* rootSaga(){
    yield take(types.ASYNC_INCREMENT)
}
// take 截取部分核心逻辑
switch(effect.type){
  case 'TAKE':
    // 订阅
    events.once(effect.actionType,next)
    break;
}
// 中间件
return (next)=>{
  return (action)=>{
    // 发布
    events.emit(action.type,action)
    return next(action)
  }
}
```
### put
- put 实际就是调用dispatch,他传入的是action(put函数返回的就是包装后的action 带type=put的对象)直接修改状态,同时他还会执行next 调用下一个yield函数,他不会堵塞进程
```js
// put用法
export default function* rootSaga(){
    yield take(types.ASYNC_INCREMENT)
    let a = put({type:types.INCREMENT})
}
// put 截取核心逻辑
switch(effect.type){
  case 'PUT':
    // 订阅
    dispatch(effect.action)
    next();
    break;
}
```
### fork
- fork他传入的是一个generator(生成器),会直接执行,还会调用下一个next 不会阻塞进程。启动一个新的进程,然后直接向下执行,(next)返回的就是当前生成器
```js
// 用法
function * increment(){
    yield put({type:types.INCREMENT})
}
export default function* rootSage(){
  // fork就是启动一个新的进程,然后直接向下执行
  // task代表当前的任务 increment()
  const task = yield fork(increment)
}
switch(effect.type){
  case 'FORK':
    let task = effect.task();//task==iterator
    run(task);
    // 直接执行下一个next 不堵塞进程
    next(task)
    break;
}
```
### takeEvery
- takeEvery 内部开启了一个新的进程,然后在里面进行死循环 执行take
- effect 里面的`takeEvery`调用了fork,fork 就是执行了一个新的生成器
- take进行订阅, 一下中间件监控到相同事件就会触发下一个yield,take会堵塞进程,一旦触发就再次等待
- task 是takeEvery的第二个参数 一般是一个生成器
```js
export function* takeEvery(actionType,task){
  // yield fork一个saga
  yield fork(function *(){
    while (true){
      // 死循环 take 等待任务 task执行任务
      yield take(actionType)
      yield task();
    }
  })
}
```
### call && 支持promise异步
- call 接收的就是一个promise 内部`fn.apply(context,args).then(next)`then的时候传入next,当promise时间到的时候执行下一个next
- 同样直接执行promise的时候 一样 也是将next传入进去`effect.then(next)`
```js
// 用法
const pro = ms =>new Promise((resolve,reject)=>{
  setTimeout(()=>{
    resolve()
  },ms)
})
function* increment(){
  yield pro(1000)
  yield call(pro,1000)
  yield delay(1000)
  yield put({type:types.INCREMENT})
}
export default function* rootSaga(){
  // 等待每一个 ASYNC_INCREMENT动作,然后执行 increment函数
  // 他不会阻塞saga,直接向后面执行,take会阻塞
  yield takeEvery(types.ASYNC_INCREMENT,increment)
}
// 内部call逻辑
switch(effect.type){
  case 'CALL':
    let {fn,args,context} = effect.payload;
    fn.apply(context,args).then(next);
    break;
}
// promise逻辑
if(typeof effect[Symbol.iterator] === 'function'){
      run(effect);
      next()
  }else if(effect.then){
    // 支持then
    effect.then(next);
  }else{
    switch(){
      xxxxx
    }
  }
```
### delay
- delay函数 直接调用的是call,在effect可以看到 他就是promise和call结合
```js
// delay effect
export function delay(...args){
  return {
    type:'CALL',
    payload:{fn:delayP,args:args}
  }
}
function delayP(ms,val){
  return new Promise((resolve,reject)=>{
    setTimeout(()=>{
      resolve(val)
    },ms)
  })
}
```
### cps
- cps 是回调函数的用法
- callback 就是下一个中间件
```js
// 用法
const fn1 = (ms,callback)=>{
  setTimeout(() => {
    callback('ms')
  }, ms);
}
function* increment(){
  let ms = yield cps(fn1 ,1000)
  console.log('ms',ms)
  yield put({type:types.INCREMENT})
}
export default function* rootSaga(){
  yield takeEvery(types.ASYNC_INCREMENT,increment)
}
// 原理
switch(effect.type){
  case 'CPS':
    // 
    effect.fn(...effect.args,next)
    break;
}
```
### all
- all 会同时启动多个saga,然后等待所有的saga完成后才能结束当前这个saga
```js
// 用法
function* increment(){
  yield delay(1000);
  yield put({type:types.INCREMENT})
}
function* incrementWatcher(){
  yield takeEvery(types.ASYNC_INCREMENT,increment);
}
function* logger(){
  
  console.log('--loggerlogger')
}
function* loggerWatcher(){
  yield takeEvery(types.ASYNC_INCREMENT,logger);
}

export default function* rootSage(){
  console.log('start saga')
  yield all([
    incrementWatcher(),
    loggerWatcher(),
  ])
  yield all([
    loggerWatcher()
  ])
  console.log('end saga')
}
// 原理
  // 高阶函数 作用的传入一个cb函数和一个number 返回值执行的次数和number相等的时候 就执行cb函数
  function times(cb,total){
    let index = 0;
    return function(){
      if(++index === total){
        cb()
      }
    }
  }
  // 核心逻辑
  // fns 就是所有的all([xx,xx])数组里面的生成器
  // run(fn,done)循环遍历每一个生成器,同时传入done 
  switch(effect.type){
      case 'ALL':
    let fns = effect.fns;
    let done = times(next,fns.length);
    // 执行每一个all数组里面的生成器 times 第一个是参数是cb 等到所有的done执行完的时候,就会触发最有一个done里面的cb函数(next中间件)
    fns.forEach(fn=>{
      run(fn,done)
    })
    break; 
  }

  if(typeof effect[Symbol.iterator] === 'function'){
      // 即当前的迭代器执行完成的时候  就会进来
      run(effect);
      next()
  }
```
### cannel 
- 取消定时任务
- fork 开启一个新的进程 task代表的当前的increment进程,是一个无线循环
- take(types.STOP)开启一个事件订阅,堵塞进程,等到组件按钮发送dispatch(types.STOP),执行cancel,传入task进程,内部执行task.return()就可以停止生成器
```js
// 用法
function * increment(){
  while(true){
    yield delay(1000)
    yield put({type:types.INCREMENT})
  }
}
export default function* rootSage(){
  // fork就是启动一个新的进程,然后直接向下执行
  // task代表当前的任务 increment()
  const task = yield fork(increment)
  yield take(types.STOP)
  yield cancel(task)
}
// 原理
switch(){
  case 'CANCEL':
  effect.task.return('over');
  break;
}
```

## hand saga
### saga/index
```js
let EventEmitter = require('events')
// 高阶函数
function times(cb,total){
  let index = 0;
  return function(){
    if(++index === total){
      cb()
    }
  }
}
// let fn = times(()=>console.log('end'),3) 
// fn();fn();fn(); 当执行3次 fn()最后才返回callback

export default function(){
  let events = new EventEmitter()
   function sagaMiddleware ({getState,dispatch}){
    function run(generator,callback){
      // 判断 如果他是一个函数 说明是一个生成器 需要执行返回迭代器 
      //      如果不是一个函数 说明本身就是一个迭代器 执行next就可以
      let it = typeof generator === 'function'? generator():generator;
      function next(action){
        // value 可能是正常的effect 也可以是一个iterator
        // 如果是 iterator 会让他执行两次next 在走 switch 语句
        let  {value:effect,done} = it.next(action)
        console.log('起点',callback,done,'it=>',it,'action',action,effect)
        if(!done){
          // 弄清这个地方 就明白run 第二次的时候 'ALL' 的时候 出现第二次calllback 走下面的情况 了
          if(typeof effect[Symbol.iterator] === 'function'){
              run(effect);
              next()
          }else if(effect.then){
            effect.then(next);
          }else{
            switch(effect.type){
              case 'TAKE':
                events.once(effect.actionType,next)
                break;    
              case 'PUT':
                dispatch(effect.action)
                next();
                break;
              case 'CALL':
                let {fn,args,context} = effect.payload;
                fn.apply(context,args).then(next);
                break;
              case 'FORK':
                let task = effect.task();//task==iterator
                run(task);
                // next中的task会传递给当前的fork返回值
                next(task)
                break;
              case 'CANCEL':
                effect.task.return();
                break;
              case 'CPS':
                effect.fn(...effect.args,next)
                break;
              case 'ALL':
                let fns = effect.fns;
                let done = times(next,fns.length);
                // 执行每一个all数组里面的生成器 times第一个是参数是cb 等到所有的
                fns.forEach(fn=>{
                  run(fn,done)
                })
                break;
              default:
                break;
            }
          }
        }else{
          if(callback){
            console.log('callback============')
            callback && callback() 
          }
        }
      }
      next()
    }
    sagaMiddleware.run = run
    return (next)=>{
      return (action)=>{
        events.emit(action.type,action)
        return next(action)
      }
    }
  }
  return sagaMiddleware
}
```
### saga/effect
```js
export function take(actionType){
 return {
   type:'TAKE',
   actionType
 } 
}
export function put(action){
  return {
    type:'PUT',
    action
  } 
}
export function call(fn,...args){
  return {
    type:'CALL',
    payload:{fn,args}
  }
}
export function delay(...args){
  return {
    type:'CALL',
    payload:{fn:delayP,args:args}
  }
}
export function cps(fn,...args){
  return {
    type:'CPS',
    fn,
    args
  }
}
export function all(fns){
  return {
    type:'ALL',
    fns  
  }
}

function delayP(ms,val){
  return new Promise((resolve,reject)=>{
    setTimeout(()=>{
      resolve(val)
    },ms)
  })
}

export function fork(task){
  return{
    type:'FORK',
    task// task 也是一个生成器
  }
}

export function cancel(task){
  return {
    type:'CANCEL',  
    task
  }
}

// 类似开启了一个新的进程,然后在进程里面进行死循环 执行take iterator
export function* takeEvery(actionType,task){
  // yield fork一个saga
  yield fork(function *(){
    while (true){
      // 死循环 take 等待任务 task执行任务
      yield take(actionType)
      yield task();

    }
  })
}
```

