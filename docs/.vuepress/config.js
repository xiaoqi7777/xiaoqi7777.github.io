module.exports = {
  title: "NorthUnicorn",
  base: "/",
  themeConfig: {
    editLinkText: "编辑此页",
    lastUpdated: "上次更新",
    nav: [
      {
        text: "前端",
        link: "/qianduan/"
      },
      {
        text: "后端",
        link: "/houduan/"
      },
      {
        text: "运维",
        link: "/operation/"
      },
      {
        text: "内功",
        link: "/foundation/"
      },
      {
        text: "GitHub",
        link: "https://github.com/xiaoqi7777"
      }
    ],
    sidebar: {
      "/qianduan/": [
        {
          title: '前端基础汇总',
          collapsable: false,
          children: [ 
            "js",
            "react",
            "vue",
            "vuepress",
            "phone",
            "webpack"
          ]
        }
      ],
      "/houduan/":[
        {
          title: "后端基础汇总",
          collapsable: false,
          children: [ 
            "node",
            "ios",
            "mongodb",
            "egg",
            "mock"
          ]
        }
      ],
      "/operation/":[
        {
          title: "运维",
          collapsable: false,
          children: [
            "git",
            "nginx",
            "linux",
            "docker"
          ]
        }
      ],
      "/foundation/":[
        {
          title: "内功",
          collapsable: false,
          children: [
            "design",
            "algorithm"
          ]
        }
      ]
    }
  }
};
