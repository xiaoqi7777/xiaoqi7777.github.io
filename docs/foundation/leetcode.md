# leetcode

[[toc]]
## 字符串

### 反转字符串中的单词

- 给定一个字符串，你需要反转字符串中每个单词的字符顺序，同时仍保留空格和单词的初始顺序。

::: tip 示例 1
- 输入: "Let's take LeetCode contest" 输出: "s'teL ekat edoCteeL tsetnoc" 注意：在字符串中，每个单词由单个空格分隔，并且字符串中不会有任何额外的空格。
:::
- 代码演示
```js
// 1
export default (str) => {
  return str.split(' ').map(item => {
    return item.split('').reverse().join('')
  }).join(' ')
}
// 2
export default str => {
  return str.match(/[\w']+/g).map(item => {
      return item.split('').reverse().join('')
    }).join(' ')
}
// 3
export default (str) => {
  return str.split(/\s/g).map(item => {
    return item.split('').reverse().join('')
  }).join(' ')
}
```
- 总结
- 1、split和join 将字符串转换成数组/将数组转换成字符串 注意('')和(' ')是2个概念 前者是分割每一个数据，后者是以空格进行分开
- 2、分割字符串/提取字符串内容 split是常用的，注意split 可以放字符串也可以放正则，还可以用正则的 match 全局匹配 得到的值也是一个数组

### 计数二进制子串

- 给定一个字符串 s，计算具有相同数量0和1的非空(连续)子字符串的数量，并且这些子字符串中的所有0和所有1都是组合在一起的。重复出现的子串要计算它们出现的次数。
- 请注意，一些重复出现的子串要计算它们出现的次数。

::: tip 示例 1
  输入: "00110011"

  输出: 6
  
  解释: 有6个子串具有相同数量的连续1和0：“0011”，“01”，“1100”，“10”，“0011” 和 “01”。
  
  另外，“00110011”不是有效的子串，因为所有的0（和1）没有组合在一起。

  写出所有情况，然后找出规律
```js
  00110011 ---> 0011
   0110011 ---> 01
    110011 ---> 1100
     10011 ---> 10
      0011 ---> 0011
       011 ---> 01
        11 --->
         1 --->
```
  规律:

  首先明确只有0和1
  
  第一步 每次做了位移 前面的数都在减少

  第二步 获取第一个数字 查找他的连续的值 在与后面的匹配 是否满足

:::

::: tip 示例 2
  输入: "10101"

  输出: 4
  
  解释: 有4个子串：“10”，“01”，“10”，“01”，它们具有相同数量的连续1和0。
::: 
- 代码演示
```js
export default (str) => {
  let rs = []
  function match(len) { 
    // r=>获取第一个连续的数值
    let r = len.match(/^(0+|1+)/)[0]
    // j=>获取r对应的连续值 0^1=>1 1^0=>
    let j = (r[0] ^ 1).toString().repeat(r.length)
    // reg => 要查找的规律
    let reg = new RegExp(`^(${r}${j})`)
    if (reg.test(len)) {
      // RegExp.$1 => 匹配分组的第一个值
      return RegExp.$1
    } else {
      return ''
    }
  }
  // 做位移
  for (let i = 0; i < str.length - 1; i++) {
    let len = match(str.slice(i))
    if (len) {
      rs.push(len)
    }
  }
  return rs
}
```
- 总结
- match配合正则提取连续相同的数值，不管是否加g，返回的都是数组
- repeat是字符赋值相同的数值
- RegExp.$1是正则对象的方法 获取第一个分组的数据

## 数组
### 电话号码的组合
- 给定一个仅包含数字 2-9 的字符串，返回所有它能表示的字母组合。

- 给出数字到字母的映射如下（与电话按键相同）。注意 1 不对应任何字母。

<img :src="$withBase('/img/tel.png')" >

:::tip 示例
  
  输入："23" 输出：["ad", "ae", "af", "bd", "be", "bf", "cd", "ce", "cf"]

  当输入 "234" 输出结果: 先拿23输出的结果 在和4进行匹配 太长暂时不写出来

  说明: 尽管上面的答案是按字典序排列的，但是你可以任意选择答案输出的顺序。
