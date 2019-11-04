# js
[[toc]]
## es5基础 
### typeof 运算符
```js
typeof undefined //undefined
typeof 'abc' // string
typeof 123 // number
typeof true // boolean
typeof {} // object
typeof [] // object
typeof null // object
typeof console.log // function
typeof Symbol() // symbol

```
### [类型转换](https://blog.csdn.net/x_jagger/article/details/73430959)
- toString()
  - 每个对象都有一个 toString() 方法，当对象被表示为文本值时或者当以期望字符串的方式引用对象时，该方法被自动调用。
  - x.toString() => [object type]  其中type是对象类型
  - 可以自己定义一个对象的toString()方法来覆盖它原来的方法。这个方法不能含有参数，方法里必须return一个值。
  - Object.prototype.toString.call(obj) 判断类型
- valueOf()
  - 每一个内置对象都会覆盖这个方法为了返回一个合理的值，如果对象没有原始值，valueOf() 就会返回对象自身
  - 同样可以自己定义改写valueOf()
- toString和valueOf 何时被调用
  -  一般来说，对象到字符串的转换经过了如下步骤：
    - 1.如果对象具有toString()方法，则调用这个方法。如果它返回一个原始值，js将这个值转换成字符串，并返还这个字符串结果。
    - 2.如果对象没有toString()方法，或者这个方法并不返回一个原始值，那么js将调用valueOf()方法。
    - 3.否则，js无法从toString()或者valueOf()获得一个原始值，因此这时它将抛出一个类型错误异常。
  - 一般来说，对象到数字的转换过程中，js做了同样类似的事情，但这里它会首先尝试使用valueOf()方法：
    - 1.如果对象具有valueOf()方法，后者返回一个原始值，则js将这个原始值转换成数字，并返回这个数字。
    - 2.否则，如果对象具有toString()方法，后者返回一个原始值，则js将转换并返回。
    - 3.否则，js抛出一个类型错误异常。
- 几个例子
```js
  []+[]  ''
  {}+{}  [object Object][object Object] -> 看成2个字符串相加
  {}+[]  0 -> {}被看成es6一个块级作用域 最后变成 +[] 转换为数值 即为0
  []+{}  [object Object] -> [] 经过valueOf() 变成 [] 在经过 toString() 变成''(空)  {} 同理 最后变成 [object Object]
   +{}    NaN  + 强制转换成数值
   +[]    0  + 强制转换成数值
   -[]    -0 - 强制转换成数值
   //特例   alert , [x].join(“”) 均调用toString() ,如果强制改写内置方法 返回的不是一个原始值 就报错
   // 注意  
   // "-"减号运算符把两个操作数都转换成数字  
   // "+"两边其中一个是对象 "+"运算符将对象转换成原始值  "==" ">" "<" 一样

   // http://www.codes51.com/article/detail_388155_3.html
   // {}+[] ：根据语句优先原则  {}被理解为复合语句块，因此相当于 {}; +[]   。[]为空，结果为0

   // console.log({}+[]) : js把()中的语句当做一个表达式，因此{}不能被理解为语句块，而被理解为对象直接量,因此结果为对象

   // 其实 console.log({}+[])和[]+{}的结果相同，原理相同，{}作为右值出现被理解为对象直接量
```
### == 和 ===

```js
// 只有这中情况用双等 其他都是 ===
if(obj.a == null){
  // 这里相当于 obj.a === null || obj.a ===  undefined, 简写形式
  // 这里 jquery 源码中推荐的写法
}
```

### JS中有哪些内置函数(仅js语言)
```js
Object
Array
Boolean
Number
String
Function
Date
RegExp
Error
```
### js按存储方式区分变量类型
- 值类型
  - var a = 10
  - 特点 他会把值放到自己的内存空间中(栈内) 
- 引用类型
  - var obj = {}
  - 特点 {} 存放到堆内 有一个引用地址 放在栈内 赋值给了obj

### JSON
- JSON 是一个js对象
  - JSON.stringify({a:10,b:20})   把对象变成字符串
  - JSON.parse('{"a":10,"b":20}') 把字符串变成对象

### 继承
- 借助原型链和构造函数
```js
child.prototype = Object.create(parent.prototype)
child.prototype.constructor = child
```

### 原型和原型链
- 构造函数拓展
```js
var a = {} //其实是 var a = new Object()的语法糖
var a = [] //其实是 var a = new Array()的语法糖
funciton Foo(){} // 其实就是 var Foo = new Function(..)
```
- instanceof 判断一个函数是否是一个变量的构造函数
  - 原理:实例对象的__proto__与构造函数 prototype 引用相同地址
  - 实例对象的__proto__在原型链上隔几次的构造函数 prototype 相等 
  - 即  实例对象 instanceof Object(true)
  - 判断一个变量是否是'数组' 
    - 变量 instanceof Array
    - typeOf 是无法判断数组和对象的 结果都是object
- constructor
  - 判断一个实例对象是不是构造函数直接生成的
    - O3 = new M()
    - O3.__proto__ = M.prototype
    - O3.__proto__.constructor = M => true
    - O3.__proto__.constructor = Object => false
- hasOwnProperty
  - 用来判断某个对象是否含有指定的属性
  - obj.hasOwnProperty(prop)
- 原型规则和示例
  - 1、所有引用类型(对象,数组,函数)都具有对象的特征,即可自由拓展属性(null除外)
  - 2、所有引用类型有一个 __proto__ 属性 属性值是一个普通的对象
  - 3、所有的函数都有一个 prototype 属性 属性值是一个普通的对象
  - 4、所有的引用类型的 __proto__ 指定构造函数的 prototype
  - 5、当试图得到一个对象的某个属性值时,先去对象本身找,没有就会去 __proto__ 找(即它的构造函数的prototype)中去找
- 循环对象自身的属性
```js
var item;
for (item in f){
  if(f.hasOwnProperty(item)){
    console.log(item)
  }
}
```
### new 的过程
- 1、创建一个新的对象,并关联构造函数的原型
- 2、执行构造函数,将this指向这个新的对象
- 3、判断执行完的结果是对象 即返回 否则返回新对象

- new一个函数 和执行一个函数 返回同一个的对象
  - 在构造函数 给一个返回对象
```js
function Fn(){
  let xx = {name:'1'}
  return xx
}
let r1 = Fn()
let r2 = new Fn()
r1 === r2
```

### 构造函数的2种用法&&setProtorypeOf 
- 修改对象原型的属性，Object.setPrototypeOf(Object,proto)
- Object.prototype 指向 proto 对象
```js
function Fn(){
  this.name = 'sg'
}
let proto = {
  url :'xxxxxxxxx'
}
Fn.prototype.address = '北京'
let one = new Fn()
let two = new Fn()
Object.setPrototypeOf(one,proto)
console.log(one.address) // undefined
console.log(one.url)  // xxxxxxxxx
console.log(two.address) // 北京
```
- 构造函数 2种用法
```js
function Fn(){
  function route(){}
  Object.setPrototypeOf(route,proto)
  return route
}
let proto = Object.create()
proto.a1 = ()=>'a1'
proto.a2 = 'a2'

// 用法一
let rs = new Fn()
console.log(rs.a1())
console.log(rs.a2)
// 用法二
console.log(Fn().a1())
console.log(Fn().a2)
```

### this
- this要在执行时才能确认值,定义时无法确认
```js
var a = {
  name:'A',
  fn:function(){
    console.log(this.name)
  }
}
a.fn() // this === a
a.fn.call({name:'B'}) // this === {name:'B'}
fn1() // this === window
```
### call apply bind
- call(this,a1,a2)    直接执行
- apply(this,[a1,a2]) 直接执行
- bind(this,a1,a2)  只返回函数不执行  函数和call一样
```js
function fn(name,age){

}
// call 参数是字符串
fn.call({x:100},'zhangsan',20)
// apply 参数是数组
fn.apply({x:100},['zhangsan',20])
```
- 原理
```js
Function.prototype.myCall = function(context,...args){
  context = context ? Object(context) : window;
  context.fn = this;
  if(!args){ 
    return context.fn()
  }
  // 利用toString 的特性
  let r = eval('context.fn('+args+')')
  delete context.fn;  
  return r
}
Function.prototype.myApply = function(context,args){
  context = context ? Object(context) : window;
  context.fn = this;
  if(!args){
    return context.fn()
  }
  let r = eval('context.fn('+args+')')
  delete context.fn;  
  return r
}

//  1、bind 方法可以绑定this指向
//  2、bind 方法返回一个绑定后的函数(高级函数)
//  3、如果绑定的函数被new了 当前函数的this就是当前的实例
Function.prototype.myBind = function(context){
  let that = this;
  let bindArgs = Array.prototype.slice.call(arguments,1)
  function Fn(){} 
  function fBound(){
    let args = Array.prototype.slice.call(arguments);
    // fBound被new 那么this就是this  否则就是context
    return that.apply(this instanceof fBound ? this: context,bindArgs.concat(args)) 
  }
  Fn.prototype = this.prototype;
  fBound.prototype = new Fn()
  return fBound
}
```
<!-- -------- -->
var fn1 = function(name,age){

}.bind({y:300})
fn1('zhangsan',20)

### 闭包
- 闭包形成的环境:
  - 函数嵌套函数
  - 子函数访问父函数
- 闭包的作用
  - 让函数内的局部变量与局部函数,在外面可以访问到延长局部变量的生命周期
- 闭包里面的this指向当前 Window 

### 题目
- 创建10个a标签 点击的时候 弹出来对应的序号
```js
var i
for (i=0;i<10;i++){
  (function (i){
    var a = document.createElement('a')
    a.innerHTML = i + '<br>'
    a.addEventListener('click',(e)=>{
      e.preventDefault()
      alert(i)
    }) 
    document.body.appendChild(a)
  })(i)
}
```

