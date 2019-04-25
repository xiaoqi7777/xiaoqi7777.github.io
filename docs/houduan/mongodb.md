# MongoDB

## MongoDB
- 基本概念
  -  数据库:mongoDB的单个实例可以容纳多个独立的数据库
  -  集合:数据库是由集合组成,一个集合用来表示一个实体
  -  文档:集合是由文档组成的,一个文档表示一条记录 
- 安装
  - [MongoDB64位绿色版 链接:]( https://pan.baidu.com/s/1EkAB2SrcU1mfMfff_WDxtA )  密码: w913
- 启动(默认端口号 27017)
	- 打开安装的bin目录(mongod.exe 是开启服务的) cmd
	- 服务端  mongod --dbpath=./data   ./data 就是存储数据的 可以随便指定
	- 客户 客户端开启 mongo
- 添加环境变量就能在任何目录下 输入命令了
	- 在环境变量的 path 里添加 bin 的目录

```js
 基本指令操作:
	
	1、操作数据库
	show dbs 显示数据库
	use xxx  切换数据库/若没有 就是创建
	db  查看当前使用的数据库
	db.dropDatabase() 删除数据库
		
	2、操作集合 (xxx 代表集合名字)
	show collections  查看集合
	db.createCollection('name') 创建空集合
	db.xxx.drop()		删除集合 
	db.xxx.find() 查看数据库所有字段

	3、更新文档
	db.xxx.update({_id:1},{name:1})  更新后就只有name属性 其他的都没了
	db.xxx.update({_id:1},{$set:{name:1}})  只更新name属性
	db.xxx.update({},{$inc:{name:1}  累加 第一个参数没有给就给所有的文档 name都加1
	db.xxx.update({},{name:'xx'},{upsert:true})  更新插入
	db.xxx.update({},{${set:name:'xx'}})	默认更新匹配到的第一条
	db.xxx.update({},{${set:name:'xx'}},{multi:true})	若是要更新所有 加第三个参数
	db.xxx.update({_id:1},{$unset:{age:xx}})	删除文档的指定字段

	往数组加数据
	db.xxx.update({_id:1},{$push:{hobbies:'smokeing'}})  (重复执行 就添加2条一样的)
	db.xxx.update({id:1},{$addToSet:{hobbies:'drinking'}}) 不会添加重复的    
	将数组放置 数组内 而且平铺
		var arr = ['1','2']
		db.xxx.update({_id:1},{$addToSet:{hobbies:{$each:arr}}})
	db.xxx.update({_id:1},{$pop:{hobbies:0}}) 删除数组内的

	
	db.xxx.remove({_id:1}) 删除 删除所有匹配的记录
	db.xxx.remove({age:1},{justOne:true}) 删除匹配的第一条

	db.xxx.find({}); 查询 默认查询所有
	db.xxx.find({},{name:1}) 只返回 有name的 也只返回name和_id  name后面的0表示不出现  1表示出现 _id 默认出现	
	db.xxx.find({},{name:0}) 这样就是除了name列 其他都出现
	db.xxx.find({},{name:0,age:1})	第二个参数 除了_id 不能即出现0又出现1  一般 只要1或少数字段 就用1,要多数字段就用0

	写正则
	db.xxx.insert({name:'123566'})
	查找都可以
	db.xxx.find({name:/^123/})
	db.xxx.find({name:/23/})

	分页
	skip 跳过指定的条数
	limt 限制返回的条数
	exec 开始执行
	sort age代表里面的字段 1代表升序 -1代表降序 (默认是按照_id排序)
	有sort的情况 先排序 在算skip limt(因为 查询是异步)  sort放前放后都可以
	db.stu.find().skip(3).limt(3).sort({age:1}).exec()
	
	         
	备份 
	将school数据备份到./bk文件里面
	mongodump --out ./bk --collection stu --db school
	导入 将备份的文件还原到数据库
	mongorestore ./bk
```

## mongoose
> 是mongodb的一个对象模型工具
- Schema 数据库集合的模型骨架
- 数据类型 
	- NodeJs中基本数据类型都属于Schema.Type
	- mongoose.Schema.Types.ObjectId (ObjectId 在mongoose实例下才能获取到的类型)
```js
var personSchema = new Schema({
			name:String, //姓名
			binary:Buffer,//二进制
			living:Boolean,//是否活着
			birthday:Date,//生日
			age:Number,//年龄
			_id:Schema.Types.ObjectId,  //主键
			_fk:Schema.Types.ObjectId,  //外键
			array:[],//数组
			arrOfString:[String],//字符串数组
			arrOfNumber:[Number],//数字数组
			arrOfDate:[Date],//日期数组
			arrOfBuffer:[Buffer],//Buffer数组
			arrOfBoolean:[Boolean],//布尔值数组
			arrOfObjectId:[Schema.Types.ObjectId]//对象ID数组
			nested:{ //内嵌文档
					name:String,
			}
		});
```
- 配合node使用
```js
let mongoose = require('mongoose');
//useNewUrlParser这个属性会在url里识别验证用户所需的db
// test 是数据库的名字 随意写
const conn = mongoose.createConnection('mongodb://localhost:27017/test',{useNewUrlParser:true})

let UserSchema = new mongoose.Schema({
    username:{type:String,required:true},
    password:String,
    age:Number,
    createAt:{type:Date,default:Date.now}
},{collection:'user'})
//集合的名字是来自于模型的名字, 模型名>小写>复数
let User = conn.model('sd',UserSchema);
//插入文档 可放单个 也可以放文档
(async ()=>{
    //  User.create添加数据
    let user = await User.create({
        username:'lisi',
        age:10,
        password:'123456'
    })
    console.log('user',user)
    // User.updateOne 更新第一条数据
    // User.updateMany 更新多条
    // 第一个参数是更新的条件 第二个参数是要更新的内容
    let updateResult = await User.updateMany({username:'lisi'},{age:121})
    console.log(updateResult)
    // User.find 查询数据
    // User.findOne 查询一条
    let queryResult = await User.find({username:'lisi'},{username:1,age:1})
    // 通过ID查找
    let rs1 = await User.findById('5ca0c6e7c4b03802b8f03587')
    // $exist:true 表示age字段要存在  $gt:1,$lte:10 表示age 1<age=<10  username在lisi或者张三之间
    let rs2 = await User.find({age:{$exist:true},age:{$gt:1,$lte:1000},username:{$in:['lisi','张三']}})
    console.log('queryResult',rs2)
})()

```

- 主外键联合
```js

// 主外键 绑定
let mongoose = require('mongoose');
// ObjectId 类型是 mongoose 自带的
let ObjectId = mongoose.Schema.Types.ObjectId
const conn = mongoose.createConnection('mongodb://localhost:27017/sg',{useNewUrlParser: true})

let UserSchema = new mongoose.Schema({
    username:String,
    password:String,
    createAt:{type:Date,default:Date.now}
})
let UserModel = conn.model('User12',UserSchema);

let ArticleShema = new mongoose.Schema({
    title:String,
    content:String,
    // 类似主外键 ref 指向 要绑定的User
    User1:{type:ObjectId,ref:'User12'},
})
let ArticleModel = conn.model('Article',ArticleShema);

// 联表操作
(async function () {
    let user = await UserModel.create({username:'wangwu'});
    let article = await ArticleModel.create({title:'标题',content:'内容',User1:user._id})  
    //populate 里面的值 要指向ArticleModel 的key
    let rs = await ArticleModel.findById(article._id).populate('User1');
    console.log('rs',rs)
    /*
        let userId = article.user;
        let rs = await User.findById(userId)
        console.log('rs',rs)
     */
})()
```