:::
- 分析:里面输入的字符串不定，但是可以巧妙的设计 2个组合，也就是说先匹配先2个，拿到结果，在和第下一个组合 依次循环
```js
export default (str) => {
  // 建立电话号码键盘映射
  let map = ['', 1, 'abc', 'def', 'ghi', 'jkl', 'mno', 'pqrs', 'tuv', 'wxyz']
  // 输入的字符串按单字符分隔变成数组 234=>[2,3,4]
  let num = str.split('')
  // 保存键盘映射的字母内容 23=>['abc','def']
  let code = []
  num.forEach(item => {
    if (map[item]) {
      code.push(map[item])
    }
  })
  //  注意 这里的arr 长度不一致 先考虑2个最短的情况
  //  当3个的时候 可以将前面2个组合完成后 在和第三个组合 也就成了2个的问题
  let comb = (arr) => {
    let tmp = []
    for (let il = 0; il < arr[0].length; il++) {
      for (let jl = 1; jl < arr[1].length; jl++) {
        tmp.push(`${arr[0][il]}${arr[1][jl]}`)
      }
    }
    // 核心的逻辑 将最短的2个组合，配合第三个重新组合
    arr.splice(0, 2, tmp)
    if (arr.length > 1) {
      comb(arr)
    } else {
      return tmp
    }
  }
  return comb(code)
}
```
- 总结
- splice数组的api，可以将原来的数据更改


### 卡牌分组
- 给定一副牌，每张牌上都写着一个整数。
- 此时，你需要选定一个数字 X，使我们可以将整副牌按下述规则分成 1 组或更多组：
- 每组都有 X 张牌。
- 组内所有的牌上都写着相同的整数。
- 仅当你可选的 X >= 2 时返回 true。

::: tip 示例1
  输入：[1,2,3,4,4,3,2,1]

  输出：true

  解释：可行的分组是 [1,1]，[2,2]，[3,3]，[4,4]

:::
::: tip 示例2

  输入：[1,1,1,2,2,2,3,3]

  输出：false
  
  解释：没有满足要求的分组。
:::

::: tip 示例3

  输入：[1,1,2,2,2,2]

  输出：true

  解释：可行的分组是 [1,1]，[2,2]，[2,2]
:::

- 取最大公约数
- 即可以提取出最大的系数
<img :src="$withBase('/img/gcd.jpg')" >
- 最大公约数(根据上面图片的公式写出的例子))
- 上面图片 和 下面例子结合看 
- 每个两个数 都可以写成`a = c*b + d`，当d为0的时候 b即成为最大公约。
- 若d不为0 则将b的将再次分解成`a = c*b + d`的格式 此时的b为上一次的取模结果，如下面的例子,(16，12)第一次取模的时候 结果是4，第一次的b就成了`1*4+0` 取模结果为0 即结束，(64,24)例子中，第一次取模结果是16，b是24,然后24被分成`1*16 + 8`，取模结果是8 继续套用`a = c*b + d`公式 直到取模(d)为0 ，即返回b(为最大公约数)。若b比a大结果一样取模的时候会调过来

```js
  10,5 可以写成
  => 10 = 2*5 + 0
  
  16,12 可以写成(16,12位子调过来也一样,在取余的时候16,12位子还是会换过来)
     16 = 2*4+4
  => 16 = 2*(1*4+0)+4

  64,24 可以写成
     64 = 2*24 + 16
     24 = 1*16 + 8
     16 = 2*8 + 0
  => 64 = 2*(1*(2*8+0)+8)+16
``` 
- 最大公约数函数
- 根据上面的例子 写出公式
```js
  function gcd(a,b){
    if(a%b===0){
      return b
    }else{
      return gcd(b,a%b)
    }
  }
```
- 分析 这个题目知道最大公约数就出来一半，将拿到的数组进行排序，求里面所有数组的公约数是否都大于1。
- 用正则将公共的部分抽离，先用数组的前两个求最大公约数，只要不为1就说明满足条件，添加一个任意字符长度为最大公约数，在可以下一个进行比较，一直这样下去要么满足最大公约数大于1，否则就返回false

- 代码
```js
export default (arr) => {
  // 最大公约数
  let gcd = (a, b) => {
    if (b === 0) {
      return a
    } else {
      return gcd(b, a % b)
    }
  }
  // 转换成字符串用 正则提取
  let groupStr = arr.sort().join('')
  let groupArr = groupStr.match(/(\d)\1+|\d/g)
  while (groupArr.length > 1) {
    // 提取数组前面2个数据
    let oneArr = groupArr.shift().length
    let twoArr = groupArr.shift().length
    let v = gcd(oneArr, twoArr)
    if (v === 1) {
      return false
    } else {
      // 补充一个数组进去
      groupArr.unshift('0'.repeat(v))
    }
  }
  return groupArr.length ? groupArr[0].length > 1 : false
}
```
- 总结
- 循环数组每个数 可以用 while 加上 shift 和 unshift 操作
- 最大公约数 可以处理 一类数值 都大于1 

