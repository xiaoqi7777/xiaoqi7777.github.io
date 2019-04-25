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
