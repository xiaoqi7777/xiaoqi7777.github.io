# 常用的状态码
[[toc]]

## 206
- 断点续传，主要依靠的请求头
- 客户端发送的 Range:bytes=0-10
- 服务端发送的 Content-Range:bytes 0-10/50  
- 流程: 客户端带`Range`请求头 去服务端请求数据，一次请求0-10字节，服务段解析头，去读取0-10字节的数据,并且返回`content-range`请求头给他前端，携带发送的字节数据以及总大小，前端根据字节数和文件总大小，对服务器再次请求等处理

### client
```js
let fs = require('fs')
let http = require('http')
let path = require('path')
let ws = fs.createWriteStream(path.join(__dirname, '2.txt'))
let start = 0

// 暂停
let pause = false
process.stdin.on('data', (res) => {
  if (res.toString().includes('p')) {
    pause = true
  } else {
    pause = false
    download()
  }
})

download()
function download () {
  http.get({
    host: 'localhost',
    port: 3000,
    headers: {
      'Range': `bytes=${start}-${start + 4}`
    }
  }, function (res) {
    let total = res.headers['content-range'].split('/')[1]
    // pipe 写完就就调end了,结束服务
    // res.pipe(ws)

    // 用res.on('data')
    res.on('data', (data) => {
      ws.write(data)
      start += 5
      if (start < total && !pause) {
        setTimeout(() => {
          download()
        }, 1000)
      }
    })
  })
}
```
### serve
```js
// 206 断点续传
let http = require('http')
let fs = require('fs')
let path = require('path')
let a = path.join(__dirname, '1.txt')
let statObj = fs.statSync(a)
//  statObj.size 文件的大小
http.createServer(function (req, res) {
  let range = req.headers.range
  if (range) {
    let [, start, end] = range.match(/bytes=(\d*)-(\d*)/)
    // 如果没有开始 默认是0  如果没有结束 默认是总大小减一
    start = start ? Number(start) : 0
    end = end ? Number(end) : statObj.size - 1
    res.statusCode = 206
    res.setHeader('Content-Range', `bytes ${start}-${end}/${statObj.size}`)
    res.setHeader('Accept-Ranges', 'bytes')
    fs.createReadStream(a, { start, end }).pipe(res)
  } else {
    fs.createReadStream(a).pipe(res)
  }
}).listen(3000, 'localhost', function () {
  console.log('localhost 3000')
})
```
## 304
- 304状态码 缓存有4种
- 强制缓存
  - `Cache-Control:max-age=10` 相对时间缓存
  - `Expires:new Date(Date.now()+10*1000).toGMTString()` 绝对时间缓存
  - `Cache-Control:no-cache` 不设置强制缓存
- 协商缓存
  - `Last-Modified:statObj.ctime.toGMTString()`(文件的修改时间) 这个是服务器发给客户端的
  - `if-modified-since`这个是客户端发给服务端的(浏览器默认) 将他们两个做对比 时间要是一样就 返回statusCode 304 进行缓存

  - `Etag:etag` 服务器发给客户端的 etag是读取文件的内容 一般进行加密，通过请求头发给客户
  - `if-none-match` 服务器会收到客户端的(浏览器默认) 进行对比是否一致 是一样就 返回statusCode 304 进行缓存 否则就重新读取数据返回
