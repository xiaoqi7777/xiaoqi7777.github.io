# dva

## dva
- dva是一个非常轻量级的封装 集成了react全家桶
- cnpm install dva redux react-redux react-router-dom connected-react-router history
## 基本的用法
```js
import React from 'react';
import dva,{connect} from 'dva';
import {Router,Route} from 'dva/router';
import {createLogger} from 'redux-logger';
import keymaster from 'keymaster'
let app = dva({
  onAction:createLogger()
});

// combineReducer
/**
 * state={
 *  counter1:{number:0},
 *  counter2:{number:1},
 * }
 */
const delay = ms =>new Promise((resolve,reject)=>{
  setTimeout(()=>{
    resolve()
  },ms)
})
// 定义模型
app.model({
  // 匿名空间 区分不同的状态,
  // 注意操作reducers等方法的时候 在该model内不需要加匿名空间,在组件内需要添加,如果操作别的model就需要添加
  namespace:'counter1',
  state:{number:0},
  reducers:{
    // 属性名就是action-type,值就是一个函数,用来计算新状态的
    // store.dispatch({type:'counter1/add'});
    add(state){
      return{number:state.number+1}
    },
    minus(state){
      return{number:state.number-1}
    }
  },
  // 如果想实现异步操作的话,需要用effects
  effects:{
    * asyncAdd(action,{put,call}){
        yield call(delay,1000)
        yield put({type:'add'})
    }
  },
  // 订阅
  subscriptions:{
    // 监控路由
    changeTitle({history}){
      history.listen(({pathname,action})=>{
        console.log(action,pathname);
        document.title = pathname
      })
    },
    // 监控键盘
    keyboard({dispatch}){
      keymaster('space',()=>{
        dispatch({type:'add'})
      })
    }
  }
})
app.model({
  namespace:'counter2',
  state:{number:1},
  reducers:{
    // store.dispatch({type:'counter2/add'});
    add(state){
      return{number:state.number+1}
    },
    minus(state){
      return{number:state.number-1}
    }
  }
})
function Counter1(props){
  return(
    <div>
      <p>{props.number}</p>
      <button onClick={()=>props.dispatch({type:'counter1/add'})}>+</button>
      <button onClick={()=>props.dispatch({type:'counter1/asyncAdd'})}>async+</button>
      <button onClick={()=>props.dispatch({type:'counter1/minus'})}>+</button>
    </div>
  )
}
function Counter2(props){
  return(
    <div>
      <p>{props.number}</p>
      <button onClick={()=>props.dispatch({type:'counter2/add'})}>+</button>
      <button onClick={()=>props.dispatch({type:'counter2/minus'})}>+</button>
    </div>
  )
}
let ConnectedCounter1 = connect(state=>state.counter1)(Counter1)
let ConnectedCounter2 = connect(state=>state.counter2)(Counter2)
app.router(({history})=>(
  <Router history={history}>
    <>
      <Route path='/' component={ConnectedCounter1}></Route>
      <Route path='/' component={ConnectedCounter2}></Route>
    </>
  </Router>
))
app.start('#root');
```
## dva用法
- app 里面主要有3个方法 
  - model定义 组件的属性
  - router路由的使用
  - start 挂载的节点
```js
import React from 'react';
import dva,{connect} from './dva';
let app = dva();
// 定义模型
app.model({
  namespace:'counter1',
  state:{number:0},
  reducers:{
    // 属性名就是action-type,值就是一个函数,用来计算新状态的
    // store.dispatch({type:'counter1/add'});
    'add'(state){
      return{number:state.number+1}
    },
    "minus"(state){
      return{number:state.number-1}
    }
  },
  effects:{
    * asyncAdd(action,{put}){
      yield delay(1000);
      yield put({type:'add'})
    },
  }
})
function Counter1(props){
  return(
    <div>
      <p>{props.number}</p>
      <button onClick={()=>props.dispatch({type:'counter1/add'})}>+</button>
    </div>
  )
}
let ConnectedCounter1 = connect(state=>state.counter1)(Counter1)
app.router(()=><ConnectedCounter1/>)
app.start('#root');
```
### 简单的实现
- 分析 dva可以执行就是一个函数,往外导出一个对象,提供了model,router等方法,由于model可能是多个,所以调用model都会保存在_models内。
- 调用方法的时候是同一个model下,内部会自动添加前缀(匿名namespace),其他model调用的时候就需要添加匿名,prefixNameSpace函数就是遍历model.reducers下面的函数修改key返回对象而已
- router 就是赋值给内部的_router,没有别的
- start 就是收集所有处理过的数据 通过react进行渲染组件
  - reducers 需要转换,dva默认的actions-types就是 reducers的名字,getReducers函数就是处理reducer,首先遍历app._models ,每一个`namespace`都是独立的reducers,当action.type匹配到当前的reducer方法的时候 就返回执行reducer。最后将reducers用`combineReducers`函数进行处理包装
  - 最后拿到store传递给下面的组件 通过`connect`包装的组件就能获取到dispatch