- 闭包场景

```js
function isFirstLoad(){
  var _list =[]
  return function(id){
    if(_list.indexOf(id) >= 0) {
      return false
    } else {
      _list.push(id)
      return true
    }
  }
}
// 使用
var firstLoad = isFirstLoad()
firstLoad(10) // true
firstLoad(10) // false
firstLoad(20) // true
```

### 日期
```js
Date.now() //获取当前时间毫秒数
var dt= new Date()
dt.getTime() // 获取毫秒数
dt.getFullYear() //年
dt.getMonth() // 月 (0-11)
dt.getDay() //周(0-6)
dt.getDate() // 日(0-31)
dt.getHours() // 小时(0-23)
dt.getMinutes() // 分钟(0-59)
dt.getSeconds() // 秒(0-59)
```
- 获取2017-xx-xx格式的日期
```js
function formatDate(dt){
  if(!dt){
    dt = new Date()
  }
  var year = dt.getFullYear()
  var month = dt.getMonth()+1
  var date = dt.getDate()
  if(month < 10){
    //强制类型转换
    month = '0' + month
  }
  if(date < 10){
    date = '0' + date
  }
  return year+'-'+month+'-'+date
}
var dt = new Date()
var formatDate = formatDate(dt)
console.log(formatDate)
```
### Math
- Math.random() 获取0-1之间的随机数[0,1)
- Math.ceil() 向上取整  
- Math.floor() 向下取整
- Math.round() 四舍五入
- Math.abs() 绝对值

- 常用的一些随机方法
```js
// x- y
Math.round(Math.random()*(y-x)+x)
// 1- x
Math.ceil(Math.random()*x)||1
// 0- x-1
Math.floor(Math.random()*x)
// 0- x
Math.round(Math.random()*x)
```
### 数组方法
- （4个增加，替倒牌，forEach，连脚截，every one 重 过 index）
- 数组累加 用 forEach 和 reduce
```js
  //4个增加
    push()
    // 添加末尾 
    unshift()
    // 添加前面
    pop()
    // 删除末尾
    shift()
    // 删除前面
    // 原数组变动 返回数组的长度

  // (替 倒 牌(排)) 原数组都会变化
    splice() //用新元素替换旧元素
    //   splice(start,deletecount,item)  start开始位子  deletecount 删除个数  item 替换内容
    //   0参数     直接返回空数组
    //   1个参数   截取数组，参数开始到结束
    //   2个参数   截取的个数
    // 原数变成更新后的数组  返回删除后的内容 是一个数组
    // 括号里面的都是包前不包后
    reverse() //颠倒数组
      // 返回值和原数组都 变成颠倒后数组
      // 原数组变动 返回变动后的数组
    Arr.sort((a,b)=>{ 
      //从小到大
      return a-b
      //从大到小
      return b-a
    })
    // 无参数 按照字符编码的顺序进行排序
    // 原数组变，返回新数组


     Arr.forEach((a1,a2,a3)=>{  //(----------------原数组不变动)
          //a1 当前数组中的某个数据
          //a2 当前数据的索引
          //a3 数组本身
        })
    // 没有返回值

    // (连 脚(join) 截)  原数组不变动
    concat() //连接数组
    // 用法 数组.concat(A1,A2) 合并多个，参数也可以是非数组
    // 原数组不变动 返回组合后的新数组

    join() //将数组所有的元素连接成一个字符串
    //   数组.join(a1)   a1就是一个连接符号，用他把数据连接成一个字符串
    // 原数组不变动 返回新值
    slice() //截取数组
    //   slice(begin,end) begin开始位子  end结束位子(可以用负数,-1是最小的,最后一个元素，但不包括，第一个参数要小于第二个参数的位子)
    //   0参数     直接返回数组
    //   1个参数   截取数组，参数开始到结束
    // 原数组不变动 返回截取后的数组

    // (every one 重 过 index)
    Arr.every((item,index)=>{
      //用来判断所有数组元素都满足一个条件
      if(item<4){
        return true
      }
    })
    // 原数组不变动 所有都满足<4 返回值true 否则false
    
    Arr.some //同上 判断所有数组元素中，只要一个元素满足条件即可
    // 原数组不变动 满足<4 返回值true 否则false


    Arr.map((item,index)=>{ //(----------------原数组不变动)
      //将元素重新组装并返回
      return '<b>'+item+'</b>'
    })
    原数组不变，返回重装后的元素

    Arr.filter((item,index)=>{ //(----------------原数组不变动)
      //通过某一个条件过滤数组
      if(item>=2){
        return true 
      }
    })
    //原数组不变，返回满足条件的元素

    Arr.findIndex(x)=>{ //(----------------原数组不变动)
      return x == 4
    }
    //原数组不变，返回满足条件的第一个元素下标

    Arr.reduce((pre,next,index,target)=>{
      
    })
    //返回新的数组 原数组不变
```
- 写一个能遍历对象和数组的forEach函数
```js
function forEach(obj,fn){
  var key 
  if(obj instanceof Array){
    //准确判断是不是数组
    obj.forEach((item,index)=>{
      fn(index,item)
    })
  }else{
    // 不是数组就是对象
    for(key in obj){
      fn(key,obj[key])
    }
  }
}
```
### 字符串
```js
  字符
    indexOf() //查下标
    lastIndexOf() //从右往左找

    slice('开始位子','结束位子') //截取字符串
      //包前不包后,可以放负，开始位子不能大于结束位子
    //原字符串不变  返回截取后的
    
    split('分隔符','分割成数组的个数') //用指定的分隔符把字符串分隔成数组
      //一个参数都没有和一个空格字符的话，会把整个字符串作为数组中的一个数据
    
    trim() //去掉首空格
    toLowerCase() //大写变小写
    toUpperCase() //小写变大写

    substring('开始位子','结束位子') //截取一段字符
      // 0参数,返回整个字符串
      // 1参数，从这个参数截到最后
      // 2参数，不包括最后一个参数
      // 返回截取后的字符串，原字符串不变
    //与slice区别
      // 1、slice起始位子不能大于结束位子
      //    substring起始位子可大于结束位子，并会自动调换位子
      // 2、slice可放负数，substring不可放负数
    
    substr('开始','个数') //截取一段指定开始位子与个数的字符串
      // 0个参,返回整个字符串
      // 1个参，默认第一个参数到最后
      
    startsWith() //方法用于检测字符串是否以指定的前缀开始。
```
- 获取随机数 要求长度是一直的字符串格式
```js
var random = Math.random()
var random = random + '0000000000' //后面加 10个零
var random = random.slice(0,10)
console.log(random) 
```
### DOM节点
- 获取元素宽高
  - dom.offsetWidth 元素宽(包括边框)
  - dom.offsetHeight 高
  - dom.clientWidth 元素宽(不带边框)         
  - dom.clientHeight 高

- 创建元素
  - document.createElement(tagName) 主语只能是document tagName是标签名
- 增加元素
  - appendChild() 添加到最后面
    - 父节点.appendChild(dom)
    - 返回创建的那个标签节点
    - 如果是操作一个已经存在的dom 会将他删除,(比如 创建一个代码片段，将现有的dom 往里面加入，会删除原有的)

  - insertBefore()
    - 父节点.insertBefore(dom1,dom2)
    - 插入元素 把第一个参数插入到第二个参数前面 
    - 第二个是空 就跟appendChild一样 
    - 如果元素是一个已经存在元素 那相当剪贴交换
- 移除元素
  - removeChild  删除
    - 父级.removeChild(dom)
  - replaceChild 替换
    - 父级.replaceChild(dom1,dom2)
    - 2个参数必须同时出现 第一个替换第二个(剪贴)
- 克隆
  - cloneNode() 克隆一个节点
    - dom.cloneNode(boolean)
    - true 包含子孙节点
    - false 不包含,默认
    - 克隆只包括html,css 克隆后id重名 需要手动修改下
- appendChild insertBefore replaceChild
  - 在操作一个已有的元素时 是将已有的元素移动而不是复制(剪切)

- InnerHTML和DOM方法的区别
  - InnerHTML是将原来的情况 在添加内容
  - DOM是追加到原来内容后面

- 动态和静态获取元素
  - getElmentByTagName 
    - 动态获取 只要原来的结果有了变化 就会监听到 他会重新获取一次
  - querySlectorAll/querySelector 静态获取 只获取一次 

- 节点名称 nodeName
  - 元素的父节点
    - dom.ParentNode
    - 属性节点没有父节点 文本有父节点
  - 元素的children
    - parentNode.children
      - 获取到父级下的第一层子节点 是一个集合 只有标签
    - parentNode.childNodes 
      - 获取所有子节点 包括文本等  
  - 获取第一个和最后一个元素节点
    - parentNode.firstElementChild(第一个)
    - parentNode.lastElementChild(最后一个)
  - 元素的兄弟节点
    - dom.previousElementSibling 紧挨着元素的上一个元素节点
    - dom.nextElementSibing 紧挨着元素的下一个元素节点
  - getBoundingClientRect()
    - 获取元素盒子模型的信息 得到的结果没有单位 不包含滚动条距离
  - offsetParent
    - 获取dom最近的有定位的父级 如果没有就是body(body节点是没有的)
    - dom.offsetParent 
  - offsetLeft/offsetTop
    - 获取dom最左/上边离最近的有定位的父级之间的距离
    - dom.offsetLeft/dom.offsetTop 不带单位 不带边框
- 节点类型 nodeType
  - 标签节点 1
  - 属性节点 2
  - 文本节点 3
  - 注释节点 8
  - 文档节点 9
- 节点属性集合 dom.attributes
  - dom.getAttribute() 
    - 获取元素的属性 如果参数是一个src 或者href那么它取到的结果就是引号里面的值(相对地址)
  - dom.setAttribute('属性','值')
  - dom.removeArribute()
  - dom.getAttributeNode('属性') 获取属性节点
