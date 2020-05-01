# react source
[[toc]]
##  babel 编译 jsx
-  `React.createElement(....)`,第一个标签类型/或者类(函数),第二个是标签属性,之后的全都是子元素(可能是一个文本,也可能是一个react元素)
```js
// jsx 语法
let element = (
  <button id='sayHello' style={{color:'red'}} onClick={sayHello}>
    say
    <b>
      hello
    </b>
  </button>
)
// babel 会编译成：
let element = React.createElement('button',
  {id:'sayHello',style:{color:'red',backgroundColor:'green'},onClick:sayHello},
  'say',
  React.createElement('b',{},'Hello')
)
```
## 分析流程
- 最简单的代码入手
```js
import React from './react';
function sayHello(){
  alert('hello')
}
let element = React.createElement('button',
  {id:'sayHello',style:{color:'red',backgroundColor:'green'},onClick:sayHello},
  'say',
  React.createElement('b',{},'Hello')
)
React.render(element,document.getElementById('root'))
```
- React.createElement函数是用来创建element(元素的),标签作为type,第三个参数作为第二个参数的children属性,传入element
```js
class Element{
  constructor(type,props){
    this.type = type;
    this.props = props;
  }
}
function createElement(type,props={},...children){
  props.children = children||[];//children也是props的一个属性
  return new Element(type,props)
}
```
- React.render 就是用来创建unit 挂载到标签上
- createUnit 创建unit 有三种情况 文本/原生dom/函数(类),每个unit对象都有getMarkUp方法,接收reactId(react组件内识别的标签一般是0开始),他是用来返回标签
- 通过 container 挂载到页面中  触发mounted 生命周期
```js
function render(element,container){
  // unit单元就是用来负责渲染的 负责把元素转换成可以在页面上显示的HTML字符串
  let unit = createUnit(element)
  let markUp =  unit.getMarkUp('0');//用来返回HTML标记
  $(container).html(markUp);
  // 挂载完成后 触发mounted
  $(document).trigger('mounted')
}

function createUnit(element) {
  if (typeof element === 'string' || typeof element === 'number') {
    return new TextUnit(element)
  }
  //  element.type === 'string' 处理原生的dom 防止类组件或者函数组件
  if (element instanceof Element && typeof element.type === 'string') {
    return new NativeUnit(element)
  }
  // 类最终转成函数
  if (element instanceof Element && typeof element.type === 'function') {
    return new CompositeUnit(element)
  }
}
```
## 创建三类unit
### 文本标签
- Unit是父组件 这三类元素都要继承他,getMarkUp是每个字元素必须实现的,他是创建元素的共有方法
- 凡是 字符串或者数字 在react创建都会用span包裹 在返回出去
```js
class Unit {
  constructor(element) {
    // 凡是挂载到私有属性的都是_开头
    this._currentElement = element
  }
  getMarkUp() {
    throw Error('此方法不能被调用');
  }
}
// _currentElement 就是代表当前传入的element
class TextUnit extends Unit {
  getMarkUp(reactid) {
    this._reactid = reactid
    return `<span data-reactId="${reactid}">${this._currentElement}</span>`
  }
}
```
### 原生dom
- NativeUnit的getMarkUp的功能 将element对象 组装成一个真实的标签元素
- `tagStart` 为标签元素的开始(注意这里没有结束标签),循环element的props,将styles和className以及其他的标签属性 组装到`tagStart`后面,同时利用事件冒泡将所有的事件绑定到document上
- `childString` 里面存放的所有的子元素,子元素内可能还有别的标签,`createUnit(child)`进行递归处理
-  最后返回`tagStart + '>' + childString + tagEnd` 则NativeUnit基本完成
```js
/*
  获取的element:
    {type:'button',props:{id:'sayHello'},children:['say',{type:'b',{},'hello'}]}
  NativeUnit的getMarkUp返回的:
  <button id='sayHello' style="color:red" onClick="sayHello()">
    <span>say</span>
    <b>Hello</b>
  </button>
*/
class NativeUnit extends Unit {
  getMarkUp(reactid) {
    this._reactid = reactid
    let { type, props } = this._currentElement
    let tagStart = `<${type} data-reactid="${this._reactid}"`;
    let childString = '';
    let tagEnd = `</${type}>`
    this._renderedChildrenUnits = []
    // {id:'sayHello',style={color:red} onClick="sayHello()"}
    for (let propName in props) {
      if (/^on[A-z]/.test(propName)) {// 这说明要绑定事件了
        let eventName = propName.slice(2).toLocaleLowerCase();
        // 事件委托
        $(document).delegate(`[data-reactid="${this._reactid}"]`, `${eventName}.${this._reactid}`, props[propName])
      } else if (propName === 'style') {// 如果是一个样式对象
        let styleObj = props[propName];
        let styles = Object.entries(styleObj).map(([attr, value]) => {
          attr = attr.replace(/[A-Z]/g, m => `-${m.toLocaleLowerCase()}`)
          return `${attr}:${value}`;
        }).join(';')
        tagStart += (`style="${styles}"`)
      } else if (propName === 'className') {// 如果是一个样式对象
        tagStart += (`class="${props[propName]}"`)
      } else if (propName === 'children') {
        let children = props[propName]
        children.map((child, index) => {
          let childUnit = createUnit(child);// 可能是一个字符串 也可能是一个react元素  
          childUnit._mountIndex = index;//每个unit有一个_mountIndex 属性 指向自己在父节点中的索引位子
          // 将子元素的unit保存起来
          this._renderedChildrenUnits.push(childUnit)
          let childMarkUp = childUnit.getMarkUp(`${this._reactid}.${index}`);
          childString += childMarkUp;
        })
      } else {
        tagStart += (` ${propName}=${props[propName]} `)
      }
    }
    return tagStart + '>' + childString + tagEnd;
  }
}
```