```js
import React from 'react';
import ReactDOM from 'react-dom';
export default function (opts={}){
  function model(m){
    const profixedModel = prefixNameSpace(m)
    // 把model放在数组里去
    app._models.push(profixedModel);
  }
  function router(router){
    // 定义路由 
    app._router=router
  }
  function start(container){
    let reducers = getReducers(app);
    app._store = createStore(reducers);
    ReactDOM.render(
      <Provider store={app._store}>
        {app._router()}
      </Provider>
      ,document.querySelector(container))
  }
  let app = {
    _models:[],
    model,
    _router:null,
    router,
    start
  }
  return app
}
const NAMESPACE_SEP = '/';
function prefixNameSpace(model){
  // reducers : {add(state) {}}
  let reducers = model.reducers
  model.reducers = Object.keys(reducers).reduce((memo,key)=>{
    let newKey = `${model.namespace}${NAMESPACE_SEP}${key}`;
    memo[newKey] = reducers[key]
    return memo
  },{})
  return model
}
function getReducers(app){
  let reducers = {};//此对象将会用来进行合并,会传给combineReducers
  // app._models=[{namespace:'counter1'},{namespace:'counter2'}]
  // model代表单个app.model
  for(const model of app._models){
    reducers[model.namespace] = function(state=model.state||{},action){
      let model_reducers = model.reducers||{};
      let reducer = model_reducers[action.type]
      if(reducer){
        return reducer(state,action)
      }
      return state;
    }
  }
  return combineReducers(reducers)
}
```
### 增加saga
- 第一步获取有所的saga配置
  - getSagas 函数处理app.model所有的saga,每一个model都是一个生成器
  - 里面会使用takeEvery订阅每一个saga函数。同时会重写push方法,主要是处理saga里面的前缀
- 第二处在原来得到store,增加saga中间件进行处理
- 第三步 遍历当前modal 并且开启saga执行`sagaMiddleware.run`
```js
import React from 'react';
import ReactDOM from 'react-dom';
import { createStore,combineReducers,applyMiddleware } from 'redux';
import { Provider,connect } from 'react-redux'
import {createBrowserHistory} from 'history'
import createSagaMiddleware from 'redux-saga'
import * as sagaEffects from 'redux-saga/effects';
export {connect}
export default function (opts={}){
  let history = opts.history || createBrowserHistory();

  let app={
    _models:[],
    model:model,
    _router:[],
    router,
    start
  }
  function model(m){
    const profixedModel = prefixNameSpace(m)
    app._models.push(profixedModel);
  }
  function router(router){
    app._router=router
  }
  function start(container){
    let reducers = getReducers(app);
    let sagas = getSagas(app)
    let sagaMiddleware = createSagaMiddleware()
    app._store = applyMiddleware(sagaMiddleware)(createStore)(reducers);
    sagas.forEach(sagaMiddleware.run);//run 就是启动saga执行
    ReactDOM.render(
      <Provider store={app._store}>
        {app._router()}
      </Provider>
      ,document.querySelector(container))
  }
  return app
}
// 就是把model里的reducer对象转成一个管理自己状态state的reducer函数,然后它们会进行合并
function getReducers(app){
  let reducers = {};
  for(const model of app._models){
    reducers[model.namespace] = function(state=model.state||{},action){
      let model_reducers = model.reducers||{};
      let reducer = model_reducers[action.type]
      if(reducer){
        return reducer(state,action)
      }
      return state;
    }
  }
  return combineReducers(reducers)
}
function prefixType(type,model){
  if(type.indexOf('/')===-1){
    return `${model.namespace}${NAMESPACE_SEP}${type}`
  }
  return type;
}
// 此方法就是把reducers对象的属性名从add变成counter/add
const NAMESPACE_SEP = '/';
function prefix(obj,namespace){
  return Object.keys(obj).reduce((memo,key)=>{
    let newKey = `${namespace}${NAMESPACE_SEP}${key}`;
    memo[newKey] = obj[key]
    return memo
  },{})
}
function prefixNameSpace(model){
  if(model.reducers){
    model.reducers = prefix(model.reducers,model.namespace)
  }
  if(model.effects){
    model.effects = prefix(model.effects,model.namespace)
  }
  console.log(model)
  return model
}
function getSagas(app){
  let sagas = [];
  for(const model of app._models){
    // 把effects对象变成一个saga
    sagas.push(function*(){
      for(const key in model.effects){
        const watcher =getWatcher(key,model.effects[key],model);
        yield sagaEffects.fork(watcher)
      }
    })
  }
  return sagas
}
function getWatcher(key,effect,model){
  function put(action){
    return sagaEffects.put({...action,type:prefixType(action.type,model)})
  }
  return function*(){
    yield sagaEffects.takeEvery(key,function*(...args){
      yield effect(...args,{...sagaEffects,put});
    })
  }
}

```