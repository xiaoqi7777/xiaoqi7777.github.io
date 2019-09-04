# vuepress

##  用法 汇总 


- **ES的运行时----JavaScript runtime, web开发的runtime**


标题:
# 一号 一个#
## 二号 两个##
### 三号 三个###
```javascript
(```后面加类型--javascript)
# 一号 一个#
## 二号 两个##
### 三号 三个###
```

点:
- 点加换行
```
- 点加换行 
```

加粗:
**加粗**
```
**加粗**  ** ** 两边*是加粗
```
文字淡化:
`
123
`


黑色背景:
```
上下加``` 有黑色背景
```

颜色背景:
::: tip
This is a tip
:::
```
::: tip
This is a tip
:::
```
::: warning
This is a warning
:::
::: danger
This is a dangerous thing
:::

小东西:

:tada: :100: :grimacing:
在[这里](https://github.com/markdown-it/markdown-it-emoji/blob/master/lib/data/full.json)可以找到所有可用的 `emojis` 列表。
```
:tada: :100:

```

换行: 给一个空行 就可以了

123

123
```
123

123
```

加竖杆(字体变灰): 
>123

加图片:
```
assets 是public 下面的目录
<img :src="$withBase('/assets/gitflow.png')" >
```

当前连接:
[[toc]] 

```
[[toc]] 
## 和 ### 都会为toc下的连接
```

文字连接:
[中文文档](https://webpack.docschina.org/concepts/)

```
[中文文档](https://webpack.docschina.org/concepts/)
```

表格:
| Tables        | Are           | Cool  |
| ------------- |:-------------:| -----:|
| col 3 is      | right-aligned | $1600 |
| col 2 is      | centered      |   $12 |
| zebra stripes | are neat      |    $1 |
```
| Tables        | Are           | Cool  |
| ------------- |:-------------:| -----:|
| col 3 is      | right-aligned | $1600 |
| col 2 is      | centered      |   $12 |
| zebra stripes | are neat      |    $1 |
```
vue组件使用
- 1、写好components/me.vue组件
- 2、创建xx.md文件 配置为路由
  - layout 写components 里面的文件名字
```js
---
layout: me
---
<!-- 放vue组件即可显示 -->
```

记坑: 
1、配置的lastUpdated  显示更新时间  必须要用git命令执行

lastUpdated  取的是执行git的时间

2、发布上线尽量别用vscode再带的终端  用git(vscode 发布上线可能有点问题)

3、新版vuepress npm install webpack-dev-middleware@3.6.0 要先运行这个