### 函数(类)
- getMarkUp在处理函数的时候 首先将他new 获取到实例,如果是类的情况下 此时`constructor`函数就执行,接着执行`componentWillMount`,获取render返回的内容,同样用递归的方式,用createUnit函数进行递归处理,调取实例的getMarkUp方法返回。在里面要绑定`mounted`生命周期,因为这里能获取到当前class的实例,在挂载完成后触发这个事件
```js
class CompositeUnit extends Unit {
  getMarkUp(reactid) {
    this._reactid = reactid
    let { type: Component, props } = this._currentElement
    let componentInstance = this._componentInstance = new Component(props)
    // 让组件的实例的currentUnit的属性等于当前的unit
    this._componentInstance._currentUnit = this;
    // 生命周期 如果有的话就让他执行
    componentInstance.componentWillMount && componentInstance.componentWillMount()
    // 调用组件的render方法 获得要渲染的元素
    let renderedElement = this._renderedElement = componentInstance.render();
    // 得到这个元素对应的unit
    let renderedUnitInstance = this._renderedUnitInstance = createUnit(renderedElement)
    // 通过unit可以获取它的html 标记markup
    let renderedMarkUp = renderedUnitInstance.getMarkUp(this._reactid);
    // 在这个时候绑定一个事件 等待挂载完成后出发 mounted事件 
    $(document).on('mounted', () => {
      componentInstance.componentDidMount && componentInstance.componentDidMount()
    })
    return renderedMarkUp
  }
}
```

## update 更新
- 类`class Counter extends React.Component`中的Component主要提供了一个`setState`方法,this._currentUnit.update调用的是当前类的update函数进行更新
```js
class Component{
  constructor(props){
    this.props = props
  }
  setState(partialState){
  // 第一个参数是新的元素 第二个参数是新的状态
    this._currentUnit.update(null,partialState)
  }
}
```
- setState&&组件更新 更新过程
  - setState实际是触发 CompositeUnit类的 update方法,传入setState要变更的状态,通过CompositeUnit类的update函数,把之前的状态和传递的状态进行合并`this._componentInstance.state = Object.assign(this._componentInstance.state,partialState)`，在新老元素进行比较的时候更新state的变化
  - `shouldDeepCompare(preRenderedElement,nextRenderElement)`新老元素进行比较，这里比较的主要是标签类型,当类型相同的时候,调用上一个渲染单元的update(传入当前更新的组件),若组件的标签不相同的时候 直接砍掉 重新创建unit
  - 文本/类/原生dom 都有update更新
    - TextUnit 比较简单 直接通过reactid 找到对应的文本 替换文本内容
    - CompositeUnit 进来就是递归,标签名相同就再次update,若不同就砍掉重新创建
    - NativeUnit 则就是核心,分两步比较 第一步是标签属性的比较,第二步是元素之间的比较(也就是DOMDiff)