- 获取子节点集合 dom.childNodes
- matches(Selector)   接收一个参数,即css选择符,如果调用的元素与该选择符匹配为ture,否则为falsed
- dom1.contains(dom2) dom1包含dom2返回ture
- 操作表格
```js
//创建表格
		var table = document.createElement('table')
				table.borber = 1
				table.width = 100%
	//	创建tbody
		var tbody = document.createElement('tbody')
				table.appendChild(tbody)
		//创建第一行
				tbody.insertRow(0)
				tbody.rows[0].insertCell(0)
				tbody.rows[0].cells[0].appendChild(document.createTextNode('cell 1,1'))
```
### BOM
- navigator
  - 检测浏览器
```JS
var ua = navigator.userAgent
var isChrome = ua.indexOf('Chrome')
console.log(isChrome)
```
- screen
  - screen.width
  - screen.height
- location
  - location.href 整个url
  - location.protocal 协议 'http':'https'
  - location.host 域名
  - location.pathname 路径 
  - location.search ?后面的
  - location.hash  #后面的
- history
  - history.back() 后退
  - history.forward() 前进
- 可视区域的宽/高(dom)
  - document.documentElement.clientWidth
  - document.documentElement.clientHeight
- 可视区域的宽/高(Bom)
  - window.innerWidth
  - window.innerHeight
- 滚动条的距离(dom)
  - 谷歌 
    - document.body.scrollTop 纵向
    - document.body.scrollLeft 横向
  - 其他
    - document.documentElement.scrollTop
    - document.documentElement.scrollLeft
- 滚动条的距离(bom)
  - window.pageYOffset 
  - window.pageXOffset 
- 设置滚动的距离
  - window.scrollTo(x,y)
  - 两个参数必需同时出现
- onscroll和onresize
  - window.onscroll = ()=>{} 滚动条触发这个方法
  - window.onresize = ()=>{} 窗口改变大小触发整个方法
### 事件
- 通用事件绑定
```js
var btn = document.getElementById('btn1')
btn.addEventListener('click',(event)=>{
  console.log('clicked')
})
function bindEvent(elem,type,fn){
  elem.addEventListener(type,fn)
}
var a = document.getElementById('link1')
bindEvent(a,'click',(e)=>{
  e.perventDefault() //阻止默认行为
  alert('clicked')
})
```
- 事件代理
```js
<div id = 'div1'>
  <a href='#'>a1</a>
</div>
var div1 = document.getElementById('div1')
div1.addEventListener('click',function(e){
  var target = e.target
  if(target.node === 'A'){
    alert(target.innerHTML)
  }
})
```
- 完善通用绑定事件的函数
```js
function bindEvent(elem,type,selector,fn){
  if(fn == null){
    fn = selector
    selector = null
  }
  elem.addEventListerner(type,(e)=>{
    var target 
    if(selector){
      target = e.target
      if(target.matches(selector)){
        fn.call(target,e)
      }
    }else{
      fn(e)
    }
  })
}
// 使用代理
var div1 = document.getElementById('div1')
bindEvent(div1,'click','a',function(e){
  console.log(this.innerHTML)
})
// 不何用代理
var a = document.getElementById('div1')
bindEvent(div1,'click',function(e){
  console.log(a.innerHTML)
})
```
### 事件
```js
/*
  鼠标事件
      click 点击
      dbclick 双击
      mousedown  按下
      mouseup    抬起
      mousemove  移动
        会传给子元素
      mouseover  移入
      mouseout   移除
        不会传给子元素
      mouseenter 移入 
      mouseleave 移出
    鼠标坐标  
      event.clientX/event.clientY
      坐标根据可视区左上角进行
    事件源
    
      event.target(他是一个属性)
      触发事件的元素
      dom.matches('选择器')=>event.target.matches
      判断选择器是否是对象里面得的

      焦点事件
      focus 有焦点事件的元素获取焦点就会触发
      blur  失去
      tabindex  用来更改tab键切换顺序
      使用 dom.focus()  dom.blur()

      事件绑定与移出
      on
        dom.on事件名 = 函数
        on只能添加一个，多个会覆盖
      addEventlistener
        dom.addEventlistener(事件名称,函数a(event),boolean)
        function a(e){
          console.log(e)
        }
        函数里面的参数event(event点击事件源,可以不写,要写只能是他) 即是事件event
        注意:当事件为mousemove 的话不能传参也不能加()写函数名即可 ：传参导致程序只能执行一次不行连续执行

        boolean 
          为true   捕获
          为false  冒泡(默认)
    移出
      on
        dom.on事件名 = null
      addEventlistener
        dom.removeEventlistener(事件名称,函数名字,boolean)
        不能移出addEventlistener添加的匿名函数
        只能移出同一阶段的绑定函数

    阻止事件冒泡
      非IE:event.stopPropagation() 不会往上层传递
      IE:event.cancelBubble= true
    
    阻止浏览器默认行为
      on
        在函数里面写return false
      addEventlistener
        event.preventDefault()
    */
```

### ajax
```js
var xhr = new XMLHttpRequest()
xhr.open('GET','/api',true)
xhr.onreadystatechange = function(){
  //这里是异步执行
  // 4 (完成)响应内容解析完成,可以在客户端调用
  if(xhr.readyState == 4){
    if(xhr.status === 200){
      alert(xhr.responseText)
    }
  }
}
xhr.send(null)
```

- 同源策略
  - 同源策略限制从一个源加载的文档或脚本如果与来自另一个源的资源进行交互
    - Cookie,LocalStorage,indexDB无法读取
    - DOM无法获得
    - AJAX请求不能发送
  - 跨域手段
    - JSONP
    - cors
    - hash
    - postMessage
    - websocket
- JSONP
```js
 // https://sp0.baidu.com/5a1Fazu8AA54nxGko9WTAnF6hhy/su?wd=1&cb=xxx
    function jsonp({url,params,cb}){
        return new Promise((resolve,reject)=>{
            let dom = document.createElement('script')
            // cb 必须挂载window上 或者放在全局里 
            // script 请求后会返回一个cd('返回数据') 此时的cd会在全局上去查找 找不到就会报错   
            window[cb] = function (item){
                resolve(item)
            }
            params = {...params,cb}
            let arr = []
            for(let key in params){
                arr.push(`${key}=${params[key]}`)
            }
            params = arr.join('&')
            url = `${url}?${params}`  
            
            dom.src = url
            document.body.appendChild(dom)
        })
    }
    // let url = 'https://sp0.baidu.com/5a1Fazu8AA54nxGko9WTAnF6hhy/su'
    let url = 'http://localhost:3000/jsonp'
    // 只能发送get请求 不支持post等  因为jsonp 依靠的的script标签
    // 不安全 xss攻击
    jsonp({
        url,
        params:{wd:'1'},
        cb:'callback'
    }).then(data=>{
        console.log(data)
    })
```
- 后端配合
```js
let express = require('express')
let app = express()
var bodyParser = require('body-parser');//解析,用req.body获取post参数
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.get('/jsonp',(req,res)=>{
    // req.query 获取get请求 ? 后前的东西
    // res.end('返回的数据') 这个接口返回的数据
    console.log(req.method,req.query)
    let rs = req.query.cb
    res.end(`${rs}(123)`)
})  

app.post('/form',(req,res)=>{
  console.log(req.method,req.url,req.body)

  res.end(`(123)`)
})

app.get('/form',(req,res)=>{
  console.log(req.method,req.url,req.query,req.params)

  res.end(`(123)`)
})

app.listen(3000,()=>{
    console.log('listen start')
})
```
- cors
```js
let express = require('express')
let app = express()
let whitList = ['http://localhost:3000']
app.use((req,res,next)=>{
    console.log(req.headers.referer) 
    let origin = req.headers.origin
    /*
      1、返给浏览器的数据 在请求头里面 要是没有'Access-Control-Allow-origin' 请求头 
         浏览器就会显示跨域 这儿设置就可以  第二个参数是* 就是所有
    */
     if(whitList.includes(origin)){
        //设置那个源可以访问我
        res.setHeader('Access-Control-Allow-Origin',origin)
        //允许携带哪个头访问我
        res.setHeader('Access-Control-Allow-Headers','name')
        //允许哪个方法访问我 默认post get
        res.setHeader('Access-Control-Allow-Methods','PUT')
        //允许携带cookie  但是Access-Control-Allow-Origin 不能设置 * 其他都可以
        res.setHeader('Access-Control-Allow-Credentials',true)
        //允许前端获取哪个头
        res.setHeader('Access-Control-Expose-Headers','name,ss')
        //预检的存活时间 10s内 options请求只会发一次  
        res.setHeader('Access-Control-Max-Age',10)



        if(req.method === 'options'){
            res.end()// options 没有任何意义  他不是每次都发 在固定时间内 触发一次
        }
    }
    next()
})

app.get('/',(req,res)=>{
    res.setHeader('name','sg')
    res.setHeader('ss','sg11')
    res.end('xxxx123')
})
app.post('/',(req,res)=>{
    res.end('xxxx123')
})
app.put('/',(req,res)=>{
    res.end('xxxx123')
})
app.listen(4000,()=>{
    console.log('listen start')
})
```

- postMessage
- a
```js
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
</head>
<body>
    a页面
    <iframe src="http://localhost:3000/b.html" frameborder="0" id="frame" onload="load()"></iframe>
    <script>
        function load(){
            let frame = document.getElementById('frame')
            // 发送
            frame.contentWindow.postMessage('我爱你','http://localhost:3000')
            // 接收
            window.onmessage = (e)=>{
                console.log('a页面',e.data)
            }
        }
    </script>
</body>
</html>
```
- b
```js
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
</head>
<body>
    b页面
    <script>
        window.onmessage = (e)=>{

            console.log('接受的数据',e.data)
            //e.source 是从哪儿来的 e.origin 是之前的地址
            e.source.postMessage('我不爱你',e.origin)
        }   
    </script>
</body>
</html>
```
- server
```js
let express = require('express')

let app = express()

app.use(express.static(__dirname))

app.listen(3000)
```

