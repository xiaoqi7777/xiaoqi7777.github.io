# vuePlugin
[[toc]]
[代码-分支/vuePlugin](https://github.com/xiaoqi7777/jwt)

-  实现自己的组件库
- 模仿element组件库，实现自己的组件库。vue 插件主要的功能提供全局数据共享，根据业务不同，实现不同逻辑的插件。比如vuex功能就是状态集中管理，vue-router通过$router可以切换显示别的组件。

## 小试牛刀
- 介绍一下开发组件的流程
- 用vue-router举例，使用他有最少需要动2个文件。第一，是生成一个router配置文件。第二在main入口文件 引入配置文件，在vue初始化的时候传进去。
  - 第一步，我们会引入 组件，vue，vue-router。将vue-router文件挂载到vue.use内=>`Vue.use(Router)`, vue的use方法会调插件内部的install函数，因此每个插件都必须有一个install方法,他会接受一个Vue,Vue为插件提供了很多方法，其中mixin就是最常用的。后面vue-router插件将会被实例化，同时传入很多参数，也就是我们通常配置的mode，routes等，插件内部会获取这些参数进行一些列处理。
  - 第二步，new Vue的时候传入了router配置文件，vue-router插件就是在这儿通过this.$option.router获取所有的router配置。
### 接下来，写一个简单的dome,所有组件共享一个数据
- 插件文件 test.js
```js
class ShareData {

}
// 当vue.use 的时候 会调用install
ShareData.install = (_Vue) => {
  _Vue.mixin({
    beforeCreate () {
      // 将new 传入进去的dataInfo 一步一步传递给所有组件
      if (this.$options && this.$options.dataInfo) {
        this.$dataInfo = this.$options.dataInfo
      } else {
        this.$dataInfo = this.$parent && this.$parent.$dataInfo
      }
    }
  })
}
export default ShareData
```
- 1、`ShareData.install` 当vue.use 的时候 会调用install函数 将Vue传递进来
- 2、`_Vue.mixin` 这个是vue自带的放到就是混合，它会将beforeCreate混合到所有组件中
- 3、`this.$parent.$options` 一步一步的将配置的参数获取传递下去，这样每个组件通过this.$dataInfo 都可以拿到他

- 使用插件 main.js
```js
import App from './App.vue'
import Test from './test'
// 调用插件内部的install方法
Vue.use(Test)
// 所有组件都共享
let dataInfo = {
  a: 1,
  b: 2
}
new Vue({
  dataInfo,
  store,
  render: h => h(App)
}).$mount('#app')
```
- 1、使用vue.use注册插件，也就是调用插件内部的install函数
- 2、在vue实例化时候 将dataInfo 传递进去， 让插件一步一步传递下去，这样每个组件都能获取到

## 根据element用法，模仿一个类似的插件库
- 创建目录设计(初期)
```js
  -plugins
    -components
      -message
        -index.js
        -message.vue
    -index.js
```
- plugins/index.js
- 这个文件将所有的组件集中起来，共外面引入
- 以后使用此插件 直接引入plugins/index.js use就可以了
```js
import { Message } from './components/message'
// 防止用户多次use
let _Vue = null
export default {
  install (Vue, options) {
    // 如是调用的组件 可以在这儿全局注册
    // 把Message 挂载到vue原型上
    if (!_Vue) {
      _Vue = Vue
      Vue.prototype.$Message = Message
    }
  }
}
export { Message }
```
### message组件
- 代码参考 顶部的链接
- 首先创建message.vue组件 和 message.js配置文件。组件提供给用户调用。配置文件提供给用户调用的方法,作为组件和用户调用中间桥梁
- 先来看组件如何写,布局用的scss&&css module。核心的html就这么点`messages`存储着使用者调用的信息。css的颜色是外面动态传递进来的。
```html
  <div v-for="(data,index) in messages" :key="index" :class="[$style[data.color],$style.message]">
    {{data.message}}
  </div>
```
- 逻辑部分, 组件提供一个add方法给调用者，每次调用的时候将信息传递进来，id是用来移除当前组件的
```js
export default {
  data () {
    return {
      messages: [],
      id: 0
    }
  },
  methods: {
    add (options) {
      let data = { ...options, id: this.id++ }
      this.messages.push(data)
      data.timer = setTimeout(() => {
        this.del(data)
      }, 2000)
    },
    del (data) {
      this.messages = this.messages.filter(item => item.id !== data.id)
    }
  }
}
```
- 配置文件，第一把将组件用`render函数`获取到，不要给el，将他挂着到内存中，然后将$el添加到body，具体可以参考官网。这个就可以通过vm实例拿到`message`组件内的数据。
- 通过单例的模式 保证获取的vm是同一个。`Message`方法是抛出去给外面调用的,里面定义了一系列的方法,主要就是语义化和颜色的区别，其他都没有影响
- 最后将他挂着到`plugins/index.js`入口文件，将Message方法放到Vue原型上就可以使用。
```js
import Vue from 'vue'
import MessageComponent from './message'
let getInstance = () => {
  let vm = new Vue({
    render: (h) => h(MessageComponent)
  }).$mount('')
  document.body.appendChild(vm.$el)
  let children = vm.$children[0]
  return {
    add (options) {
      children.add(options)
    }
  }
}
// 单例
let instance
let getInit = () => {
  instance = instance || getInstance()
  return instance
}
function Message (options) {
  switch (options.type) {
    case 'info':
      getInit().add({ ...options, color: 'green' })
      break
    case 'warn':
      getInit().add({ ...options, color: 'red' })
      break
  }
}
export { Message }
```
### form组件
- 目前form组件仅仅实现了一个简单的input组件，表单校验和组件提示，其他的类似，后期在增加。form组件知道需要3个组件，第一个form最外层的，获取所有的数据进行校验和提交，第二个formItem每个使用组件的父级，主要用来校验当前组件。第三个就是具有操作功能的组件，这里只做了input。
- form.vue
- form组件主要就干了2件事，给用户暴露一个`validator`校验的方法,返回当前子组件是否都校验成功以及传递传递错误信息,接受组件传递进来的数据，通过`provide`传递给组件
```html
<template>
  <form onsubmit="return false">
    <slot></slot>
  </form>
</template>
<script>
export default {
  props: {
    model: {
      type: Object
    },
    rules: {
      type: Object
    }
  },
  methods: {
    // 给用户调用的
    validator (cb) {
      let errorObj = {}
      // 获取检验是否成功
      let flag = this.$children.every(child => child.validateStatus !== 'error')
      // 获取formItem校验信息
      let errorData = this.$children.map(children => children.valiStatus).flat()
      for (let i = 0; i < errorData.length; i++) {
        let data = errorData[i]
        let name = data['field']
        errorObj[name] = data
      }
      cb(flag, errorObj)
    }
  },
  provide () {
    return {
      form: this
    }
  }
}
</script>
```


- formItem.vue
- formItem是表单的核心校验处理，html结构也很简单一个label,一个slot接受外面传进来的组件,一个div用来处理错误提示
- `mounted`主要是初始化，获取rules,获取`trigger`触发的事件,在监听子组件触发的事件。监听到事件 在调`validate`方法进行校验，根据传入不同的rule触发不同的校验规则。在这里我只做了`required`必填和自定义的`validator`校验器。将校验规则通过`handleAddValidate`&&`handleDelValidate`方法收集错误和移除错误，最后在通过`handleStatus`修改校验的状态和检验的提示。
```html
<template>
  <div>
    <label v-if="label">{{label}}</label>
    <slot></slot>
    <div v-if="validateStatus == 'error'">
      {{validateContent}}
    </div>
    <!-- <div>校验文字</div> -->
  </div>
</template>
<script>
import Vue from 'vue'
Vue.prototype.$bus = new Vue()
export default {
  props: {
    label: String,
    prop: String
  },
  data () {
    return {
      /**
        *  当前表单是否通过校验
        */
      validateStatus: '',
      /**
       *  当前校验后的信息
       */
      validateContent: '',
      /**
       * 存放所有校验的信息
       * field 当前的prop项
       * type 校验的类型
       * isError 是否显示错误
       * content 错误提示
       */
      valiStatus: [],
      /**
       * 存放当前输入的内容
       */
      getinputData: '',
      /**
       * 当前是触发的事件
       */
      trigger: null
    }
  },
  methods: {
    handleAddValidate (type, content) {
      // 处理多次加入同一个
      for (let [i, k] of this.valiStatus.entries()) {
        if (k && (k.type === type)) {
          this.valiStatus[i].isError = true
          return
        }
      }
      this.valiStatus.push({
        field: this.prop,
        type,
        content,
        isError: true
      })
    },
    handleDelValidate (type) {
      for (let [i, k] of this.valiStatus.entries()) {
        if (k && (k.type === type)) {
          this.valiStatus.splice(i, 1)
        }
      }
    },
    handleStatus () {
      this.valiStatus.forEach(item => {
        // 处理有提示的情况
        if (item.isError) {
          this.validateStatus = 'error'
          this.validateContent = item.content
        }
      })

      // 要是没有提示 清除所有
      let isShow = this.valiStatus.some(data => {
        if (data.isError === true) {
          return true
        }
      })
      if (!isShow) {
        this.validateStatus = false
      }
    },
    validate (value) {
      // 通过inject 获取到的
      let rules = this.rules // 获取当前对应的规则
      // 收集错误信息
      rules.forEach(rule => {
        // 默认配置目前只写required 如果必填 并且没有值，那就出错
        if (rule.required) {
          if (!value) {
            this.handleAddValidate('required', rule.message)
          } else {
            this.handleDelValidate('required')
          }
        }
        // 如果是自定义配置 也就是传入 validator
        if (rule.validator) {
          // validator 就是用户自定义那个函数
          let { validator } = rule
          validator('rule', this.getinputData, (data) => {
            if (data && data.name === 'Error') {
              this.handleAddValidate('validator', data.message)
            } else if (data) {
              this.handleAddValidate('validator', data.toString())
            } else {
              this.handleDelValidate('validator')
            }
          })
        }
      })
      // 更新错误状态
      this.handleStatus()
    },
    getTriggerMethod () {
      this.trigger = this.rules && this.rules.map(item => {
        if (item.trigger === 'change') {
          item.trigger = 'input'
        }
        return item.trigger
      })
    },
    bindTrigger () {
      this.trigger && this.trigger.forEach(item => {
        this.$bus.$on(item, (data) => {
          if (this._uid === data.id) { // 说明更改的是当前自己的输入框
            this.getinputData = data.value
            this.validate(data.value)
          }
        })
      })
    }
  },
  inject: ['form'], // 注入父级的实例
  mounted () {
    // 获取多有的rules
    this.rules = this.form.rules[this.prop]
    // 获取触发的方式
    this.getTriggerMethod()
    // 绑定事件
    this.bindTrigger()
  }
}
</script>
```
- input.vue
- input标签绑定了一些列监听的方法,用户在校验的时候,会传`trigger`作为触发的事件,与这里绑定的事件对应上。每个事件都会向父级(formItem)传递当前的value,同时父级也会监听到。
```html
<template>
  <input type="text" :value="inputValue" @input="handleInput" @change="handleChange" @blur="handleBlur" @focus="bandleFocus" >
</template>
<script>
export default {
  props: {
    value: String
  },
  data () {
    return { inputValue: this.value }
  },
  methods: {
    handleInput (e) {
      // 更新数据
      this.inputValue = e.target.value
      this.$bus.$emit('input', {
        id: this.$parent && this.$parent._uid, // 为了标识是哪个输入框
        value: this.inputValue
      }) // 发射输入事件
    },
    handleChange (e) {
      this.inputValue = e.target.value
      this.$bus.$emit('change', {
        id: this.$parent && this.$parent._uid,
        value: this.inputValue
      })
    },
    bandleFocus (e) {
      this.inputValue = e.target.value
      this.$bus.$emit('focus', {
        id: this.$parent && this.$parent._uid,
        value: this.inputValue
      })
    },
    handleBlur (e) {
      this.inputValue = e.target.value
      this.$bus.$emit('blur', {
        id: this.$parent && this.$parent._uid,
        value: this.inputValue
      })
    }
  }
}
</script>
```
### cascader无线联级组件
- cascader 作用就是通过传递固定数据格式，进行联级展示，类似于省市县列表展示，这里只要数据多，格式对的情况下，都能展示出来。
- cascader.vue 接受了`option`初次传递进来的列表参数,`lazyload`点击的时候获取下一列的数据,`value`用来收集每次点击的数据。`clickOutside`处理点击组件外的内容隐藏组件，`level`用来判断当前层级，CascaderItem组件涉及到递归了。比较麻烦的就是`change`方法,先通过父级的`lazyload`方法获取对应点击id下面的所有children数据。 在子组件(cascaderItem)获取值的时候触发他，需要用id对比当前栏`option`的数据,由于`option`是多层的情况，这里涉及到对`option`的遍历。第一层的时候肯定满足`current.id === id`,会给当前的`option`项赋值一个children,值为传值进来的children。当点击第二层的时候,current又是从头开始匹配，肯定是先走`current.children`他因为之前赋值过children,通过`stack = stack.concat(current.children)`把下一层的数据全部塞到`stack`后面 在开始跑，就这样一层一层的跑数据正确的情况下，肯定能匹配到 执行`break`。最后将新的数据发给父级的`option`
```html
<template>
  <div v-click-outside="close">
    多级联动组件
    <div class="top" @click="btn">
      {{rs}}
    </div>
    <div v-if="isShow">
      <CascaderItem :option='option' :level='0' :value='value' @change="change" ></CascaderItem>
    </div>
  </div>
</template>

<script>
import CascaderItem from './cascaderItem'
import cloneDeep from 'lodash/cloneDeep'
export default {
  data () {
    return {
      isShow: true
    }
  },
  directives: {
    clickOutside: {
      inserted (el, binding, vnode) {
        document.addEventListener('click', (e) => {
          let target = e.target
          if (target === el || el.contains(target)) {
            return false
          } else {
            binding.value()
          }
        })
      }
    }
  },
  computed: {
    rs () {
      return this.value.map(item => item.label).join('/')
    }
  },
  methods: {
    btn () {
      this.isShow = !this.isShow
    },
    close () {
      this.isShow = false
    },
    handle (id, children) {
      let cloneValue = cloneDeep(this.option)
      // 这里考虑多层的情况 广度便利
      let stack = [...cloneValue]
      let current = null
      let index = 0
      while (current = stack[index++]) {
        if (current.id === id) {
          break
        } else {
          if (current.children) {
            stack = stack.concat(current.children)
          }
        }
      }
      // if (current) {
          current.children = children
          this.$emit('update:option', cloneValue)
        // }
    },
    change (item) {
      let { id } = item[item.length - 1]
      this.lazyload && this.lazyload(id, (data) => {
        this.handle(id, data)
      })
      this.$emit('input', item)
    }
  },
  props: {
    lazyload: {
      type: Function
    },
    option: {
      type: Array,
      default: () => []
    },
    value: {
      type: Array,
      default: () => []
    }
  },
  components: {
    CascaderItem
  }
}
</script>
```
- cascaderItem.vue
- 这个组件就是最终显示的一列一列的数据，这里使用的组件的递归，其实套路很简单，看他的父级传递什么，组件递归的时候就传递什么。
- `option`一直是存着所有的数据，所以`lists`处理数据通过他来处理
```html
<template>
  <div class="children">
    <div class="parent">
      <div class="left" v-for="(item,index) in option" :key="index+10">
        <div @click="click(item)">
          {{item.label}}
        </div>
      </div>
    </div>
    <div class="right" v-if='lists&&lists.length'>
      <Children :option="lists" @change="change" :value="value" :level='level+1'></Children>
    </div>
  </div>
</template>
<script>
import cloneDeep from 'lodash/cloneDeep'
export default {
  name: 'Children',
  data () {
    return {
      currentSelect: []
    }
  },
  computed: {
    lists () {
      // 处理点击左边的时候 把右边一个往后都干掉
      if (this.value[this.level] && this.value[this.level].id) {
        let o = this.option.find(item => item.id === this.value[this.level].id)
        return o.children
      }
      return null
    }
  },
  methods: {
    click (item) {
      this.currentSelect = item
      let newValue = cloneDeep(this.value)
      newValue[this.level] = item
      // 处理点击左边的时候 把右边一个往后都干掉
      newValue.splice(this.level + 1)
      this.$emit('change', newValue)
    },
    change (item) {
      this.$emit('change', item)
    }
  },
  props: {
    option: {
      type: Array,
      default: () => []
    },
    value: {
      type: Array,
      default: () => []
    },
    level: {
      type: Number
    }
  }
}
</script>
```

- nrm ls 查看源 (我电脑不支持)
- nrm use npm 切换源 到npm (安装 cnpm i -g nrm 好像有问题)
- npm addUser 发包 (小心.gitignore文件 忽略dist)