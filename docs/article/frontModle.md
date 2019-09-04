# 发布订阅模式&&观察者模式
[[toc]]
## 观察者模式

<img :src="$withBase('/img/observe.png')" >

- 被观察者提供维护观察者的一系列方法
- 观察者提供更新接口
- 观察者把自己注册到被观察者里面
- 在被观察者发生变化的时候,调用观察者的更新方法

### 伪代码(讲述明星和粉丝的故事)

```js
// 被观察者
class Star{
  constructor(name){
    this.name = name;
    this.state = '';
    // 被观察者 内部维护一个 观察者数组
    this.observers = [];//粉丝
  }
  getState(){
    return this.state
  }
  setState(state){ 
    this.state = state;
    this.notifyAllObservers()
  }
  // 增加一个新的观察者
  attach(observer){
    this.observers.push(observer)
  }
  // 通知所有的观察者更新自己
  notifyAllObservers(){
    if(this.observers){
      this.observers.forEach(observer=>observer.update())
    }
  }
}
// 观察者
class Fan{
  constructor(name,start){
    this.name = name;
    this.start = start
    // 通过start里的方法 把自己注入到start的observers里面
    this.start.attach(this);
  }
  update(){
    console.log(`当前颜色是 => ${this.start.getState()}`);
  }
}

let star = new Star('Angular Baby')
let f1 = new Fan('张三',star)
let f2 = new Fan('李四',star)
star.setState('绿色')
```
### 场景
- promsie then的时候
  - new Pormise() 的时候 会执行里面的函数,将值保存起来。等到then的时候之前的结果返回
- vue 和 react里生命周期,只有等到运行 这儿时期的时候(触发当前生命周期) 才会去调用
- node events对象里的 on 和 emit
- mvvm 数据更新
<img :src="$withBase('/img/mvvm.png')" >
- 伪代码
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Document</title>
</head>
<body>
  <div id='app'>
  
    <input type="text" v-model="school.name">
    <div>{{school.age}}</div>
    <div>
      123
    </div>
    {{school.name}}
    <ul>
      <li>1</li>
      <li>1</li>
    </ul>
  </div>
  <script src="./MVVM.js"></script>
  <script>
    let vm = new Vue({
      el:'#app',
      data:{
        school:{
          name:'珠峰',
          age:10111
        }
      }
    })
  </script>
</body>
</html>
```
- 主要实现了数据双向绑定，简单的对v-model指令&&文本取值{{}}做了解析，代码结合上面的观察者模式理解
- new大致流程
  - 1、new Vue的时候 拿到所有的options,保存起来，$data存着所有的data值
  - 2、用Observer将$data里面的值做数据劫持
  - 3、Compiler编译代码
- Observer
  - 获取所有的data 如果是对象(传递的就是对象,做递归用)就遍历data,通过defineReactive方法给key加上getter()和setter()
  - defineReactive 主要就两步，如果是对象就走递归。否则就添加getter()和setter()
  - 每当初始化或者获取数据的时候,触发getter(),我们要往`Dep`列表里面订阅`watcher`,当前的`watcher`不好拿，但是可以通过`Dep.target`获取。`watcher`初始化的时候，触发get方法，我们将当前的this赋值给`Dep.target`上的。也就是说页面表达式只要获取值的时候，需要响应式的时候，首先`new watcher`增加一个观察者，等赋值的时候 出再出getter() ，往Dep里面订阅方法,通过`Dep.target`把当前的watcher实例push进去
  - 当页面的值更改的时候,触发setter(),触发`Dep`列表的notify(发布)。notify会循环之前订阅的所有watcher,然后调用他本身的update方法
- 这就是一个典型的 观察者模式 
  - 只要是响应式数据就创建一个`new Watcher`(观察者)
  - Dep是一个维护数据的列表(可以理解为被观察者) 只要响应式数据获取的时候(触发getter)，就会调用被观察者的addSub(watcher)，将自己传进去
  - 在被观察者数据更新的时候，就会触发setter，调用被观察者的notify方法,遍历观察者的更新方法
 
- 解剖编译大致流程
  - 通过$el获取所有的dom
  - 创建一个代码片段，将dom全部塞到 代码片段内(用appendChild,会删除原有的dom )
  - 对代码片断进行编译(核心)
  - 将编译后的代码片段添加到body中
- 核心编译(dome 主要对元素节点和文本节点处理)
  - 元素节点无非就是一堆指令，而文本节点就是{{}}
  - 编译的时候就是将指令里面的值替换成data里面定义的，文本节点同样也是。注意这里处理值的时候，之前Observer劫持会触发get方法(连接到Observer数据劫持)

```js
// 观察者(发布订阅)  
class Dep{
  constructor(){
    this.subs = [] //存放所有的watcher
  };
  // 订阅
  addSub(watcher){
    // 添加 watcher
    this.subs.push(watcher)
  }
  // 发布
  notify(){
    this.subs.forEach(watcher => watcher.update())
  } 
}

