# vue 汇总

**安装**

```javascript
1、安装淘宝镜像
  npm install -g cnpm --registry=http://registry.npm.taobao.org
2、安装vue-cli
  npm install -g vue-cli
3、初始化vue项目
  vue init webpack firstApp
4、安装依赖包
  npm install  
```

**常用api**

[[toc]]

## 指令

指令一般作用在html中

- v-show
- v-if

  一般来说，v-if 有更高的切换开销，而 v-show 有更高的初始渲染开销。因此，如果需要非常频繁地切换，则使用 v-show 较好；如果在运行时条件很少改变，则使用 v-if 较好。
- v-else

  v-else 元素必须紧跟在带 v-if 或者 v-else-if 的元素的后面，否则它将不会被识别。 v-else-if类似

```javascript
  <div v-if="type === 'A'">
    A
  </div>
  <div v-else-if="type === 'B'">
    B
  </div>
  
  <h1 v-show="ok">Hello!</h1>
```

- v-for

  基于源数据多次渲染元素或模板块,一般要添加:key做标识 用来数据缓存

```javascript
<div v-for="(item,index) in items" :key="index">
  {{ item.text }}
</div>
```


- v-on

  一般使用缩写 @

  常用搭配的修饰符

:::tip
  .stop - 调用 event.stopPropagation()。

  .prevent - 调用 event.preventDefault()。

  .self - 只当事件是从侦听器绑定的元素本身触发时才触发回调。
:::


```javascript
   click 为事件名 btn为触发时间名执行的函数

  <!-- 方法处理器 根据需求传参数  $event是固定写法代表事件源 e -->
  <button v-on:click="btn('hello', $event)"></button>

  <!-- 停止冒泡 -->
  <button @click.stop="btn"></button>

  <!-- 阻止默认行为 -->
  <button @click.prevent="btn"></button>

  <!-- 对象语法 (2.4.0+) -->
  <button v-on="{ mousedown: doThis, mouseup: doThat }"></button>

```

- v-bind
::: tip
  value='1'  1是字符串

  :value='1' 1是数字类型
:::
  一般使用缩写 :

  动态地绑定一个或多个特性，或一个组件 prop 到表达式。

  在绑定 class 或 style 特性时，支持其它类型的值，如数组或对象。(一般不写内联样式))

```javascript
  <!-- 绑定一个属性 -->
  <img v-bind:src="imageSrc">

  <!-- 缩写 -->
  <img :src="imageSrc">

  <!-- class 绑定 对象时 isRed为ture class才为red 数组时 可以显示多个 -->
  <div :class="{ red: isRed }"></div>
  <div :class="[classA, classB]"></div>
  <div :class="[classA, { classB: isB, classC: isC }]">

  <!-- prop 绑定。“prop”必须在 my-component 中声明。-->
  <my-component :prop="someThing"></my-component>

  <!-- 通过 $props 将父组件的 props 一起传给子组件 -->
  <child-component v-bind="$props"></child-component>
```

- v-model

数据双向绑定

:::tip
  .lazy - 取代 input 监听 change 事件

  .number - 输入字符串转为有效的数字

  .trim - 输入首尾空格过滤
:::

```javascript
  <input v-model="message" placeholder="edit me">
  <p>Message is: {{ message }}</p>
```

## 特殊特性
- ref

  在html 定义ref名字, 在this.$ref.名字 可以获取此元素的dom

  因为 ref 本身是作为渲染结果被创建的，在初始渲染的时候你不能访问它们

  它们还不存在！$refs 也不是响应式的，因此你不应该试图用它在模板中做数据绑定

```javascript
  <p ref="p">hello</p>
  
  <scrip>
     p元素的dom=>this.$refs.p
  </scrip>

```

- slot

  插槽: 一般分有带名字和不带名字的插槽
  作用: 一个可以传值的复用代码片段

```javascript
  我们希望的
  <div class="container">
    <header>
      <!-- 我们希望把页头放这里 -->
    </header>
    <main>
      <!-- 我们希望把主要内容放这里 -->
    </main>
    <footer>
      <!-- 我们希望把页脚放这里 -->
    </footer>
  </div>

  A组件 需要引入slot组件
  <Slot class="container">
    <header>
      <slot name="header"></slot>
    </header>
    <main>
      <slot></slot>
    </main>
    <footer>
      <slot name="footer"></slot>
    </footer>
  </Slot>

  slot 组件
  <div>
    <template slot="header">
      <h1>这里slot有名字 对应header</h1>
    </template>

    <p>这里没有名字 对应 slot </p>
    <p>这里没有名字 对应 slot----</p>

    <template slot="footer">
      <p>这里slot有名字 对应footer</p>
    </template>
  </div>
  
  结果
  <div class="container">
    <header>
      <h1>这里slot有名字 对应header</h1>
    </header>
    <main>
      <p>这里没有名字 对应 slot </p>
      <p>这里没有名字 对应 slot----</p>
    </main>
    <footer>
      <p>这里slot有名字 对应footer</p>
    </footer>
  </div>
```

- 作用域插槽(没有名字的例子)
```javascript
  slot 组件 
  <div>
    <template slot-scope="data">
      <p>slot组件默认的数据<p>
      <h1>传递进来的数据：{{data.msg}}</h1>
    </template>
  </div>
  
  A组件 引用
  <Slot>
    <div class='container'>
      <slot msg='A组件的的数据'>
    </div>
  </Slot>
  
  结果
  <div>
    <div class='container'>
      <p>slot组件默认的数据<p>
      <h1>传递进来的数据：A组件的的数据</h1>
    </>
  </div>

```

