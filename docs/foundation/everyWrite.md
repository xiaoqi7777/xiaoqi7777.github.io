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

## 观察者模式
- 被观察者(一个)  观察者(多个) 
```js
1、被观察者提供维护观察者一系列方法
2、观察者提供更新接口
3、观察者把自己注入到被观察者中
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
```