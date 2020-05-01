# hooks

## 每次渲染都是独立的闭包
- 每一次渲染都有它自己的props and state
- 每一次渲染都有它自己的事件处理函数
- alert会捕获 点击按钮时候的状态
- 我们的组件函数每次渲染都会被调用 但是每一次调用中number值都是常量,并且它被赋予了当前渲染中的状态值
- 在单次渲染的范围内,props和state始终保持不变
```js
function Counter3(){
  let [number1,setNumber] = useState(0);
  function alertNumber(){
    setTimeout(() => {
      alert(number1)
    }, 3000);
  }
  return(
    <>
      <p>{number1}</p>
      
      <button onClick={()=>setNumber(number1+1)}>+</button>
      <button onClick={()=>alertNumber(number1+1)}>alertNumber+</button>
    </>
  )
}
```
## 函数式更新
- 如果新的 state 需要通过使用先前的 state 计算得出，那么可以将函数传递给 setState。该函数将接收先前的 state，并返回一个更新后的值
```js
function Counter4(){
  let [number1,setNumber] = useState(0);
  function lazy(){
    setTimeout(() => {
      // number1是老的
      // setNumber(number1+1)
      // number1是最新的
      setNumber(number1=>number1+1)
    }, 3000);
  }
  return(
    <>
      <p>{number1}</p>
      
      <button onClick={()=>setNumber(number1+1)}>+</button>
      <button onClick={()=>lazy(number1+1)}>alertNumber+</button>
    </>
  )
}
```
## 惰性初始化
```js
  function Counter5(props){
    // 惰性初始化 两种  setCounter操作 每次都是去替换不是合并
    // useState({name:'sg',age:8})
    let [counter,setCounter] = useState(function(){
      return {number1:props.number1}
    });
    return(
      <>
        <p>{counter.number1}</p>
        <button onClick={()=>setCounter({number1:counter.number1+1})}>+</button>
      </>
    )
  }
  ReactDOM.render(<Counter5 number1={5}/>,document.getElementById('root'))
```
## 性能优化
- 如果你状态状态的时候,直接传的是老状态,则不重新渲染
```js
function Counter5(props){
  console.log('counter render')
  let [counter,setCounter] = useState(function(){
    return {number1:props.number1}
  });
  return(
    <>
      <p>{counter.number1}</p>
      <button onClick={()=>setCounter({number1:counter.number1+1})}>+</button>
      <button onClick={()=>setCounter(counter)}> counter +</button>
    </>
  )
}
ReactDOM.render(<Counter5 number1={5}/>,document.getElementById('root'))
```
## memo
- 当子组件内的值不变的时候，父组件变化的时候不重新渲染子组件
- 用memo 把子组件包装
```js
function SubCounter({onClick=()=>{},data={number:0}}){
  console.log('SubCounter render')
  return (
  <button onClick={onClick}>{data.number}</button>
  )
}
// 把此组件传递给memo之后,就会返回一个新的组件,新的组件有了一个功能,如果属性不变,则不重新渲染。
SubCounter = memo(SubCounter)
let oldData,oldAddClick;
function Counter6(props){
  console.log('Counter6 render')
  let [number,setNumber] = useState(0);
  let [name,setName] = useState('计数器');
  // 如果你状态状态的时候,直接传的是老状态,则不重新渲染
  const data ={number};
  const addClick = ()=>{
    setNumber(number=>number+1)
  }
  return(
    <>
      <input type="text" value={name} onChange={e=>setName(e.target.value)}/>
      <SubCounter data={data} onClick={addClick}></SubCounter>
    </>
  )
}
ReactDOM.render(<Counter6 number1={5}/>,document.getElementById('root'))
```

## useMemo&&useCallback
- useMemo包装变量,第二个参数都是数组 指的该函数变化的时候 不会重新创建函数 执行
  - 它仅会在某个依赖项改变时才重新计算 memoized 值。这种优化有助于避免在每次渲染时都进行高开销的计算