## 数据

- data

  组件的定义数据只接受 function

  Vue 将会递归将 data 的属性转换为 getter/setter，从而让 data 的属性能够响应数据变化。

  对象必须是纯粹的对象 (含有零个或多个的 key/value 对)

``` javascript
data(){
  return{
    key1:'data1',
  }
}
```
- props

  props 可以是数组或对象，用于接收来自父组件的数据

:::tip
二选一

  为数组 简单粗暴 只接收值

  为对象 可以检测类型和一些验证
:::
```javaScript
  父组件传递heigth和age
  props:['height','age']
  props:{
    height:Number,
    age:{
      type:Boolean,//类型
      required:true，//必须传入
      default:0,//默认值为0
      validator:function(value){
        return value >0
      }//校验
    }
  }
```
- computed

  计算,特点有缓存，多次取值只会执行一次

```javascript
  data(){
    return{
      a:1
    }
  }
  computed: {
    // 仅读取
    aDouble: function () {
      return this.a * 2
    },
    // 读取和设置
    aPlus: {
      get: function () {
        return this.a + 1
      },
      set: function (v) {
        this.a = v - 1
      }
    }
```
::: tip
  注意:
:::
- watch

  监视,一个对象，键是需要观察的表达式，值是对应回调函数

  值也可以是方法名，或者包含选项的对象

  初次绑定的时候 是不会执行的

```javascript
  data(){
    return{
      a:1,
      b:{
        c:{
          d:2
        }
      }
    }
  }
  watch: {
    // 监视 a 浅度 下面是三种函数的写法
    a:(newVal, oldVal)=>{
      console.log(newVal, oldVal)
    },
    // 多层的时候 深度  handler/immediate/deep 固定语法
    b: {
      handler:function(newVal,oldVal){

      },
      immediate:ture //绑定的时候 就会执行  为false的时候只有在变化的时候才执行
      deep:true//为ture的时候 才能做深度监听 b.c赋值 否则只能监听b的变化
    }
    <!-- 要是监听 b.c  要加'' -->
    'b.c'(newVal, oldVal)=>{
      console.log(newVal, oldVal)
    },
  }
```
- methods

  方法(函数一般丢在这儿执行)

```javascript

  <div @lick='plus'>按钮</div>

  data(){
    return{
      a:1,
    }
  }
  methods: {
    plus: function () {
      this.a++
    }
  }
```

## 常用api

- nextTick

  在下次 DOM 更新循环结束之后执行延迟回调。在修改数据之后立即使用这个方法，获取更新后的 DOM。
```javascript
  // 修改数据
  vm.msg = 'Hello'
  // DOM 还没有更新
  Vue.nextTick(function () {
    // DOM 更新了
  })
```

- filter

  注册或获取全局过滤器。
```javascript

  <div>{a | filter}}</div>

  // 注册
  Vue.filter('my-filter', function (value) {
    //这里处理 a 的指  完事后 返回一个新的给他
  })

```

## 实例属性和方法

- 属性(vm/this)
``` javascript
  this.$el          当前组件的根 DOM 元素。
  this.$parent      父实例，如果当前实例有的话
  this.$root        当前组件树的根 Vue 实例
  this.$childewn    当前实例的直接子组件
  this.$slots       用来访问被插槽分发的内容
                    每个具名插槽 有其相应的属性 (例如：slot="foo" 中的内容将会在
                    vm.$slots.foo 中被找到)。default 属性包括了所有没有被包
                    含在具名插槽中的节点。
  this.$refs        一个对象，持有注册过 ref 特性 的所有 DOM 元素和组件实例。
  this.$attrs       包含了父作用域中不作为 prop 被识别 (且获取) 的特性绑定 (class 和 style 除外)
  this.$listeners   包含了父作用域中的 (不含 .native 修饰器的) v-on 事件监听器。它可以通过 
                    v-on="$listeners" 传入内部组件——在创建更高层次的组件时非常有用。
```

- 事件(vm/this)

  this.$on

  this.$emit

  this.$once

  this.$off

```javascript
  //一般 先绑定监视
  this.$on('test', function (msg) {
    console.log(msg)
  })
  //在触发事件
  this.$emit('test', 'hi')
  // => "hi"
  this.$once
  //监听一个自定义事件，但是只触发一次，在第一次触发之后移除监听器。
  this.$off
  /*
  移除自定义事件监听器。

    如果没有提供参数，则移除所有的事件监听器；

    如果只提供了事件，则移除该事件所有的监听器；

    如果同时提供了事件与回调，则只移除这个回调的监听器。
  */
```

- 生命周期

  this.$mount

  this.$forceUpdate

  this.$nextTick

  this.$destroy

## 声明周期

- beforeCreate(组件创建前)

- created(组件创建完成)

- beforeMount(组件挂载前)

- mounted(组件挂载完成)

- beforeUpdate(组件更新前)

- updated(组件更新后)

- beforeDestroy(组件销毁前)

- destroyed(组件销毁完成)

:::tip
  beforeCreate()和created() 

  是在不指定el:"#App"触发的，也就是template没有挂载的时候

  beforeMount()此时 只有挂载点  mounted()才正式渲染模板完成 
  
  他们中间做了render function  也就是挂载到渲染的过程 

  数据最早请求 放在created()
:::

## 组件

一般叫法:子组件,父组件,兄弟组件
```javascript
  组件传值
  <template>
    <h1></h1>
  </template>

```
