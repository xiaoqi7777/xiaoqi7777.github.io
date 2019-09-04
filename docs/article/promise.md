# promise && Event Loop
[[toc]]
##  Event Loop
- 事件环
  - 宏任务 setImmediate setTimeout MessageChannel
  - 微任务 promise.then
  - js执行顺序 先把栈里面的东西全部执行, 遇到异步(不管宏任务和微任务)等 等待的时间到了将他们放置 各自的队列中,等栈执行完成后,将所有的微任务执行完成(情况微任务)
  - 执行栈的时候 取第一个 放到栈中执行 然后就开始循环  这个就叫Event Loop
- 进程 
  - 计算机分配任务的最小单位
  - 进程里包含着线程
- 线程
- js是单线程(主线程是单线程)

- 堆 放对象
- 栈 存放变量 js值栈中执行的
- 队列 和 栈
  - 队列 先进先出(数组里的pop和push)
  - 栈 后进先出(数组里的unshift和shift)
  
<img :src="$withBase('/img/eventloop.png')" >

## promise实现
- promise是前端处理异步非常好的方式,先实现一个简单版本的
### 简单版
```js
function Promise(executor){
  let self = this;
  self.status = 'pending'
  self.rs = ''
  this.onResolvecb = []
  this.onRejectcb = []
  function resolve(value){
    if(self.status === 'pending'){
      self.status = 'resolved'
      self.rs = value
      self.onResolvecb.forEach(item=>{
        item(self.rs)
      })
    }
  }
  function reject(reason){
    if(self.status === 'pending'){
      self.status = 'rejected'
      self.rs = reason
      self.onRejectcb.forEach(item=>{
        item(self.rs)
      })
    }
  }
  executor(resolve,reject)
}
Promise.prototype.then = function(onFulfilled,onRejected){
  let self = this;
  if(self.status === 'resolved'){
    onFulfilled(self.rs)
  }
  if(self.status === 'rejected'){
    onRejected(self.rs)
  }
  if(self.status === 'pending'){
    self.onResolvecb.push(onFulfilled)
    self.onRejectcb.push(onRejected)
  }
}
module.exports = Promise
```
- 用法
```js
let Promise = require('./promise.js')
let p = new Promise((resolve,reject)=>{
  // setTimeout(()=>{
  //   reject('222')
  // },1000)
  // console.log('start')
  resolve('111')
})
```
- 当new的时候，会触发`executor`函数，当前默认是有三个状态`pending,resolved,rejected`。首次进来默认是`pending`,看new的时候调用的谁,分三种情况。第一个触发`resolve`，状态会变成`resolved`。第二个触发`reject`，状态会变成`rejected`.第三个是异步的时候状态保持`pending`。同步情况下调用谁，状态就会变化(状态不可逆)，获取传递进来的参数，保存到rs上面，等调用then的时候在回传rs的结果。在异步情况下先走then在执行`executor`函数。在then中状态肯定是`pending`,然后我们将当前then里面的函数全部保存起来(分onFulfilled,onRejected两种)，等待异步时间到了，执行`executor`函数，看触发`resolve`还是`reject`，不管触发谁，他们里面都会执行遍历数组执行，也是就在then时候保存的方法，这样异步也打到了回调，这样我们就实现了一个简易版的promise

