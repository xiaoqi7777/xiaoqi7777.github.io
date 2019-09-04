# linux

::: tip 基本指令
ssh root@xxx  远程连接

ls -a 查看所有文件 包括隐藏

mkdir xx  创建目录

rmdir xx 删除目录

rm -rf xx 强制删除文件

cd 切换

pwd 显示目录

cp [源文件或者目录] [目标文件] 

mv [源文件或者目录] [目标文件]

ln -s [源文件] [目标文件] -s创建软连接  类似Windows快捷方式 软连接权限都是777 修改任意一个文件，另一个都会改变 软链接源文件必须写绝对路径
```js
// 将java执行文件 链接到一个文件 /usr/bin/java 就指代java执行文件
ln -s /use/java/jdk1.8.0_211/bin/java /usr/bin/java
```
find  find [搜索范围] [搜索条件] 是在系统当中搜索符合条件的文件名，如果需要匹配，使用通配符匹配，通配符是完全匹配

vim xx 编辑文件 

cat  查看文件


:::

```js
// 切换git用户
su - git 

// 查看目录
pwd

// 删除文件
rm -rf xx

// 查看服务器的外网
curl cip.cc

// 往文件写入东西
echo xx > xx.js

// 修改文件权限
chmod 600 xx(文件名字)

// 拷贝文件 将xx 文件拷贝到 /usr/home
cp -r xx  /usr/home

// 通过 yum 安装的 一般通过systemctl start xx(软件名字) 启动
// 查看状态 systemctl status xx

// 查看端口
ps -ef | grep jenkins


// 杀进程
kill -s 9 进程号
```
