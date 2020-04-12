# react
[[toc]]

## 前言
- 1、react 0开始
    react基础应用
    高级应用优化
    redux + redux中间件 react-redux
    react路由
    umi dva roadhog ant design ant design pro
    react源码
    hook fiber
- 2、React 是一个用于构建用户界面的JavaScript库 核心专注于视图,目的实现组件化开发,React和vue都是专注视图层
### 什么是jsx
- 把一种js和html混合的语法 将组建的结构 数据甚至样式都聚合在一起,jsx是语法糖 会通过babel转义成 createElement语法 
3、jsx 语法通过 babel转译成js babel-loader @babel/core @babel/preset-react(预设,他负责把html标签转成js代码)  
### 元素
- react元素(element)就是一个普通的js对象
- 元素是构成React应用的最小单位
- class 要换成 className(class 是关键字)
- for 要换成 htmlFor
- 元素内插入 标签 用下面的格式 使用 dangerouslySetInnerHTML 他的父元素不能有子元素
```js
<span dangerouslySetInnerHTML={{_html:'xxx'}}>
```
- key尽量不要用索引做key  同级且类型相同的的节点才需要key
```js
// 元素
let element = (
  <h1>
     hello
  </h1>
)
```
### jsx表达式
```js
//< 开头的表示 是一个js标签
//{ 开头的表示里面是一个表达式 里面放变量
function toUser(user){
  // react 可以作为方法的参数  也可以作为方法的返回值
  return <span>{user.id}:{user.name}:<span dangerouslySetInnerHTML={{__html:user.slogan}}></span></span>
}
let users = [{id:1,name:'zhufeng',slogan:'<input id="user" value="zf"/>'},{id:2,name:'jiagou'}]
ReactDOM.render(
  <ul className='users'>
  {
    users.map((user,index)=>(
      <li key={user.id} style={{color:'red'}}>{toUser(user)}</li>
    ))
  }
  </ul>
,document.getElementById('root'))
// 列表中的每一个子元素都应该有唯一的key属性
```

