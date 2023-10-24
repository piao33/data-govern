module.exports = {
  "presets": ["@vue/cli-plugin-babel/preset"],
  "plugins": [
    [
      "component",
      {
        "libraryName": "element-ui",
        "styleLibraryName": "~element/theme",// 配合babel-plugin-component实现自定义样式文件按需引入
        // "styleLibraryName": "theme-chalk"
      }
    ]
  ]
}
