# JSBooru

Booru（出自日文ボール，英文原文为 board），是以标签为纲的互联网图库（imageboard）。

JSBooru 致力于在 JSBox 平台带给您最好的 Booru 浏览体验。一方面，通过连接 Gelbooru、 Danbooru、konachan 等数十个不同的站点，可以欣赏数以百万计的动漫相关图片；另一方面，标签是 Booru 的灵魂，JSBooru 使用 JSBox 内置的 SQLite 模块，并且实现了便捷的搜索、保存、收藏、分类、查询 Wiki 等功能，让您方便地管理标签。

JSBooru 是一款基于 Node.js 的应用。

## Features

- 支持 17 个不同的 Booru 网站
- 图片搜索、收藏、下载、分享
- 支持幻灯片播放
- 支持图片预加载
- 标签即时搜索、保存、收藏、分类、Wiki（自动查询）
- 支持安全搜索模式，可以过滤 NSFW 图片

## Usages

- 右上角问号查看帮助，加号在不同标签页有不同作用，共同作用是可以进入设置页面
- Booru 和 Favorites 标签页中，拉到底自动加载下一页，下拉刷新，点击右上角加号可以跳转页码，查看全部等
- Tags 标签页中，点击列表项目直接搜索，长按进入菜单选择更多功能，向左划可以编辑、删除，点击右上角加号可以添加标签、添加组合、编辑分类
- 阅读页面：两指放缩，点击上/下半部分可以前后翻页\n 点击右上角图标可以查看图片信息和标签

## Requirements

1. JSBox>=2.12.0，需要启用 Node.js 功能，iOS>=14.0.0
2. 良好的网络环境，此部分请参见 [Known issues](#known-issues)
3. node modules `booru`

## Known issues

1. 网络问题

   - 由于众所周知的原因，在中国大陆地区无法使用本应用绝大多数功能，请确保设备已经科学上网
   - 本应用需要的 Node.js 使用了 SSL Pinning（证书锁定）技术保护自身安全，但因此被中间人攻击（MITM）时可能无法使用，请关闭 Surge、Quantumult X 或其他工具的 MITM 功能
   - 部分代理工具不能正确识别 Node.js 的网络请求，请自行修改规则或者改为全局模式

2. Node.js 运行时偶尔会有不工作的情况，如果遇到请重启 JSBox

## Credits

Icons made by [Freepik](https://www.flaticon.com/authors/freepik) from [www.flaticon.com](https://www.flaticon.com/)