- useCallback包装回调函数,二个参数同上
```js
function SubCounter({onClick,data}){
  console.log('SubCounter render')
  return (
  <button onClick={onClick}>{data.number}</button>
  )
}
// 把此组件传递给memo之后,就会返回一个新的组件,新的组件有了一个功能,如果属性不变,则不重新渲染。
SubCounter = memo(SubCounter)
let oldData,oldAddClick;
function Counter6(props){
  console.log('Counter6 render')
  let [number,setNumber] = useState(0);
  let [name,setName] = useState('计数器');
  //  oldData 是上一次的 
  const data =useMemo(()=>({number}),[number]);
  console.log('data=oldData',data===oldData)
  oldData = data
  
  const addClick = useCallback(()=>{
    setNumber(number+1)
  },[number])
  console.log('data=oldData',addClick===oldAddClick)
  oldAddClick = addClick
  
  return(
    <>
      <input type="text" value={name} onChange={e=>setName(e.target.value)}/>
      <SubCounter data={data} onClick={addClick}></SubCounter>
    </>
  )
}
ReactDOM.render(<Counter6 number1={5}/>,document.getElementById('root'))
```
## useReducer
- useReducer 第一个参数是reducer函数 第二个参数是初始状态 第三个是一个函数用来获取数值,他的结果作为第一个的state
```js
import React,{useState,memo,useMemo,useCallback,useReducer} from 'react'
import ReactDOM from 'react-dom';
const initialState = 0;
function reducer(state=initialState,action){
  switch(action.type){
    case 'ADD':
      return {number:state.number+1};
    default :
    break
  }
}
function Counter6(props){
  // useReducer 第一个参数是reducer函数 第二个参数是初始状态 第三个是一个函数用来获取数值,他的结果作为第一个的state
  const [state,dispatch] = useReducer((reducer),initialState,()=>({number:initialState}))
  return(
    <>
      <p>{state.number}</p>
      <button onClick={()=>dispatch({type:'ADD'})}>+</button>
    </>
  )
}
ReactDOM.render(<Counter6/>,document.getElementById('root'))
```
## useContext
- 接收一个 context 对象（React.createContext 的返回值）并返回该 context 的当前值
- 当前的 context 值由上层组件中距离当前组件最近的 <MyContext.Provider> 的 value prop 决定
- 当组件上层最近的 <MyContext.Provider> 更新时，该 Hook 会触发重渲染，并使用最新传递给 MyContext provider 的 context value 值
- useContext(MyContext) 相当于 class 组件中的 static contextType = MyContext 或者 <MyContext.Consumer>
- useContext(MyContext) 只是让你能够读取 context 的值以及订阅 context 的变化。你仍然需要在上层组件树中使用 <MyContext.Provider> 来为下层组件提供 context
```js
import React,{useState,memo,useMemo,useCallback,useReducer,createContext, useContext} from 'react'
import ReactDOM from 'react-dom';
const initialState = 0;
function reducer(state=initialState,action){
  switch(action.type){
    case 'ADD':
      return {number:state.number+1};
    default :
    break
  }
}
let CounterContext = createContext()
// 老版的
// function SubCounter_bak(){
//   return(
//     <CounterContext.Consumer>
//       {
//         value=>(
//           <>
//             <p>{value.state.number}</p>
//             <button onClick={()=>value.dispatch({type:'ADD'})}>+</button>
//           </>
//         )
//       }
//      </CounterContext.Consumer>
//   )
// }
// class SubCounter extends React.Component{
//   static contextTypes = CounterContext
//   this.context
// }
function SubCounter(){
  const {state,dispatch} = useContext(CounterContext)
  return(
    <>
      <p>{state.number}</p>
      <button onClick={()=>dispatch({type:'ADD'})}>+</button>
    </>
  )
}
function Counter6(props){
  // useReducer 第一个参数是reducer函数 第二个参数是初始状态 第三个是一个函数用来获取数值,他的结果作为第一个的state
  const [state,dispatch] = useReducer((reducer),initialState,()=>({number:initialState}))
  return (
    <CounterContext.Provider value={{state,dispatch}}>
      <SubCounter></SubCounter>
    </CounterContext.Provider>
  )
  
}
ReactDOM.render(<Counter6/>,document.getElementById('root'))
```
## useEffect
- 在函数组件主体内（这里指在 React 渲染阶段）改变 DOM、添加订阅、设置定时器、记录日志以及执行其他包含副作用的操作都是不被允许的，因为这可能会产生莫名其妙的 bug 并破坏 UI 的一致性
- 使用 useEffect 完成副作用操作。赋值给 useEffect 的函数会在组件渲染到屏幕之后执行。你可以把 effect 看作从 React 的纯函数式世界通往命令式世界的逃生通道
- useEffect 就是一个 Effect Hook，给函数组件增加了操作副作用的能力。它跟 class 组件中的 componentDidMount、componentDidUpdate 和 componentWillUnmount 具有相同的用途，只不过被合并成了一个 API
- 该 Hook 接收一个包含命令式、且可能有副作用代码的函数
## 清除副作用
- 副作用函数还可以通过返回一个函数来指定如何清除副作用
- 为防止内存泄漏，清除函数会在组件卸载前执行。另外，如果组件多次渲染，则在执行下一个 effect 之前，上一个 effect 就已被清除
```js
import React,{useState,memo,useMemo,useCallback,useReducer,createContext, useContext,useEffect} from 'react'
import ReactDOM from 'react-dom';
console.log('111')
class Counter2 extends React.Component{
  state={number:0}
  componentWillMount(){
    document.title=`当前一共点击了${this.state.number}次`
  }
  componentDidUpdate(){
    document.title=`当前一共点击了${this.state.number}次`
  }
  render(){
    return(
      <>
        <p>{this.state.number}</p>
        <button onClick={()=>this.setState({number:this.state.number+1})}>+</button>
      </>
    )
  }
}
// 每次修改完状态后要同步到浏览器的标题上
function Counter(){
  let [number,setNumber]=useState(0);
  // effect函数式在每次渲染完成之后(渲染分为2中,第一个初始化渲染,第二个组件更新后渲染)
  useEffect(()=>{
    document.title=`当前一共点击了${number}次`
  },[number])
  return(
    <>
      <p>{number}</p>
      <button onClick={()=>setNumber(number+1)}>+</button>
    </>
  )
}
function Counter3(){
  let [number,setNumber]=useState(0);
  // useEffect函数式在每次渲染完成之后(渲染分为2中,第一个初始化渲染,第二个组件更新后渲染)
  // useEffect每次执行前 会执行上次的返回值
  // useEffect 第二个参数为组件 会监控数组内变量变化  没有变化的时候就不会重复执行,
  //    为空就永远不会重复执行,如果数组内放了number 每次number都变化了里面的函数都会重复执行
  useEffect(()=>{
    console.log(`你开启了一个新的定时器`)
    const $timer = setInterval(() => {
      setNumber(number=>number+1)
    }, 1000);
    return ()=>{
      clearInterval($timer)
    }
  },[])
  return(
    <>
      <p>{number}</p>
      <button onClick={()=>setNumber(number+1)}>+</button>
    </>
  )
}
ReactDOM.render(<Counter3/>,document.getElementById('root'))
```
## useRef
- createRef和useRef 区别,useRef每次都返回相同的对象
```js
import React,{useState,memo,useMemo,useRef, createRef} from 'react'
import ReactDOM from 'react-dom';
// usrRef React.createRef()
function Parent(){
  let [number,setNumber] = useState(0)
  return (
    <>
      <Children/>
      <button onClick={()=>setNumber(number+1)}>{number}</button>
    </>
  )
}
let myInput;
function Children(){
  // const inputRef = createRef(); // {current:''}
  const inputRef = useRef(); // {current:''}
  console.log('inputRef === myInput',inputRef === myInput);
  myInput = inputRef;
  function getFocus(){
    inputRef.current.focus();
  }
  return (
    <>
      <input ref={inputRef}></input>
      <button onClick={getFocus}>获得焦点</button>
    </>
  )

}
ReactDOM.render(<Parent />,document.getElementById('root'))
```
- useRef 父组件获取子组件属性和方法
- useRef 方法定义ref
- forwardRef 包装子组件
- useImperativeHandle,第一个参数接收父组件parentRef,第二个参数返回parent组件操作的属性和方法
```js
import React,{useState,memo,useMemo,useRef, createRef,forwardRef,useImperativeHandle} from 'react'
import ReactDOM from 'react-dom';
// useRef React.createRef()
function Children(props,parentRef){
  let focusRef = useRef();
  let inputRef = useRef();
  useImperativeHandle(parentRef,()=>{
    return  {
        focusRef,
        inputRef,
        name:'计数器',
        focus(){
          focusRef.current.focus()
        },
        changeTxt(text){
          inputRef.current.value = text;
        }  
    }
  })
  return (
    <>
      <input ref={focusRef}/>
      <input ref={inputRef}/>
    </>
  )
}

let ForwardChild = forwardRef(Children) 
// hook 有什么特点 可以用在函数组件中, 并且可以在函数组件的多次渲染之间保持不变
function Parent(){
  const parentRef = useRef();
  function getFocus(){
    parentRef.current.focus();
    parentRef.current.changeTxt('<script>alert(1)</script>');
    console.log(parentRef.current)
  }
  return (
    <>
      <ForwardChild ref={parentRef}/>
      <button onClick={getFocus}>获得焦点</button>
    </>
  )
}
ReactDOM.render(<Parent />,document.getElementById('root'))
```
## useLayoutEffect 
- 其函数签名与 useEffect 相同，但它会在所有的 DOM 变更之后同步调用 effect
- 可以使用它来读取 DOM 布局并同步触发重渲染
- 在浏览器执行绘制之前useLayoutEffect内部的更新计划将被同步刷新
- 尽可能使用标准的 useEffect 以避免阻塞视图更新
- dom在浏览器的渲染过程
  - html和css解析 生成DOM Tree和Style rules
  - 两者结合 生成render Tree 进行painting(绘制) 
