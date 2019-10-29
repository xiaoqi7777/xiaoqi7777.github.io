# js算法&&经典考题
  [[toc]]
## 经典题目
### 深拷贝

- 只考虑对象
```js
let obj = { a:1,b:{name:'sg'}}
let rs = JSON.parse(JSON.stringify(obj))
```
- 只考虑对象和数组的情况下
```js
let obj = { a:1,b:{name:'sg'},c:[{a:1},{b:2}] }
function deepClone(obj){
  if((typeof obj !== 'object')||(obj == null)) return obj
  let rs = Array.isArray(obj)?[]:{}
  for(let key in obj){
    if(obj.hasOwnProperty(key)){
      rs[key] = deepClone(obj[key])
    }
  }
  return rs
}
```
- 多种情况
```js
function deepClone(obj){
  if(typeof obj !== 'object') return obj;
  if( obj == 'null') return obj;
  if(obj instanceof RegExp) return new RegExp(obj);
  if(obj instanceof Date) return new Date(obj);
  let newObj = new obj.constructor
  for(let k in obj){
    newObj[k] = deepClone(obj[k])
  }
  return newObj
}
console.log(deepClone(obj))
```
### 数组内的对象过滤
- 给一类数组 [{"51":1},{"51":2},{"37":1},{"37":2},{"37":3}] 按照对象里面的key进行过滤,后面的替换前面出现 最终得到[{"51":2},{"37":3}]
```js

function fn(rs){
    return rs.reduce((a,b)=>{
      if(!a.some(item=> Object.keys(item)[0] == Object.keys(b)[0])){
        a.push(b)
      }else{
        a.forEach((item,index)=>{
          if(Object.keys(item)[0] == Object.keys(b)[0]){
            a[index] = b
          }
        })
      }
      return a
  },[])
}
fn([{"51":1},{"51":2},{"37":1},{"37":2},{"37":3}])
```
### apply call bind原理
- apply和call 基本一样 apply接收的是数组，call接收的是每一个参数，传递进去的都是一个一个的参数
- eval(`xxx `) 语法会直接执行字符串里面的代码
- `${[1,2]}` == '1,2'  ,`${}` 能将数组转换成字符串 
- a = (1,2,n)  =>  a===n 
```js
function fn (a,b,c,d){
  console.log('=>',a,b,c,d)
}

fn.call({x:1000},1,2,3,4,5)

Function.prototype.mycall = function(context,...args){
  context = Object(context)?context:window;
  context.fn = this
  if(!args){
    context.fn()
  }
  // `${args}` 会把数组转换成string 隐式转换 
  let rs = eval(`context.fn(${args})`)
  delete context.fn;
  return rs
}

fn.mycall({x:1000},1,2,3,4,5)

Function.prototype.myApply = function(context,args){
  context = Object(context)?context:window;
  context.fn = this
  if(!args){
    context.fn()
  }
  let rs = `eval(context.fn(${args}))`
  delete context.fn;
  return rs
}

fn.myApply({x:1000},[1,2,3,4,5])

Function.prototype.myBind = function(context){
  let bindArgs = Array.prototype.slice.call(arguments,1)
    let that = this
  function fn(){}
  fn.prototype = this.prototype
  function fBound(){
    let args = Array.prototype.slice.call(arguments)
    return that.apply(this instanceof fBound?this:context,bindArgs.concat(args))
  }
  fBound.prototype = new fn()
  return fBound
}
let a = fn.myBind({x:1000},2)
a(1)
```

### 将数组随机打乱
```js
// 这个性能不好
function fn(arr){
 arr.sort(()=>Math.random()>0.5)
 return arr
}

function fn1(arr){
  for(let i=0;i<arr.length;i++){
    let j = i + Math.floor(Math.random()*(arr.length-i));
    [arr[j],arr[i]] = [arr[i],arr[j]]
  }
  return arr
}

```
## 基础算法-字符串
### 找连续字符串问题
- 给定一个字符串 s，计算具有相同数量0和1的非空(连续)子字符串的数量，并且这些子字符串中的所有0和所有1都是组合在一起的。
```js
输入: "00110011"
输出: 6
解释: 有6个子串具有相同数量的连续1和0：“0011”，“01”，“1100”，“10”，“0011” 和 “01”。

// 找规律
写出所有情况，然后找出规律
00110011--->0011
0110011 --->01
110011 --->1100
10011 --->10
0011 --->0011
011 --->01
11 --->
1 --->

输入: "10101"
输出: 4
解释: 有4个子串：“10”，“01”，“10”，“01”，它们具有相同数量的连续1和0。
```

