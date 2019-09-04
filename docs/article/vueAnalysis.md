# vue
- 准备工作 clone vue@2.6.10
## 构建对应的版本
- package.json 里面配置了一堆script脚本 其实看关键字段 所有的build配置文件都在`scrpits/config`里面。这个文件里面有个builds,能找到很多版本，format里面标记了各个版本，有(es)es6模块、(cjs)commonjs模块以及(umd)浏览器执行的闭包模式,中口号内即为format。

```js
  'web-runtime-cjs-dev': {
    //入口
    entry: resolve('web/entry-runtime.js'),
    //目标 根据入口文件 最终编译打包生成的文件目录
    dest: resolve('dist/vue.runtime.common.dev.js'),
    //格式 cjs commonjs模块
    format: 'cjs',
    env: 'development',
    banner
  },
    // 分析完整版
  'web-full-esm': {
    entry: resolve('web/entry-runtime-with-compiler.js'),
    dest: resolve('dist/vue.esm.js'),
    format: 'es',
    alias: { he: './entity-decoder' },
    banner
  },
  // runtime-only build (Browser)
  'web-runtime-dev': {
    entry: resolve('web/entry-runtime.js'),
    dest: resolve('dist/vue.runtime.js'),
    format: 'umd',
    env: 'development',
    banner
  },

```
  - 官网上也写了对应的模块，但是这里要注意runtime和runtime-with-compiler。一个是运行版本后者是完整版,完整版包括运行版和编译器,而编译器的作用是用来将模板字符串编译成为 JavaScript 渲染函数的代码。
  - 说简单点就是，main.js里面可以用render渲染组件也可以用template模板渲染,若要用到template就需要编译器来处理，否则就回报错。我们通常npm run vue下载vue的时候 vue文件的package.json 的入口文件对应的版本是运行版本,如果我们要在main.js使用template就需要更改配置。默认是对应运行版本,webpack可以通过resolve对象里面的alias进行配置 `{'vue$': 'vue/dist/vue.esm.js'}` 。`vue//dist `这个目录存放着所有的vue构建版本,需要知道的是runtime比起runtime-with-compiler体积要小30%。此外说一下vue-cli，他默认配置了 `{'vue$': 'vue/dist/vue.esm.js'}` 路径,当我们引入vue的时候,不是去找package.js里面的入口,而是找配置的这个文件路径。当然以下的所有分析都是针对runtime-with-compiler版本

## new Vue
- new Vue 针对下面的小dome 通过源码 解剖一下做了什么事情

```js
{{message}}
export default{
  data(){
    return{
      message:'hello word'
    }
  }
}
```
- new Vue干的事情，针对runtime-with-compiler版本。首先找到目录`scrpits/config`,配置文件里找到完整版即runtime-with-compiler,那么对应的entry就是`web/entry-runtime-with-compiler.js`,在这儿文件末尾找到export default Vue,但是Vue又是从`./runtime/index`中导入的。再看`runtime/index`，同样的套路这里也没有直接创建Vue,这个文件的Vue是`core/index`导入进来。打开`core/index`,老套路来了 Vue又是`./instance/index`导入的，但是要注意的initGlobalApi(Vue),有东西把Vue包裹了,从字面上讲给vue初始化了一些全局api,先将他放下。回来找Vue主线,进到`./instance/index`，终于在这儿找到了Vue原型了。

```js
function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options)
}

initMixin(Vue)
stateMixin(Vue)
eventsMixin(Vue)
lifecycleMixin(Vue)
renderMixin(Vue)
```
- 这里做了判断,`this instanceof Vue`也就是说 必须要用new 创建Vue的实例才行。往后mixin很多东西，比如`initMixin,stateMixin,eventsMixin,lifecycMixin,renderMixin`,我们只关心initMixin做了什么事情,new Vue的时候 只触发了`this._init`,而`_init`是通过initMixin挂载到Vue原型链上的