### 安全 
- CSRF 跨站请求伪造
  - 原理 
    - 用户登录A网站 获取cookie 
    - 用户点击B网站 B网站跳出东西 引诱用户点击
    - 用户点击之后携带自己的cookie 就直接访问A网站
  - 防御
    - Token验证
    - Referer验证
    - 隐藏令牌
- XSS 跨域脚本攻击
  - 向网站注入脚本进行攻击
### 函数节流&&函数防抖
- 函数节流和函数防抖，两者都是优化高频率执行js代码的一种手段。
- 函数节流是指一定时间内js方法只跑一次。比如人的眨眼睛，就是一定时间内眨一次。这是函数节流最形象的解释。
  - 函数节流应用的实际场景，多数在监听页面元素滚动事件的时候会用到。因为滚动事件，是一个高频触发的事件。
- 函数防抖是指频繁触发的情况下，只有足够的空闲时间，才执行代码一次。
  - 数防抖的应用场景，最常见的就是用户注册时候的手机号码验证和邮箱验证了。只有等用户输入完毕后，前端才需要检查格式是否正确，如果不正确，再弹出提示语。
### 算法
- 排序算法
  - 冒泡排序
  - 选择排序
  - 希尔排序
  - 快速排序
  
  - 堆栈
  - 链表
  - 队列

  - 递归

  - 波兰式和逆波兰式
### 渲染机制
- 什么是 DOCTYPE 及作用
  - DTD 是一系列的语法规范,用来定义XML或HTML的文档类型
  - DOCTYPE是用来声明文档类型DTD,检验文件的合法性

### 重排(回流)Reflow 
- 定义
  - DOM结构中的各个元素都有自己的盒子(模型),浏览器根据各种样式来计算他们该出现的位置
  - 引起DOM树结构变化，页面布局变化的行为叫回流，且回流一定伴随重绘
  - 回流往往伴随着布局的变化
- 触发
  - 触发Reflow
    - 当你增加,删除,修改DOM结点时,会导致Rewflow或Repaint
    - dom移动
    - 修改css样式
    - 当你Resize窗口的时候,或是滚动的时候
    - 当你修改网页的默认字体时
### 重绘Repaint
- 定义
  - 页面呈现的内容统统画在页面上
- 触发Repaint
  - 页面呈现的内容只要修改了就触发
  - DOM改动
  - css改动
- 重绘只是样式的变化，结构不会变化


### 页面性能类
- 提升页面性能的方法
- 1、资源压缩合并,减少HTTP请求
- 2、非核心代码异步加载
- 3、利用浏览器缓存
- 4、使用CDN
- 5、预解析DNS
<link rel='dns-prefetch' href='xxx'>

- 高级浏览器中a标签默认是预解析
- https 中a标签默认是非预解析 下面强制打开预解析
```html
<meta http-equiv='x-dns-prefetch-control' content='on'>
```
- 1、异步加载的方式
  - 动态脚本加载 (js)
  - defer
  - async
- 2、异步加载的区别
  - defer是在HTML解析完成之后会执行,如果是多个,按照加载的顺序依次执行
  - async是加载完成之后立即执行,如果是多个,执行顺序和加载序无关

- 1、缓存的分类(都在请求头里)
  - 强缓存
    - Expires(过期时间) Expires:Thu,21 Jan 2017 23:39:02 GMT (绝对时间)  
    - Cache-Control Cache-Control:max-age=3600 (相对时间 以客户端时间为准)
    - 如果都设置了以后者为准
  - 协商缓存
    - Last-Modified(服务器下发的)  If-Modified-Since(请求时候的)  一对做对比 
      - 缺点 时间变动了内容没有变
    - Etag If-None-Match 一对
      - 服务器下发会给一个etag 哈希值 过了强缓存 浏览器再次请求 客户端会发一个If-None-Match 里面就是etag值,服务器会比对这个客服端发送过来的Etag是否与服务器的相同，
      - 如果相同，就将If-None-Match的值设为false，返回状态为304,客户端继续使用本地缓存，不解析服务器返回的数据
      - 如果不相同，就将If-None-Match的值设为true，返回状态为200，客户端重新解析服务器返回的数据
## promise原理
- 1、new Promise(resolve, reject) 的时候 会执行executor(resolve, reject) 将resolve, reject传递给外面
- 2、new 的时候先执行 resolve 内部状态就变成resolved  要是先执行 reject 状态就执行 rejected 默认是pending  
- 3、then的时候 会走Promise.prototype.then(onFulfilled,onRejected) then 会接收2个值,判断状态 在执行哪个函数将new里面拿到的value返回给函数
- 4、then执行 当执行异步的时候走pending 将获取的时候存放起来 等时间到了 在执行 resolve 和 rejected,将之前存起来的数组执行
- 5、then执行后返回一个新的promise 因为promise的状态一旦失败就不能在成功了
- 6、promise其他原理
  - catch 就是特殊的then方法
  - finally 最终都会执行
  - rece 赛跑
  - all 表示全部成功才成功(数组里面都是promise)
  
```js
// Promise.all 表示全部成功才成功 有任意一个失败 都会失败
Promise.all = function (promises) {
  return new Promise((resolve, reject) => {
    let arr = [];
    let currentIndex = 0;
    function processData(index, val) {
      arr[index] = val;
      currentIndex++; // 记录一下成功的次数
      // 如果达到了执行目标就让all的promise成功
      if (currentIndex === promises.length) {
        resolve(arr);
      }
    }
    for (let i = 0; i < promises.length; i++) {
      promises[i].then(function (data) {
        processData(i, data);
      }, reject)
    }
  });
}
// rece赛跑
Promise.race = function (promises) {
  return new Promise((resolve, reject) => {
    for (let i = 0; i < promises.length; i++) {
      promises[i].then(resolve, reject);
    }
  });
}
// reject
Promise.reject = function (reason) {
  return new Promise((resolve,reject)=>{
    reject(reason);
  })
}
// resolve
Promise.resolve = function (value) {
  return new Promise((resolve, reject) => {
    resolve(value);
  })
}
// finally
Promise.prototype.finally = function(callback){
  // 无论如何finally中传递的回调函数 必须会执行
  return this.then(function (data) {
    // 返回一个promise,将上一次的状态继续传递下去
    return Promise.resolve(callback()).then(()=>data)
  },function (reason) {
    return Promise.resolve(callback()).then(()=>{
      throw reason
    })
  })
}
// catch
Promise.prototype.catch = function (errFn) {
  // catch就是特殊的then方法,第一个参数resove给null,第二个也就是rejected
  return this.then(null, errFn)
}
// 调用
let Promise = require('./1.promise');
let p = new Promise(function (resolve,reject) {
  setTimeout(() => {
    resolve();
  }, 1000);
});
p.then(function (value) {
  console.log('val',value);
},function (reason) {
  console.log('rea',reason);
});
p.then(function (value) {
  console.log('val', value);
}, function (reason) {
  console.log('rea', reason);
});

// 基础Promise
function Promise(executor) {
  let self = this;
  // 保存成功的值和失败的原因
  self.value = undefined;
  self.reason = undefined;
  // 保存一下当前这个promise的状态(promise有三个状态)
  self.status = 'pending';
  function resolve(value) {
    if (self.status === 'pending') {
      self.value = value;
      self.status = 'resolved';
    }
  }
  function reject(reason) {
    if (self.status === 'pending') {
      self.reason = reason;
      self.status = 'rejected';
    }
  }
  executor(resolve, reject);
  // executor是立即执行的
}
// then方法中需要传递两个参数 分别是成功的回调和失败的回调
Promise.prototype.then = function (onFulfilled,onRejected) {
  let self = this;
  if(self.status === 'resolved'){
    onFulfilled(self.value);
  }
  if (self.status === 'rejected') {
    onRejected(self.reason);
  }
}
module.exports = Promise
```

## generator+co
- generator函数 执行后要next() 
  - 返回{value: xx, done: false} {value: underfined, done: true}
  - yield 后面的值就是value的结果 xx  
  - done fase 代表没结束  / true 代表结束了
  - next 传参数 第一个next传参数 是无效的, 第二次next执行传参数会返回给第一次yield的返回值

```js
// 基本用法
function * gen(){
  yield 1;
}
let it = gen()
let r = it.next()
console.log(r)
 r = it.next()
console.log(r)
// 自动迭代
function * gen(){
  yield 1;
  yield 2;
  yield 3;
}
let it = gen()
let flag = false
do{
  let {value,done} = it.next()
  flag = value;
  console.log(value)
} while (!flag);
```
- co库(只考虑 yield后面接promise异步)
 - value 是yield后面的异步执行结果 也就是一个promise
 - value.then拿到结果给next(data) data会传递给下异步(age),then再次拿到结果在传递给adress,最后done为true结束
```js
function * r(){
  // read异步读取文件 先看作一个promise
  let age = yield read('xx.text')
  let adress = yield read(age)
  let r = yield read(adress)
}

function co(it){
  return new Promise((resolve,reject)=>{
    function next(data){
      let {value,done} = it.next(data)
      if(!done){
        value.then(data=>{
          next(data);
        })
      }else{
        resolve(value)
      }
    }
  })
  next()
}
```
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

## RegExp
### 定义方式
  - 直接量定义  /正则/修饰符  
  - 对象定义    new RegExp(字符串,修饰符)
### 修饰符
  - i:忽略大小写
  - g:全局匹配