```js
function countBinarySubstrings(str){
  let arr = []
  let match = function(str){
    let j = str.match(/^(0+|1+)/)[0]
    let i = (j[0]^1).toString().repeat(j.length)
    let reg = new RegExp(`(${j}${i})`)
    if(reg.test(str)){
      return RegExp.$1
    } else {
      return ''
    }
  }

  for(let i=0;i<str.length;i++){
    let rs = match(str.slice(i))
    if(rs){
      arr.push(rs)
    }
  }
  return arr
}
countBinarySubstrings('110011')
```
### 反转字符串中的单词
- 给定一个字符串，你需要反转字符串中每个单词的字符顺序，同时仍保留空格和单词的初始顺序。


示例

输入: "Let's take LeetCode contest" 输出: "s'teL ekat edoCteeL tsetnoc"  注意：在字符串中，每个单词由单个空格分隔，并且字符串中不会有任何额外的空格。

```js
var reverseWords = function(s) {
  return s.split(' ').map(item=>{
      return item.split('').reverse().join('');
  }).join(' ');
};
```
```js
var reverseWords = function(s) {
  // 体现出split两种用法都清楚
  return s.split(/\s/g).map(item=>{
      return item.split('').reverse().join('');
  }).join(' ');
};
```
```js
var reverseWords = function(s) {
  // 使用match来做（大于一个单词或者'的集合的数组）
  return s.match(/[\w']+/g).map(item=>{
      return item.split('').reverse().join('');
  }).join(' ');
};
```

## 基础算法-数组
### 公式运算(电话号码的组合)
给定一个仅包含数组2-9的字符串，返回所有他能表示的字母组合，

给出的数字到字母的影射如下，1不对应任何字母

<img :src="$withBase('/img/telephone.png')" >

比如

输入："23" 输出：["ad", "ae", "af", "bd", "be", "bf", "cd", "ce", "cf"]. 说明: 尽管上面的答案是按字典序排列的，但是你可以任意选择答案输出的顺序。
```js
let fn = (str)=>{
  let rsArr = str.split('')
  let map = ['','','abc','def','ghi','jkl','mno','pqrs','tuv','wxyz']
  if(str.length<2) return
  let code = []
  rsArr.forEach(item => {
    code.push(map[item])
  });
  let comb = (code)=>{
    let tmp = []
    for(let i=0;i<code[0].length;i++){
      for(let j=0;j<code[1].length;j++){
        tmp.push(`${code[0][i]}${code[1][j]}`)
      }
    }
    return tmp
  }
  return comb(code)
}
console.log(fn('29'))
```
## 排序

### 冒泡排序
- 先把最大值冒出来，再把倒数第二大的冒出来，以此类推
- 比较相邻的元素。如果第一个比第二个大，就交换他们两个。
- 对每一对相邻元素作同样的工作，从开始第一对到结尾的最后一对。这步做完后，最后的元素会是最大的数。
```js
let fn = (str)=>{
  let len = str.length
  for(let i=0;i<len-1;i++){
    for(let j=i+1;j<len;j++){
      if(str[i]>str[j]){
        [str[i],str[j]]=[str[j],str[i]]
      }
    }
  }
  return str
}
let a = fn([123,41,423,22,3,131,123,22,1,3])
console.log(a)
```

### 选择排序
- 选中最小的值的索引，和第一个交换，再选中第二小的值，和第二个交换，以此类推
- 首先在未排序序列中找到最小（大）元素，存放到排序序列的起始位置。
- 再从剩余未排序元素中继续寻找最小（大）元素，然后放到已排序序列的末尾。
- 重复第二步，直到所有元素均排序完毕。
```js
function selectionSort(arr){
  let index;
  let len = arr.length
  for(let i=0; i < len-1; i++){
    index = i
    for(let k=i; k <len; k++){
      if(arr[index]>arr[k]){
        index = k
      }  
    }
    [arr[i],arr[index]] = [arr[index],arr[i]]
  }
  return arr
}
let a = selectionSort([2,31,1,1231,112,12,3])
console.log(a)
```
### 数组中的第K个最大元素
- 在未排序的数组中找到第 k 个最大的元素。请注意，你需要找的是数组排序后的第 k 个最大的元素，而不是第 k 个不同的元素。
```js
示例 1:
输入: [3,2,1,5,6,4] 和 k = 2
输出: 5

示例 2:
输入: [3,2,3,1,2,4,5,5,6] 和 k = 4
输出: 4

export default (arr,k)=>{
    return arr.sort((a,b)=>b-a)[k-1]
}

export default((arr,k)=>{
  let index;
  let len = arr.length
  for(let i=0;i<len-1;i++){
    index = i
    for(let k=i;k<len;k++){
      if(arr[index]<arr[k]){
        index = k
      }
    }
    [arr[index],arr[i]] = [arr[i],arr[index]]
  }
  return arr[k-1]
})
```