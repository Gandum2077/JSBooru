# JSBooru

JSBox 平台的 Booru 客户端。在 JSBox 上连接 Gelbooru 或 Danbooru 类型的站点，并欣赏数以万计的动漫相关图片！  
现已支持十余个不同的站点。

## Features

- 标签搜索
- 幻灯片播放
- 检索、收藏、管理标签
- 收藏图片
- 下载不同尺寸的图片
- 支持安全搜索模式，过滤 NSFW 图片
- 支持 17 个网站

## Requirements

1. JSBox>=2.2.0，需要 Node.js 功能，iOS>=13.0.0
2. 良好的网络环境，此部分请参见 [Known issues](#known-issues)
3. node modules `booru`，点击左上角按钮并选择“解决模块依赖”来安装

## Known issues

1. 网络错误

   - 墙国居民请先确定自己的设备已经科学上网
   - Node.js 使用了 SSL Pinning（证书锁定）技术，因此不能使用 MITM 工具
   - 一部分代理 App 的自动分流功能不能正确分类 Node.js 的访问请求，请自行修正规则，或者直接改为全局代理模式

2. Node.js 运行时偶尔会有不工作的情况，如果遇到请重启 JSBox
3. 部分站点工作不正常。修复此问题需要首先解决上游依赖项目的 bug，不过你可以先反馈问题