- 转义字符
```js
/*
\  转义符
\n 换行(newline)
\s 空格(space)
\S 非空格
\' 单引号
\" 双引号
\d (digit)数字,正则中专门用来代表数字的,等级于 [0-9]
\D 非数字字符,等价于[^0-9]
\w 数字、字母、下划线
\W 非数字、非字母、非下划线
\b 单词的边界，独立的部分(起始位子、结束位子、空格)，它不匹配某个可见的字符，而是匹配位子(border)
\B 非边界的部分
.  任意一个字符
\. 真正的点
*/
``` 
### 分组和子项
  - 子项 => ()
### 中括号
  -  []              匹配中括号里的任意一个字符,只代表一个字符
  -  [1-9]           区间的写法，标示从1到9之间的任意的一个字符
  -  [a-z]           a-z之间的任意一个小写字母
  -  [A-Z]           A-Z之间的任意一个大写字母 
  -  [a-zA-Z0-9]     匹配a-z,A-Z,0-9(匹配任何字母和数字)
  -  ^               排除掉某个字符(仅仅用在中括号内表达这个意思)
  -  [\u4e00-\u9fa5] 中文的区间,包含所有的汉字
  - red|blue|green 标示red,blue,green 这三个单词中的任何一个(至少)

### 属性
  - global 布尔值,表示是否设置了g标志
  - ignoreCase 布尔值,表示是否设置了i标志
  - lastIndex 整数,表示开始搜索下一个匹配项的字符位置,从0开始(带g才有效果 不然每次都是从头开始)
  - multiline 布尔值 表示是否设置了m表示
  - source 正则表达式的字符串表示
  - $n n代表()内匹配数据

### 量词
  - 所有的量词都需要放在{n,m}里面
  - \n n代表数字 \n代表第几个的分组=>()
  - n,m代表数字
  - {n}     前一项重复n次
  - {n,}    前一项至少重复n次，最多不限
  - {n,m}   前一项至少重复n次,最多重复m次
  - '+'   前一项至少重复1次，最多不限     等价{1,}
  - ？  前一项至少重复0次，最多重复1次，也就是说前一项是可选的，等价于{0,1}
  - '*'   前一项至少重复0次，最多不限，也就是说前一项是可选的，等价{0,}
  - ^      它出现在中括号里代表排除的意思,在中括号的外面标示字符串开始的位子
  - $      字符串结束的位子

### 方法
  - test()
    - 是否包含某位字符串
    - 正则对象.test(字符串)
    - 返回:布尔值
  - exec 接收一个字符串参数 返回匹配的内容，或者没有匹配项情况下返回null
    - 返回的是array实例,记住不能随便加空格,没有捕获组则该数组只包含一项,捕获组就是中括号
    - index 表示匹配项在字符串中的位置
    - input 正则表达式的字符串
      - let text = "mom and dad and bady"
      - var p = /mom( and dad (and bady)?)?/gi
      - var p1 = /nd/gi
      - var ma = p.exec(text)
      - 若是不加g他每次只返回一个匹配项,每次调用exec则都会在字符串中继续查- 找新的匹配项索引的第一个就是匹配到的值
      - 若正则匹配项里面加()(即捕获组)则匹配所有满足的  如果带g他的index会有变化
  - toString方法 
    - RegExp 和 字面量创建的 toString方法都返回正则表达式的字面量
  - valueOf 返回正则表达式的本身 是一个对象
### RegExp静态方法
  - $$  $
  - $&  匹配模式的子字符串 与RegExp.lastMatch 的值相同 (lastMatch 最后匹配的值) 你不能使用属性访问器(RegExp.$&)来使用简写的别名，因为解析器在这里会将 "&" 看做表达式，并抛出 SyntaxError 。使用 方括号符号来访问属性。
  - $n   匹配第n个捕获组的子字符串 n(0-9),如果正则表达式没有定义捕获组 则使用空字符串
  - $nn  匹配第nn个捕获组的子字符串 nn(00-99)

### 字符串方法 用正则
  - search()
    - 找匹配的字符串首次出现的位子
    - 字符串.search(字符串或者正则)
    - 返回:找到返回位子下标,没有返回-1
  - match()
    - 将满足的数据放到数组中
    - 字符串.match(字符串或者正则)
    - 找到后把结果放在数组中并返回,若是没有返回null
    - 如果不带g修饰符,只会匹配一个结果，并且给找到的数组添加index与input属性 如果用了分组(也就是() )那么分组里的内容也会显示到结果中
    - 如果带g修饰符,则为全局匹配，结果里面放的是找到匹配的字符
  - replace
    - 替换匹配的字符串
    - 字符串.replace(字符串或者正则,字符串或者函数)
    - 返回:替换后的新字符串,原来的字符串没有变化
```js

// 参数 
// 第一个参数:字符串或者正则
// 第二个参数:字符串或者函数
//     函数参数说明
//       参一 要匹配的内容,与replace的第一个参数一样
//       参二 要匹配的内容对应的位子下标
//       参三 原字符串
//       注意:这个函数必须要有一个返回值,否则的话它就会拿undefined替换掉原来的内容
// 返回:替换后的新字符串,原来的字符串没有变化
    
//     第二个参数是一个函数,他的形参至少是3个
//     var str='adb22s22d22hsu222223673njAj2nj2234n45nk';
//     let a = str.replace(/(\d+)(\d)/g,(a1,a2,a3,a4,a5)=>{
//       console.log('-----------',a1,a2,a3,a4,a5)
//       return '--------'
//     })
//     a1 为(\d+)(\d)
//     a2 为第一个(\d+)
//     a3 为第二个(\d)
//     a4 为第一个满足的下标
//     a5 原字符串
//     console.log会把满足的条件都打印下来

```
## CommonJS和es6模块
- 它们有两个重大差异
  - CommonJS 模块输出的是一个值的拷贝，ES6 模块输出的是值的引用。
  - CommonJS 模块是运行时加载，ES6 模块是编译时输出接口。
    -  CommonJS 模块输出的是值的拷贝，也就是说，一旦输出一个值，模块内部的变化就影响不到这个值。
    - ES6 模块的运行机制与 CommonJS 不一样。JS 引擎对脚本静态分析的时候，遇到模块加载命令 import，就会生成一个只读引用。等到脚本真正执行时，再根据这个只读引用，到被加载的那个模块里面去取值,因此，ES6 模块是动态引用，并且不会缓存值，模块里面的变量绑定其所在的模块。
- CommonJS 也就是node的require
- exports.a 导出的是单个对象
```js
// b.js
exports.a = '1'

// a.js
let b = require('./b.js')

console.log(b) //{a:1}
```
- module.exports 导出的是一个值
```js
// b.js
module.exports = 1

// a.js
let b = require('./b.js')

console.log(b) // 1
```
- es6模块 需要import
- es6 需要编译
- 导出多个变量
```js
// 导出多个变量
// a.js
export const a = 1 ; 
export const b = 2 ; 

// b.js 两种引入的办法
// import {a,b} from 'a.js'
import * as obj from 'a.js'
console.log(obj.a)// 1
console.log(obj.b)// 2
```
- 导出单个(默认导出)
```js
// a.js
export default {a:'123'}

// b.js obj名字随便写什么都可以 引入有2种写法
import obj from './a'
console.log(obj)//{a:'123'}

import * as obj from './a'
console.log(obj.default)//{a:'123'}
```
### CommonJS模块的循环加载
- CommonJS的做法是，一旦出现某个模块被"循环加载"，就只输出已经执行的部分，还未执行的部分不会输出。
- 也就是说进入循环引用的时候 引入的只是已经执行过的代码
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
- 首先开始 第一步加载a.js这时候 a = a.js 的地址类似于 a=a{}
- 进入a.js首先对外暴露一个属性fl a{fl:false}
- 加载b.js并且将值赋值给b b=b{}
- 进入b.js首先对外暴露一个属性fl b{fl:false}
- 这个时候开始加载a文件,但是内存中有a{}将内存中的a{}给a a=a{}
- 然后打印内容b.js ===> fl:false;这个时候a里面fl时false
- 修改fl的值 为true b{fl:true}
- 打印 b.js ===> 执行完毕
- 然后文件a的require('b.js')执行完毕
- 打印a.js ===> fl:true 这个时候b里面的fl为true
- 修改a.js 对外暴露的fl 为true a{fl:true}
- 打印 a.js ===> 执行完毕
- 然后读取 b文件,内存中已经有b文件了直接将地址改成内存中的地址
- 打印 代码执行完毕: a ===> fl:true; b ===> fl:true
### ES6模块的循环加载
- ES6模块的运行机制与CommonJS不一样，它遇到模块加载命令import时，不会去执行模块，而是只生成一个引用。等到真的需要用到时，再到模块里面去取值。

```js
// a.js
import {bar} from './b.js';
export function foo() {
  bar();  
  console.log('执行完毕');
}
foo();

// b.js
import {foo} from './a.js';
export function bar() {  
  if (Math.random() > 0.5) {
    foo();
  }
}
```
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
- 上面的代码中，参数n从10变为0的过程中，even()一共会执行6次，所以变量counter等于6。第二次调用even()时，参数n从20变为0，even()一共会执行11次，加上前面的6次，所以变量counter等于17。

## 页面加载
- window.onload()
  -  必须等待网页全部加载完毕（包括图片等），然后再执行JS代码
- $(document).ready()
  - 只需要等待网页中的DOM结构加载完毕，就能执行JS代码
