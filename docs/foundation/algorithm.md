# 算法
[[toc]]

## 1、随机打乱100W条数据

```js
ger(100)
function gen(w){
	const arr = []
	for(let i=0;i<w*10000;i++){
		arr[i] = i+1
	}
}
// 将数组随机打乱 这个比较合适
1、function fisher_yates_shuffle(arr){
	for(let i=0;i<arr.length -1;i++){
		// 从 [i,arr.length-1] 取索引
		// const j = i + Math.floor(Math.random() * (arr.length - i));
		const j = Math.floor(Math.random() * (arr.length - 2*i)+i);
		
		// 在通过数组位子调换 值
		[ arr[i], arr[j] ] = [ arr[j], arr[i]]
				console.log('j',j,arr[j])
	}
	return arr
}
// 这种简单 但是计算时间长
2、function shuffle_simple(arr){
	return	arr.sort(()=>Math.random()-.5)
}

let rs = fisher_yates_shuffle(['1','2','3','4','5'])
console.log('rs',rs)

```

## 排序算法总结
- 冒泡法
	-	每次循环都两两比较，每循环一次都把最大的值放在后边。
```js
function bubbleSort(arr) {
        var len = arr.length;
        for (var i = 0; i < len; i++) {
            for (var j = 0; j < len - 1 - i; j++) {
                if (arr[j] > arr[j + 1]) {
                    var temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                }
            }
        }
        return arr;
    }
```
-	选择排序法
	-	从一个未知数据空间，选取数据之最放到一个新的空间。
```js
function selectSort(arr) {
        var len = arr.length;
        var minIndex = 0;
        for (var i = 0; i < len - 1; i++) {
            minIndex = i;
            for (var j = i + 1; j < len; j++) {
                if (arr[j] < arr[minIndex]) {
                    minIndex = j;
                }
            }
            var temp = arr[i];
            arr[i] = arr[minIndex];
            arr[minIndex] = temp;
        }
        return arr
    }
```
- 插入排序
	-	在一个数组中我们不知道哪个是最小值，那么就假定第一个就是最小值，然后取第二个值与第一个值比较产排序后的序列，然后再取第三个值与排序后的序列进行比较插入到对应的位置，依次类推。
```js
 function insertSort(arr) {
        var len = arr.length;
        for (var i = 1; i < len; i++) {
            var key = arr[i];
            var j = i - 1;
            while (arr[j] > key) {
                arr[j + 1] = arr[j];
                j--;
            }
            arr[j + 1] = key;

        }
        return arr;
    }
```

- 归并排序
	-	每次把数组分割成一半，再把两个排好序的数组合并成一个有序数组，然后每一层递归，当数组长度小于2的时候就返回数组。
```js
function mergeSort(arr){
        var len=arr.length;
        if(len<2){
            return arr;
        }
        var mid=Math.floor(len/2)
        var left=arr.slice(0,mid)
        var right=arr.slice(mid)
        return merge(mergeSort(left),mergeSort(right))
       }
       function merge(left,right){
        var res=[];
        while(left.length && right.length){
            if(left[0]<=right[0]){
                res.push(left.shift())
            }else{
                res.push(right.shift())
            }
        }
        while(left.length){
            res.push(left.shift())
        }
        while(right.length){
            res.push(right.shift())
        }
        return res;
       }
```
- 快速排序
	-	每次选择一个基准值，建立两个数组，小雨这个基准值的就放left里，大于这个基准值的就放right里，然后再把left，基准值，right连接起来组成一个数组，然后再递归就可以了
```js
 function quickSort(arr){
        var len=arr.length;
        if(len<2){
            return arr;
        }
        var mid=arr.splice(Math.floor(len/2),1)[0];
        var left=[],right=[];
        for (var i = 0; i < arr.length; i++) {
            if(arr[i]<mid){
                left.push(arr[i])
            }else{
                right.push(arr[i])
            }
        }
        return quickSort(left).concat([mid],quickSort(right))
      }
```
## 深拷贝
```js
function deepCopy(obj) {
		var result = Array.isArray(obj) ? [] : {};
		for (var key in obj) {
			if (obj.hasOwnProperty(key)) {
				if (typeof obj[key] === 'object') {
					result[key] = deepCopy(obj[key]);   //递归复制
				} else {
					result[key] = obj[key];
				}
			}
		}
		return result;
	}
```
## 移动端开发自适应
-	hotcss.js+px2rem
- 使用动态的HTML根字体大小和动态的viewport scale。