```js
let http = require('http')

let fs = require('fs')
let path = require('path')
let url = require('url')
let crypto = require('crypto')

let serve = http.createServer(function (req, res) {
  // 1、强制缓存 当客户段访问服务端时，跟客户端说下次请求别别来找我
  let { pathname } = url.parse(req.url)
  // max-age=10 相对时间  告诉浏览器10s内不在请求我
  // res.setHeader('Cache-Control','max-age=10')
  // Expires 绝对时间
  // res.setHeader('Expires',new Date(Date.now()+10*1000).toGMTString())
  // 清除强制缓存
  res.setHeader('Cache-Control', 'no-cache')

  // 2、一般情况下 会先采用强制缓存 强制缓存使用后 在5s内不会在发请求了，过了5s在次发送请求
  if (pathname === '/') {
    return fs.createReadStream(path.join(__dirname, '304.html')).pipe(res)
  }
  let realPath = path.join(__dirname, pathname)
  fs.stat(realPath, (err, statObj) => {
    if (err) {
      res.statusCode = 404
      return res.end()
    }
    let etag = crypto.createHash('md5').update(fs.readFileSync(realPath, 'utf8')).digest('base64')
    res.setHeader('Etag', etag) // 一般会用文件大小来替代etag
    if (etag === req.headers['if-none-match']) {
      res.statusCode = 304
      res.end()
    } else {
      fs.createReadStream(realPath).pipe(res)
    }

    // 最后的修改时间
    // 最后修改时间不是很准确 这个时间 精确到秒
    res.setHeader('Last-Modified',statObj.ctime.toGMTString())
    let ctime = req.headers['if-modified-since']
    if(ctime === statObj.ctime.toGMTString()){
      // 说明是同一个
      res.statusCode = 304
      res.end();
    }else{
      if(err){
        res.statusCode = 404
        return res.end();
      }else{
        fs.createReadStream(realPath).pipe(res)
      }
    }
  })
})
let port = 3000
serve.listen(port, (err) => {
  console.log('start 3000')
})

// 端口号占用 重新开启一个
serve.on('error', function (err) {
  if (err.errno === 'EADDRINUSE') {
    serve.listen(++port)
  }
})
```

## referer
- 图片防盗链 简单的原理就是 根据`referer`头，这个头会携带host 主机域名,通过查看他与本地的域名是否一致来处理
```js
let http = require('http')
let url = require('url')
let path = require('path')
let fs = require('fs')
http.createServer(function (req, res) {
  let { pathname } = url.parse(req.url, true)
  if (pathname === '/') {
    return fs.createReadStream(path.join(__dirname, '5.html')).pipe(res)
  }
  let realPath = path.join(__dirname, pathname)
  fs.stat(realPath, (err, statObj) => {
    if (err) return res.end()
    if (req.headers['referer']) {
      // 防盗链
      console.log(req.headers)
      let host = req.headers.host.split(':')[1]
      let referer = url.parse(req.headers['referer']).hostname
      console.log(host, referer)
      if (host === referer) {
        console.log('本机')
        fs.createReadStream(realPath).pipe(res)
      } else {
        console.log('防盗')
        return fs.createReadStream(path.join(__dirname, '2.png')).pipe(res)
      }
    } else {
      fs.createReadStream(realPath).pipe(res)
    }
  })
}).listen(9999)
```
## language 
- 多语言 切换路径 或者通过点击来切换
- 下面说下后端实现多语言 主要就是靠请求头`accept-language`接受的是什么语言
```js
let langs = {
  en: 'hello world',
  zh: '你好世界',
  ja: '日文~~~',
  'zh-CN': '中文简体'
}
let defaultLanguage = 'en'

// zh-CN;q=0.8,zh;q=0.9,en
let http = require('http')
http.createServer(function (req, res) {
  let l = req.headers['accept-language']
  res.setHeader("Content-Type","text/plain;charset=utf8")
  if (l) {
    let rs = l.split(',').map(item => {
        let [lan, q = 'q=1'] = item.split(';')
        return {
          name: lan,
          q: Number(q.split('=')[1])
        }
      }).sort((a, b) => b.q - a.q)
      console.log('====', rs)
      for (let i = 0; i < rs.length; i++) {
        let l = rs[i].name
        if (langs[l]) {
          return res.end(langs[l])
        }
      }
      res.end(langs[defaultLanguage])
    } else {
      res.end(langs[defaultLanguage])
  }
}).listen(4000)
```
## 405
- 表示服务端可以接受那些请求方法methods