## 组件
### 函数组件 
- 函数组件 函数执行完成返回一个React元素 虚拟dom
- 函数组件 和 普通的函数(首字母需要大写)
- 函数组件可以接受参数对象
- 函数组件可以认为是一个纯函数,传入props,返回react元素,相同的props肯定会返回相同的React
```js
import React from 'react';
function Counter(props){
  return <div>数字{props.number}</div>
}
export default Counter
```
### 类组件
- 是一个继承自React.Component的一个类,里面必须提供一个render方法,需要返回一个react元素
- 1、React元素不但可以是原生DOM标签类型,也可以是用户自定义组件
- 2、组件名称首字母大写
- 3、函数组件 类组件render方法 都要返回并且唯一返回一个顶级react元素 <></> 就是<React.Frament><React.Frament>
- 4、属性是不可变的 this.props上的属性不能修改
- 5、可以给组件加一个类型检查,类型检查类似于说明书.告诉使用者如何使用我这个组件
```js
import React from 'react'
class Counter extends React.Component{
  render(){
    return (
      <>
        <div>数字{this.props.number}</div>
        <div>数字{this.props.number}</div>
      </>
    )
  }
}
export default Counter
```
### 类型检查&&默认赋值
- `import PropTypes from 'prop-types'`
```js
MyComponent.propTypes = {
  // 你可以将属性声明为 JS 原生类型，默认情况下
  // 这些属性都是可选的。
  optionalArray: PropTypes.array,
  optionalBool: PropTypes.bool,
  optionalFunc: PropTypes.func,
  optionalNumber: PropTypes.number,
  optionalObject: PropTypes.object,
  optionalString: PropTypes.string,
  optionalSymbol: PropTypes.symbol,

// node和元素的区别
  // 任何可被渲染的元素（包括数字、字符串、元素或数组）
  // (或 Fragment) 也包含这些类型。
  optionalNode: PropTypes.node,

  // 一个 React 元素。
  optionalElement: PropTypes.element,

  // 你也可以声明 prop 为类的实例，这里使用
  // JS 的 instanceof 操作符。
  optionalMessage: PropTypes.instanceOf(Message),

  // 你可以让你的 prop 只能是特定的值，指定它为
  // 枚举类型。
  optionalEnum: PropTypes.oneOf(['News', 'Photos']),

  // 一个对象可以是几种类型中的任意一个类型
  optionalUnion: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.instanceOf(Message)
  ]),

  // 可以指定一个数组由某一类型的元素组成
  optionalArrayOf: PropTypes.arrayOf(PropTypes.number),

  // 可以指定一个对象由某一类型的值组成
  optionalObjectOf: PropTypes.objectOf(PropTypes.number),

  // 可以指定一个对象由特定的类型值组成
  optionalObjectWithShape: PropTypes.shape({
    color: PropTypes.string,
    fontSize: PropTypes.number
  }),

  // 你可以在任何 PropTypes 属性后面加上 `isRequired` ，确保
  // 这个 prop 没有被提供时，会打印警告信息。
  requiredFunc: PropTypes.func.isRequired,

  // 任意类型的数据
  requiredAny: PropTypes.any.isRequired,

  // 你可以指定一个自定义验证器。它在验证失败时应返回一个 Error 对象。
  // 请不要使用 `console.warn` 或抛出异常，因为这在 `onOfType` 中不会起作用。
  customProp: function(props, propName, componentName) {
    if (!/matchme/.test(props[propName])) {
      return new Error(
        'Invalid prop `' + propName + '` supplied to' +
        ' `' + componentName + '`. Validation failed.'
      );
    }
  },

  // 你也可以提供一个自定义的 `arrayOf` 或 `objectOf` 验证器。
  // 它应该在验证失败时返回一个 Error 对象。
  // 验证器将验证数组或对象中的每个值。验证器的前两个参数
  // 第一个是数组或对象本身
  // 第二个是他们当前的键。
  customArrayProp: PropTypes.arrayOf(function(propValue, key, componentName, location, propFullName) {
    if (!/matchme/.test(propValue[key])) {
      return new Error(
        'Invalid prop `' + propFullName + '` supplied to' +
        ' `' + componentName + '`. Validation failed.'
      );
    }
  })
};
```
```js
import React from 'react'
import PropTypes from 'prop-types'
class Counter extends React.Component{
  static defaultProps ={
    name:'默认对象'
  }
  static propTypes ={
    name:PropTypes.string.isRequired,
    number:PropTypes.number.isRequired
  } 
  render(){
    return (
      <>
        <div>数字{this.props.number}</div>
        <div>数字{this.props.name}</div>
      </>
    )
  }
}
export default Counter
```
### map
- 组件处理children 当children不固定的时候 可以用react内置语法`React.Children.map`(第一个参数是处理的children,第二个是回调。他内部会判断children个数),直接用props.children.map,有缺陷 他只能处理数组,遇到别的情况就会出问题
- 若`React.Children.map`返回的是数组`[li,li]`,他会将数组打平`li li li li`,我们自己写的map 只会变成`[[li,li],[li,li]]`
- props.children 有三种情况,1、props.children 不传就是undefined。2、props.children 传递一个,那就是一个对象 react元素 数字 字符串。3、props.children 大于一个 那就是一个数组
```js
// props.children 不传就是undefined
// props.children 传递一个,那就是一个对象 react元素 数字 字符串
// props.children 大于一个 那就是一个数组
function Users(props){
  return (
    <ul>
      {
      props.children.map((item,index)=><li key={index}>11+{item}</li>)
      }
    </ul>
    // <ul>
    //   {
    //     React.Children.map(props.children,(item,index)=><li key={index}>{item}</li>)
    //   }
    // </ul>
    // map 返回的是数组的情况
    // <ul>
    //   {
    //     React.Children.map(props.children,(item,index)=>[<li key={index}>{item}</li>,<li key={index+'11'}>{item}</li>])
    //   }
    // </ul>
  )
}
function App() {
  return (
    <div className="App">
      <Users>
        {/* <span>123</span>
        <span>123</span> */}
      </Users>
    </div>
  );
}
```
## 虚拟dom
### createElement
- 1、`import React from './react'` 我们写的jsx语法 通过babel编译,React.createElement将编译后的jsx语法创建组件,接收三个参数(第一个是组件或者标签,第二个是标签的配置对象id、style等,第三个是及其后面的都是children,可能是一个对象,也可能是一个数组)
- 2、createElement 里面返回type和props,props里面存放了第二个标签的配置对象,和children
  - props.children 不传就是undefined
  - props.children 传递一个,那就是一个对象 react元素 数字 字符串
  - props.children 大于一个 那就是一个数组
