
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
- npm install react-router-dom
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
- render和children 都是返回函数 component给一个组件
- children 不管路径没有没匹配到 都会渲染 如果是当前路径 则props.match 为ture	
  - 一般对NavLink做 二次处理 如果跳转的是当前 可以把active放到上级
- render 就是返回函数 
  - 一般对Route 进行二次处理 如果登陆就正常返回 否则 拦截等操作

## react-redux用法
- 创建一个store
- actions 存放动作 => 导出的是一个对象 对象里面有操作的方法 方法返回对象  获得的对象传入reducers的第二个参数
- reducers 存放管理员 => 就是一个函数接受(state,aciton) 返回一个对象 修改store的数据
- index.js 导出store  将reducers传入redux里面的createStore中
- types.js 存放操作类型 操作的类型 避免写错 所以集中存放
  - redux 在创建的store的时候 将reducer(管理员放进去) 默认是执行一次dispatch state会接受默认值
  - 在组件内是通过调用store.dispatch 修改state里面的东西 store.getState获取state里面的值

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

- saga.js (待完善)
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

## redux核心
```js
function CreateStore(reducer) {
  let state;
  let getters = () => state;
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
    getters,
    dispatch,
    subscribe
  }
}
export { CreateStore };
```

## redux-saga 原理
- 用法
```js
  // store/index
  import createSagaMiddleware  from 'redux-saga'
  import rootSaga from '../saga'
  let sageMiddleware = createSagaMiddleware()
  //sageMiddleware放到中间件里面
  let store = createStore(reducer,applyMiddleware(sageMiddleware));
  //运行
  sageMiddleware.run(rootSaga)

  // src/saga
  import {takeEvery,put,take} from './redux-saga/effect'
  import * as Types from './store/types'
  
  // rootSage 是核心的 导出函数
  export default function * rootSage(){
    for(var i=0;i<3;i++){
      console.log(`第${i}次`)
      // take监听一次 会触发 subscribe  
      // 默认rootSage会执行一次  也就是take会被
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
## dva用法
- 流程图
- 脚手架
  - npm install dva-cli@next -g(1+ 的版本采用的umi)
  - dva new xx
  - cd xx
  - cnpm i styled-components -S
  - npm start
<img :src="$withBase('/img/dva.png')" >
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

app.model({
  //里面的是 子状态
  namespace:'count',
  state:{number:0},
  reducers:{
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
```

