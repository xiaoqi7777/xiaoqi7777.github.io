# 正则
  [[toc]]

  ## 创建 两种方式
  - 1、 直接量定义  /正则/修饰符  
  - 2、 对象定义    new RegExp(字符串,修饰符)
    - 传递的是字符串,需要对特殊字符进行双重转义
  ### 对比
  ```js
    字面量模式         等价的字符串
    /\[bc\]at/  =>  "\\[bc\\]at"
    /\d.\d{1,2}/  =>  "\\d.\\d{1,2}"

    let path = '/user/:uid/:name';
    let reg1 = /\:\w+/g
    console.log(reg.source) => \:\w+
      
    // 这里注意 \\w  我们要他的\  里所有的第一个\代表转义 最终我们要得到(\w) 所以就是\\  
    let reg2 = new RegExp('\:\\w+', 'g')

  ```  
  
  ## 修饰符
  - 常用的就i忽略大小写,g全局匹配
  
  ## 转义字符
  ```js 
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
    \. 真正的点  匹配除\n换行以外的任意单字符  匹配包括\n在内的所有字符  使用(.|\n)
  ```
  ## 量词
  ```js

  所有的量词都需要放在{n,m}里面
  n,m代表数字

  {n}     前一项重复n次
  {n,}    前一项至少重复n次，最多不限
  {n,m}   前一项至少重复n次,最多重复m次

  +      前一项至少重复1次，最多不限     等价{1,}
  ？     前一项至少重复0次，最多重复1次，也就是说前一项是可选的，等价于{0,1}
  *      前一项至少重复0次，最多不限，也就是说前一项是可选的，等价{0,}
  
  ^      它出现在中括号里代表排除的意思,在中括号的外面标示字符串开始的位子
  $      字符串结束的位子

  ```
## 正则属性
- 正则对象的属性
  - $n n代表()内匹配数据
  - RegExp 对象上的方法  RegExp.$n
    - 在replace方法里用 RegExp.$1 匹配的都是最后一个 可以用 arguments[n] 获取,但是不要用箭头函数(无arguments)
    - 当正则 匹配后就可以用(不匹配拿不到) RegExp.$n 匹配分组的数据  n代表数字 1代表第一个分组
  - 
- 正则原型上的属性
```js
  global 布尔值,表示是否设置了g标志
  ignoreCase 布尔值,表示是否设置了i标志
  lastIndex 整数,表示开始搜索下一个匹配项的字符位置,从0开始(带g才有效果 不然每次都是从头开始)
  multiline 布尔值 表示是否设置了m表示
  source 正则表达式的字符串表示
  var pattern = /\[bc\]at/i;
  console.log(pattern.global) => false
  console.log(pattern.ignoreCase) => true
  console.log(pattern.multiline) => false 
  console.log(pattern.lastIndex) => 0
  console.log(pattern.source) => "\[bc\]at"
```

## 正则方法
- 匹配规则:默认前一项的结束是下一项的开始
  ```js
    exec 匹配内容
      不带g
        功能和match 是一样 第一个是匹配的内容 第二个是分组内容
      带g
        match 带g　返回的数组　全是匹配的内容　和不带g返回的　完全不一样
        exec　要执行一次　和　不带是一样的　只会匹配到第一个　
        　　　再次　执行的时候　会匹配到第二个(索引和匹配的内容　跟着变化)，　他们返回的数据格式　和不带g是一样的
      let str = '/url1/:id/:name'
      let reg = /\:([^\/]+)/g
      let a = reg.exec(str)
      let b = reg.exec(str)
      console.log(a, b)
    test
      正则.test(str)
      返回布尔值
  ```

