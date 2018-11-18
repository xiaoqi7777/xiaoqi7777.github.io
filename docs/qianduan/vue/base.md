---
sidebar: auto
---


#  说明

VuePress 网站实际上是由 [Vue](http://vuejs.org/), [Vue Router](https://github.com/vuejs/vue-router) 和 [webpack](http://webpack.js.org/) 驱动的单页面应用程序。

每个 markdown 文件都使用 [markdown-it](https://github.com/markdown-it/markdown-it) 编译为 HTML，然后作为 Vue 组件的模板进行处理。允许直接在 markdown 文件中使用 Vue，在需要嵌入动态内容时，这种使用方式非常有用。


## Markdown 扩展


**输入**

```
| Tables        | Are           | Cool  |
| ------------- |:-------------:| -----:|
| col 3 is      | right-aligned | $1600 |
| col 2 is      | centered      |   $12 |
| zebra stripes | are neat      |    $1 |
```

**输出**

| Tables        | Are           | Cool  |
| ------------- |:-------------:| -----:|
| col 3 is      | right-aligned | $1600 |
| col 2 is      | centered      |   $12 |
| zebra stripes | are neat      |    $1 |

## Emoji :tada:

**输入**

```
:tada: :100:
```

**输出**

:tada: :100:

在[这里](https://github.com/markdown-it/markdown-it-emoji/blob/master/lib/data/full.json)可以找到所有可用的 emojis 列表。

## 目录(table of contents)

**输入**

```
[[toc]]
```

**输出**

[[toc]]


## 自定义容器(custom containers)

**输入**

```
::: tip
This is a tip
:::

::: warning
This is a warning
:::

::: danger
This is a dangerous warning
:::
```

**输出**

::: tip
This is a tip
:::

::: warning
This is a warning
:::

::: danger
This is a dangerous thing
:::
