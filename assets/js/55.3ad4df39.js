(window.webpackJsonp=window.webpackJsonp||[]).push([[55],{189:function(t,s,n){"use strict";n.r(s);var a=n(0),e=Object(a.a)({},function(){var t=this,s=t.$createElement,n=t._self._c||s;return n("div",{staticClass:"content"},[t._m(0),t._v(" "),n("p"),t._m(1),n("p"),t._v(" "),n("ul",[n("li",[n("a",{attrs:{href:"https://dev.mysql.com/downloads/mysql/5.5.html",target:"_blank",rel:"noopener noreferrer"}},[t._v("下载安装"),n("OutboundLink")],1)]),t._v(" "),t._m(2),t._v(" "),t._m(3)]),t._v(" "),t._m(4),t._v(" "),t._m(5),t._m(6),t._v(" "),t._m(7),t._m(8),t._v(" "),t._m(9),t._m(10),t._v(" "),t._m(11)])},[function(){var t=this.$createElement,s=this._self._c||t;return s("h1",{attrs:{id:"mysql"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#mysql","aria-hidden":"true"}},[this._v("#")]),this._v(" mysql")])},function(){var t=this.$createElement,s=this._self._c||t;return s("div",{staticClass:"table-of-contents"},[s("ul",[s("li",[s("a",{attrs:{href:"#数据库基本操作"}},[this._v("数据库基本操作")])]),s("li",[s("a",{attrs:{href:"#sql"}},[this._v("SQL")])]),s("li",[s("a",{attrs:{href:"#查询"}},[this._v("查询")])]),s("li",[s("a",{attrs:{href:"#node连接数据库"}},[this._v("node连接数据库")])])])])},function(){var t=this.$createElement,s=this._self._c||t;return s("li",[this._v("MYSQL启动和停止(可在 我的电脑=> 管理=> 服务 里面查找mysql是否跑起)\n"),s("ul",[s("li",[this._v("net start MySQL")]),this._v(" "),s("li",[this._v("net stop MySQL")])])])},function(){var t=this.$createElement,s=this._self._c||t;return s("li",[this._v("进入安装目录\n"),s("ul",[s("li",[this._v("C:\\Program Files\\MySQL\\MySQL Server 5.5\\bin")]),this._v(" "),s("li",[this._v("cmd")]),this._v(" "),s("li",[this._v("执行 mysql 就可以连接")])])])},function(){var t=this.$createElement,s=this._self._c||t;return s("h2",{attrs:{id:"数据库基本操作"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#数据库基本操作","aria-hidden":"true"}},[this._v("#")]),this._v(" 数据库基本操作")])},function(){var t=this,s=t.$createElement,n=t._self._c||s;return n("div",{staticClass:"language-js extra-class"},[n("pre",{pre:!0,attrs:{class:"language-js"}},[n("code",[t._v("    查看数据库 show databases"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    切换数据库 use test"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    查看表     show tables"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    查看当前所在的数据库 select "),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("database")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    查看表结构 desc user"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n    "),n("span",{pre:!0,attrs:{class:"token constant"}},[t._v("SQL")]),t._v("语言\n    关键字用大写  自己定义的用小写\n\n    表的数据 \n    先建主表数据 在建子表数据\n    先删子标数据 在删主表数据\n")])])])},function(){var t=this.$createElement,s=this._self._c||t;return s("h2",{attrs:{id:"sql"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#sql","aria-hidden":"true"}},[this._v("#")]),this._v(" SQL")])},function(){var t=this,s=t.$createElement,n=t._self._c||s;return n("div",{staticClass:"language-js extra-class"},[n("pre",{pre:!0,attrs:{class:"language-js"}},[n("code",[n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 插入")]),t._v("\n"),n("span",{pre:!0,attrs:{class:"token constant"}},[t._v("INSERT")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token constant"}},[t._v("INTO")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("student")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("name"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("idcard"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("age"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("city"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token constant"}},[t._v("VALUES")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token string"}},[t._v("'王五'")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),n("span",{pre:!0,attrs:{class:"token string"}},[t._v("'5'")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),n("span",{pre:!0,attrs:{class:"token constant"}},[t._v("NULL")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),n("span",{pre:!0,attrs:{class:"token string"}},[t._v("'上海'")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n"),n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 查询")]),t._v("\n"),n("span",{pre:!0,attrs:{class:"token constant"}},[t._v("SELECT")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("*")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token constant"}},[t._v("FROM")]),t._v(" student"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 更新")]),t._v("\n"),n("span",{pre:!0,attrs:{class:"token constant"}},[t._v("UPDATE")]),t._v(" student "),n("span",{pre:!0,attrs:{class:"token constant"}},[t._v("SET")]),t._v(" age"),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),n("span",{pre:!0,attrs:{class:"token number"}},[t._v("33")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("city"),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),n("span",{pre:!0,attrs:{class:"token string"}},[t._v("'深圳11'")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token constant"}},[t._v("WHERE")]),t._v(" id"),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),n("span",{pre:!0,attrs:{class:"token number"}},[t._v("3")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token constant"}},[t._v("AND")]),t._v(" age"),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),n("span",{pre:!0,attrs:{class:"token string"}},[t._v("'331'")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 删除")]),t._v("\n"),n("span",{pre:!0,attrs:{class:"token constant"}},[t._v("DELETE")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token constant"}},[t._v("FROM")]),t._v(" student "),n("span",{pre:!0,attrs:{class:"token constant"}},[t._v("WHERE")]),t._v(" id"),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),n("span",{pre:!0,attrs:{class:"token number"}},[t._v("3")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n")])])])},function(){var t=this.$createElement,s=this._self._c||t;return s("h2",{attrs:{id:"查询"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#查询","aria-hidden":"true"}},[this._v("#")]),this._v(" 查询")])},function(){var t=this,s=t.$createElement,n=t._self._c||s;return n("div",{staticClass:"language-js extra-class"},[n("pre",{pre:!0,attrs:{class:"language-js"}},[n("code",[t._v("  "),n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("//常规")]),t._v("\n  select 列名\n  "),n("span",{pre:!0,attrs:{class:"token constant"}},[t._v("FROM")]),t._v("  表名\n  "),n("span",{pre:!0,attrs:{class:"token constant"}},[t._v("WHERE")]),t._v(" 查询条件表达式\n  "),n("span",{pre:!0,attrs:{class:"token constant"}},[t._v("ORDER")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token constant"}},[t._v("BY")]),t._v(" 排序的列名 "),n("span",{pre:!0,attrs:{class:"token constant"}},[t._v("ID")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token constant"}},[t._v("ASC")]),t._v("或者"),n("span",{pre:!0,attrs:{class:"token constant"}},[t._v("DESC")]),t._v("\n  \n  "),n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// as 是别名 2 '和' 是常量列")]),t._v("\n  "),n("span",{pre:!0,attrs:{class:"token constant"}},[t._v("SELECT")]),t._v(" id "),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("as")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token string"}},[t._v("'主键'")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("name "),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("as")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token string"}},[t._v("'姓名'")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),n("span",{pre:!0,attrs:{class:"token number"}},[t._v("2")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token string"}},[t._v("'和'")]),t._v("\n  "),n("span",{pre:!0,attrs:{class:"token constant"}},[t._v("FROM")]),t._v(" student\n  "),n("span",{pre:!0,attrs:{class:"token constant"}},[t._v("WHERE")]),t._v(" city "),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token string"}},[t._v("'北京'")]),t._v("\n  "),n("span",{pre:!0,attrs:{class:"token constant"}},[t._v("ORDER")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token constant"}},[t._v("BY")]),t._v(" id "),n("span",{pre:!0,attrs:{class:"token constant"}},[t._v("DESC")]),t._v("\n\n  "),n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 分页 LIMIT offset(跳过的条数),limit")]),t._v("\n  "),n("span",{pre:!0,attrs:{class:"token constant"}},[t._v("SELECT")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("*")]),t._v("\n  "),n("span",{pre:!0,attrs:{class:"token constant"}},[t._v("FROM")]),t._v(" student \n  "),n("span",{pre:!0,attrs:{class:"token constant"}},[t._v("LIMIT")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token number"}},[t._v("2")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),n("span",{pre:!0,attrs:{class:"token number"}},[t._v("2")]),t._v("\n\n  "),n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 相同的记录只会出现一次")]),t._v("\n  "),n("span",{pre:!0,attrs:{class:"token constant"}},[t._v("SELECT")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token constant"}},[t._v("DISTINCT")]),t._v(" city\n  "),n("span",{pre:!0,attrs:{class:"token constant"}},[t._v("FROM")]),t._v(" student\n\n  "),n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("//字符串默认都是0  '数字' =>数字")]),t._v("\n  "),n("span",{pre:!0,attrs:{class:"token constant"}},[t._v("SELECT")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token number"}},[t._v("1")]),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("+")]),n("span",{pre:!0,attrs:{class:"token string"}},[t._v("'1'")]),t._v("\n  "),n("span",{pre:!0,attrs:{class:"token constant"}},[t._v("SELECT")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token number"}},[t._v("1")]),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("+")]),n("span",{pre:!0,attrs:{class:"token string"}},[t._v("'XDSA'")]),t._v(" \n\n  "),n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 返回字符串的长度")]),t._v("\n  "),n("span",{pre:!0,attrs:{class:"token constant"}},[t._v("SELECT")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token constant"}},[t._v("LENGTH")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token string"}},[t._v("'abcde'")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n\n  "),n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 拼接字符 ")]),t._v("\n  "),n("span",{pre:!0,attrs:{class:"token constant"}},[t._v("SELECT")]),t._v("  "),n("span",{pre:!0,attrs:{class:"token constant"}},[t._v("CONCAT")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token string"}},[t._v("'aa'")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),n("span",{pre:!0,attrs:{class:"token string"}},[t._v("'ss'")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n  "),n("span",{pre:!0,attrs:{class:"token constant"}},[t._v("SELECT")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token constant"}},[t._v("CONCAT_WS")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token string"}},[t._v("'aaa'")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),n("span",{pre:!0,attrs:{class:"token string"}},[t._v("'#'")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),n("span",{pre:!0,attrs:{class:"token string"}},[t._v("'qq'")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),n("span",{pre:!0,attrs:{class:"token string"}},[t._v("'@'")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n\n  "),n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 转大写")]),t._v("\n  "),n("span",{pre:!0,attrs:{class:"token constant"}},[t._v("SELECT")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token constant"}},[t._v("UPPER")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token string"}},[t._v("'ss'")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n  "),n("span",{pre:!0,attrs:{class:"token constant"}},[t._v("SELECT")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token constant"}},[t._v("LOWER")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token string"}},[t._v("'SS'")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n\n  "),n("span",{pre:!0,attrs:{class:"token comment"}},[t._v("//查询的结果转化成=> 第一个首字母大写 后面都小写")]),t._v("\n  "),n("span",{pre:!0,attrs:{class:"token constant"}},[t._v("SELECT")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token constant"}},[t._v("CONCAT")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token constant"}},[t._v("UPPER")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token constant"}},[t._v("SUBSTR")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("name"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),n("span",{pre:!0,attrs:{class:"token number"}},[t._v("1")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),n("span",{pre:!0,attrs:{class:"token number"}},[t._v("1")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),n("span",{pre:!0,attrs:{class:"token constant"}},[t._v("LOWER")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token constant"}},[t._v("SUBSTR")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("name"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),n("span",{pre:!0,attrs:{class:"token number"}},[t._v("2")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token constant"}},[t._v("FROM")]),t._v(" student\n")])])])},function(){var t=this.$createElement,s=this._self._c||t;return s("h2",{attrs:{id:"node连接数据库"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#node连接数据库","aria-hidden":"true"}},[this._v("#")]),this._v(" node连接数据库")])},function(){var t=this,s=t.$createElement,n=t._self._c||s;return n("div",{staticClass:"language-js extra-class"},[n("pre",{pre:!0,attrs:{class:"language-js"}},[n("code",[t._v("  "),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("var")]),t._v(" mysql "),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("require")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token string"}},[t._v("'mysql'")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n\n  "),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("var")]),t._v(" connection "),n("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" mysql"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("createConnection")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    host"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),n("span",{pre:!0,attrs:{class:"token string"}},[t._v("'localhost'")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n    user"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),n("span",{pre:!0,attrs:{class:"token string"}},[t._v("'root'")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n    password"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),n("span",{pre:!0,attrs:{class:"token string"}},[t._v("'root'")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n    database"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),n("span",{pre:!0,attrs:{class:"token string"}},[t._v("'studb'")]),t._v("\n  "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n  connection"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("connect")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n  connection"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("query")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token string"}},[t._v("'SELECT * FROM course'")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("function")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token parameter"}},[t._v("error"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" results"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" fields")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("if")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("error"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),n("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("throw")]),t._v(" error"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    console"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),n("span",{pre:!0,attrs:{class:"token function"}},[t._v("log")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),n("span",{pre:!0,attrs:{class:"token string"}},[t._v("'查看course表的所有信息'")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" results"),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n  "),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),n("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n")])])])}],!1,null,null,null);s.default=e.exports}}]);