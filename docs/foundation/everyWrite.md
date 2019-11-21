# everyWrite
[[toc]]

## 冒泡
```js
function fn(arr) {
    let len = arr.length
    for (let i = 0; i < len; i++) {
        for (let j = 0; j < len; j++) {
            if (arr[i] < arr[j]) {
                [arr[i], arr[j]] = [arr[j], arr[i]]
            }
        }
    }
    return arr
}
console.log(fn([5, 2, 6, 3, 2, 6, 1]))
```

## 快速
```js
function fn(arr) {
    let len = arr.length
    if (len < 2) {
        return arr
    }
    let midindex = arr.splice(Math.floor(Math.random() * len), 1)
    let right = []
    let left = []
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] < midindex) {
            left.push(arr[i])
        } else {
            right.push(arr[i])
        }
    }
    return fn(left).concat(midindex, fn(right))
}

console.log(fn([5, 2, 6, 3, 2, 6, 1]))
```

## 选择排序
```js
function fn(arr) {
    let len = arr.length
    let index = null
    for (let i = 0; i < len; i++) {
        index = i;
        for (let j = i + 1; j < len; j++) {
            if (arr[index] > arr[j]) {
                index = j
            }
        }
        [arr[index], arr[i]] = [arr[i], arr[index]]
    }
    return arr
}
console.log(fn([5, 2, 6, 3, 2, 6, 1]))
```

## 深拷贝 
```js
function clone(obj) {
    if (typeof obj != null && obj != null) return obj
    if (obj instanceof Date) return new Date(obj)
    if (obj instanceof RegExp) return new RegExp(obj)
    let newObj = new obj.constructor
    for (let i in obj) {
        newObj[i] = clone(obj(i))
    }
    return newObj
}
```
## call
```js
Function.prototype.mycall = function(context, ...args) {
    context = Object(context) ? context : window
    context.fn = this

    let rs = eval('context.fn(' + args + ')')
    // let rs = eval(`context.fn(${args})`)
    delete context.fn
}

function fn(a, b, c, d) {
    console.log(a, b, c, d)
}
fn.mycall({}, 1, 2)
```

## apply
```js
Function.prototype.myapply = function(context, args) {
    context = Object(context) ? context : window
    context.fn = this

    let rs = eval('context.fn(' + args + ')')
    // let rs = eval(`context.fn(${args})`)
    delete context.fn
}

function fn(a, b, c, d) {
    console.log(a, b, c, d)
}
fn.myapply({}, [1, 2, 3])
```
## mybind
```js
Function.prototype.mybind = function(context, ...args) {
    context = Object(context) ? context : window
    let bindArgs = args
    let that = this

    function fn() {}
    fn.prototype = this.prototype

    function fBound() {
        let fArgs = Array.prototype.slice.call(arguments)
        return that.apply(this instanceof fBound ? this : context, bindArgs.concat(fArgs))
    }
    fBound.prototype = new fn()
    return fBound
}

function fn(a, b, c, d) {
    console.log(a, b, c, d)
}
let a = fn.mybind({}, 1, 2)
a(3, 4)
```

## 数组数据打乱
```js
function fn(arr) {
    let len = arr.length
    for (let i = 0; i < len; i++) {
        let midindex = i + Math.floor(Math.random() * (len - i));
        [arr[i], arr[midindex]] = [arr[midindex], arr[i]]
    }
    return arr
}
console.log(fn([1, 2, 3, 4, 5, 6]))
```
## promise  catch reject finally all race
```js
Promise.prototype.catch = function(data) {
    return this.then(null, data)
}

Promise.reject = function(data) {
    return new Promise((resolve, reject) => reject(data))
}

Promise.prototype.finally = function(cb) {
    return this.then(data => {
        return Promise.resolve(cb()).then(() => data)
    }, err => {
        return Promise.resolve(cb()).then(() => { throw err })
    })
}

let pro = new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve('seccuss')
    }, 1000)
})

pro.then(data => {
    console.log('data1', data)
    return '12312312'
}).finally((data) => {
    console.log('1231')
}).then(data => {
    console.log('data2', data)
})

Promise.prototype.all = function(promises) {
    return new Promise((resolve, reject) => {
        let rs = null;
        let index = 0;

        function fn(arr) {
            index++;
            rs.push(arr)
            if (index == promises.length) {
                resolve(rs)
            }
        }
        for (let i = 0; i < promises.length; i++) {
            promises[i].then(data => {
                fn(data)
            }, reject)
        }
    })
}

Promise.prototype.race = function(promises) {
    return new Promise((resolve, reject) => {
        for (let i = 0; i < promises.length; i++) {
            promises[i].then(data => {
                resolve(data)
            })
        }
    })
}
```