```js
let uid = 0

export function initMixin (Vue: Class<Component>) {
  Vue.prototype._init = function (options?: Object) {
    const vm: Component = this
    // a uid
    vm._uid = uid++

    let startTag, endTag
    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      startTag = `vue-perf-start:${vm._uid}`
      endTag = `vue-perf-end:${vm._uid}`
      mark(startTag)
    }

    // a flag to avoid this being observed
    vm._isVue = true
    // merge options
    if (options && options._isComponent) {
      // optimize internal component instantiation
      // since dynamic options merging is pretty slow, and none of the
      // internal component options needs special treatment.
      initInternalComponent(vm, options)
    } else {
      vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor),
        options || {},
        vm
      )
    }
    /* istanbul ignore else */
    if (process.env.NODE_ENV !== 'production') {
      initProxy(vm)
    } else {
      vm._renderProxy = vm
    }
    // expose real self
    vm._self = vm
    initLifecycle(vm)
    initEvents(vm)
    initRender(vm)
    callHook(vm, 'beforeCreate')
    initInjections(vm) // resolve injections before data/props
    initState(vm)
    initProvide(vm) // resolve provide after data/props
    callHook(vm, 'created')

    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      vm._name = formatComponentName(vm, false)
      mark(endTag)
      measure(`vue ${vm._name} init`, startTag, endTag)
    }

    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }
}
```
- `instance/init`文件里面给Vue原型挂了`_init`,这里有一个`_uid`是在当前文件生成的。`_init`函数里面做了层层判断,vm当前实例,`vm.options`获取了传递进来的`options`,在往下走,我们可以看到`initLifecycle(vm),initEvents(vm),initState(vm)`这些初始化,最后一步,当option传递了el的时候才执行$mount挂载,整个初始化过程就结束了。到这儿主要做了合并配置，初始化生命周期，初始化事件中心，初始化渲染。下面看看initState做了什么
```js
const sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop
}
export function proxy (target: Object, sourceKey: string, key: string) {
  sharedPropertyDefinition.get = function proxyGetter () {
    return this[sourceKey][key]
  }
  sharedPropertyDefinition.set = function proxySetter (val) {
    this[sourceKey][key] = val
  }
  Object.defineProperty(target, key, sharedPropertyDefinition)
}


export function initState (vm: Component) {
  vm._watchers = []
  const opts = vm.$options
  if (opts.props) initProps(vm, opts.props)
  if (opts.methods) initMethods(vm, opts.methods)
  if (opts.data) {
    initData(vm)
  } else {
    observe(vm._data = {}, true /* asRootData */)
  }
  if (opts.computed) initComputed(vm, opts.computed)
  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch)
  }
}

function initData (vm: Component) {
  let data = vm.$options.data
  data = vm._data = typeof data === 'function'
    ? getData(data, vm)
    : data || {}
  if (!isPlainObject(data)) {
    data = {}
    process.env.NODE_ENV !== 'production' && warn(
      'data functions should return an object:\n' +
      'https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function',
      vm
    )
  }
  // proxy data on instance
  const keys = Object.keys(data)
  const props = vm.$options.props
  const methods = vm.$options.methods
  let i = keys.length
  while (i--) {
    const key = keys[i]
    if (process.env.NODE_ENV !== 'production') {
      if (methods && hasOwn(methods, key)) {
        warn(
          `Method "${key}" has already been defined as a data property.`,
          vm
        )
      }
    }
    if (props && hasOwn(props, key)) {
      process.env.NODE_ENV !== 'production' && warn(
        `The data property "${key}" is already declared as a prop. ` +
        `Use prop default value instead.`,
        vm
      )
    } else if (!isReserved(key)) {
      proxy(vm, `_data`, key)
    }
  }
  // observe data
  observe(data, true /* asRootData */)
}
```
- 继续跟着主剧情走,看了一圈就`initState`符合,进去看看他做了什么事情。`initState`里面对options配置做了系列判断,分别初始化`props,methods,data,computed,watch`。`initData(vm)`方法，这儿就是核心点了,里面告诉我们在`data`里面声明的值为什么能在this里拿到,再次之前`vue`用对象的key了3个判断,防止`methods`和`props`重名,查看key是否已经存在了,一但名字相同就会爆警告。一切顺利后就来到`proxy(vm,'_data',key)`,看到这个方法就知道要干什么了,没错就是给当前实例声明一个`_data`,然后将key和对应的value整合进去,这样`this._data`就能拿到所有data里面的
### 总结
- Vue 初始化主要就干了几件事情，合并配置，初始化生命周期，初始化事件中心，初始化渲染，初始化 data、props、computed、watcher 等等

## 挂载($mount)实现
  - 还是先看`entry-runtime-with-compiler`入口
