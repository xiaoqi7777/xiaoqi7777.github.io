# 常用库

**1、let mime = require('mime')**
```js
// 获取文件的后缀
  mime.getType('引入文件')
```
**2、let fs = require('mz/fs')**

mz需要引入 mz将fs所有的方法转换成promise

**3、require('querystring').parse(str,'&@','#=')**
```javaScript
后面两个参数默认是 '&' '='
let str = 'username#=123&@password#=456'
let obj = require('querystring').parse(str,'&@','#=')
console.log(obj)//{ username: '123', password: '456' }
```
**4、方法拷贝**
- 把一个对象的属性 拷贝到另一个对象上去
- express 源码用到这个
```js
var mixin = require('merge-descriptors');
mixin(app, EventEmitter.prototype, false);
mixin(app, proto, false);
```
**5、let url = require('url')**
- 解析url地址
```js
let url = require('url')
let rs = url.parse('http://user:pass@host.com:8080/p/a/t/h?query=string#hash', true)

{
  protocol: 'http:',
  slashes: true,
  auth: 'user:pass',
  host: 'host.com:8080',
  port: '8080',
  hostname: 'host.com',
  hash: '#hash',
  search: '?query=string',
  query: 'query=string',
  pathname: '/p/a/t/h',
  path: '/p/a/t/h?query=string',
  href: 'http://user:pass@host.com:8080/p/a/t/h?query=string#hash' 
}
```
**6、fiddler**
- https://blog.csdn.net/cui130/article/details/80595435

**7、querystring**
 - [https://www.jianshu.com/p/78c94673a2e8](https://www.jianshu.com/p/78c94673a2e8)