- useLayoutEffect和useEffect区别
  - useLayoutEffect发生是在 render Tree和painting之间,在这里获取dom进行操作是同步的
  - useEffect是在painting之后
```js
import React,{useState,memo,useMemo,useRef, useLayoutEffect,useEffect} from 'react'
import ReactDOM from 'react-dom';

function UseLayoutEffectComponent(){
    const [color,setColor] = useState('red')  
    // 他是异步 浏览器painting之后执行
    useEffect(()=>{
      console.log('useEffect color=',color)
    })
    // 他是同步 在painting之前 render Tree 之后执行,这个时候一般操作DOM比较合适,能很快的获取到DOM
    // 如果在useEffect 操作dom 可能会出现闪现,因为dom渲染了之后 在执行颜色更换操作 
    useLayoutEffect(()=>{
      console.log('useLayoutEffect color=',color)
      document.getElementById('myDiv').style.backgroundColor = 'purple'
    })
    return (
      <>
        <div id='myDiv' style={{background:color}}>颜色</div>
        <button onClick={()=>setColor('red')}>红色</button>
        <button onClick={()=>setColor('blue')}>蓝色</button>
        <button onClick={()=>setColor('yellow')}>黄色</button>
      </>
    )
}
ReactDOM.render(<UseLayoutEffectComponent />,document.getElementById('root'))
```
## 自定义hooks
- 只能在函数最外层调用hook 不要在循环 条件判断或者子函数中使用
- 只能在React函数组件中调用hook 不要在其他js函数中调用
- 自定义hooks，1、命名use开头。2、函数内部使用hooks
```js
import React,{useState,memo,useMemo,useRef, useLayoutEffect,useEffect} from 'react'
import ReactDOM from 'react-dom';
// 组件的复用 1、
class Counter1 extends React.Component{
  state = {number:0}
  add = ()=>{
    this.setState({number:this.state.number+1})
  }
  render(){
    return(
      <>
        <button onClick={this.add}>{this.state.number}</button>
      </>
    )
  }
}
function withCounter(Component){
  return class  extends React.Component{
    state = {number:0}
    componentDidMount(){
      setInterval(()=>this.setState({number:this.state.number+1}),1000)
    }
    render(){
      return(
        <>
          <Component number={this.state.number}/>
        </>
      )
    }
  }
}

class App1 extends React.Component{
  render(){
    return(
      <>
      <button>{this.props.number}</button>
      </>
    )
  }
}
App1 = withCounter(App1)
class App2 extends React.Component{
  render(){
    return(
      <>
      <button>{this.props.number}</button>
      </>
    )
  }
}
App2 = withCounter(App2)

// 2、render props 组件有一个render方法
class Counter  extends React.Component{
  state = {number:0}
  componentDidMount(){
    setInterval(()=>this.setState({number:this.state.number+1}),1000)
  }
  render(){
    return this.props.render({number:this.state.number})
  }
}
ReactDOM.render(<><Counter render={props=><p>{props.number}</p>}/><Counter render={props=><button>{props.number}</button>}/></>,document.getElementById('root'))

// 自定义hook 只要一个方法,名的前缀是use开头,并且在函数内使用hooks,那么它就是一个自定义hooks
function useNumber(){
  let [number,setNumber] = useState(0)
  useEffect(()=>{
    setInterval(()=>{
      setNumber(number=>number+1)
    },1000)
  },[])
  return number;
}
function Counter1(){
  let number = useNumber();
  return (
  <div>{number}</div>
  )
}
function Counter2(){
  let number = useNumber();
  return (
  <div>{number}</div>
  )
}
ReactDOM.render(<><Counter1/><Counter2/></>,document.getElementById('root'))
```