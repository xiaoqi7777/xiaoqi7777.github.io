# Mockjs
[[toc]]

[文档](http://mockjs.com/examples.html)
[Mock.js](https://github.com/nuysoft/Mock/wiki/Getting-Started)

## 配合express搭建
```js
  let express = require('express')
    let Mock = require('mockjs')
    let app = express()
    app.get('/user',function(req,res){
    let result = Mock.mock({
      code:0,
      message:'成功',
      "data|20":[{
          "name":"@cname",
          "userId":"@id",
          "createAt":"@datetime"
        }]
      })
      res.json('自动生成随机数据',result)
    })
    app.listen(7000)
```
```html
  <script>
      let xhr = new XMLHttpRequest;
      xhr.open('GET','http://localhost:7000/user.json',true)
      xhr.onreadystatechange = function(){
        if(xhr.readyState == 4 && xhr.status == 200){
          console.log(xhr.responseText);
        }
      }  
      xhr.send()
  </script>
```
##  easy-mock 
[easy-mock](https://easy-mock.com/login)
- Easy Mock就是一个在线创建mock的服务平台，帮你省去你 配置、安装、起服务、维护、多人协作Mock数据不互通等一系列繁琐的操作
- 不需要本地搭建服务  直接生成数据 生成连接