```js
class Counter extends React.Component{
  constructor(props){
    super(props);
    this.state = {number:0}
  }
  componentWillMount(){
    console.log('Counter componentWillMount')
  }
  componentDidMount(){
    // console.log('Counter componentDidMount')
  }
  shouldComponentUpdate(nextProps,nextState){
    return true
  }
  componentDidUpdate(){
    // console.log('Counter componentDidUpdate')
  }
  handleClick = ()=>{
    this.setState({number:this.state.number+1})
  }
  render(){
    let p = React.createElement('P',{},this.state.number)
    let button = React.createElement('button',{onClick:this.handleClick},'+')
    return React.createElement('div',{style:{color:this.state.number%2===0?"red":"green",background:this.state.number%2===0?"green":"red"}},p,button)
  }
}
let element1 = React.createElement(Counter,{name:'计数器'})
React.render(element1,document.getElementById('root'))

// CompositeUnit 的 update
 update(nextElement,partialState){
    // 先获取到新元素
    this._currentElement = nextElement
    // 获取新的状态,不管要不要更新组件,组件的状态一定要修改
    // 前面操作的setState 在这个地方进行了处理 下面调用render的时候 就是最新的state
    let nextState = this._componentInstance.state = Object.assign(this._componentInstance.state,partialState);
    // 新的属性对象
    let nextProps = this._currentElement
    if(this._componentInstance.shouldComponentUpdate && !this._componentInstance.shouldComponentUpdate(nextProps,nextState)){
      return;
    }
    // 下面要进行比较更新  先得到上次渲染的单元
    let preRenderedUnitInstance = this._renderedUnitInstance

    // 得到上次渲染的元素
    let preRenderedElement  = preRenderedUnitInstance._currentElement
    // 更新后的元素
    let nextRenderElement = this._componentInstance.render();
    // 如果新旧两个元素类型一样,则可以进行深度比较,如果不一样,直接干掉老的元素，新建新的
    if(shouldDeepCompare(preRenderedElement,nextRenderElement)){
      // 如果可以进行深比较,则把更新的工作交给上次渲染出来的那个element元素对应的unit来处理
      // preRenderedUnitInstance 这是老的unit
      preRenderedUnitInstance.update(nextRenderElement)
      // 更新完成
      this._componentInstance.componentDidUpdate&&this._componentInstance.componentDidUpdate()
    }else{
      this._renderedUnitInstance = createUnit(nextRenderElement);
      let nextMarkUp = this._renderedUnitInstance.getMarkUp(this._reactid)
      $(`[data-reactid]="${this._reactid}"`).replaceWith(nextMarkUp)
    }
  }

// TextUnit 的 update
  update(nextElement){
    if(this._currentElement !== nextElement){
      this._currentElement = nextElement
      $(`[data-reactid="${this._reactid}"]`).html(this._currentElement)
    }
  }
// NativeUnit 的 update
  update(nextElement){
    // console.log(nextElement)
    let oldProps = this._currentElement.props;
    let newProps = nextElement.props
    // 比较新老属性  在原来的基础上对属性进行增删
    this.updateDOMProperties(oldProps,newProps)
    // this.updateDOMChildren(nextElement.props.children);
  }
```

## DOMDiff
- DOMDiff 发生在 原生dom 中
- 当两个相同标签 做比较的时候 就进入到NativeUnit.update中
  - updateDOMProperties 是属性的属性替换和事件的解绑，不处理元素的 children
  - updateDOMChildren 就是对元素的children进行比较,
