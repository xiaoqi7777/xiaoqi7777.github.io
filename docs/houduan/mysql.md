# mysql
[[toc]]

- [下载安装](https://dev.mysql.com/downloads/mysql/5.5.html)
- MYSQL启动和停止(可在 我的电脑=> 管理=> 服务 里面查找mysql是否跑起)
  - net start MySQL
  - net stop MySQL
- 进入安装目录 
  - C:\Program Files\MySQL\MySQL Server 5.5\bin
  - cmd
  - 执行 mysql 就可以连接

## 数据库基本操作
```js
    查看数据库 show databases;
    切换数据库 use test;
    查看表     show tables;
    查看当前所在的数据库 select database();
    查看表结构 desc user;

    SQL语言
    关键字用大写  自己定义的用小写

    表的数据 
    先建主表数据 在建子表数据
    先删子标数据 在删主表数据
```

## 基本查询操作
```js
  //常规
  select 列名
  FROM  表名
  WHERE 查询条件表达式
  ORDER BY 排序的列名 ID ASC或者DESC

  // as 是别名 2 '和' 是常量列
  SELECT id as '主键',name as '姓名',2 '和'
  FROM student
  WHERE city = '北京'
  ORDER BY id DESC

  // 分页 LIMIT offset(跳过的条数),limit
  SELECT *
  FROM student 
  LIMIT 2,2

  // 相同的记录只会出现一次
  SELECT DISTINCT city
  FROM student

  //字符串默认都是0  '数字' =>数字
  SELECT 1+'1'
  SELECT 1+'XDSA' 

  // 返回字符串的长度
  SELECT LENGTH('abcde')

  // 拼接字符 
  SELECT  CONCAT('aa','ss')
  SELECT CONCAT_WS('aaa','#','qq','@')

  // 转大写
  SELECT UPPER('ss')
  SELECT LOWER('SS')

  //查询的结果转化成=> 第一个首字母大写 后面都小写
  SELECT CONCAT(UPPER(SUBSTR(name,1,1)),LOWER(SUBSTR(name,2))) FROM student
```
## node连接数据库
```js
  var mysql = require('mysql')

  var connection = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'root',
    database:'studb'
  })
  connection.connect();
  connection.query('SELECT * FROM course', function (error, results, fields) {
    if (error) throw error;
    console.log('查看course表的所有信息', results);
  });
```