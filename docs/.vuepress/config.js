module.exports = {
  title: "NorthUnicorn",
  base: "/",
  themeConfig: {
    editLinkText: "编辑此页",
    lastUpdated: "上次更新",
    nav: [{
      text: "前端",
      link: "/front/"
    },
    {
      text: "后端",
      link: "/houduan/"
    },
    {
      text: "operation",
      link: "/operation/"
    },
    {
      text: "foundation",
      link: "/foundation/"
    },
    {
      text: "article",
      link: "/article/"
    },
    {
      text: "GitHub",
      link: "https://github.com/xiaoqi7777"
    },
    {
      text: "about",
      link: "/about/"
    }, ],
    sidebar: {
      "/article/": [{
        title: "article",
        collapsable: false,
        children: [
          "webpack",
          "module",
          "vueAnalysis",
          "promise",
          "wx",
          "frontModle",
          "vuePlugin",
          "jwtPrinciple",
          "routerAuth",
          "statusCode",
          "koa_express",
          "useLibrary",
          "reg",
          "deepWebpack"
        ]
      }],
      "/front/": [{
        title: 'front',
        collapsable: false,
        children: [
          "css",
          "js",
          "react",
          "vue",
          "vuepress",
          "phone",
          "webpack",
          "video"
        ]
      }],
      "/houduan/": [{
        title: "houduan",
        collapsable: false,
        children: [
          "node",
          "ios",
          "mongodb",
          "egg",
          "mock",
          "wx",
          "koa",
          "http"
        ]
      }],
      "/operation/": [{
        title: "operation",
        collapsable: false,
        children: [
          "git",
          "nginx",
          "linux",
          "docker",
          "jenkins"
        ]
      }],
      "/foundation/": [{
        title: "foundation",
        collapsable: false,
        children: [
          "design",
          "algorithm",
          "subject",
          "leetcode",
          "everyWrite"
        ]
      }]
    }
  }
};