## es6基础
### let
- 作用域{}
```js
// let 的情况
console.log(bar); // 报错ReferenceError
let bar = 2;
```
- 暂时性死区
```js
var tmp = 123;
if(true){
  // {}里面 有let 声明 tmp, let前面tmp是不能赋值的
  tmp = 'abc'
  let tmp
}
```
### 结构赋值
- 如果解构不成功，变量的值就等于undefined。
- 事实上，只要某种数据结构具有 Iterator 接口，都可以采用数组形式的解构赋值。
- 数组解构赋值
```js
let [x, , y,...tail] = [1, 2, 3, 4, 5, 6];
x // 1
y // 3
tail // [4, 5, 6]
```
- 默认赋值
```js
let [x, y = 'b'] = ['a']; // x='a', y='b'
```
- 如果一个数组成员是null，默认值就不会生效，因为null不严格等于undefined。
```js
let [x = 1] = [undefined];
x // 1

let [x = 1] = [null];
x // null
```
- 对象解构赋值
- 对象的解构与数组有一个重要的不同。数组的元素是按次序排列的，变量的取值由它的位置决定；而对象的属性没有次序，变量必须与属性同名，才能取到正确的值。
- 等号右边的对象没有 baz 属性，所以变量 baz 取不到值，所以等于undefined。
```js
let { bar, foo } = { foo: 'aaa', bar: 'bbb' };
foo // "aaa"
bar // "bbb"

let { baz } = { foo: 'aaa', bar: 'bbb' };
baz // undefined

const { log } = console;
log('hello') // hello
```
- 如果变量名与属性名不一致，可以修改变量名字
```js
let { foo: baz } = { foo: 'aaa', bar: 'bbb' };
baz // "aaa"

let obj = { first: 'hello', last: 'world' };
let { first: f, last: l } = obj;
f // 'hello'
l // 'world'
```
- 默认值
```js
var {x = 3} = {};
x // 3
```
- 字符串解构赋值
```js
const [a, b, c, d, e] = 'hello';
a // "h"
b // "e"
c // "l"
d // "l"
e // "o"
// 类似数组的对象都有一个length属性，因此还可以对这个属性解构赋值。
let {length : len} = 'hello';
```
- 解构赋值时，如果等号右边是数值和布尔值，则会先转为对象。
```js
let {toString: s} = 123;
s === Number.prototype.toString // true

let {toString: s} = true;
s === Boolean.prototype.toString // true
```
- 解构赋值的规则是，只要等号右边的值不是对象或数组，就先将其转为对象。由于undefined和null无法转为对象，所以对它们进行解构赋值，都会报错。
```js
let { prop: x } = undefined; // TypeError
let { prop: y } = null; // TypeError
```
- 函数参数的解构赋值 
```js
// 对象同理
function add([x, y]){
  return x + y;
}
add([1, 2]); // 3
```
### 字符串拓展
- String.raw()方法将\转义
- 处理字符串模板
  - 如果原字符串的斜杠已经转义，那么String.raw()会进行再次转义。
- 当函数使用
  - String.raw()方法也可以作为正常的函数使用。这时，它的第一个参数，应该是一个具有raw属性的对象，且raw属性的值应该是一个数组。
```js
// 字符串模板使用
String.raw`Hi\n${2+3}!`;
// 返回 "Hi\\n5!"
String.raw`Hi\\n`
// 返回 "Hi\\\\n"

// 函数使用
String.raw({ raw: 'test' }, 0, 1, 2);
// 't0e1s2t'
```
- includes() 
  - 返回布尔值，表示是否找到了参数字符串。
- startsWith()
  - 返回布尔值，表示参数字符串是否在原字符串的头部。
- endsWith() 
  - 返回布尔值，表示参数字符串是否在原字符串的尾部。
- repeat()
  - 参数如果是小数，会被取整。
```js
'hello'.repeat(2) // "hellohello"
'na'.repeat(0) // ""
'na'.repeat(2.9) // "nana"
```
- padStart()
  - 字符串补全长度的功能, 用于头部补全
- padEnd() 
  - 用于尾部补全
  - 一共接受两个参数，第一个参数是字符串补全生效的最大长度，第二个参数是用来补全的字符串
  - 如果省略第二个参数，默认使用空格补全长度。
- trim() 
  - 删除首尾空格
  - trimStart()删除前面空格 trimEnd()删除后面空格 
```js
// 用途
// 补全指定位数
'1'.padStart(10, '0') // "0000000001"
// 另一个用途是提示字符串格式。
'12'.padStart(10, 'YYYY-MM-DD') // "YYYY-MM-12"
```
### 正则拓展
- ES5 不允许此时使用第二个参数添加修饰符，否则会报错。
```js
var regex = new RegExp('xyz', 'i');
// 等价于
var regex = /xyz/i;
```
- ES6 增加修饰符
  - 原有正则对象的修饰符是ig，它会被第二个参数i覆盖。
  - u 代表Unicode 字符
  - i 大小写
  - g 全局
  - y 跟g类似 但是y修饰符要求匹配必须从头部开始
```js
new RegExp(/abc/ig, 'i').flags
// i

var s = 'aaa_aa_a';
var r1 = /a+/g;
var r2 = /a+/y;

r1.exec(s) // ["aaa"]
r2.exec(s) // ["aaa"]

r1.exec(s) // ["aa"]
r2.exec(s) // null
```
- source&&flags
```js
// ES5 的 source 属性
// 返回正则表达式的正文
/abc/ig.source
// "abc"

// ES6 的 flags 属性
// 返回正则表达式的修饰符
/abc/ig.flags
// 'gi'
```
- 点字符
  - 点（.）字符在正则表达式中，含义是除了换行符以外的任意单个字符
- matchAll
  - 可以一次性取出所有匹配。不过，它返回的是一个遍历器（Iterator），而不是数组。  
### 数值扩展
- Number.isFinite()
  - 用来检查一个数值是否为有限的（finite），即不是Infinity。
  - 如果参数类型不是数值，Number.isFinite一律返回false。
  - Number.isFinite()对于非数值一律返回false
- Number.isNaN()
  - 用来检查一个值是否为NaN。
  - 如果参数类型不是NaN，Number.isNaN一律返回false
  - Number.isNaN()只有对于NaN才返回true，非NaN一律返回false。
- Number.parseInt('12.34') // 12
- Math.trunc方法用于去除一个数的小数部分，返回整数部分。
- Math.sign方法用来判断一个数到底是正数、负数、还是零。对于非数值，会先将其转换为数值。
  - 参数为正数，返回+1；
  - 参数为负数，返回-1；
  - 参数为 0，返回0；
  - 参数为-0，返回-0;
  - 其他值，返回NaN。
- Math.max/Math.min 接收的都是字符串 取最大值和最小值
- str.charAt(num) 取str的第num个值
```js
// ES5的写法
parseInt('12.34') // 12
// ES6的写法
Number.parseInt('12.34') // 12
Number.parseInt === parseInt // true
// 这样做的目的，是逐步减少全局性方法，使得语言逐步模块化。
```
- Math.trunc方法用于去除一个数的小数部分，返回整数部分。
```js
Math.trunc(4.1) // 4
Math.trunc(4.9) // 4
Math.trunc(-4.1) // -4
Math.trunc(NaN);      // NaN
Math.trunc('foo');    // NaN
Math.trunc();         // NaN
Math.trunc(undefined) // NaN
```
- 新增了一个指数运算符（**），立方
  - 多个指数运算符连用时，是从最右边开始计算的。
```js
2 ** 3 // 8

// 相当于 2 ** (3 ** 2)
2 ** 3 ** 2
// 512


let a = 1.5;
a **= 2;
// 等同于 a = a * a;

let b = 4;
b **= 3;
// 等同于 b = b * b * b;
```
### 数组拓展
- 判断数组的方法
```js
// 1
Array.isArray(arr)
// 2
Object.prototype.toString.call(arr)
// 3
arr.constructor === Array 
// 4
arr instanceof Array 
```
- 扩展运算符
  - 数组.length=0 就是一个空数组
```js
console.log(...[1, 2, 3])
// 1 2 3

console.log(1, ...[2, 3, 4], 5)
// 1 2 3 4 5
```
- 扩展运算符还可以将字符串转为真正的数组。
```js
[...'hello']
// [ "h", "e", "l", "l", "o" ]
```
- Array.from
  - 只要有length属性的对象都可以转成真正的数组,不够的用 undefined 补充
  - 字符串有length 此方法字符串转换数组 类似 str.split('') 对象没有length 需要指定在转换
  - 还可以接受第二个参数，作用类似于数组的map方法，用来对每个元素进行处理，将处理后的值放入返回的数组。
```js
 let obj = {
    // a:1,
    // b:2,
    // c:3,
    0:'a',
    c:'b',
    3:'c',
    length: 5
  }
  let arr = Array.from(obj)
  console.log(arr)// ["a", undefined, undefined, "c", undefined]

  Array.from(arrayLike, x => x * x);
  // 等同于
  Array.from(arrayLike).map(x => x * x);

  Array.from([1, 2, 3], (x) => x * x)
  // [1, 4, 9]
```
- Array.of()
  - 用于将一组值，转换为数组。
  - Array.of基本上可以用来替代Array()或new Array()
  - Array.of总是返回参数值组成的数组。如果没有参数，就返回一个空数组。
```js
Array.of(3, 11, 8) // [3,11,8]
Array.of(3) // [3]
Array.of(3).length // 1
```
-  copyWithin
  - 在当前数组内部，将指定位置的成员复制到其他位置（会覆盖原有成员），然后返回当前数组
  - 它接受三个参数。
    - target（必需）：从该位置开始替换数据。如果为负值，表示倒数。
    - start（可选）：从该位置开始读取数据，默认为 0。如果为负值，表示倒数。 
    - end（可选）：到该位置前停止读取数据，默认等于数组长度。如果为负值，表示倒数。
    - 只有一个的时候 后面2个值默认选取所有
    - 2个值 开始到结束   3个值 包前不包尾
- fill()
  - fill方法使用给定值，填充一个数组。
  - 数组中已有的元素，会被全部抹去。
  - fill方法还可以接受第二个和第三个参数，用于指定填充的起始位置和结束位置。
