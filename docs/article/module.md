# module
  [[toc]]
- js模块主要分前端的es6模块和node的CommonJS模块,他们两个有很大的区别,但目的是一样,都是引入文件,在大项目中起到至关重要的作用.下面我将介绍下他们的基本用法、区别以及循环加载的难点
## es6模块
### export命令
- es6模块主要由两个命令构成:export和import。export命令式用于模块的对外接口，而import命令用于输入其他模块提供的功能。可以这么理解模块，一个文件即为一个模块，外面文件想获取模块内的变量(包括函数和类)，就必须用export 导出变量。as关键字 默认情况下export输出的变量就是本来的名字 通过as 可以重命名。
- 特性：export语句输出的接口与其对应的值是动态绑定的关系，若是有定时器更改值 最后导出的值是最新(定时器修改后的值) 
- 写法
```js
// 1、
export var a = 1;
var b = 2;
export {b}
export function f(){}
// 2、
var a = 1;
var b = 2;
function f(){}
export{a,b,f}
// 3、
function fn1(){}
function fn2(){}
export {fn1 as stream1,fn2 as stream2}
```
### import命令
- 与export对应的 即是import命令,export {}导出 ,import {} from 'xx.js' 引入。export导出的内容 import都要用{}，大括号内的值要跟export导出的值对应上。同时也可以用as进行重命名。文件的名字可以是相对路径也可以是绝对路径。import 命令具有提升效果的作用，会提升到整个模块的头部首先执行，有点类似变量提升。import 语句会执行所有的模块加载，相同的只执行一次
- 写法
```js
// import命令 参考export 例子
import {a,b,f} from 'xx.js'
import {a as a1} from 'xx.js'
// import 语句,多次加载 相同的只执行一次
import 'xxx.js'
import 'xxx.js'
```
### 整体模块加载
- 上面说到import {} 里面写入每一个要加载的变量,当变量很多的时候，我们可以用*代替，*里面包含了所有导出的内容，使用的时候 需要那个直接调用他即可
- 写法
```js
// export 导出
export function fn1(){}
export function fn2(){}

// import
import { * as fn} from 'xx.js'
// fn.fn1 即 fn1 
// fn.fn2 即 fn2 
```
### export default命令
- 前面说到import {} 内需要知道所有的变量，或者用*来代替,否则无法加载。因为export是一个个导出的 所以需要import一个个加载。现在有一种叫默认导出 即export default 变量,一个模块只能有一个这样的语句。所以import 引入的时候 就不需要加{} 直接写变量名，而且变量名不需要跟exoprt 导出的进行关联。默认导出的函数有名字和没名字都一样
- 写法
```js
  var a = 1;
  export default a;
  // 默认导出 
  export default function a(){}
  // 引入
  import fn from 'xxx.js'
```
### 复合写法
- 复合写法即一个模块中既有输入也有输出
```js
import {es6} from 'xx'
export default es6
// 复合写法
export {es6} from 'xx'
```
### import()
- export 和 import 命令只能在模块的顶层，不能再代码块中(比如,if代码或者函数)。而import()就没有这个限制,import()是动态加载的，他执行后的结果返回一个promise，他再运行时执行。import()类似node里面的require方法，前者是异步而后者是同步加载。import()很合适做按需加载，也就是等需要的时候，我们再去import模块，返回的结构就是promise，若是多个按需加载的处理，就是操作promise。

## CommonJS模块 
- 基本用法，exports.变量 是单个输出 通过require获取到，类似es6的export。module.exports是整体输出 同样通过require获取，类似es6的export default。
```js
  exports.done = false // 单个输出
  module.exports = {a:1} // 整体输出

  let data = require('xxx.js')
```
### 具体两大差异
  - CommonJs 模块输出的是一个值的复制，es6模块输出的是值的引用
  - CommonJs 模块是运行时候加载，es6模块是编译时输出接口
### 相互加载问题
  - import命令加载CommonJS,module.exports等同于export default
```js
//1、整体输出
module.exports = {foo:'foo'}
import foo from 'xxx.js'
```
  - require命令加载es6模块 结果再require的default中，require存在缓存机制 es.js对foo重新赋值没有在模块外部反映出来
```js
// es.js
  let foo = {bar:'xxx'}
  export default foo
  foo == null
// cjs.js
  const  a = require('es.js')
  console.log(a.default) // {bar:'xxx'}
```
  - 循环加载，指的是a脚本执行依赖b脚本，b脚本执行依赖a脚本。
  - CommonJS模块加载原理，require命令第一次加载该脚本就会执行整个脚本，在内存中生成一个对象，对象里面有id(模块的命),exports是属性模块输出的各个接口,loaded属性是一个布尔值,表示模块的脚本是否执行完毕，还有其他的属性。要用到模块就去会exports上面取值，后面多次执行require也不会执行该模块，而是在缓存中取值。CommonJS模块无论加载多少次，都只会在第一次加载时运行一次，以后再加载就去缓存中的值,除非手动清楚缓存。
  - 一旦出现某个模块被"循环加载"，就只输出已经执行的部分，还未执行的部分不会输出,也就是说进入循环引用的时候 引入的只是已经执行过的代码.
```js
// a.js
exports.fl = false
let b = require('b.js')
console.log(`a.js ===> fl:${b.fl}`)
export.fl = true
console.log(`a.js ===> 执行完成`)

// b.js
exports.fl = false
let a = require('/a.js')
console.log(`b.js ===> fl:${a.fl}`)
export.fl = true
console.log(`b.js ===> 执行完毕`)

// index.js
let a = require('/a.js')
let b = require('/b.js')
console.log(` 代码执行完毕: a ===> fl:${a.fl}; b ===> fl:${b.fl}`);

/**
  b.js ===> fl:flase
  b.js ===> 执行完毕
  a.js ===> fl:true
  a.js ===> 执行完毕
  代表执行完毕: a ==> fl:true; b ==> fl:true
*/
```
  - ES6模块的运行机制与CommonJS不一样，它遇到模块加载命令import时，不会去执行模块，而是只生成一个引用。等到真的需要用到时，再到模块里面去取值。当es6模块循环引用的时候 如 a.js 引入 b.js，b.js 引入 a.js，由于a.js 已经开始执行了 所以不回重复执行 开始执行b.js
```js
// a.js
import {bar} from './b.js';
export function foo() {
  console.log('a.js');
  bar();  
  console.log('执行完毕');
}
foo();

// b.js
import {foo} from './a.js';
export function bar() {  
  console.log('b.js')
  if (Math.random() > 0.5) {
    foo();
  }
}
// a.js
// b.js
// 执行完毕

// 执行结果也有可能
// a.js
// b.js
// a.js
// b.js
// 执行完毕
// 执行完毕
```
- 下面的代码中，参数n从10变为0的过程中，even()一共会执行6次，所以变量counter等于6。第二次调用even()时，参数n从20变为0，even()一共会执行11次，加上前面的6次，所以变量counter等于17
```js
// even.js
import { odd } from './odd'
export var counter = 0;
export function even(n) {
  counter++;
  return n == 0 || odd(n - 1);
}
 
// odd.js
import { even } from './even';
export function odd(n) {
  return n != 0 && even(n - 1);
}


$ babel-node
> import * as m from './even.js';
> m.even(10);
true
> m.counter
6
> m.even(20)
true
> m.counter
17
```