### 配上链式
- 对上面代码修改 实现then的链式
```js
function Promise(executor){
  let self = this;
  self.status = 'pending'
  self.rs = ''
  this.onResolvecb = []
  this.onRejectcb = []
  function resolve(value){
    if(self.status === 'pending'){
      self.status = 'resolved'
      self.rs = value
      self.onResolvecb.forEach(item=>{
        item()
      })
    }
  }
  function reject(reason){
    if(self.status === 'pending'){
      self.status = 'rejected'
      self.rs = reason
      self.onRejectcb.forEach(item=>{
        item()
      })
    }
  }
  executor(resolve,reject)
}

Promise.prototype.then = function(onFulfilled,onRejected){
  onFulfilled = typeof onFulfilled == 'function' ? onFulfilled : function (value) {
    return value
  };
  onRejected = typeof onRejected == 'function' ? onRejected : function (value) {
    throw value
  };
  let self = this;
  let promise2 = new Promise((resolve,reject)=>{
    if(self.status === 'resolved'){
        try{
          let x = onFulfilled(self.rs)
          resolve(x)
        }catch(err){
          reject(err)
        }
    }
    if(self.status === 'rejected'){
          try{
            let x = onRejected(self.rs)
            resolve(x)
          }catch(err){
            reject(err)
          }
    }
    if(self.status === 'pending'){
      self.onResolvecb.push(function(){
        try{
          let x = onFulfilled(self.rs)
            resolve(x)
        }catch(err){
          reject(err)
        }
        
      })
      self.onRejectcb.push(function(){
        try{
          let x = onRejected(self.rs)
          resolve(x)
        }catch(err){
          reject(err)
        }
        
      })
    }
  })
  return promise2
}
module.exports = Promise
```
- 用法
```js
let Promise = require('./promise.js')
let p = new Promise((resolve,reject)=>{
  // setTimeout(()=>{
  //   reject('222')
  // },1000)
  // console.log('start')
  resolve('111')
})

let p1 =  p.then((data)=>{
  console.log('success',data)
  throw '123'
  // return '11as'
},(data)=>{
  console.log('err',data)
})
.then()
.then((data)=>{
  console.log(data)
},(err)=>{
  console.log(err)
})
```
- 首先我看 then接收的两方法，`onFulfilled`和`onRejected`。用法里面`then()`可以是空，所以我们要对他们做判断，是一个函数就返回自己，否则的话我们就返回一个函数将获取到的值丢出去，注意成功是`return`,错误用`thorw`抛出。因为是链式可以一直调用`then`，肯定涉及到了递归，所以创建一个`Promise`实例。将`onFulfilled`和`onRejected`直接的结果 传递给`resolve`值方便下一次拿用 。加入`try catch`只要有异常就走`reject`

### resolvePromise方法&&完整版
 - resolvePromise是处理 resolve返回的promise而不是基本数据类型，这里面逻辑判断稍微麻烦一点。