```js
['a', 'b', 'c'].fill(7)
// [7, 7, 7]

new Array(3).fill(7)
// [7, 7, 7]

// 注意，如果填充的类型为对象，那么被赋值的是同一个内存地址的对象，而不是深拷贝对象。
let arr = new Array(3).fill([]);
arr[0].push(5);
// [[5], [5], [5]]
```
- entries()，keys() 和 values()
  - keys()是对键名的遍历、values()是对键值的遍历，entries()是对键值对的遍历。
```js
for (let index of ['a', 'b'].keys()) {
  console.log(index);
}
// 0
// 1

for (let elem of ['a', 'b'].values()) {
  console.log(elem);
}
// 'a'
// 'b'

for (let [index, elem] of ['a', 'b'].entries()) {
  console.log(index, elem);
}
// 0 "a"
// 1 "b"
```
-  flat()，flatMap()
  - flat拉平 默认只会“拉平”一层，如果想要“拉平”多层的嵌套数组
  - 可以将flat()方法的参数写成一个整数，表示想要拉平的层数，默认为1。
  - 如果不管有多少层嵌套，都要转成一维数组，可以用 Infinity 关键字作为参数。
  - 如果原数组有空位，flat()方法会跳过空位。
  - flatMap就是map和flat的结合
```js
[1, 2, [3, 4]].flat()
// [1, 2, 3, 4]
[1, 2, [3, [4, 5]]].flat()
// [1, 2, 3, [4, 5]]
[1, 2, [3, [4, 5]]].flat(2)
// [1, 2, 3, 4, 5]
[1, 2, , 4, 5].flat()
// [1, 2, 4, 5]
``` 
### delete 用法
- 用来删除复合类型的属性
```js
// 对象
let obj = {
        'a1':'1',
        'a2':'2',
        'a3':'3',
        'a4':'4',
      }
  delete obj.a1  // {'a2':'2','a3':'3','a4':'4'}
// 数组
let arr = [1,2,3,4,5]
  delete arr[1] // [1,3,4,5]
```
### 对象拓展
- Object.is() 它用来比较两个值是否严格相等，与严格比较运算符（===）的行为基本一致。
- 不同之处只有两个：一是+0不等于-0，二是NaN等于自身。
- 对象不能用for of ,有两个办法
  - Object.entries() 倒下
  - 手动在内部添加Symbol.iterator
```js
 -0 === 0 // true
 NaN === NaN //false

 Object.is(-0,0) //false
 Object.is(NaN,NaN) //true
```
- Object.assign() 合并对象
- 方法的第一个参数是目标对象，后面的参数都是源对象。
- 如果目标对象与源对象有同名属性，或多个源对象有同名属性，则后面的属性会覆盖前面的属性
- 如果传入的不是对象(null,undefined除外,数值和布尔值会被忽略) 会转换成对象
  - 字符串会被转换成数组  重复的将被顶替 后面的把前面的顶替
- 方法实行的是浅拷贝
```js
const target = { a: 1 };
const source1 = { b: 2 };
const source2 = { c: 3 };
Object.assign(target, source1, source2);
target // {a:1, b:2, c:3}
```
- Object.keys()，Object.values()，Object.entries() 
```js
let {keys, values, entries} = Object;
let obj = { a: 1, b: 2, c: 3 };

for (let key of keys(obj)) {
  console.log(key); // 'a', 'b', 'c'
}

for (let value of values(obj)) {
  console.log(value); // 1, 2, 3
}

for (let [key, value] of entries(obj)) {
  console.log([key, value]); // ['a', 1], ['b', 2], ['c', 3]
}
```
### Symbol
- 他是一个原始数据类型 不能用new
- 他接受一个字符串  如果是对象会先调用toString方法转换成字符串
- Symbol函数的参数只是表示对当前 Symbol 值的描述，因此相同参数的Symbol函数的返回值是不相等的。
- 属性名的遍历
  - Symbol 作为属性名，该属性不会出现在for...in、for...of循环中，也不会被Object.keys()、Object.getOwnPropertyNames()、JSON.stringify()返回。
  - Object.getOwnPropertySymbols只能获取 Symbol
  - Reflect.ownKeys 可以获取所有的
- Symbol.for 用来声明Symbol 得到的是一样的
- Symbol有一群内置值
  - Symbol.iterator 等
  - 对象的Symbol.iterator属性，指向该对象的默认遍历器方法。
```js
let s1 = Symbol.for('foo');
let s2 = Symbol.for('foo');

s1 === s2 // true
```
### Set&&Map
- Set 它类似于数组，但是成员的值都是唯一的，可以接受一个数组（或者具有 iterable 接口的其他数据结构）作为参数，用来初始化。
- 方法
  - add(value)方法向 Set 结构加入成员
  - delete(value) 删除某个值，返回一个布尔值，表示删除是否成功。
  - has(value) 返回一个布尔值，表示该值是否为Set的成员。
  - clear() 清除所有成员，没有返回值。
- 数组去重&&字符串去重
- 去重复 比较用的类似 ===  但是NaN加入算重复的
```js
// 数组去重
[...new Set(arr)]
function dedupe(array) {
  return Array.from(new Set(array));
}
dedupe([1, 1, 2, 3]) // [1, 2, 3]
// 字符串去重
[...new Set(string)].join('')
```
- 用 ... 和 Array.from 都可以将Set转换成数组
- 遍历操作
  - keys()：返回键名的遍历器
  - values()：返回键值的遍历器
  - entries()：返回键值对的遍历器
  - forEach()：使用回调函数遍历每个成员
  - 可以用for of
- 实现数组的交集-并集-差集
```js
    let a = new Set([1, 2, 3]);
    let b = new Set([4, 3, 2]);
    // 并集
    let a1 = new Set([...a,...b])
    // 交集
    let a2 = new Set([...a].filter(x=>b.has(x)))
    // 差集
    let a3 = new Set([...a].filter(x=> !b.has(x)))
    console.log(a1,a2,a3,a4)
```
- Map 它类似于对象，也是键值对的集合，但是“键”的范围不限于字符串，各种类型的值（包括对象）都可以当作键
- Object 结构提供了“字符串—值”的对应，Map 结构提供了“值—值”的对应
- 任何具有 Iterator 接口、且每个成员都是一个双元素的数组的数据结构都可以当作Map构造函数的参数。这就是说，Set和Map都可以用来生成新的 Map。
- 实例的属性和操作方法
  - size 属性  size属性返回 Map 结构的成员总数。
  - set(key, value) set方法设置键名key对应的键值为value，然后返回整个 Map 结构。如果key已经有值，则键值会被更新，否则就新生成该键。
  - set方法返回的是当前的Map对象，因此可以采用链式写法。
  - get(key) get方法读取key对应的键值，如果找不到key，返回undefined。
  - has(key) has方法返回一个布尔值，表示某个键是否在当前 Map 对象之中。
  - delete(key) delete方法删除某个键，返回true。如果删除失败，返回false。
  - clear() clear方法清除所有成员，没有返回值。
- 遍历方法 
  - keys()：返回键名的遍历器。
  - values()：返回键值的遍历器。
  - entries()：返回所有成员的遍历器。
  - forEach()：遍历 Map 的所有成员。
- Map 转为数组
```js
const myMap = new Map()
  .set(true, 7)
  .set({foo: 3}, ['abc']);
[...myMap]
// [ [ true, 7 ], [ { foo: 3 }, [ 'abc' ] ] ]
```
- 数组 转为 Map
```js
new Map([
  [true, 7],
  [{foo: 3}, ['abc']]
])
```
- Map 转为对象
```js
function strMapToObj(strMap) {
  let obj = Object.create(null);
  for (let [k,v] of strMap) {
    obj[k] = v;
  }
  return obj;
}

const myMap = new Map()
  .set('yes', true)
  .set('no', false);
strMapToObj(myMap)
// { yes: true, no: false }
```