- 静态属性 isReactComponent 是用来用区别函数组件和类组件,在render 里面用到的
```js
function createElement(type,config,children){
  let propName;
  const props = {};
  for(propName in config){
    props[propName] = config[propName]
  }
  const childrenLength = arguments.length - 2//看看有几个儿子
  if(childrenLength === 1){
    props.children = children;// props.children就是一个普通的对象
  }else if(childrenLength >1){// 如果说儿子数量大于1的话 props.children就是一个数组
    props.children = Array.from(arguments).slice(2);
  }
  return {type,props}
}
class Component{
  static isReactComponent = true
  constructor(props){
    this.props = props
  }
}
export default {
  createElement,
  Component
}
```
### render
- render里面会判断组件类型是 普通、函数、类组件
- 当是普通组件的时候,通过组件类型 创建一个node节点,在循环props 将所有的参数设置到node上,若 render参数 element是`string`或者`number`就创`createTextNode(element)`返回,判断children是数组 就说明还有子组件,进行render循环,知道render第一个参数是字符串或者数字
```js
function render(element,container){
  if(typeof element == 'string' || typeof element == 'number'){
    return  container.appendChild(document.createTextNode(element))
  }
  let type = element.type //获取react元素的类型
  let props = element.props //获取react元素的属性
  // 类组件
  if(typeof type === 'function' && type.isReactComponent === true){
    let inst = new type(props)
    let renderedElement = inst.render();
    type = renderedElement.type;
    props = renderedElement.props;
  }else if(typeof type === 'function'){
  // 函数组件 
    let renderedElement = type(props);
    type = renderedElement.type;
    props = renderedElement.props;
  }
  // 普通组件
  let domElement = document.createElement(type)
  // console.log('props',props)
  for(let propName in props){
    if(propName === 'className'){
      domElement.className = props[propName]
    }else if(propName === 'style'){
      let styleObj = props[propName];
      for(let attr in styleObj){
        domElement.style[attr] = styleObj[attr]
        // document.style.backgroundColor = 'green'
      }
    }else if(/^on[A-Z]/.test(propName)){
      domElement[propName.toLowerCase()] = props[propName]
    }else if(propName === 'children'){
      let children = Array.isArray(props.children)?props.children:[props.children];
      console.log('children',children)
      children.forEach(child=>render(child,domElement));
    }
  }
  // console.log('domElement',domElement)
  container.appendChild(domElement);
}
export default{
  render
}
```

## 组件状态
- 类组件可以定义状态,还可以修改状态,另外每次状态额改变都会引发组件的更新
```js
/*
  1、不要直接修改状态,页面不会刷新,必须要通过setState
  2、组件在渲染的时候只会修改变动的部分
  3、react数据是自上而下流动的
  4、state的更新可能是异步的,多个state可能会被合并成同一个,
      state = {number:0}
      handleClick = (event)=>{ //触发的时候 后面的setState顶替之前的
        // 状态不能直接修改
        this.setState({number:this.state.number+1})
        this.setState({number:this.state.number+1})
        this.setState({number:this.state.number+1})
        console.log(this.state.number)//是0
      }
  5、如果想永远基于上一个状态来更新,用函数
      this.setState((pre)=>({number:pre.number+1}))
      this.setState((pre)=>({number:pre.number+2}))
  6、如果希望立刻获取到最新的值,可以在回调函数获取
      this.setState({number:this.state.number+1},()=>{
        this.setState({number:this.state.number+1},()=>{
        })
      })
*/ 
```