```js
function Promise(executor) {
  let self = this;
  self.status = 'pending'
  self.rs = ''
  this.onResolvecb = []
  this.onRejectcb = []

  function resolve(value) {
    if (self.status === 'pending') {
      self.status = 'resolved'
      self.rs = value
      self.onResolvecb.forEach(item => {
        item()
      })
    }
  }

  function reject(reason) {
    if (self.status === 'pending') {
      self.status = 'rejected'
      self.rs = reason
      self.onRejectcb.forEach(item => {
        item()
      })
    }
  }
  try{ // 处理在new的时候 报错
    executor(resolve, reject)
  }catch(err){
    reject(err)
  }
}

function resolvePromise(promise2, x, resolve, reject) {
  if (promise2 === x) {
    return reject(new TypeError('循环引用'));
  }
  let then, called;// called用来防止不规范的promise 表示当前有没有被调用 类似之前的pending
  // 判断x是一个引用类型  当前我们的promise是object  判断function是兼容别人写的promise
  if (x != null && ((typeof x == 'object' || typeof x == 'function'))) {
    try { // try 防止在取then的时候出异常  then里面 可能有getter
      then = x.then; // 这里也是防止getter 获取一次 进行处理
      if (typeof then == 'function') {
        then.call(x, function (y) { //y有可能还是一个promise 要进行递归  一直解析 直到结果是一个常量
          if (called)return; // 给别人的promise增加的逻辑 如果没调用过 就是 fasle 直接拦截掉
          called = true;
          resolvePromise(promise2, y, resolve, reject);
        }, function (r) {
          if (called)return; // 如果没调用过 就是 fasle 直接拦截掉
          called = true;
          reject(r);
        });
      } else {
        resolve(x);
      }
    } catch (e) {
      if (called)return; // 如果失败了 就不能在掉成功
      called = true;
      reject(e);
    }
  } else {
    resolve(x);
  }
}

Promise.prototype.then = function (onFulfilled, onRejected) {
  let self = this;
  // 判断是处理 值的穿透
  onFulfilled = typeof onFulfilled == 'function' ? onFulfilled : function (value) {
    return value
  };
  // throw 要在代码快里面
  onRejected = typeof onRejected == 'function' ? onRejected : function (value) {
    throw value
  };
  let promise2 = new Promise((resolve, reject) => {
    if (self.status === 'resolved') {
      setTimeout(() => { //这里的定时器 是为了拿到当前创建的promise2
        try {
          let x = onFulfilled(self.rs)
          // resolve(x)
          resolvePromise(promise2,x,resolve,reject)
        } catch (err) {
          reject(err)
        }
      })
    }
    if (self.status === 'rejected') {
      setTimeout(() => {
        try {
          let x = onRejected(self.rs)
          // resolve(x)
          resolvePromise(promise2,x,resolve,reject)
        } catch (err) {
          reject(err)
        }
      })
    }
    if (self.status === 'pending') {
      self.onResolvecb.push(function () {
        setTimeout(() => {
          try {
            let x = onFulfilled(self.rs)
            resolvePromise(promise2,x,resolve,reject)
            // resolve(x)
          } catch (err) {
            reject(err)
          }
        })

      })
      self.onRejectcb.push(function () {
        setTimeout(() => {
          try {
            let x = onRejected(self.rs)
            resolvePromise(promise2,x,resolve,reject)
            // resolve(x)
          } catch (err) {
            reject(err)
          }
        })

      })
    }
  })
  return promise2
}
Promise.prototype.catch = function (err){
  return this.then(null,err)
};

Promise.reject = function(data){
    return new Promise((resolve,reject)=>{
      reject(data)
    })
}
Promise.resolve = function(data){
  return new Promise((resolve,reject)=>{
    resolve(data)
  })
}
Promise.prototype.finally = function(cb){
  return this.then((data)=>{
    return Promise.resolve(cb()).then(()=>data)
  },(reason)=>{
    return Promise.resolce(cb()).then(()=>{
      throw data
    })
  })
}

Promise.all = function(promises){
  return new Promise((resolve,reject)=>{
    let rs = []
    let index=0;
    function processData(data){
      index++;
      rs.push(data)
      if(index==promises.length){
        resolve(rs)
      }
    }
    for(let i=0;i<promises.length;i++){
      promises[i].then(data=>{
        processData(data)
      },reject)
    }
  })
}
Promise.race = function(promises){
  return new Promise((resolve,reject)=>{
    promises.forEach(item=>{
      item.then(data=>{
        resolve(data)
      })
    })
  })
}
// 实现一个延迟对象 Promise.deferred别名用来测试的
Promise.defer = Promise.deferred = function(){
  let dfd = {}
  dfd.promise = new Promise((resolve,reject)=>{
    dfd.resolve = resolve
    dfd.reject = reject
  })
  return dfd
}
module.exports = Promise
```
- resolvePromise 只有当x是引用类型的时候 才会发生回调。第一步先处理异常情况,x.then执行返回可能报异常的时候，这时我们用`try catch`处理，出异常直接走`reject`结束。第二步为什么要多加异步 then = x.then 而不是下面直接使用x.then，为了确保出现getter 里面多次取值出问题，x.then保证了当前的值是同一份。第三步判断then类型是函数，大致可以说明是返回的是promise，否则就是基本数据类型直接出去，这里是后面发生递归的出口。执行他用call修改this执行，指向当前的x,成功的时候获取的y还有可能是promise，此时发生递归 把获取的值传递过去`resolvePromise(promise2, y, resolve, reject)`,失败的时候 直接调用`reject`。里面有一个called，是防止使用别人不规范的promise，表示当前有没有被调用 类似之前的pending
- npm install -g promises-aplus-tests 测试的包 promises-aplus-tests promise.js