- 对象转为 Map
```js
function objToStrMap(obj) {
  let strMap = new Map();
  for (let k of Object.keys(obj)) {
    strMap.set(k, obj[k]);
  }
  return strMap;
}

objToStrMap({yes: true, no: false})
// Map {"yes" => true, "no" => false}
```
- Map 转为 JSON
- Map 转为 JSON 要区分两种情况。一种情况是，Map 的键名都是字符串，这时可以选择转为对象 JSON。
```js
function strMapToJson(strMap) {
  return JSON.stringify(strMapToObj(strMap));
}

let myMap = new Map().set('yes', true).set('no', false);
strMapToJson(myMap)
// '{"yes":true,"no":false}'
```
- 另一种情况是，Map 的键名有非字符串，这时可以选择转为数组 JSON。
```js
function mapToArrayJson(map) {
  return JSON.stringify([...map]);
}

let myMap = new Map().set(true, 7).set({foo: 3}, ['abc']);
mapToArrayJson(myMap)
// '[[true,7],[{"foo":3},["abc"]]]'
```
- JSON 转为 Map
```js
function jsonToStrMap(jsonStr) {
  return objToStrMap(JSON.parse(jsonStr));
}

jsonToStrMap('{"yes": true, "no": false}')
// Map {'yes' => true, 'no' => false}
```
- 但是，有一种特殊情况，整个 JSON 就是一个数组，且每个数组成员本身，又是一个有两个成员的数组。这时，它可以一一对应地转为 Map。这往往是 Map 转为数组 JSON 的逆操作。
```js
function jsonToMap(jsonStr) {
  return new Map(JSON.parse(jsonStr));
}

jsonToMap('[[true,7],[{"foo":3},["abc"]]]')
// Map {true => 7, Object {foo: 3} => ['abc']}
```
### 对象 字符串 数组 Set Map互转
- 字符串
```js
  // 字符串 => 数组
  let str = 'abcd'
  console.log(str.split('')) // ['a','b','c','d']
  console.log(Array.from(str)) // ['a','b','c','d']
  console.log([...str]) // ['a','b','c','d']

  // 字符串 => 对象
  let str = 'abcd'
  console.log({...str}){} // {0: "a", 1: "b", 2: "c", 3: "d"}
```
- 数组
```js
  // 数组合并
  let arr = [...arr1,...arr2]

  // 数组 => 字符串
  let arr = ['a','b','c']
  console.log(arr.join('')) //abc 
  let arr = ['a','b','c']
  console.log(JSON.stringify(arr)) //"["a","b","c"]"  
  let arr = ['a','b','c']
  let s = arr.toString()
  let s1 = arr.join()
  console.log(s,s1) // a,b,c a,b,c

  // 数组 => 对象
  let arr = ['a','b','c']
  console.log({...arr}) //{0: "a", 1: "b", 2: "c"}

  // 数组 => Set
  let arr = ['a','b','c']
  console.log(new Set(arr)) //Set(3) {"a", "b", "c"}

  // 数组 => Map 参数里面多一层[]
new Map([ [true, 7], [{foo: 3}, ['abc']] ])
```
- 对象
```js
  // 对象合并
  let obj = {...obj1,...obj2}
  // 对象 => 字符串
  let obj = {a:1}
  console.log(obj.toString()) // [object Object]
  
  // 对象 => 数组
  // 用Array.from 前提 obj参数有length
  let obj = {'0':1,'s':2,length:2}
  console.log(Array.from(obj)) // [1, undefined]
  
  let obj = {'a':'我','b':'你'}
  for (let [key,value] of Object.entries(obj)){
    console.log(key,value)
  }
  // 对象 =>  Map
  function objToStrMap(obj){
    let strMap = new Map()
    for(let [k,v] of Object.entries(obj)){
      strMap.set(k,v)
    }
     return strMap
  }
  objToStrMap({yes: true, no: false})
```
- Set
```js
  // Set => 数组
  let set = new Set([1,2,3,4])
  console.log([...set]) // [1,2,3,4]

  // Set => 对象
  let set = new Set([1,2,3,4])
  console.log({...[...set]})
```
### Proxy 
- 代理
  - get接收的属性 目标对象、属性名和 proxy 实例本身
  - set接收的属性 目标对象、属性名、属性值和 Proxy 实例本身，其中最后一个参数可选
```js
var proxy = new Proxy(target, handler);
handler = {
  get: function (target, key, receiver) {
    console.log(`getting ${key}!`);
    return Reflect.get(target, key, receiver);
  },
  set: function (target, key, value, receiver) {
    console.log(`setting ${key}!`);
    return Reflect.set(target, key, value, receiver);
  }
```
- 下面是 Proxy 支持的拦截操作一览，一共 13 种。
  - get(target, propKey, receiver)：拦截对象属性的读取，比如proxy.foo和proxy['foo']。
  - set(target, propKey, value, receiver)：拦截对象属性的设置，比如proxy.foo = v或proxy['foo'] = v，返回一个布尔值。
  - has(target, propKey)：拦截propKey in proxy的操作，返回一个布尔值。
  - deleteProperty(target, propKey)：拦截delete proxy[propKey]的操作，返回一个布尔值。
  - ownKeys(target)：拦截Object.getOwnPropertyNames(proxy)、Object.getOwnPropertySymbols(proxy)、Object.keys(proxy)、for...in循环，返回一个数组。该方法返回目标对象所有自身的属性的属性名，而Object.keys()的返回结果仅包括目标对象自身的可遍历属性。
  - getOwnPropertyDescriptor(target, propKey)：拦截Object.getOwnPropertyDescriptor(proxy, propKey)，返回属性的描述对象。
  - defineProperty(target, propKey, propDesc)：拦截Object.defineProperty(proxy, propKey, propDesc）、Object.defineProperties(proxy, propDescs)，返回一个布尔值。
  - preventExtensions(target)：拦截Object.preventExtensions(proxy)，返回一个布尔值。
  - getPrototypeOf(target)：拦截Object.getPrototypeOf(proxy)，返回一个对象。
  - isExtensible(target)：拦截Object.isExtensible(proxy)，返回一个布尔值。
  - setPrototypeOf(target, proto)：拦截Object.setPrototypeOf(proxy, proto)，返回一个布尔值。如果目标对象是函数，那么还有两种额外操作可以拦截。
  - apply(target, object, args)：拦截 Proxy 实例作为函数调用的操作，比如proxy(...args)、proxy.call(object, ...args)、proxy.apply(...)。
  - construct(target, args)：拦截 Proxy 实例作为构造函数调用的操作，比如new proxy(...args)。
### Reflect
- 将Object对象的一些明显属于语言内部的方法（比如Object.defineProperty），放到Reflect对象上，从Reflect对象上可以拿到语言内部的方法。
- Reflect对象一共有 13 个静态方法。
  - Reflect.apply(target, thisArg, args)
  - Reflect.construct(target, args)
  - Reflect.get(target, name, receiver)
  - Reflect.set(target, name, value, receiver)
  - Reflect.defineProperty(target, name, desc)
  - Reflect.deleteProperty(target, name)
  - Reflect.has(target, name)
  - Reflect.ownKeys(target)
  - Reflect.isExtensible(target)
  - Reflect.preventExtensions(target)
  - Reflect.getOwnPropertyDescriptor(target, name)
  - Reflect.getPrototypeOf(target)
  - Reflect.setPrototypeOf(target, prototype)
- Reflect.get(target, name, receiver) 
  - Reflect.get方法查找并返回target对象的name属性，如果没有该属性，则返回undefined。
  - 如果第一个参数不是对象，Reflect.get方法会报错。
```js
var myObject = {
  foo: 1,
  bar: 2,
  get baz() {
    return this.foo + this.bar;
  },
}
Reflect.get(myObject, 'foo') // 1
Reflect.get(myObject, 'bar') // 2
Reflect.get(myObject, 'baz') // 3
```
- 如果name属性部署了读取函数（getter），则读取函数的this绑定receiver。
```js
var myObject = {
  foo: 1,
  bar: 2,
  get baz() {
    return this.foo + this.bar;
  },
};

var myReceiverObject = {
  foo: 4,
  bar: 4,
};

Reflect.get(myObject, 'baz', myReceiverObject) // 8
```
- Reflect.set(target, name, value, receiver) 
  - Reflect.set方法设置target对象的name属性等于value。
```js
var myObject = {
  foo: 1,
  set bar(value) {
    return this.foo = value;
  },
}

myObject.foo // 1

Reflect.set(myObject, 'foo', 2);
myObject.foo // 2

Reflect.set(myObject, 'bar', 3)
myObject.foo // 3
```
### Iterator
- 作用
  - 一是为各种数据结构，提供一个统一的、简便的访问接口；
  - 二是使得数据结构的成员能够按某种次序排列；
  - 三是 ES6 创造了一种新的遍历命令for...of循环，Iterator 接口主要供for...of消费。
- 原理
  - 1、创建一个指针对象，指向当前数据结构的起始位置
  - 2、第一次调用指针对象的next方法，可以将指针指向数据结构的第一个成员。
  - 3、第二次调用指针对象的next方法，指针就指向数据结构的第二个成员。
  - 4、不断调用指针对象的next方法，直到它指向数据结构的结束位置。
  - 每次调用next方法都会返回{value:'xx',done:false/ture}  ture代表结束
- 默认的 Iterator 接口部署在数据结构的Symbol.iterator属性，或者说，一个数据结构只要具有Symbol.iterator属性，就可以认为是“可遍历的”
- Symbol.iterator属性本身是一个函数，就是当前数据结构默认的遍历器生成函数
- 原生具备 Iterator 接口的数据结构如下。
  - Array
  - Map
  - Set
  - String
  - TypedArray
  - 函数的 arguments 对象
  - NodeList 对象
- 给对象实现一个iterator
```js
  let obj = {
    data:['hello','word'],
    [Symbol.iterator]:function(){
      let that = this
      let index = 0
      return {
        next:function(){
          index += 1
          if(index>2){
            return {value:that.data[index-1],done:true}
          }else{
            return {value:undefined,done:false}
          }
        }
      }
    }
  }
  for (let k of obj) {
    console.log(k)
  }
```

## for in && for of
- for in 
  - 数组的键名是数字，但是for...in循环是以字符串作为键名“0”、“1”、“2”等等。
  - for...in循环主要是为遍历对象而设计的，不适用于遍历数组。
- for of
  - 不同于forEach方法，它可以与break、continue和return配合使用。
  - break用于完全结束一个循环，跳出循环体执行循环后面的语句。
  - continue是跳过当次循环中剩下的语句，执行下一次循环。
  - return一般用于函数
```js
for (var n of fibonacci) {
  if (n > 1000)
    break;
  console.log(n);
}
```
### generator
- 由于 Generator 函数返回的遍历器对象，只有调用next方法才会遍历下一个内部状态，所以其实提供了一种可以暂停执行的函数。yield表达式就是暂停标志。
```js
function* helloWorldGenerator() {
    yield 'hello';
    yield 'world';
    return 'ending';
  }
  
  var hw = helloWorldGenerator();
  console.log([...hw]) // ["hello", "world"]

  console.log(hw.next()) // {value: "hello", done: false}
  console.log(hw.next()) // {value: "world", done: false}
  console.log(hw.next()) // {value: "ending", done: true}
  console.log(hw.next()) // {value: undefined, done: true}
```
### Decorator
- 下面代码@就是一个装饰器 将MyTestableClass传递给@testable, testable函数就能接收到
```js
@testable
class MyTestableClass {
  // ...
}

function testable(target) {
  target.isTestable = true;
}

MyTestableClass.isTestable // true
```