## this处理
```js
/*
  this 处理
  一般来说我们希望在回调函数里让this = 当前组件
  1、使用箭头函数 this就会永远指向类的实例
  2、如果用的是普通函数 this=undefined 
    2.1 可以使用bind
    2.2 可以用匿名函数 (event)=>this.handleSubmit(event)
*/
```
## ref&受控和非受控
```js
/*
  ref的用法 + 受控组件和非受控组件
  reference = 引用 如果我们希望在代码中获取到React元素渲染到页面的真是DOM
  ref用法三种
  1、ref='num1'  this.refs.num1 (废弃了)
  2、ref函数方式 ref={input=>this.num1 = input} (废弃了)
  3、主流方式
  constructor(props){
    super(props)
    this.num1 = React.createRef();//{current:'null'}
  }
  add=()=>{
    let num1 = this.num1.current.value
  }
  <input ref={this.num1}/>

  input内部会存储自己的值,这个值和react是相互独立的
  input的值并不受react控制 这个称为非受控组件
  
  受控组件 就是value的值受state控制
  
  input 组件用value 必须要添加onChange等事件或者 readOnly,value 给'' 不能给null和undefined(他们2个是有值的,受控组件要给空值) 否则会报警告

  <input data-name='num1'>  data-name  在dom.dataset中获取
*/
```
## 生命周期
- 创建时  constructor(初始化的时候执行后面一半不执行了) getDerivedStateFromProps render 开始更新 componentDidMount(组件挂载完成)
```js
  // new props  setState forceUpdate 都会触发
  // 返回的对象将会更新新的状态对象,
  // 如果不改变状态,则可以返回null
  static getDerivedStateFromProps(nextProps,nextState){
    // nextProps 接收到的父组件传递的参数
    // nextState 当前的state
  }
``` 
- 更新时 getDerivedStateFromProps shouldComponentUpdate render getSnapshotBeforeUpdate 开始更新 componentDidUpdate
```js
  // react可以shouldComponentUpdate方法中优化 默认返回true
  shouldComponentUpdate(nextProps,nextState){ // 代表的是下一次的属性 和 下一次的状态 
    return nextState.number%2;
    // return nextState.number!==this.state.number; //如果此函数种返回了false 就不会调用render方法了
  }
  // 在更新前获取DOM的快照 dom更新前获取一些数据 放在dom上
  getSnapshotBeforeUpdate(){
    // 此返回值会传给 componentDidUpdate的最后一个参数
    return this.scrollRef.current.scrollHeight;
  }
  componentDidUpdate(pervProps,prevState,lastScrollHeight){}
```
- getSnapshotBeforeUpdate 用法 
- 在state数据变化的时候
```js
import React from 'react';
import ReactDom from 'react-dom';
class Counter extends React.Component{
  constructor(){
    super();
    this.scrollRef = React.createRef()
  }
  state = {messages:[]}
  componentDidMount(){
    this.timer = setInterval(()=>{
      this.setState({
        messages:[`message=>${this.state.messages.length}`,...this.state.messages]
      })
    },1000)
  }
  componentWillUnmount(){
    clearInterval(this.timer);
  }
  // 在更新前获取DOM的快照
  getSnapshotBeforeUpdate(){
    // 此返回值会传给 componentDidUpdate的最后一个参数
    return this.scrollRef.current.scrollHeight;
  }
  componentDidUpdate(pervProps,prevState,lastScrollHeight){
    let scrollTop = this.scrollRef.current.scrollTop
    this.scrollRef.current.scrollTop = scrollTop+(this.scrollRef.current.scrollHeight-lastScrollHeight)
  }
  render(){
    let styles = {
      margin:'50px',
      height:'100px',
      width:'200px',
      border:`1px solid red`,
      overflow:'auto',
    } 
      return (
        <ul style={styles} ref={this.scrollRef}>
          {
            this.state.messages.map((item,index)=><li key={index}>{item}</li>)
          }
        </ul>
      )
  }
}
export default Counter
```
- 卸载 componentWillUnmount组件将要卸载

## setState
- 他既不是同步也不是异步(看情况)
- 1、`this.setState`修改数据变化,首先将setState传进来的数据存放到 pending 列表中
- 2、判断是否是批量更新,是的话,就将当前组件存放到 dirtyComponents(脏组件数组中)。
  - 否的话,就将直接更新当前组件的 update(直接更新dom操作),遍历所有的 dirtyComponents(脏组件)执行他们的update方法(直接更新dom操作)
  - 是的情况下一般是同步,把所有的组件存起来,否的一般是异步情况,因为同步走完了会更新批量为false