## js原型链经典题目
- [网址](https://www.jb51.net/article/79461.htm)
```js
function Foo() {
getName = function () { alert (1); };
return this;
}
Foo.getName = function () { alert (2);};
Foo.prototype.getName = function () { alert (3);};
var getName = function () { alert (4);};
function getName() { alert (5);}
//答案：
Foo.getName();//2
getName();//4
Foo().getName();//1
getName();//1
new Foo.getName();//2
new Foo().getName();//3
new new Foo().getName();//3
```
## 排序算法

### 冒泡排序
- 冒泡排序算法就是依次比较大小，小的的大的进行位置上的交换。
```js
function fn(arr){
  let len = arr.length
  for(let i=0; i < len; i++){
    for(let j=0; j < len - i - 1; j++){
      if(arr[j]>arr[j+1]){
        let str = arr[j]
        arr[j] = arr[j+1]
        arr[j+1] = str
      }
    }
  }
  return arr
}
console.log(fn([3,5,6,2,1,5]))
```
### 快速排序
- 参考某个元素值，将小于它的值，放到左数组中，大于它的值的元素就放到右数组中，然后递归进行上一次左右数组的操作，返回合并的数组就是已经排好顺序的数组了。
```js
function quickSort(arr) {
  if(arr.length<=1){
    return arr
  }
  let leftArr = []
  let rightArr = []
  let str = arr[0]
  for(let i=1;i<arr.length;i++){
    if(arr[i]>str){
      rightArr.push(arr[i]) 
    }else{
      leftArr.push(arr[i]) 
    }
  }
  return [].concat(quickSort(rightArr),str,quickSort(leftArr))
}
let a = quickSort([4,1,3,2,1,5,33,22,11])
console.log(a)
```
## 柯里化
```js
function currie(...args){
  let arr = [...args]
    fBound = function(...args){
      arr.push(...args)
      return fBound
    }
    // 将所有arr相加的值存放到toString里面
    fBound.toString = ()=> arr.reduce((a,b)=>a+b)
    return fBound
}
  let a =currie(1,2,3,4)(11)(22)
  console.log(a+'')
```

## 题目
- 判断一个单词是否是回文
```js
function fn(arr){
  return arr == arr.split('').reverse().join('')
}
console.log( fn('12321'))
```
-  去掉一组整型数组重复的值

:::tip
比如输入: [1,13,24,11,11,14,1,2] 

输出: [1,13,24,11,14,2]

需要去掉重复的11 和 1 这两个元素。
:::
```js
// 利用对象 存储
function fn(arr1){
  let arr = []
  let hasArr = {}
  for(let k=0;k<arr1.length;k++){
    if(!hasArr[arr1[k]]){
      hasArr[arr1[k]] = true ;
      arr.push(arr1[k])
    }
  }
  return arr
}
let a = fn([1,2,3,1,2,3,2])

// es6 
let set = new Set(arr)
arr = [...set]
```
- 统计一个字符串出现最多的字母
- 前面出现过去重的算法，这里需要是统计重复次数。

:::tip
输入 ： afjghdfraaaasdenas 

输出 ： a。
:::
```js
function fn (arr){
  if(arr.length == 1){
    return arr
  }
  let obj = {}
  for(let k=0; k < arr.length;k++){
    if(!obj[arr[k]]){
      obj[arr[k]] = 1
    }else{
      obj[arr[k]] += 1
    }
  }
  let strMax = 1;
  let maxChar = ''
  for(let i in obj){
    if(obj[i]>strMax){
      strMax = obj[i]
      maxChar =  i
    }
  }
  return maxChar
}
let a = fn([1,2,3,4,5,1,1,1,2,3,1])
console.log(a)
```
- 求数组第3个最大值
  - 可以用冒泡排序 在取前三
  - 我这儿用取巧 利用Math.max(...arr) 走三次
```js
let  arr = [1,2,3,5,5,2,74,3,19]
let max=null;
for (let k=0; k<3;k++){
    max = Math.max(...arr)
    let index = arr.indexOf(max)
    arr.splice(index,1)
}
console.log(max)
```
- 不借助临时变量，进行两个整数的交换
- 输入 a = 2, b = 4 输出 a = 4, b =2
```js
function swap(a,b){
  a = a + b
  b = a - b
  a = a - b
  return [a,b]
}
console.log(swap(11,22))
```
- 随机生成指定长度的字符串
```js
  function randomString(n) {  
    let str = 'abcdefghijklmnopqrstuvwxyz9876543210';
    let tmp = ''
    for(let k=0;k<n;k++){
      tmp +=  str.charAt(Math.floor(Math.random()*str.length))
    }
    return tmp;
  }
  console.log(randomString(2))

```
- [使用JS 实现二叉查找树(Binary Search Tree)](https://www.jackpu.com/qian-duan-mian-shi-zhong-de-chang-jian-de-suan-fa-wen-ti/)
