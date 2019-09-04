# docker

> Docker 属于 Linux 容器的一种封装，提供简单易用的容器使用接口。它是目前最流行的 Linux 容器解决方案。Docker 将应用程序与该程序的依赖，打包在一个文件里面。运行这个文件，就会生成一个虚拟容器。程序在这个虚拟容器里运行，就好像在真实的物理机上运行一样

[[toc]]

## 安装
- [docker 连接](https://docs.docker.com/install/linux/docker-ce/centos/)
- docker 自带DNS功能  可以通过名字 互相访问
- 所有的指令都是 docker 打头
:::tip centos7.2中安装docker
- yum -y install docker-io

- docker version

- docker info

- 启动docker服务 systemctl start docker
:::

##  Docker架构
<img :src="$withBase('/img/docker.jpg')" >

## 阿里云加速
```js
mkdir -p /etc/docker
tee /etc/docker/daemon.json <<-'EOF'
{
  "registry-mirrors": ["https://fwvjnv59.mirror.aliyuncs.com"]
}
EOF
systemctl daemon-reload
systemctl restart docker
```

## image    
>镜像  image 文件可以看作是容器的模板 一个 image 文件往往通过继承另一个 image 文件，加上一些个性化设置而生成  用来实例化的  可比喻一个类 

- 基本操作

| 命令        | 含义       |  案例|
| ----------- | ----------| ---- |
| images | 查看全部镜像 | docker image ls|
| search | 查找镜像 | docker search [imageName]|
| pull | 拉取镜像 | docker pull [imageName]|
| rmi | 删除镜像 | docker rmi [imageName]|

## 容器 
> docker run 命令会从 image 文件，生成一个正在运行的容器实例 就像 new object 一样

| 命令        | 含义       |  案例|
| ----------- | ----------| ---- |
| run | 从镜像运行一个容器 | docker run ubuntu /bin/echo 'hello-world' | 
| --rm | 运行完自动删除 |docker run --rm ubuntu /bin/bash|
| ps | 查看当前运行的容器 | docker ps -a -l | 
| kill [containerId] | 终止容器(发送SIGKILL ) | docker kill [containerId] | 
| rm [containerId] | 删除容器 | docker rm [containerId] | 
| start [containerId] | 启动已经生成、已经停止运行的容器文件 | docker start [containerId] | 
| stop [containerId] | 终止容器运行 (发送 SIGTERM ) | docker stop [containerId] | 
| logs [containerId] | 查看 docker 容器的输出 | docker logs [containerId] | 
| attach [containerId]| 进入容器 | docker attach [containerId]|
| exec [containerId] | 进入一个正在运行的 docker 容器 | docker container exec -it [containerID] /bin/bash | 
| cp [containerId] | 从正在运行的 Docker 容器里面，将文件拷贝到本机 | docker container cp [containID]:app/package.json  | 

## 制作镜像 && 使用
```js
制作个性化镜像
    docker commit -m"hello" -a "songge" [containerId] songge/hello:latest
    docker images
    docker run zhangrenyang/hello /bin/bash
```
###  制作Dockerfile
> docker inspect centos
- Docker 的镜像是用一层一层的文件组成的
- docker inspect命令可以查看镜像或者容器
- Layers就是镜像的层文件，只读不能修改。基于镜像创建的容器会共享这些文件层
- .dockerignore(忽略文件)
  - .git
  - node_modules
:::tip 编写Dockerfile


|命令	  |    含义  | 案例 |
| ---- | :----|---|
|FROM	   |  继承的镜像	       |  FROM node |
|COPY	   |  拷贝	         |   COPY ./app /app |
|WORKDIR |	    指定工作路径	   |  WORKDIR /app |
|RUN	    | 编译打包阶段运行命令   | 	 RUN npm install |
|EXPOSE   |	暴露端口	     |    EXPOSE 3000 |
|CMD	   |  容器运行阶段运行命令	 | CMD npm run start |

:::

### Dockerfile编写例子 && 使用
```js
1、node 安装
    wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash
    source ~/.bashrc
    nvm install stable
    node -v
    npm i cnpm -g
    npm i nrm -g

    文件传输要安装 rz
    yum install lrzsz
 
    service nginx status //查看nginx开启状态
    service nginx start
    
    // 使用lsof
    yum install lsof
    lsof -i:8080 //查看8080端口
  
    // 杀进程
    kill -s 9 进程号

    // 开启服务 后台运行
    node serve.js &

    // 安装 git
    yum install -y git
    // 创建git用户
    useradd git
    passwd git
2、安装express
    npm install express-generator -g
    express app

3、Dockerfile
    vim Dockerfile
    写入 
        FROM node
        COPY ./app /app
        WORKDIR /app
        RUN npm install
        EXPOSE 3000
4、运行 docker build -t express-demo .
-t用来指定image镜像的名称，后面还可以加冒号指定标签，如果不指定默认就是latest
.表示Dockerfile文件的所有路径,.就表示当前路径

5、使用
docker container run -p 3333:3000 -it express-demo /bin/bash

6、发布
docker login
docker image tag [imageName] [username]/[repository]:[tag]
docker image build -t [username]/[repository]:[tag] .

docker tag express-demo songge/express-demo:1.0.0
docker push songge/express-demo:1.0.0
```
- 3注释
    - FROM 表示该镜像继承的镜像 :表示标签
    - COPY 是将当前目录下的app目录下面的文件都拷贝到image里的/app目录中
    - WORKDIR 指定工作路径，类似于执行 cd 命令
    - RUN npm install 在/app目录下安装依赖，安装后的依赖也会打包到image目录中
    - EXPOSE 暴露3000端口，允许外部连接这个端口
- 4注释
    - -p 参数是将容器的3000端口映射为本机的3333端口,通过访问本机的3333端口就可以 访问到容器的3000
    - -it 参数是将容器的shell容器映射为当前的shell,在本机容器中执行的命令都会发送到容器当中执行express-demo image的名称
    - /bin/bash 容器启动后执行的第一个命令,这里是启动了bash容器以便执行脚本
    - --rm 在容器终止运行后自动删除容器文件

## 数据盘
- 删除容器的时候，容器层里创建的文件也会被删除掉，如果有些数据你想永久保存，比如Web服务器的日志，数据库管理系统中的数据，可以为容器创建一个数据盘。
- 创建容器的时候我们可以通过-v或--volumn给它指定一下数据盘

- 指定数据盘
  - ~/data:/mnt 把当前用户目录中的data目录映射到/mnt上
  - : 前是linux内的空间  后是容器内的空间
```js
mkdir ~/data
docker run -v ~/data:/mnt -ti --name logs2 centos bash
cd /mnt
echo 3 > 3.txt
exit
cat ~/data/3.txt
```


- 容器共享数据盘
```js
docker create -v /mnt --name logger centos (在linux中创建数据盘,name=>logger)
docker run --volumes-from logger --name logger3 -i -t centos bash(初始化容器指定logger容器)
cd /mnt 
touch logger3
docker run --volumes-from logger --name logger4 -i -t centos bash
cd /mnt
touch logger4
```

- 管理数据盘
```js
docker volume ls 列出所有的数据盘
docker volume ls -f dangling=true 列出已经孤立的数据盘
docker volume rm xxxx
docker volume ls
docker rm logger1 logger2
docker volume inspect xxx
docker rm logger -v
```

## 网络
- docker里面有一个DNS服务，可以通过容器名称访问主机 网络类型
:::tip

none 无网络，对外界完全隔离

host 主机网络

bridge 桥接网络，默认网络

:::

- bridge 
```js
docker network ls
docker inspect bridge
docker run -d --name server1 nginx
docker run -d --name server2 nginx
docker exec -it server1 bash
ping server2
```

- none
```js
docker run -d --name server_none --net none nginx
docker inspect none
docker exec -it server_none bash
ip addr
```

- host 
```js
docker run -d --name server_host --net host nginx
docker inspect none
docker exec -it server_host bash
ip addr
```

- 访问桥接网络里面的服务
  - 访问主机的8080端口会被定向到容器的80端口
```
docker inspect nginx
docker run -d --name server_nginx -p "8080:80"  nginx
```

- 查看主机绑定的端口
```js
docker inspect [容器名称]
docker port server_nginx
```

## compose 
```js
 安装 pip install docker-compose
```
- Compose 通过一个配置文件来管理多个Docker容器，在配置文件中，所有的容器通过services来定义，然后使用docker-compose脚本来启动，停止和重启应用，和应用中的服务以及所有依赖服务的容器，非常适合组合使用多个容器进行开发的场景 步骤：
- 在 docker-compose.yml 中定义组成应用程序的服务，以便它们可以在隔离的环境中一起运行。
- 最后，运行docker-compose up，Compose 将启动并运行整个应用程序。 配置文件组成
- services 可以定义需要的服务，每个服务都有自己的名字、使用的镜像、挂载的数据卷所属的网络和依赖的其它服务。
- networks 是应用的网络，在它下面可以定义使用的网络名称，类性。
- volumes是数据卷，可以在此定义数据卷，然后挂载到不同的服务上面使用。

### docker-compose.yml 使用
- 空格缩进表示层次
- 冒号空格后面有空格
```
version: '2'
services:
  zfpx1:
    image: nginx
    port:
      - "8080:80"
  zfpx2:
    image: nginx
    port:
      - "8081:80"
```

- nginx工具包
> docker体积很小 
```js
apt update
#ping
apt install inetutils-ping 
#nslookup
apt install dnsutils   
#ifconfig 
apt install net-tools    
#ip
apt install iproute2     
#curl
apt install curl
```

- 启动
```js
docker-compose up 启动所有的服务
docker-compose -d 后台启动所有的服务
docker-compose ps 打印所有的容器
docker-compose stop 停止所有服务
docker-compose logs -f 持续跟踪日志
docker-compose exec zfpx1 bash 进入zfpx服务系统
docker-compose rm 删除服务容器
docker network ls 网络不会删除
docker-compose down 删除网路
```

## 实战
- nodeapp 是一个用 Docker 搭建的本地 Node.js 应用开发与运行环境。
:::tip 服务

node：启动node服务

web：使用 nginx 作为应用的 web 服务器

:::

:::tip  结构 

- app：这个目录存储应用

    - web 放应用的代码

- services： 环境里定义的服务需要的一些服务

- images: 方式一些贬义的脚本和镜像

- docker-compose.yml：定义本地开发环境需要的服务

- images/nginx/config/default.conf 放置nginx 配置文件

- node 的Dockfile配置文件

:::

- docker-compose.yml
```js
version: '2'
services:
 node:
  build:
    context: ./images/node
    dockerfile: Dockerfile
  volumes:
    - ./app/web:/web
  depends_on:
   - db
 web:
  image: nginx
  ports:
   - "8080:80"
  volumes:
   - ./images/nginx/config:/etc/nginx/conf.d
   - ./app/web/views:/mnt/views  
  depends_on:
   - node
 db:
  image: mariadb
  environment:
   MYSQL_ROOT_PASSWORD: "root"
   MYSQL_DATABASE: "node"
   MYSQL_USER: "zfpx"
   MYSQL_PASSWORD: "123456"
  volumes:
    - db:/var/lib/mysql
volumes:
 db:
  driver: local
```
-  app/web/server.js 
```js
let http=require('http');
var mysql  = require('mysql');
var connection = mysql.createConnection({
  host     : 'db',
  user     : 'zfpx',
  password : '123456',
  database : 'node'
});

connection.connect();

let server=http.createServer(function (req,res) {
    connection.query('SELECT 2 + 2 AS solution', function (error, results, fields) {
        if (error) throw error;
        res.end(''+results[0].solution);
    });
});
server.listen(3000);
```
-  package.json 
```js
"scripts": {
    "start": "node server.js"
  },
```

-  images/node/Dockerfile
```js
FROM node
MAINTAINER zhangrenyang <zhang_renyang@126.com>
WORKDIR /web
RUN npm install
CMD npm start
```

-  images/nginx/config/default.conf
```js
upstream backend {
    server node:3000;
}
server {
    listen 80;
    server_name localhost;
    root /mnt/views;
    index index.html index.htm;

    location /api {
        proxy_pass http://backend;
    }
}
```