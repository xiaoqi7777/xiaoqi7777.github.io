# ts
[[toc]]
- 安装ts cnpm i -g typescript@3.7.2
- tsc -v 查看版本
- tsc xxx.ts 会编译文件
- tsc --init 创建ts配置文件
## 配置文件
```js
compilerOptions{
   "target": "es5", // 将ts文件编译成es5
   "module": "commonjs", // 将所有语法编译成commonjs语法
   "strict"true,
   "esModuleInterop":true,// 通过es6模块的方式导入commonjs模块
}
```
## 配置脚本
```js
    "build": "tsc",
    "build:watch": "tsc --watch"
```

## base
- 变量冲突 ts文件声明的变量 默认是全局的  内部有name变量会冲突,处理办法在顶部添加`export { }`使其变成局部变量
- 如代码里面有export import 之类的代码 那么这个文件变成一个模块
```js
export { }
// `Cannot redeclare block-scoped variable 'name'.` 
let name:string = '111'
let age: number = 10
// 数组内只能放字符串  下面有2中方式声明
let hobbies:string[]=['s','1']
let interests:Array<string> = ['4','5']
// 元祖 类似数组  他是一个长度和类型都固定的数组,数组类型是固定的,元祖表示固定的结构,数组表示 一个列表
let point:[number,string]=[100,'222']
// 枚举 考虑变量的所有可能值 用单词表示它的每一个值
enum Week{
  MONDAY = 1,
  TUESDAY = 8
}
// 常数枚举
const enum Colors{
  Red,//他的值只能是0
  Yellow//1
}
// 任意类型
// 非空断言 root可能是null的时候   root!表示肯定不会是null  就可以在root后面加东西了
// ts 为dom提供了一整套的类型声明   
let root : HTMLElement|null = document.getElementById('root')
root!.style.color='red'

// null undefined
// null 空 undefined 未定义
// 他们是其他类型的子类型
// 要修改配置 strictNullChecks:false
let num1:string = null;
let num1:string = undefined;

// void 类型 空的 没有
function greeting(name:string):void{
  return null
}
// never 永远不
// never 是其他类型的子类型 代表不会出现的值
// 函数内部永远会抛出错误 导致函数无法正常结束
```
## 函数
```js
// 定义
function hello(name:string):void{}
// type 用来定义一个类型或者类型别名
type GetU = (fi:string) => void
// 函数表达式
let getUserName:GetU = function(fi:string):string{
  return fi
}
// 可选参数 
function print(name:string,age?:number){

}
print('zss')
print('zss',12)
// 默认参数
function ajax(url:string,method:string='GET'){}
ajax('/user')
// 剩余参数
function sum(...number:Array<number>){
  return number.reduce((a,b)=>a+b,0)
}
// 函数重载
// 函数的传递的参数做区分
function attr(val:string):void
function attr(val:number):void
function attr(val:any):void{
  if(typeof val === 'string'){
    // ...
  }else if(typeof val === 'number'){
    // ....
  }
}
```
## 类
namespace 可以包裹起来
```js
namespace c{
  class Person{
    constructor(public name:string){

    }
  }
  let p = new Person('xx')
  p.name = 'xxx'
}
```
## 继承
- 子类继承父类后子类的实例上就拥有了父类中的属性和方法
- 访问修饰符 public protected private
## 装饰器
- 如果装上的是普通属性的话 那么这个target指向类的原型 
- 如果装饰的是一个类的属性static 那么这个target指定类的定义
## 接口
- 接口就是用来约束用的
- 任意属性
- 约束对象 
```js
interface Pl{
  [propName:string]:number
}
let obj:Pl={
  x:1,
  y:2
}
```
- 约束数组和对象
```js
interface pl{
  [index:number]:string
}
let arr:p1=['1','2']
let obj:p1={
  1:'1',
  2:'2'
}
```
- 接口的继承
```js
interface s1{
  speak():void
}
interface s2 extends s1{
  speak1():void
} 
// 继承了都要实现
class Person implement s2{
  speak(){}
  speak1(){}
}
```
- 约束函数
```js
interface Discount{
  (price:number):number
}
let cost:Discount = function(price:number):number{
  return price*0.8
}
```
- 约束类
```js
interface speak{
  name:string,
  speak(word:string):void
}
class Dog implements speak{
  name:string;
  speak(){}
}
```
- 约束构造函数
```js
class Animal{}
interface wi{
  new(name:string):Animal
}
function cr(clazz:wi,name:string){
  return new clazz(name)
}
let a = cr(Animal,'xxx')
```
## 泛型
- 泛型是指在定义函数 接口 类的时候 不预先指定具体类型 而在使用的时候在指定类型的一种特性
- 泛型T 作用只限于函数内部使用 
- 其实就是一个占位符 用的时候 传入啥 这个占位符就是啥
```js
  function cr<T>(length:number,value:T):Array<T>{
    let rs:Array<any> = [];
    for(let i = 0 ;i<length;i++){
      rs[i] = value
    }
    return rs
  }
  let r1 = cr<string(3,'x')
```

## interface&&type
- interface定义一个实实在在的接口,他是一个真正的类型,接口创建了一个新的名字，它可以在其他任意地方被调用，类型别名并不是创建新的名字,类型不能被extends和implements 这个时候一般用接口
- type一般用在定义别名,并不是真正的类型,当我们需要使用联合类型或者元祖类型的时候 类型别名会更合适

