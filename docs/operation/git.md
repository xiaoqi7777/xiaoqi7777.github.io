# git

## 基本操作

```javascript
    创建git用户
      useradd git
      passwd git

    查看用户名字/邮箱
      git config --global(可有可无) user.name
      git config user.email
    修改用户名/邮箱
      git config --global user.name "Your_username"
      git config --global user.email "Your_email"
    查看本地 提交地址
      git remote -v

    创建git仓库
      git init 初始化项目  他会创建一个.git文件 里面放了一堆配置
      git init --bare 不包含工作区域 只是一个仓库 让别人提交代码

    查看状态
    git status

    添加 提交地址
    git remote add origin 地址

    删除本地 提交地址
    git branch -D master

    删除远程分支
    git push origin --delete '分支名字'

    撤销 修改的文件 *为所有
    git checkout -- readme.txt

    拉取分支
	  get fetch origin 分支:qimingzi

    合并分支
    git merge dev //他会创建2个在合并
    git rebase dev  //他在原来基础上合并


    返回到指定的分支
      git log
      git reset --hard d22f3b7de65383a3f277237a79af27b854e94f67

    提交 加-f是强制
      git push -u origin master -f

    克隆某个分支
			git clone -b b1 https://github.com/...
			git命令：全局设置用户名邮箱配置

    查看git用户名
      git config user.name

    查看邮箱配置
      git config user.email

    全局配置用户名
      git config --global user.name "nameVal"

    全局配置邮箱
      git config --global user.email "eamil@qq.com"

    merge :refusing to merge unrelated histories
    加上--allow-unrelated-histories


```

## 三个区域

- 工作区 是红色(status)
  - git add (到暂存区)
- 暂存区 是绿色
  - git commit (到版本库)
- 版本库
  - git log(查看版本号)

### git diff

- 比较工作区和暂存区(就是 git add 之后的比较)
  - git diff --cached
- 比较工作区和版本库
  - git diff master(分支)

### 撤销(git add 内容)

- git reset Head .(将绿色状态变成红色)

### 从暂存区把内容撤回来

- git checkout index.html/.(绿色部分覆盖红色)

### git rm

- 删除工作区(或者暂存区)的内容 先要在本地把文件删除 在执行 git rm
- git rm index.html

### 删除缓存区的内容 保存工作区的内容

- git rm --cached index.html

### 从工作区域直接到版本区域

- git commit -a -m 'xxx'

### 恢复版本

- git log 查看历史版本
- git reset --hard 历史版本号
- git reflog 历史版本号
- history 查看输入的历史命令
- git reset --hard^ 往上回滚一级

## 分支

- 创建分支 git branch dev
- 查看分支 git branch
- 切换分支 git checkout dev
- 创建切换分支 git checkout -b dev
- 删除分支 git branch -d dev
- 查看合并图谱 git log --oneline --graph/git log --oneline --graph --all --decorate
- git cherry-pick 'xx' 分支上合并别的分支版本号

## 存储工作区

- 本地分支没有保存 要调到另一个分支 可以将当前工作区暂停
- git stash 存储
- git stash list 查看存储工作区
- git stash pop 释放本地存储(上一个,会删除)
- git stash apply 应用存储的(不删除)
- git stash drop 删除上一个

## vscode

- code spell checker
  - 单词检查
- code runner
  - 执行运行脚本
- eslint

```js
module.exports = {
  parser: "babel-eslint", // 把源码转成语法树的工具
  extends: "airbnb", // 继承airbnb规则
  env: {
    //指定运行环境
    browser: true,
    node: true
  },
  rules: {
    "linebreak-style": "off",
    indent: ["error", 4], //缩进风格
    quotes: ["error", "double"], //引号类型
    semi: ["error", "always"], //关闭语句强制分号结尾
    "no-console": "error", //禁止使用console
    "arrow-parens": 0 //箭头函数用小括号括起来
  }
};
```

```js
  // 重新设定tabsize
    "editor.tabSize": 2,
    // #让vue中的js按编辑器自带的ts格式进行格式化
    "vetur.format.defaultFormatter.js": "vscode-typescript",
    // // #每次保存的时候自动格式化 他eslint保存 还有点冲突(格式化代码的时候 会把最后一行空格删除,eslint 需要保存这一行)
    "editor.formatOnSave": true,
    // #每次保存的时候将代码按eslint格式进行修复
    "editor.codeActionsOnSave": {
        "source.fixAll.eslint": true
    },
```