- diff  
  - 1、接收2个参数 第一个`diffQueue`用来收集补丁,第二个则是更新后的元素
  - 2、`this._renderedChildrenUnits`存放的所有子元素,是NativeUnit组件在创建unit时候,遍历收集获取到的
  - 3、处理老元素,所有的children包装映射成{reactid:children}的格式
  - 4、处理新元素,`getNewChildren`函数遍历新childrenElements, 用key查找oldElements对应的元素 有的话就进行shouldDeepCompare深度比较,调用老元素.update进行递归更新,没有的话就创建新的元素,返回 新的children包装映射成{reactid:children}的格式和所有的新children
  - 5、开始比较(diff),遍历新的所有新children,用key在老的children查找对应的元素比较
    - 1、如果新老一样(一样的话他们是同一个引用地址)就生成一个`diffQueue`补丁项
      - diffQueue数组  字段`fromIndex`为老的索引值这个值在remove操作和获取老元素时候用到的，字段`toIndex`是指重新排列的新元素位子，主要是插入元素
    - 2、当新老不一样的时候 就删除老children(打补丁操作),`diffQueue`添加一个新的节点(打补丁操作),最后删除新children中 不保存老children的元素
    - 3、lastIndex作用挪动元素，遍历新元素,当新老元素相等的时候,lastIndex定位到老元素的最后一个,老元素相等的时候小于lastIndex,就说明要换位子 添加到`diffQueue`中
  ```js
  // 补丁项
  diffQueue.push({
    parentId: this._reactid,
    parentNode: $(`[data-reactid="${this._reactid}"]`),
    type: types.MOVE,
    fromIndex: oldChildUnit._mountIndex,//_mountIndex 代表老元素之前的索引位子
    toIndex: i
  })
  ```

```js
// NativeUnit
  update(nextElement){
    let oldProps = this._currentElement.props;
    let newProps = nextElement.props
    // 比较新老属性  在原来的基础上对属性进行增删
    this.updateDOMProperties(oldProps,newProps)
    this.updateDOMChildren(nextElement.props.children);
  }

  updateDOMProperties(oldProps,newProps){
    let propName;
    //循环老的属性集合
    for(propName in oldProps){
      // 新的属性里面没有
      if(!newProps.hasOwnProperty(propName)){
        $(`[data-reactid="${this._reactid}"]`).removeAttr(propName)
      }
      if(/^on[A-Z]/.test(propName)){
        $(document).undelegate(`.${this._reactid}`)
      }
    }
    for(propName in newProps){
      if(propName === 'children'){//如果是儿子属性 先不处理
        continue;
      }else if(/on[A-Z]/.test(propName)){
        // 事件处理
        let eventName = propName.slice(2).toLocaleLowerCase();
        $(document).delegate(`[data-reactid="${this._reactid}"]`, `${eventName}.${this._reactid}`, newProps[propName])
      }else if(propName === 'className'){
        // $(`[data-reactid="${this._reactid}"]`)[0].className = newProps[propName]
        $(`[data-reactid]="${this._reactid}"`).attr('class',newProps[propName])
      }else if(propName === 'style'){
        let styleObj = newProps[propName];
        Object.entries(styleObj).map(([attr, value]) => {
          $(`[data-reactid="${this._reactid}"]`).css(attr,value);
        })
      }else{
        // 上面是特殊属性  这里是修改普通的属性
        $(`[data-reactid="${this._reactid}"]`).prop(propName,newProps[propName])
      }
    }
  }
   diff(diffQueue, newChildrenElements) {
    // 第一步生成一个map, key=老的uint
    let oldChildrenUnitMap = this.getOldChildrenMap(this._renderedChildrenUnits)
    // 第二步生成一个新的儿子unit数组
    let { newChildrenUnitMap, newChildrenUnits } = this.getNewChildren(oldChildrenUnitMap, newChildrenElements)
    let lastIndex = 0;//上一个已经确定位子的索引
    for (let i = 0; i < newChildrenUnits.length; i++) {
      let newUnit = newChildrenUnits[i];
      // 第一个拿到的就是 newKey=A
      let newKey = (newUnit._currentElement.props && newUnit._currentElement.props.key) || i.toString()
      let oldChildUnit = oldChildrenUnitMap[newKey];
      if (oldChildUnit === newUnit) {// 如果说新老一致的话 说明复用了老节点
        if (oldChildUnit._mountIndex < lastIndex) {
          diffQueue.push({
            parentId: this._reactid,
            parentNode: $(`[data-reactid="${this._reactid}"]`),
            type: types.MOVE,
            fromIndex: oldChildUnit._mountIndex,
            toIndex: i
          })
        }
        lastIndex = Math.max(lastIndex, oldChildUnit._mountIndex)
      } else {
        // 当标签不一样的时候 没有复用 要删除原有的 
        if (oldChildUnit) {
          diffQueue.push({
            parentId: this._reactid,
            parentNode: $(`[data-reactid="${this._reactid}"]`),
            type: types.REMOVE,
            fromIndex: oldChildUnit._mountIndex,
          });
          // 如果要删除掉某一个节点 则要把它对应的unit也要删除掉
          this._renderedChildrenUnits = this._renderedChildrenUnits.filter(item => item !== oldChildUnit)
          $(document).undelegate(`.${oldChildUnit._reactid}`)
        }
        // 新的节点 就去创建
        diffQueue.push({
          parentId: this._reactid,
          parentNode: $(`[data-reactid="${this._reactid}"]`),
          type: types.INSERT,
          toIndex: i,
          markUp: newUnit.getMarkUp(`${this._reactid}.${i}`)
        })
      }
      // newUnit oldChildUnit 是同一个对象,newChildrenUnits 获取key和old元素进行比较,每次比较后 newUnit._mountIndex 应该往后挪动一个位子 
      // 所以 newUnit._mountIndex = i
      newUnit._mountIndex = i;
    }
    for (let oldKey in oldChildrenUnitMap) {
      let oldChild = oldChildrenUnitMap[oldKey]
      if (!newChildrenUnitMap.hasOwnProperty(oldKey)) {
        diffQueue.push({
          parentId: this._reactid,
          parentNode: $(`[data-reactid="${this._reactid}"]`),
          type: types.REMOVE,
          fromIndex: oldChild._mountIndex
        })
        // 如果要删除掉某一个节点 则要把它对应的unit也要删除掉
        this._renderedChildrenUnits = this._renderedChildrenUnits.filter(item => item !== oldChild)
        // 还要把这个节点对应的事件委托也要删除掉
        $(document).undelegate(`.${oldChild._reactid}`)
      }
    }
  }
```
### patch
- 开始打补丁
  - 补丁的主要是对`diffQueue`的type,进行增删移
  - 1、首选把所有type 值为`MOVE`和`REMOVE`元素进行删除
  - 2、type 值为`MOVE`和`INSERT`元素进行删除,toIndex为插入节点的索引值
