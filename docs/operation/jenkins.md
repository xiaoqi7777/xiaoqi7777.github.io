# jenkins

## git

### 搭建git服务器
- 安装git
```js
yum install -y git
```
- 创建git用户
```js
useradd git
passwd git
```
- 创建仓库
  - git init 会创建一个.git配置文件 提交代码用
  - git init --bare  只会创建一个仓库 让别人提交代码
```js
su - git
mkdir -p ~/repos/app.git
cd ~/repos/app.git
git --bare init
```

### 创建git客户端
```js
cd /usr/local/src
// clone 刚才创建的 git服务器  
// git(是用户名) @后面接服务器的地址 : 后面接git服务器的路径
git clone git@192.168.20.131:/home/git/repos/app.git

// 创建文件 提交就可以了
```

- 实现SsH无密码 提交
  - 需要在客户端生成一个公钥
    - 生产公钥 
    - ssh-keygen -t rsa
    - 在`~/.ssh/` 目录生成2个密钥 id_rsa 是私钥 id_rsa.pub 是公钥
    - copy 公钥即可
  - 在服务端，把客户端的公钥添加到authorize_keys文件里 
    - 同样在服务器端生成配置文件`ssh-keygen -t rsa`
    - 创建一个文件，定时的名字 `vi authorized_keys`
    - 将客户端的公钥粘贴进去就可以了

## Jenkins 

### 安装java
- 安装JDK
```JS
// 下载包
wget http://img.zhufengpeixun.cn/jdk1.8.0_211.tar.gz
// 解压包 x解压 z原来是一个gz的包 v显示解压的过程 f指定文件名
tar -xzvf jdk1.8.0_211.tar.gz 
// 将解压的文件 cp 走
cp -r jdk1.8.0_211 /usr/java
// java的执行文件
/use/java/jdk1.8.0_211/bin/java
// 执行查看版本
/use/java/jdk1.8.0_211/bin/java -version 

// 将java执行文件 链接到一个文件 /usr/bin/java 就指代java执行文件
ln -s /use/java/jdk1.8.0_211/bin/java /usr/bin/java

// 配置环境变量  java 就可以在全局访问到了
vi /etc/profile
// 在文件最后加入 下面的 路径根据自己的情况
JAVA_HOME=/usr/java/jdk1.8.0_211
export CLASSPATH=.:${JAVA_HOME}/jre/lib/rt.jar:${JAVA_HOME}/lib/dt.jar:${JAVA_HOME}/lib/tools.jar
export PATH=$PATH:${JAVA_HOME}/bin

// 使刚才的配置文件生效
source /etc/profile

// 这样全局就可以使用 java了
java -version
```

### 安装jenkins
[下载](https://pkg.jenkins.io/redhat-stable/)
```js
// 1
sudo wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat-stable/jenkins.repo
// 2
sudo rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io.key
// 3
yum install jenkins
// 卸载
service jenkins stop
yum clean all
yum -y remove jenkins

// 启动
systemctl start jenkins
// 重启
systemctl restart jenkis
// 查看状态
systemctl status jenkins


// 密码存放位子
/var/lib/jenkins/secrets/initialAdminPassword

// 修改jenkins 默认端口
vim /etc/sysconfig/jenkins
// 找到 JENKINS_PORT="8080" 这个就是默认的8080  将他修改即可 

```

- 关闭防火墙
```js
systemctl stop firewalld.service
systemctl disable firewalld.service
```
## jenkins使用
### 角色和用户管理 
- 安装 Role-based Authorization Strategy 插件
- 首先注册2个账号分别 zhangsan/lisi 
- `系统管理->Manage Roles` 配置管理角色
<img :src="$withBase('/img/manageroles.jpg')" >

- `系统管理->Assign Roles` 配置分配角色
<img :src="$withBase('/img/assignroles.jpg')" >

- 新建任务`dev-first&&qa-first`
 - 新建任务 构建过程加上git，配置如下
 - 有几点要注意
 - 1、jenkins 拉去git代码 需要jenkins 获取ssh公钥,配置到git服务器中 
 - 2、修改jenkins配置文件 将用户修改成root,`vim /etc/sysconfig/jenkins`,修改为`JENKINS_USER="root"`
 - 3、Repository URL 写git的地址 
 - 只要服务器有新的分支 jenkins 就能更新到
<img :src="$withBase('/img/jenkinstasks.jpg')" >
<img :src="$withBase('/img/managecode.jpg')" >
<img :src="$withBase('/img/parameter.jpg')" >