## 字符串方法使用正则
- match 和 exec 主要是做匹配数据 replace 也可以匹配数据 但他主要是做替换
```js
  match 匹配内容
    不带g 返回数组 第一个是匹配的内容 第二个开始 就是()内的匹配内容 index/input等 以文本下标显示不占数字的length 
          在使用数组方法的时候 文本下标 不会循环出来
          小技巧: 在多个分组的时候 索引从一开始到最后 全是分组内容
      
    带g   返回数组 里面全是匹配的内容
    let str = '/url1/:id/:name'
    let reg = /\:([^\/]+)/
    let match = str.match(reg)
    console.log(match)
  replace   
    函数接收的参数 (返回替换后的内容,原来的不变) 
      第一个是匹配到的内容 
      第二个是分组匹配的内容(若多个分组 下面的索引往后靠,要是没有就往前挪)
      第三个是索引
      第死个是原字符串
    let str = '/url1/:id/:name'
    let reg = /\:([^\/]+)/
    str.replace(reg, function($1, $2, $3, $4) {
        console.log($1, $2, $3, $4)
    })
  split 
    用来切割字符串 将字符串转换成数组
    第一个可以是字符串 也可以是 正则
```

## 中括号
```js
[]              匹配中括号里的任意一个字符,只代表一个字符
[1-9]           区间的写法，标示从1到9之间的任意的一个字符
[a-z]           a-z之间的任意一个小写字母
[A-Z]           A-Z之间的任意一个大写字母 
[a-zA-Z0-9]     匹配a-z,A-Z,0-9(匹配任何字母和数字)
^               排除掉某个字符(仅仅用在中括号内表达这个意思)
[\u4e00-\u9fa5] 中文的区间,包含所有的汉字

red|blue|green 标示red,blue,green 这三个单词中的任何一个(至少)
```
 
## 量词种类

### 贪婪
  - 尽量多的匹配 
    - ?匹配0或者1个 贪婪模式先匹配1个 当1匹配不到的时候 在从上一次匹配的下一个位子开始 匹配0
    - *匹配0或者至多个 规律同上
    - +匹配1或者至多个 规律同上
    - x{n,m} 和 x{n,} 同上
  - x?  
    ```js
       aaa  a?a => aa a
    ```   
  - x*
    ```js
       aaa  a*a => ['aaa']
       aaa1a  a*a => ['aaa','a']  
    ```
  - x+ 
    ```js
       aaa  a+a => ['aaa']
       aaa1a  a+a => ['aaa']
       aaa1aa  a+a => ['aaa','aa']
  ```
  - x{n,m}  x{n,}
    -  同上 例子就写了
### 懒惰
  - 尽量少匹配
  - x??
    ```js
      aaa  a??a =>  ['a','a','a']
    ```
  - x*?
    ```js
      aaa a*?a => ['a','a','a']
    ```
  - x+?
    ```js
      aaa a+?a => ['aa']
    ```
## 捕获组
 -  捕获组:使用括号作为单独的单元来对待的一种方式,可通过程序方便地拿到分组对应的匹配内容
 - (\d\d)\1 == (\d\d)\d\d  也就是说是一个ABAB形式的
```js
// 1、匹配连续出现的数字
let str = 'aa1212ss'
let rs = str.match(/(\d\d)\1/g)
console.log(rs) => [1212]
// 2、匹配html标签
let str = '<div id='ss'><a>123</a></div>'
let rs = str.match(/<([a-z]+).+?<\/\1>/)
console.log(rs)
```
## 非捕获组
  - 分组括号里第一个是?就是非捕获组(不计算在分组内) 
  - 好处 不会讲匹配到的字符存储在内存种 从而节省内存
  - 一般常用的就是 (?:xxx)
```js
let str = 'ad123asd'
let rs = str.match(/(?:\d)/)
console.log(rs) // 结果没有分组的内容 数组长度是1
```

## ?=
- 前瞻 exp1(?=exp2) 查找exp2前面的exp1
- 后顾 (?<=exp2)exp1 查找exp2前面的exp1(js不支持)
- 负前瞻 exp1(?exp2) 查找后面不是exp2的exp1
- 负后瞻 (?<!exp2)exp1 查找前面不是exp2的exp1(js不支持)