## koa 中间件
```js
let app = {}
app.middlewares = []
app.use = function(arr) {
    app.middlewares.push(arr)
}
app.use((next) => {
    console.log('1')
    next()
    console.log('2')
})

app.use((next) => {
    console.log('3')
    next()
    console.log('4')
})

let dispatch = function(index) {
    if (index === app.middlewares.length) return () => {}
    let route = app.middlewares[index]
    route(() => dispatch(++index))
}
dispatch(0)
let rs = app.middlewares.reduce((a, b) => (...fn) => a(() => b(...fn)))
let rs = app.middlewares.reduceRight((a, b) => (...fn) => b(() => a(...fn)))
rs(() => {})
```

## map
```js
let rs = [1, 2, 3].map(item => item * 2)
console.log(rs)  
Array.prototype.mymap = function(fn) {
    return this.reduce((a, b) => {
        a.push(fn(b))
        return a
    }, [])
}
let rs = [1, 2, 3].mymap(item => item * 2)
console.log(rs)
```

## 函数柯里化
```js
function currie(...args) {
    let rs = [...args]

    function fn(...args) {
        rs.push(...args)
        return fn
    }
    fn.toString = () => rs.reduce((a, b) => a + b)
    return fn
}
let rs = currie(1)(2)(3)(4)
console.log(rs + '')
```

## 数组 交集 并集 差集
```js
let arr1 = [1, 2, 3, 1, 4]
let arr2 = [3, 4, 5, 6]

并集
let set1 = new Set([...arr1, ...arr2])
console.log(set1)

差集
arr1 = new Set(arr1)
arr2 = new Set(arr2)
let rs = [...arr1].filter(item => !arr2.has(item))
console.log(rs)

交集
arr1 = new Set(arr1)
arr2 = new Set(arr2)
let rs = [...arr1].filter(item => arr2.has(item))
console.log(rs)
```

## 路由 路径参数解析
- 请求的路径 url=`/url1/123/sg`
- 自定义的路由 reg = `url1/:id/:name`
- 得到 => {id:123,name:sg}
- exec 匹配的结果 和 分组 都放到数组内 长度就是数组长度,此外数组内还有文本下标 不记在length内
  - 所以在数组内只有 结果和 分组
```js
let url = `/url1/123/sg/12312`
let reg = `/url1/:id/:name/:l`
let data = {}
// 获取id name 放到keys中
let keys = []

function pathToRegexp(path, keys) {
  let rs = path.replace(/\:([^\/]+)/g, function() {
    keys.push(arguments[1])
    return `([^\/]+)`
  })
  return new RegExp(rs)
}
let regexp = pathToRegexp(reg, keys)
let matchRs = regexp.exec(url)
for (let i = 1; i < matchRs.length; i++) {
  let key = keys[i - 1]
  data[key] = matchRs[i]
}
console.log(data, keys)
```

## 模板字符串
- Function && with
- new Function('参数',script), 参数可以写多个，script 是一个字符串,参数对应script里面的 参数
```js
  let obj = { s: 1 }
  let script = `
  console.log(obj,a)
  `
  let fn = new Function('obj', 'a', script)

  fn(obj, 'a1' )
  // 打印 {s:1} 'a1'
```
- with
```js
let obj = { a: 1 }
with(obj) {
  console.log(a) // 1
}
```
- ejs
- 单个渲染原理
```js
let str = `hello <%=name%> world <%=age%>`;
let options = { name: 'zdpx', age: 9 }

function render(str, options) {
  return str.replace(/<%=(\w+)%>?/g, ($0, $1, $2, $3) => {
    return options[$1]
  })
}

let rs = render(str, options)
console.log(rs)
```
- ejs if/for渲染原理
- 主要用到2个语法 
  - Function构造函数可以执行字符串脚本
  - with(obj)语法 具有独立的作用域 里面的数据都可以从obj里面获取