class Watcher{
  constructor(vm,expr,cb){
    this.vm = vm;
    this.expr = expr;
    this.cb = cb;
    console.log('construtor')
    // 默认存放一个老值
    this.oldValue = this.get();
  }

  get(){
    console.log('get Dep1',Dep.target)
    Dep.target = this;//先把自己放在this上
    console.log('get Dep2',Dep.target)
    // 取值 把这个观察者 和 数据关联起来,当他获取值的时候 会触发Observer里面的get
    let value = CompileUtil.getVal(this.vm,this.expr);
    Dep.target = null;
    return value
  }

  update(){
    //更新操作 数据变化后 会调用观察者的update方法
    let newVal = CompileUtil.getVal(this.vm,this.expr);
    if(newVal !== this.oldValue){
      this.cb(newVal)
    }
  }
}

class Observer{ // 实现数据劫持
  constructor(data){
    this.observer(data);
  }

  observer(data){
    // 如果是对象才观察
    if(data && typeof data == 'object'){
      //如果是对象
      for(let key in data){
        this.defineReactive(data,key,data[key]);
      }
    }
  }

  defineReactive(obj,key,value){
    this.observer(value);
    let dep = new Dep();//给每个属性 都加上一个具有发布订阅的功能
    Object.defineProperty(obj,key,{
      get(){
        console.log('Observer')
        //创建watcher时候 会去对应的内容 并且把watcher 放到全局上
        Dep.target && dep.addSub(Dep.target)
        return value;
      },
      set:(newVal) => {
        if(newVal != value){
          this.observer(newVal)
          value = newVal
          dep.notify();
        }
      }
    })
  }
}

class Compiler{
  constructor(el,vm){
    // 判断el 属性 是不是一个元素 
    this.el = this.isElementNode(el)?el:document.querySelector(el)
    this.vm = vm
    //把当前节点中的元素 获取到 放到内存中
    let fragment = this.node2fragment(this.el);
    
    //把节点中的内容进行替换

    //编译模板 用数据编译
    this.compile(fragment)

    //把内容塞到页面中
    this.el.appendChild(fragment)
  }

  isDirective(attrName){
    // startsWith() 方法用于检测字符串是否以指定的前缀开始。
    return attrName.startsWith('v-')
  }

  // 编译元素的
  compileElement(node){
    //获取元素属性
    let attributes = node.attributes;// 类数组
    // type='text' v-model='school.name'
      //name就是v-model value 就是school.name 
    [...attributes].forEach(attr => {
      let {name,value:expr} = attr;//
      //判断是不是指令
      if(this.isDirective(name)){
        let [,directive] = name.split('-');
        
        //需要调用不同的指令 来处理
        // node 当前的节点  expr是指令里面的名字  this.vm是当前传递进来的vue参数
        CompileUtil[directive](node,expr,this.vm);
      }
    })

  }
  // 编译文本的
  compileText(node){
    let content = node.textContent;
    // 判断当前文件节点中的内容是否包含 {{}} 
    if(/\{\{(.+?)\}\}/.test(content)){
      //找到所有文本
      CompileUtil['text'](node,content,this.vm);
    }
  }
  // 核心的编译方法
  compile(node){// 用来编译内存中的dom节点
    let childNodes = node.childNodes;
    [...childNodes].forEach(child=>{
      if(this.isElementNode(child)){
        // 进来的都是元素节点
        this.compileElement(child)
        // 如果是元素的话 需要把自己传递进去 在去便利子元素
        this.compile(child)
      }else{
        this.compileText(child)
      }
    })
  }