```js
// 事务
class Transaction{
  constructor(wrappers){
    this.wrappers = wrappers
  }
  perform(anyMethod){
    this.wrappers.forEach(wrapper=>wrapper.initialize())
    anyMethod.call()
    this.wrappers.forEach(wrapper=>wrapper.close())
  }
}

let batchingStrategy = {
  isBatchingUpdates:false,//默认是非批量更新模式
  dirtyComponents:[],// 脏组件 组件的状态和界面上显示的不一样
  batchedUpdates(){
    this.dirtyComponents.forEach(Component=>Component.updateComponent());
  }
}
class Updater{
  constructor(component){
    this.component = component;
    this.pendingStates = [];
  }
  // 添加到队列
  addState(partcialState){
    this.pendingStates.push(partcialState);
    batchingStrategy.isBatchingUpdates
    ?batchingStrategy.dirtyComponents.push(this.component)
    :this.component.updateComponent()
  }
}
class Component{
  constructor(props){
    this.props = props;
    this.$updater = new Updater(this)
  }
  createDOMFromDOMString(domString){
    let div = document.createElement('div')
    div.innerHTML = domString;
    return div.children[0];    
  }
  setState(partcialState){
    this.$updater.addState(partcialState)
  }
  updateComponent(){
    this.$updater.pendingStates.forEach(partcialState=>Object.assign(this.state,partcialState))
    this.$updater.pendingStates.length = 0
    let oldElement = this.domElement
    let newElement = this.renderElement()
    oldElement.parentElement.replaceChild(newElement,oldElement)
  }
  // 把一个DOM模板字符串转成真是的DOM元素
  renderElement(){
    let htmlString = this.render()
    this.domElement = this.createDOMFromDOMString(htmlString);
    // 让这个button节点的component属性等于当前Counter组件的实例
    this.domElement.component = this
    // this.domElement.addEventListener('click',this.add.bind(this))
    return this.domElement;
  }
  mount(container){
    container.appendChild(this.renderElement());
  }
}
let transaction = new Transaction([
  {
    initialize(){
      batchingStrategy.isBatchingUpdates = true
    },
    close(){
      batchingStrategy.isBatchingUpdates = false
      batchingStrategy.batchedUpdates()//批量更新,把所有的脏组件根据自己的状态和属性重新渲染
    }
  }
])
// 事件委托处理所有的事件
window.trigger = function(event,method){
  // console.log(event.target.component[method])
  let component =  event.target.component
  transaction.perform(component[method].bind(component))
}
class Counter extends Component{
  constructor(props){
    super(props);
    this.state = {number:0}
  }
  add(){
    this.setState({number:this.state.number+1})
    console.log(this.state)
    this.setState({number:this.state.number+1})
    console.log(this.state)
    setTimeout(() => {
      this.setState({number:this.state.number+1})
      console.log(this.state)
      this.setState({number:this.state.number+1})
      console.log(this.state)
    });
  }
  a(){
    return '111'
  }
  
  render(){
    return (`
      <button onClick="trigger(event,'add')">${this.props.name}:${this.state.number}</button>
      `)
  }
}
```
### 事务
- 一个所谓的 Transaction 就是讲需要执行的 method 使用 wrapper 封装取来 在通过 Transaction 提供 perform 方法执行
- 而在 perform 之前 执行所有wrapper中的initialize 方法;perform完成之后(即 method 执行后)在执行所有的close方法
- 一组 initialize 及close方法称为一个 wrapper 
```js
// 事务
function setState(){
  console.log('setState')
}
class Transaction{
  constructor(wrappers){
    this.wrappers = wrappers
  }
  perform(anyMethod){
    this.wrappers.forEach(wrapper=>wrapper.initialize())
    anyMethod.call()
    this.wrappers.forEach(wrapper=>wrapper.close())
  }
}
let transaction = new Transaction([{
  initialize(){
    console.log('initialize1')
  },
  close(){
    console.log('close1')
  }
},{
  initialize(){
    console.log('initialize2')
  },
  close(){
    console.log('close2')
  }
}])
transaction.perform(setState)
```
## createContext
- `Context API` Context提供了一种在组件之间共享值的方式,而不必显式地通过组件树逐层传递props
- 用法 他提供了2个api 一个`Context.Provider` 一个`Context.Consumer` 父级传递给子级 反过来不行,但是父级可以给子级传递一个回调函数(来实现 子级修改父级的state)
```js
let Context = React.createContext();
// 父组件
  class Parent extends React.component{
    render(){
      return <Context.Provider value={xxx}><Children/></Context.Provider>
    }
  }
  // 子组件 类组件
  class Children extends React.Component{
    // 给类增加一个静态属性 然后就可以通过this.context获取到上面传递过来的值
    static contextType = Context // 他会往this.context 上挂载属性(value:xxx)
    constructor(props,context){
      super(props)
      this.rs = context
      console.log('这里的 context 和 this.context 是一样的')
    }
    render(){
      console.log(this.rs === this.context)// 他们是相等的 
      return (
        <div>{this.context.value}</div>
      )
    }
  }
  // 子组件 函数
  function Children(){
    return(
      <Context.Consumer>
          {
            value=>{
              // value 就是父组件传递过来的数据
            }
          }
        </Context.Consumer>
    )
  }
```
- 原理
```js
function createContext(){
  class Provider extends React.Component{
    static value;//给Provider提供一个静态属性
    constructor(props){
      super(props)
      Provider.value = props.value
      this.state = {value:props.value};
    }
    static getDerivedStateFromProps(nextProps,nextState){
      Provider.value = nextProps.value
      return {value:nextProps.value}
    }
    render(){
      return this.props.children
    }
  }
  class Consumer extends React.Component{
    render(){
      return this.props.children(Provider.value)
    }
  }
  return{
    Provider,
    Consumer
  }
}
```


