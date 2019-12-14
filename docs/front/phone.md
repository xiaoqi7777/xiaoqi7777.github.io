# 移动端

[[toc]]

## 手机调试

- weinre
> 借助于网络，可以在PC上直接调试运行在移动设备上的远程页面。
- 安装: cnpm install –g weinre
- 开启 weinre 服务
  - `--httpPort 8090 --boundHost -all-`

:::tip 参数
httpPort: 设置Wninre使用的端口号，默认是8080

boundHost: [hostname | Ip | -all-]: 默认是 ‘localhost’.

debug [true | false] : 这个选项与–verbose类似， 会输出更多的信息。默认为false。

readTimeout [seconds] : Server发送信息到Target/Client的超时时间， 默认为5s。

deathTimeout [seconds] : 默认为3倍的readTimeout， 如果页面超过这个时间都没有任何响应， 那么就会断开连接。

- 如果报错(lookup找不到)

  - mime库 更新 函数名字变更 需要更改下面2个东西在 

  - node_modules\weinre\node_modules\_connect@1.9.2@connect\lib\middleware\static 

  - mime.lookup => mime.getType

  - mime.charsets.lookup => mime.getExtension
:::

- 在浏览器 输入 localhost:8090 
- 点击debug client user interface，进入调试页面。
- 在启动服务器开启一个页面,在页面中加入下面(192.168.1.6:8081 指的是weinre服务器,ip修改成自己的 端口号随意)

```js
<script src="http://192.168.1.6:8081/target/target-script-min.js#anonymous"></script>
```
- 电脑关闭防火墙(建议)
- 在手机上访问 页面地址 就可以了 (ip+项目端口+路径)
- 最后，在调试结束之后，别忘记删除嵌入的script