  isElementNode(node){//判断是不是文本节点
    return node.nodeType === 1
  }
  //把节点移动到内存中
  node2fragment(node){
    //创建一个文件碎片
    let fragment = document.createDocumentFragment();
    let firstChild;
    while(firstChild = node.firstChild){
      //appendChild增加一个原来的就少一个
      fragment.appendChild(firstChild)
    }
    return fragment
  }
}

CompileUtil = {
  // 根据表达式取到对应的数据
  getVal(vm,expr){//expr格式=> vm.$data  'scholl.name'
   let arr = expr.split('.')
   let rs = vm.$data
   arr.forEach(item=>{
      rs =  rs[item]
   })
   return rs
  },
  model(node,expr,vm){
    // node节点 expr是表达式 vm是当前实例
    // 给输入框赋予value属性
    let fn = this.updater['modelUpdater']

    console.log('Watcher before')
    new Watcher(vm,expr,(newVal)=>{
      // 给输入框加入一个观察着
      // 如果稍后数据更新了会触发此方法,会拿新值 给输入框赋予值
      fn(node,newVal);
    })
    console.log('Watcher after')
    
    let value = this.getVal(vm,expr)
    fn(node,value)
  },
  html(){
    //
  },
  getContentValue(vm,expr){
    //遍历表达式 将内容 重新替换成一个完整的内容 返还回去
    return expr.replace(/\{\{(.+?)\}\}/g,(...args)=>{
      return this.getVal(vm,args[1])
    })
  },
  text(node,expr,vm){
      let fn = this.updater['textUpdater']
      // expr => {{xx}}
      let content = expr.replace(/\{\{(.+?)\}\}/g,(...args)=>{
        new Watcher(vm,args[1],()=>{
          // 给表达式每{{}}都加上观察者
          fn(node,this.getContentValue(vm,expr));//返回了一个全的字符串 
        })  
        return this.getVal(vm,args[1])
      })
      fn(node,content)
  },
  updater:{
    // 把数据插入到节点中
    modelUpdater(node,value){
      node.value = value
    },
    htmlUpdater(){

    },
    //处理文本节点
    textUpdater(node,value){
      node.textContent = value
    }
  }
}

class Vue{
  constructor(options) {
    this.$el = options.el;
    this.$data = options.data;
    //这个根元素 存在 编译模板
    if(this.$el){
      
      //把数据 全部转换成 object.defineProperty来定义
      new Observer(this.$data)
      new Compiler(this.$el,this)
    }
  }
}
```

## 发布订阅

<img :src="$withBase('/img/publish.png')" >

- 订阅者把自己想订阅的事件注册到调度中心
- 当该事件触发的时候,发布者发布该事件到调度中心,由调度中心统一调度订阅者注册事件的处理代码

### 伪代码(房东和租客的故事)
```js
class Agent{
  constructor(){
    this._events = {}
  }
  // on
  subscribe(type,listener){
    let listeners = this._events[type]
    if(listeners){
      listeners.push(listener)
    }else{
      this._events[type] = [listener]
    }
  }
  // emit 
  publish(type){
    let listeners = this._events[type]
    let args = Array.prototype.slice.call(arguments,1)
    if(listeners){
      listeners.forEach(listener=>listener(...args))
    }
  }
}
// 房东
class LandLord{
  constructor(name){
    this.name = name
  }
  // 向外出租
  lend(agent,area,money){
    agent.publish('house',area,money)
  }
}
// 租客
class Tenant{
  constructor(name){
    this.name = name
  }
  rent(agent){
    agent.subscribe('house',(area,money)=>{
      console.log(`${this.name}看到中介的新房源${area},${money}`)
    })
  }
}

let agent = new Agent();
let t1 = new Tenant('张三');
let t2 = new Tenant('李四');
t1.rent (agent)
t2.rent (agent)
let landLord = new LandLord();
landLord.lend(agent,60,400)

```
### 场景


## 发布订阅&&观察者(区别)

<img :src="$withBase('/img/o_p.png')" >

- 1、角色不一样，发布订阅(3者，发布者&&订阅者&&调度中心)，观察者(2者，观察者&&被观察者)
- 2、观察者&&被观察者存在依赖，发布订阅则是解耦
- 3、调度人不同，观察者模式是由被观察者调度，发布订阅是由调度中心调度