## 高阶组件
- 高阶组件 一般需要一个函数 传入一个老组件 返回一个新的组件
- 高阶函数  函数可以作为方法的参数或返回值
```js
import React,{Component} from 'react';
// 高阶组件 一般需要一个函数 传入一个老组件 返回一个新的组件
function withLogger(OldComponent){
  // 匿名类
  return class extends React.Component{
    constructor(props){
      super(props)
      this.start = Date.now();//在组件将要挂载的时候记录一个当前的时间
    }
    componentDidMount(){
      console.log(`本次渲染一共话费了 ${Date.now()-this.start} ms`)
    }
    render(){
      return (<OldComponent {...this.props}>
      </OldComponent>)
    }
  }
}
class Counter extends Component{
  render(){
    return(
      <div>
        <p>{this.props.number}</p>
      </div>
    )
  }
}
const CounterWithLogger = withLogger(Counter)
export default CounterWithLogger
```
## 请求模拟数据
- 在public 内写的文件 可以直接通过localhost:3000/文件名获取

## render/children
- this.props.render(render默认的 写什么名字都可以) 用在标签属性中
- this.props.children 用在标签内
- render
```js
class A extends React.Component{
  render(){
    return(
      // render 默认写法 也可以用别的字母代替
      <MouseTracker render={
        props=>(
          <>
            <h1>请移动鼠标</h1>
            <p>当前鼠标的位子 x={props.x},y={props.y}</p>
          </>
        )
      }>       
      </MouseTracker>
    )
  }
}
render(){
    return(
      <div style={{border:'1px solid red'}} onMouseMove={this.handleMouseMove}>
        {
          this.props.render(this.state)
        }
      </div>
    )
  }
```
- children
```js
  render(){
    return(
      <div style={{border:'1px solid red'}} onMouseMove={this.handleMouseMove}>
        {
          this.props.children(this.state)
        }
      </div>
    )
  }
class A extends React.Component{
  render(){
    return(
      <MouseTracker>
        {
          props=>(
            <>
              <h1>请移动鼠标</h1>
              <p>当前鼠标的位子 x={props.x},y={props.y}</p>
            </>
          )
        }
      </MouseTracker>
    )
  }
}
```
## lazy组件&&组件错误处理
- 使用React.lazy 延迟加载组件
- React.lazy 帮助我们按需加载组件 从而减少我们应用程序的加载时间,只加载我们所需要的组件
- React.lazy 接收一个函数,这个函数内部调用 import() 动态导入,它必须返回一个Promise 该Promise需要resolve一个default export的React组件
- 要用lazy的话 需要用 Suspense组件 在外层包裹 Suspense 有fallback属性接收一个组件  一般就是缓冲显示的 等待动画组件
- componentDidCatch组件的错误捕获 getDerivedStateFromError  获取派生的状态
```js
import React, { Suspense,lazy } from 'react';
import ReactDOM from 'react-dom';
// 
class Loading extends React.Component{
  render(){
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img src='http://img.zhufengpeixun.cn/loading.gif' />
  }
}
// 懒加载的组件,then 做了对返回的数据做了下处理
const AppTitle = lazy(()=>import(/* webpackChunkName:'title' */'../components/title').then(rs=>{
  return new Promise((resolve)=>{
    setTimeout(() => {
      resolve(rs)
    }, 3000)
  })  
}))

class App extends React.Component{
  state = {visible:false,hasError:false}
  show = ()=>{
    this.setState({visible:true});
  }
  // 获取派生的状态
  static getDerivedStateFromError(error){
    return {hasError:true} // 返回新的状态
  }
  // 能捕获错误,当前组件有err 不会影响到其他组件,若没有这个 一个组件出问题 页面就直接崩溃
  componentDidCatch(err,info){
    console.log(err,info)
  }
  render(){
    if(this.state.hasError){
      return <div>此组件显示错误</div>
    }
    return(
      <>
        {
          this.state.visible&&(
            <Suspense fallback={<Loading/>}>
              {/* 懒加载的组件  */}
              <AppTitle/>
            </Suspense>
          )}
        <button onClick={this.show}>显示</button>
      </>
    )
  }
}
class A extends React.Component{
  render(){
    return(
      <>
        <App/>
        <div>123</div>
      </>
    )
  }
}
export default A
```