```js
// entry-runtime-with-compiler
const mount = Vue.prototype.$mount
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  // query 将el传递进来的转换成dom
  el = el && query(el)

  /* istanbul ignore if */
  if (el === document.body || el === document.documentElement) {
    process.env.NODE_ENV !== 'production' && warn(
      `Do not mount Vue to <html> or <body> - mount to normal elements instead.`
    )
    return this
  }

  const options = this.$options
  // resolve template/el and convert to render function
  // 如果传递的不是render 说明是template 对他进行处理
  if (!options.render) {
   //*********
  }
  return mount.call(this, el, hydrating)
}
```
- `$mount`是从原型上获取的,这里先跳过往后看。`Vue.prototype.$mount`重写了挂载方法,主要就是出路编译,`!options.render`这里做了判断,如果传递的不是render 说明是template 对他进行处理,也就是tempalte编译处理,这里面比较复杂。
```js
// runtime/index
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  el = el && inBrowser ? query(el) : undefined
  return mountComponent(this, el, hydrating)
}
```
- 上面代码是运行环境,看`runtime/index`这里在Vue原型上写了挂载的方法,最后交给了mountComponent进行了处理。
```js
// core/instance/lifecycle
export function mountComponent (
  vm: Component,
  el: ?Element,
  hydrating?: boolean
): Component {
  vm.$el = el
  if (!vm.$options.render) {
  // 在initState 初始化的时候 options全部挂上去了 
    vm.$options.render = createEmptyVNode
    if (process.env.NODE_ENV !== 'production') {
      /* istanbul ignore if */
      if ((vm.$options.template && vm.$options.template.charAt(0) !== '#') ||
        vm.$options.el || el) {
        warn(
          'You are using the runtime-only build of Vue where the template ' +
          'compiler is not available. Either pre-compile the templates into ' +
          'render functions, or use the compiler-included build.',
          vm
        )
      } else {
        warn(
          'Failed to mount component: template or render function not defined.',
          vm
        )
      }
    }
  }
  callHook(vm, 'beforeMount')

  let updateComponent
  /* istanbul ignore if */
  if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
    updateComponent = () => {
      const name = vm._name
      const id = vm._uid
      const startTag = `vue-perf-start:${id}`
      const endTag = `vue-perf-end:${id}`

      mark(startTag)
      const vnode = vm._render()
      mark(endTag)
      measure(`vue ${name} render`, startTag, endTag)

      mark(startTag)
      vm._update(vnode, hydrating)
      mark(endTag)
      measure(`vue ${name} patch`, startTag, endTag)
    }
  } else {
    updateComponent = () => {
      // _render在new的时候 初始化initrender的时候给原型赋值上去的
      vm._update(vm._render(), hydrating)
    }
  }
```
- 在initState 初始化的时候 options全部挂上去了,能取到所有的配置。这里有个很关键的warn,当`$options.render`没有配置并且配置了`$options.template`(所处的是运行环境)就会警告`You are using the runtime-only ....`。核心的来了vm._render,_render就是专门用来渲染的方法,既然他挂载vm上肯定是之前初始化的时候处理的。当前有一个render.js,他是在new时候 被初始化执行的文件,在这儿就找到_render挂载到原型上了
## render
```js
// instance/render.js

vm.$createElement = (a, b, c, d) => createElement(vm, a, b, c, d, true)

Vue.prototype._render = function (): VNode {
    const vm: Component = this
    const { render, _parentVnode } = vm.$options

    if (_parentVnode) {
      vm.$scopedSlots = normalizeScopedSlots(
        _parentVnode.data.scopedSlots,
        vm.$slots,
        vm.$scopedSlots
      )
    }

    // set parent vnode. this allows render functions to have access
    // to the data on the placeholder node.
    vm.$vnode = _parentVnode
    // render self
    let vnode
    try {
      // There's no need to maintain a stack because all render fns are called
      // separately from one another. Nested component's render fns are called
      // when parent component is patched.
      currentRenderingInstance = vm
      vnode = render.call(vm._renderProxy, vm.$createElement)
    } catch (e) {
      handleError(e, vm, `render`)
      // return error render result,
      // or previous vnode to prevent render error causing blank component
      /* istanbul ignore else */
      if (process.env.NODE_ENV !== 'production' && vm.$options.renderError) {
        try {
          vnode = vm.$options.renderError.call(vm._renderProxy, vm.$createElement, e)
        } catch (e) {
          handleError(e, vm, `renderError`)
          vnode = vm._vnode
        }
      } else {
        vnode = vm._vnode
      }
    } finally {
      currentRenderingInstance = null
    }
    // if the returned array contains only a single node, allow it
    if (Array.isArray(vnode) && vnode.length === 1) {
      vnode = vnode[0]
    }
    // return empty vnode in case the render function errored out
    if (!(vnode instanceof VNode)) {
      if (process.env.NODE_ENV !== 'production' && Array.isArray(vnode)) {
        warn(
          'Multiple root nodes returned from render function. Render function ' +
          'should return a single root node.',
          vm
        )
      }
      vnode = createEmptyVNode()
    }
    // set parent
    vnode.parent = _parentVnode
    return vnode
  }
```
- render就是在这儿挂到vue原型上的,他会返回一个vnode。options是在new初始化的时候挂载上去的,`render.call(vm._renderProxy, vm.$createElement)`第一个参数是当前实例,第二个才是创建虚拟dom,$createElement函数返回的是`createElement(vm, a, b, c, d, true)`,
createElement才是创建虚拟dom的。
## createElement
```js
// ../vdom/create-element
export function createElement (
  context: Component,
  tag: any,
  data: any,
  children: any,
  normalizationType: any,
  alwaysNormalize: boolean
): VNode | Array<VNode> {
  if (Array.isArray(data) || isPrimitive(data)) {
    normalizationType = children
    children = data
    data = undefined
  }
  if (isTrue(alwaysNormalize)) {
    normalizationType = ALWAYS_NORMALIZE
  }
  return _createElement(context, tag, data, children, normalizationType)
}

export function _createElement (
  context: Component,
  tag?: string | Class<Component> | Function | Object,
  data?: VNodeData,
  children?: any,
  normalizationType?: number
): VNode | Array<VNode> {
  if (isDef(data) && isDef((data: any).__ob__)) {
    process.env.NODE_ENV !== 'production' && warn(
      `Avoid using observed data object as vnode data: ${JSON.stringify(data)}\n` +
      'Always create fresh vnode data objects in each render!',
      context
    )
    return createEmptyVNode()
  }
  // object syntax in v-bind
  if (isDef(data) && isDef(data.is)) {
    tag = data.is
  }
  if (!tag) {
    // in case of component :is set to falsy value
    return createEmptyVNode()
  }
  // warn against non-primitive key
  if (process.env.NODE_ENV !== 'production' &&
    isDef(data) && isDef(data.key) && !isPrimitive(data.key)
  ) {
    if (!__WEEX__ || !('@binding' in data.key)) {
      warn(
        'Avoid using non-primitive value as key, ' +
        'use string/number value instead.',
        context
      )
    }
  }
  // support single function children as default scoped slot
  if (Array.isArray(children) &&
    typeof children[0] === 'function'
  ) {
    data = data || {}
    data.scopedSlots = { default: children[0] }
    children.length = 0
  }
  if (normalizationType === ALWAYS_NORMALIZE) {
    children = normalizeChildren(children)
  } else if (normalizationType === SIMPLE_NORMALIZE) {
    children = simpleNormalizeChildren(children)
  }
  let vnode, ns
  if (typeof tag === 'string') {
    let Ctor
    ns = (context.$vnode && context.$vnode.ns) || config.getTagNamespace(tag)
    if (config.isReservedTag(tag)) {
      // platform built-in elements
      if (process.env.NODE_ENV !== 'production' && isDef(data) && isDef(data.nativeOn)) {
        warn(
          `The .native modifier for v-on is only valid on components but it was used on <${tag}>.`,
          context
        )
      }
      vnode = new VNode(
        config.parsePlatformTagName(tag), data, children,
        undefined, undefined, context
      )
    } else if ((!data || !data.pre) && isDef(Ctor = resolveAsset(context.$options, 'components', tag))) {
      // component
      vnode = createComponent(Ctor, data, context, children, tag)
    } else {
      // unknown or unlisted namespaced elements
      // check at runtime because it may get assigned a namespace when its
      // parent normalizes children
      vnode = new VNode(
        tag, data, children,
        undefined, undefined, context
      )
    }
  } else {
    // direct component options / constructor
    vnode = createComponent(tag, data, context, children)
  }
  if (Array.isArray(vnode)) {
    return vnode
  } else if (isDef(vnode)) {
    if (isDef(ns)) applyNS(vnode, ns)
    if (isDef(data)) registerDeepBindings(data)
    return vnode
  } else {
    return createEmptyVNode()
  }
}
```
- createElement 通过处理调用的内部_createElement,接收一系列参数,也就是我们render时候传入的。当`if (!tag)`会调`createEmptyVNode`方法,也就是创建一个空的Virtual DOM。当`if (typeof tag === 'string')`tag 传入的是字符串,普通的节点的时候会`new VNode(xxx)`创建dom实例,如果是已经注册了的组件名则用createComponent来创建一个组件类型的VNode,否则就创建一个未知名的VNode。同时children也是一个节点,他也会创建一个VNode,层层嵌套下来就形成了一个DOMTree
## Virtual DOM
```js
// core/vdom/vnode
export default class VNode {
  tag: string | void;
  data: VNodeData | void;
  children: ?Array<VNode>;
  text: string | void;
  elm: Node | void;
  ns: string | void;
  context: Component | void; // rendered in this component's scope
  key: string | number | void;
  componentOptions: VNodeComponentOptions | void;
  componentInstance: Component | void; // component instance
  parent: VNode | void; // component placeholder node

  // strictly internal
  raw: boolean; // contains raw HTML? (server only)
  isStatic: boolean; // hoisted static node
  isRootInsert: boolean; // necessary for enter transition check
  isComment: boolean; // empty comment placeholder?
  isCloned: boolean; // is a cloned node?
  isOnce: boolean; // is a v-once node?
  asyncFactory: Function | void; // async component factory function
  asyncMeta: Object | void;
  isAsyncPlaceholder: boolean;
  ssrContext: Object | void;
  fnContext: Component | void; // real context vm for functional nodes
  fnOptions: ?ComponentOptions; // for SSR caching
  devtoolsMeta: ?Object; // used to store functional render context for devtools
  fnScopeId: ?string; // functional scope id support

  constructor (
    tag?: string,
    data?: VNodeData,
    children?: ?Array<VNode>,
    text?: string,
    elm?: Node,
    context?: Component,
    componentOptions?: VNodeComponentOptions,
    asyncFactory?: Function
  ) {
    this.tag = tag
    this.data = data
    this.children = children
    this.text = text
    this.elm = elm
    this.ns = undefined
    this.context = context
    this.fnContext = undefined
    this.fnOptions = undefined
    this.fnScopeId = undefined
    this.key = data && data.key
    this.componentOptions = componentOptions
    this.componentInstance = undefined
    this.parent = undefined
    this.raw = false
    this.isStatic = false
    this.isRootInsert = true
    this.isComment = false
    this.isCloned = false
    this.isOnce = false
    this.asyncFactory = asyncFactory
    this.asyncMeta = undefined
    this.isAsyncPlaceholder = false
  }

  // DEPRECATED: alias for componentInstance for backwards compat.
  /* istanbul ignore next */
  get child (): Component | void {
    return this.componentInstance
  }
}

export const createEmptyVNode = (text: string = '') => {
  const node = new VNode()
  node.text = text
  node.isComment = true
  return node
}

export function createTextVNode (val: string | number) {
  return new VNode(undefined, undefined, undefined, String(val))
}

// optimized shallow clone
// used for static nodes and slot nodes because they may be reused across
// multiple renders, cloning them avoids errors when DOM manipulations rely
// on their elm reference.
export function cloneVNode (vnode: VNode): VNode {
  const cloned = new VNode(
    vnode.tag,
    vnode.data,
    // #7975
    // clone children array to avoid mutating original in case of cloning
    // a child.
    vnode.children && vnode.children.slice(),
    vnode.text,
    vnode.elm,
    vnode.context,
    vnode.componentOptions,
    vnode.asyncFactory
  )
  cloned.ns = vnode.ns
  cloned.isStatic = vnode.isStatic
  cloned.key = vnode.key
  cloned.isComment = vnode.isComment
  cloned.fnContext = vnode.fnContext
  cloned.fnOptions = vnode.fnOptions
  cloned.fnScopeId = vnode.fnScopeId
  cloned.asyncMeta = vnode.asyncMeta
  cloned.isCloned = true
  return cloned
}
```
- Virtual DOM 简单的说就是用js对象描述一个DOM节点,真是的DOM节点非常复杂,vue用VNode这个类,暂时替代了dom经常操作