```js
patch(diffQueue){
    let deleteChildren = []; // 这里要放着所有将要删除的节点
    let deleteMap = {}; //这里暂存能复用的节点
      // 删除
    for(let i=0;i<diffQueue.length;i++){
      let difference = diffQueue[i];
      if(difference.type === types.MOVE || difference.type === types.REMOVE){
        let fromIndex = difference.fromIndex;
        let oldChild = $(difference.parentNode.children().get(fromIndex))
        if(!deleteMap[difference.parentId]){
          deleteMap[difference.parentId] = {}
        }
        deleteMap[difference.parentId][fromIndex] = oldChild;
        deleteChildren.push(oldChild);
      }
    } 
    // 删除所有不需要的节点  old元素里面不需要的节点被删除了 页面上可以显示出来了
    $.each(deleteChildren,(idx,item)=>$(item).remove());

    // 插入
    for(let i=0;i<diffQueue.length;i++){
      let difference = diffQueue[i]
        switch(difference.type){
          case types.INSERT:
            this.insertChildAt(difference.parentNode,difference.toIndex,$(difference.markUp));  
          break;
          case types.MOVE:
            this.insertChildAt(difference.parentNode,difference.toIndex,deleteMap[difference.parentId][difference.fromIndex]);
          break;
          default:
          break; 
        }
    }
  } 
  insertChildAt(parentNode,index,newNode){
    let oldChild = parentNode.children().get(index);
    // index 是原来老的元素 要插入的位子 已经订好了  现在直接插入 如果这位子有元素就insertBefore(向前插入),没有的话就直接添加一个
    oldChild?newNode.insertBefore(oldChild):newNode.appendTo(parentNode)
  }
```