## 错误边界
-  能捕获错误,当前组件有err 不会影响到其他组件,若没有这个 一个组件出问题 页面就直接崩溃
-  异步加载的时候  删除异步加载的文件 造成错误 测试
```js
  static getDerivedStateFromError(error){
    return {hasError:true} // 返回新的状态
  }
  componentDidCatch(err,info){
    console.log(err,info)
  }
  render(){
    if(this.state.hasError){
      return <div>此组件显示错误</div>
    }
    return(...)
  }
```
## 插槽(portals)
- html 页面给一个 空的dom 获取他
- ReactDom.createPortal(),第一个参数是要渲染的内容,第二个是页面的dom(容器)
```css
.modal{
  position: fixed;
  left:0;
  top:0;
  right:0;
  bottom:0;
  background: rgba(0,0,0,.5);
  display: block;
}
@keyframes zoom{
    from{transform:scale(0);}
    to{transform:scale(1);}
}
.modal .modal-content{
    width:50%;
    height:50%;
    background: white;
    border-radius: 10px;
    margin:100px auto;
    display:flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    animation: zoom .6s;
}
```
```js
// 看效果 看dom结构
import React from 'react';
import ReactDom from 'react-dom'
class Modal extends React.Component{
  constructor(){
    super()
    this.modalContainer = document.getElementById('modal-root')
  }
  render(){
    console.log('==>',this.props.children)
    return(
      ReactDom.createPortal(this.props.children,this.modalContainer)
    )
  }
}
class Page extends React.Component{
  state = {show:false}
  toggleModal = ()=>{
    this.setState({
      show:!this.state.show
    })
  }
  render(){
    return (
      <div>
        <button onClick={this.toggleModal}>显示模态窗口</button>
        {
          this.state.show&&(
            <Modal>
              <div className='modal'>
                <div className='modal-content'>
                  真正的内容
                  <button onClick={this.toggleModal}>隐藏模态窗口</button>
                </div>
              </div>
            </Modal>
          )
        }
      </div>
    )
  }
}
export default Page
```
