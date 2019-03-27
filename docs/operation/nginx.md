# nginx 
[[toc]] 


## 安装
- 安装模块
- yum  -y install gcc gcc-c++ autoconf pcre pcre-devel make automake
- yum  -y install wget httpd-tools vim
- [nginx安装文档](http://nginx.org/en/linux_packages.html#stable)
## CentOS下YUM安装
```js 
vim 
    /etc/yum.repos.d/nginx.repo

写入:
    [nginx]
    name=nginx repo
    baseurl=http://nginx.org/packages/centos/7/$basearch/
    gpgcheck=0
    enabled=1

运行
    yum install nginx -y
    nginx -v
```

## nginx 命令

- rpm -ql nginx  查看所有目录
- 文件配置目录
  - /etc/nginx/nginx.conf
  - /etc/nginx/conf.d/*.conf /etc/nginx/conf.d/default.conf

## /etc/nginx/nginx.conf 默认配置
```js
user  nginx;   设置nginx服务的系统使用用户  
worker_processes  1;  工作进程数,一般和CPU数量相同 

error_log  /var/log/nginx/error.log warn;   nginx的错误日志  
pid        /var/run/nginx.pid;   nginx服务启动时的pid

events {
    worker_connections  1024;每个进程允许的最大连接数 10000
}

http {
    include       /etc/nginx/mime.types;//文件后缀和类型类型的对应关系
    default_type  application/octet-stream;//默认content-type

    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';  //日志记录格式

    access_log  /var/log/nginx/access.log  main;//默认访问日志

    sendfile        on;//启用sendfile
    #tcp_nopush     on;//懒发送

    keepalive_timeout  65;//超时时间是65秒

    #gzip  on;gzip压缩

    include /etc/nginx/conf.d/*.conf;//包含的子配置文件
}

```

## default.conf 默认配置
> 两种方法增加配置 default.conf 里面在下一个server  或者 创建一个xx.conf的文件写server
```js
server {
    listen       80;  //监听的端口号
    server_name  localhost;  //用域名方式访问的地址

    #charset koi8-r; //编码
    #access_log  /var/log/nginx/host.access.log  main;  //访问日志文件和名称

    location / {
        root   /usr/share/nginx/html;  //静态文件根目录
        index  index.html index.htm;  //首页的索引文件
    }

    #error_page  404              /404.html;  //指定错误页面

    # 把后台错误重定向到静态的50x.html页面
    error_page   500 502 503 504  /50x.html; 
    location = /50x.html {
        root   /usr/share/nginx/html;
    }

    # 代理PHP脚本到80端口上的apache服务器
    #location ~ \.php$ {
    #    proxy_pass   http://127.0.0.1;
    #}


    # 不允许访问.htaccess文件
    #location ~ /\.ht {
    #    deny  all;
    #}
}
```

## 启动和重新加载
- systemctl restart nginx.service
- systemctl reload nginx.service
- nginx -s reload

## 内置变量

| 名称        | 含义           | 
| ----------- | :----------|
|$remote_addr |	客户端地址 |
|$remote_user |	客户端用户名称 |
|$time_local |	访问时间和时区 |
|$request |	请求的URI和HTTP协议 |
|$http_host |	请求地址，即浏览器中你输入的地址（IP或域名）|
|$status |	HTTP请求状态 |
|$body_bytes_sent |	发送给客户端文件内容大小 |


## 实战
### 基本设置

| 语法 | 作用|上下文|
| ----------- | :----------: | :----------|
|sendfile>on/off|不经过用户内核发送文件| http,server,location,if in location|
|tcp_nopush>on/off|在sendfile开启的情况 下，提高网络包的传输效率|   http,server,location|
|tcp_nodelay>on/off| 在keepalive连接下，提高网络包的传输实时性|http,server,location|
|gzip>on/off|压缩文件可以节约带宽和提高网络传输效率|http,server,location|
|gzip_comp_level>level|压缩比率越高，文件被压缩的体积越小|http,server,location|
|gzip_http_version>1.0/1.1|压缩HTTP版本|http,server,location|
|gzip_static>on/off| 先找磁盘上找同名的.gz这个文件是否存在,节约CPU的压缩时间和性能损耗|http,server,location|
|expires>time|添加Cache-Control、Expires头|http,server,location|
|add_header>name value|增加请求头|http,server,location|
|valid_referers>none block	server_names|使用http_refer防盗链 |server,location|
```js
server {
    listen       80;  //监听的端口号
    server_name  localhost;  //用域名方式访问的地址

    # 图片处理
    location ~ .*\.(jpg|png|gif)$ {
        gzip off;
        gzip_http_version 1.1;
        gzip_comp_level 3;
        gzip_types image/jpeg image/png image/gif;
        expires 24h;
        root /data/images;
    }

    # 下面 比上面多了一个防盗链
    # 47.104.184.134 服务器id
    location ~ .*\.(jpg|png|gif)$ {
        expires 1h;
        gzip off;
        gzip_http_version 1.1;
        gzip_comp_level 3;
        gzip_types image/jpeg image/png image/gif;
        valid_referers none blocked 47.104.184.134;
        if ($invalid_referer) {
           return 403;
        }
        root /data/images;
    }

    # html等代码处理
    location ~ .*\.(html|js|css)$ {
        gzip on;
        gzip_min_length 1k;
        gzip_http_version 1.1;
        gzip_comp_level 9;
        gzip_types  text/css application/javascript;
        root /data/html;
    }

    # 下载
    location ~ ^/download {
        gzip_static on;
        tcp_nopush on; 
        root /data/download;
    }

    
    # 跨域
    location ~ .*\.json$ {
        add_header Access-Control-Allow-Origin http://localhost:3000;
        add_header Access-Control-Allow-Methods GET,POST,PUT,DELETE,OPTIONS;
        add_header Access-Control-Allow-Headers Content-Type;
        #允许携带凭证 
        add_header Access-Control-Allow-Credentials true;
        root /data/json;
    }
    # 配置跨域的demo

    let xhr = new XMLHttpRequest();
        xhr.open('GET', 'http://47.104.184.134/users.json', true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                console.log(xhr.responseText);
            }
        }
    xhr.send();

}
```
### 负载均衡&& 反向代理

| 语法 | 作用|上下文|
| ----------- | :----------: | :----------|
|proxy_pass>URL|代理服务|server,location|
|upstream>name {}|负载均衡|http|

:::tip 负载均衡分配方式
| 方法 | 作用|
| ----------- | :----------: | 
|轮询（默认） | 每个请求按时间顺序逐一分配到不同的后端服务器，如果后端服务器down掉，能自动剔除。 | 
|weight(加权轮询) | 指定轮询几率，weight和访问比率成正比，用于后端服务器性能不均的情况。 | 
|ip_hash | 每个请求按访问ip的hash结果分配，这样每个访客固定访问一个后端服务器，可以解决session的问题。 | 
|url_hash（第三方） | 按访问的URL地址来分配 请求，每个URL都定向到同一个后端 服务器上(缓存) | 
|fair（第三方） | 按后端服务器的响应时间来分配请求，响应时间短的优先分配。 | 
|least_conn | 最小连接数，哪个连接少就分给谁 | 
|自定义hash | hash自定义key | 
:::

```js
upstream zfpx {
  ip_hash;
  server localhost:3000;
  server localhost:4000;
  server localhost:5000;
}
server {
    listen       80;  //监听的端口号
    server_name  localhost;  //用域名方式访问的地址
    # 反向代理
    resolver 8.8.8.8;
    location ~ ^/api {
        proxy_pass http://127.0.0.1:3000;
    }
}
server {
    listen 8080;
    server_name locahost;
    # 负载均衡
    location / {
        proxy_pass http://zfpx;
    }
}
```
### 缓存

-  proxy_cache

:::tip
http{  
    proxy_cache_path /data/nginx/tmp-test levels=1:2 keys_zone=tmp-test:100m inactive=7d max_size=1000g;  
}  
- proxy_cache_path 缓存文件路径
- levels 设置缓存文件目录层次；levels=1:2 表示两级目录
- keys_zone 设置缓存名字和共享内存大小
- inactive 在指定时间内没人访问则被删除
- max_size 最大缓存空间，如果缓存空间满，默认覆盖掉缓存时间最长的资源。

location /tmp-test/ {  
  proxy_cache tmp-test;  
  proxy_cache_valid  200 206 304 301 302 10d;  
  proxy_cache_key $uri;  
  proxy_set_header Host $host:$server_port;  
  proxy_set_header X-Real-IP $remote_addr;  
  proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;  
  proxy_pass http://127.0.0.1:8081/media_store.php/tmp-test/;  
}

- proxy_cache tmp-test 使用名为tmp-test的对应缓存配置
- proxy_cache_valid 200 206 304 301 302 10d; 对httpcode为200…的缓存10天
- proxy_cache_key $uri 定义缓存唯一key,通过唯一key来进行hash存取
- proxy_set_header 自定义http header头，用于发送给后端真实服务器。
- proxy_pass 指代理后转发的路径，注意是否需要最后的/
:::