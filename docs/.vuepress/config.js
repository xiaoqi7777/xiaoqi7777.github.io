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
            "js/base",
            "react/base",
            "vue/base",
            "vuepress/base",
          ]
        }
      ],
      "/houduan/":[
        {
          title: "后端基础汇总",
          collapsable: false,
          children: [ 
            "node/base",
            "http/base",
          ]
        }
      ]
    }
  }
};
