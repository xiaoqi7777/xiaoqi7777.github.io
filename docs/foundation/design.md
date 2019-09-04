# 设计模式
[[toc]] 
## OO 
- 面向对象
- 把同一个类型的客观对象的属性数据和操作绑定在一起，封装成类，并且允许分成不同层次进行抽象，通过继承实现属性和操作的共享
  - 继承(子类继承父类) 封装(父类进行内部封装) 多态(子类实例化的不用,多种形态)

### 继承
  - 继承可以把公共方法抽离出来，提高复用，减少冗余
```js
	class Animal{
		constructor(name) {
				this.name=name;
		}
		eat() {
				console.log(`${this.name} eat`)
		}
		speak() {

		}
	}

	let animal=new Animal('动物');
	animal.eat();

	class Dog extends Animal{
		constructor(name,age) {
				super(name);
				this.age=age;
		}
		speak() {	
				console.log(`${this.name} is barking!`);
		}
	}

	let dog=new Dog('🐶',5);
	dog.eat();
	dog.bark();
```
### 封装 (借助ts)
- 把数据封装起来
- 减少耦合，不该外部访问的不要让外部访问
- 利于数据的接口权限管理
- ES6 目前不支持，一般认为_开头的都会私有的，不要使用
- 实现(借助ts)
  - public:公有修饰符，可以在类内或者类外使用public修饰的属性或者行为，默认修饰符
  - protected:受保护的修饰符，可以本类和子类中使用protected修饰的属性和行为
  - private : 私有修饰符，只可以在类内使用private修饰的属性和行为

::: tip ts
安装 npm install -g typescript

执行 tsc 1.ts
:::

```js
class Animal {
			public name;
			protected age;
			private weight;
			constructor(name,age,weight) {
				this.name=name;
				this.age=age;
				this.weight=weight;
			}	
		}
	class Person extends Animal {
			private money;
			constructor(name,age,weight,money) {
					super(name,age,weight);
					this.money=money;
			}
			getName() {
					console.log(this.name);
			}
			getAge() {
					console.log(this.age);
			}
			getWeight() {
					console.log(this.weight);
			}
	}
	let p=new Person('zfpx',9,100,100);
	console.log(p.name);
	console.log(p.age);
	console.log(p.weight);		

	// webpack 配置
	module: {
		rules: [
			{
				test: /\.js$/,
				use: {
					loader: 'babel-loader',
					options: {
						presets:["@babel/preset-env"]
					}
				}
			},
			{
				test: /\.ts$/,
				use: {
						loader: 'ts-loader'
				}
			}
		]
	}
```

### 多态
 - 同一个接口可以不同实现(一个类根据传入的不同 得到的实例不同)

```js
class Animal {
			public name;
			protected age;
			private weight;
			constructor(name,age,weight) {
					this.name=name;
					this.age=age;
					this.weight=weight;
			}
	}
	class Person extends Animal {
			private money;
			constructor(name,age,weight,money) {
					super(name,age,weight);
					this.money=money;
			}
			speak() {
					console.log('你好!');
			}    
	}
	class Dog extends Animal {
			private money;
			constructor(name,age,weight) {
					super(name,age,weight);
			}
			speak() {
					console.log('汪汪汪!');
			}    
	}

	let p=new Person('zfpx',10,10,10);
	p.speak();
	let d=new Dog('zfpx',10,10);
	d.speak();
```
## 发布订阅模式

## 观察者模式

<img :src="$withBase('/img/observe.png')" >

- 被观察者提供维护观察者的一系列方法
- 观察者提供更新接口
- 观察者把自己注册到被观察者里面
- 在被观察者发生变化的时候,调用观察者的更新方法

### 伪代码(讲述明星和粉丝的故事)

```js
// 被观察者
class Star{
  constructor(name){
    this.name = name;
    this.state = '';
    // 被观察者 内部维护一个 观察者数组
    this.observers = [];//粉丝
  }
  getState(){
    return this.state
  }
  setState(state){ 
    this.state = state;
    this.notifyAllObservers()
  }
  // 增加一个新的观察者
  attach(observer){
    this.observers.push(observer)
  }
  // 通知所有的观察者更新自己
  notifyAllObservers(){
    if(this.observers){
      this.observers.forEach(observer=>observer.update())
    }
  }
}
// 观察者
class Fan{
  constructor(name,start){
    this.name = name;
    this.start = start
    // 通过start里的方法 把自己注入到start的observers里面
    this.start.attach(this);
  }
  update(){
    console.log(`当前颜色是 => ${this.start.getState()}`);
  }
}

let star = new Star('Angular Baby')
let f1 = new Fan('张三',star)
let f2 = new Fan('李四',star)
star.setState('绿色')
```
### 场景
- promsie then的时候
  - new Pormise() 的时候 会执行里面的函数,将值保存起来。等到then的时候之前的结果返回
- vue 和 react里生命周期,只有等到运行 这儿时期的时候(触发当前生命周期) 才会去调用
- node events对象里的 on 和 emit

## 发布订阅

<img :src="$withBase('/img/publish.png')" >

- 订阅者把自己想订阅的事件注册到调度中心
- 当该事件触发的时候,发布者发布该事件到调度中心,由调度中心统一调度订阅者注册事件的处理代码

### 伪代码(房东和租客的故事)
```js
class Agent{
  constructor(){
    this._events = {}
  }
  // on
  subscribe(type,listener){
    let listeners = this._events[type]
    if(listeners){
      listeners.push(listener)
    }else{
      this._events[type] = [listener]
    }
  }
  // emit 
  publish(type){
    let listeners = this._events[type]
    let args = Array.prototype.slice.call(arguments,1)
    if(listeners){
      listeners.forEach(listener=>listener(...args))
    }
  }
}
// 房东
class LandLord{
  constructor(name){
    this.name = name
  }
  // 向外出租
  lend(agent,area,money){
    agent.publish('house',area,money)
  }
}
// 租客
class Tenant{
  constructor(name){
    this.name = name
  }
  rent(agent){
    agent.subscribe('house',(area,money)=>{
      console.log(`${this.name}看到中介的新房源${area},${money}`)
    })
  }
}

let agent = new Agent();
let t1 = new Tenant('张三');
let t2 = new Tenant('李四');
t1.rent (agent)
t2.rent (agent)
let landLord = new LandLord();
landLord.lend(agent,60,400)

```
### 场景
- mvvm使用
<img :src="$withBase('/img/mvvm.png')" >


## 发布订阅&&观察者(区别)
<img :src="$withBase('/img/o_p.png')" >
- 1、角色不一样，发布订阅(3者，发布者&&订阅者&&调度中心)，观察者(2者，观察者&&被观察者)
- 2、观察者&&被观察者存在依赖，发布订阅则是解耦
- 3、调度人不同，观察者模式是由被观察者调度，发布订阅是由调度中心调度