- render函数处理，
  - head 主要是申明变量和创建with 语法
  - str 是处理的模板,将<%xxx%> 和<%=xxx%>这两种替换出来,注意顺序,先处理<%=xxx%>类型的,他主要是处理 具体值 ,<%xxx%>是将if或者for语法进行转换
  - tpl变量要将 除if 和 for以外的所有数据里连接起来,所以会有`"`;\n" + arguments[1] + "\n;tpl+=`"`,tpl是我们最终要获取的值
  - html 获取的是str用正则替换和 with语法包装后的结果
  - 最后通过Function函数将对象和html传进去 执行脚本

```js
let options = { user: { name: 'zdpx', age: 9 }, total: 5 }
let str = `
<%if(user){%>
  hello '<%=user.name%>'
<%}else{%>
  hi guest
<%}%>
<ul>
<%for(let i=0;i<total;i++){%>
  <li><%=i%></li>
<%}%>
</ul>
`

function render(str, options) {
  let head = "let tpl = ``;\n with(obj){ \n tpl+=` "
  str = str.replace(/<%=([\s\S]+?)%>/g, function() {
    return "${" + arguments[1] + "}"
  })
  str = str.replace(/<%([\s\S]+?)%>/g, function() {
    return "`;\n" + arguments[1] + "\n;tpl+=`";
  })
  let tail = "`} \n return tpl;" 
  let html = head + str + tail;
  let fn = new Function('obj', html)
  return fn(options)
}


let rs = render(str, options)
console.log(rs)

```

## 观察者模式
- 被观察者(一个)  观察者(多个) 
```js
1、被观察者提供维护观察者一系列方法 (注入观察者 提供更新数据 获取数据方法)
2、观察者提供更新接口
3、观察者把调用被观察者的注入方法自己注入到被观察者中
4、当被观察者中的数据变化 调用观察者中的更新方法

class Fan {
    constructor(name, star) {
        this.name = name;
        this.star = star
        this.star.attach(this)
    }
    update() {
        console.log(this.name + '-----------' + this.star.getState())
    }
}

class Star {
    constructor(name) {
        this.name = name
        this.state = null
        this.obervers = []
    }
    getState() {
        return this.state
    }
    setState(val) {
        this.state = val
        this.notifyAllObervers()
    }
    attach(oberver) {
        this.obervers.push(oberver)
    }
    notifyAllObervers() {
        this.obervers.forEach(oberver => {
            oberver.update()
        })
    }
}

let star = new Star('李明', 'blank')
let fan1 = new Fan('fan1', star)
let fan2 = new Fan('fan2', star)
star.setState('black')
```

## 发布订阅
```js
订阅者 发布者 调度中心
订阅者把自己想订阅的事注册到调度中

class Agent{
  constructor(){
    this._event = {}
  }
  publish(item){
    let listeners = this._event[item]
    let arg = Array.prototype.slice.call(arguments)

    listeners.forEach(item=>item(...arg))
  }
  subsribe(type,listener){
    let listeners = this._event[type]
    if(listeners){
      listeners.push(listener)
    } else{
      this._event[type] = [listener]
    }
  }
}
class Tenant{
  constructor(name){
    this.name = name
  }
  rent(agent){
    agent.subsribe('house',(area,monry)=>{
      console.log(this.name,area,monry)
    })
  }
}
class LandLord{
  constructor(name){
    this.name= name
  }
  lend(agent,area,monry){
    agent.publish('house',area,monry)
  }
}

let agent = new Agent()
let landLord = new LandLord('房东')
let tenant1 = new Tenant('张三')
let tenant2 = new Tenant('李四')
tenant1.rent(agent)
tenant2.rent(agent)

landLord.lend(agent,40,600)
```
