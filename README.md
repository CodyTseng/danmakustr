# danmakustr - 去中心化弹幕插件 (decentralized danmaku)

> 一个基于 [nostr 协议](https://nostr.com/)的 chrome 弹幕插件，支持 YouTube
>
> a chrome extension for danmaku based on [the nostr protocol](https://nostr.com/), supporting YouTube

因为现在使用的人比较少，所以弹幕也很少。所以做了个简单的[网页](https://danmaku.nostr-relay.app/)展示所有的弹幕，方便大家看到别人的弹幕。如果你觉得哪条弹幕有趣，可以点击跳转到对应的视频使用插件进行回复。

Since there are not many users at the moment, there are also few danmakus. So I made a simple [web page](https://danmaku.nostr-relay.app/) to display all the danmakus, making it easier for everyone to see other people's danmakus. If you find any danmaku interesting, you can click to jump to the corresponding video and reply using this extension.

## 截图 (Screenshot)

![screenshot](./screenshot.jpg)

## 安装 (Install)

### 从 Chrome 商店安装 (Install from Chrome Web Store)

[Chrome Web Store](https://chromewebstore.google.com/detail/danmakustr/mohbdimkkpjjibdfipfajpgpmegnglhb)

### 从源码安装 (Install from source)

1. clone 本仓库并进入文件夹 (clone this repo and cd into it)
2. 安装依赖并构建 (install dependencies and build)

```bash
npm install
npm run build
```

3. 打开 chrome 浏览器，进入 `chrome://extensions/` (open chrome and go to `chrome://extensions/`)
4. 打开开发者模式 (enable developer mode)
5. 点击 `加载已解压的扩展程序` (click `Load unpacked extension`)
6. 选择打包好的文件夹 `build` (select the `build` folder)
7. 打开 YouTube 发送你的第一条 nostr 弹幕吧！(open YouTube and send your first nostr danmaku!)

## 中继器 (Relay)

中继器是用于存储和传播 nostr 事件的服务，每一条弹幕都是一个 nostr 事件。如果你想自己保存和传播弹幕，可以自己搭建一个中继器。以下是我的两个中继器实现：

- [nostr-relay-tray](https://github.com/CodyTseng/nostr-relay-tray): 一个桌面端中继器，使用 electron 实现，双击即可运行。适合非技术人员使用。
- [nostr-relay-nestjs](https://github.com/CodyTseng/nostr-relay-nestjs): 一个更适合在服务器上运行的 nostr 中继器，使用 nodejs + PostgreSQL 实现。

nostr 社区中还有很多[其他中继器实现](https://github.com/aljazceru/awesome-nostr#relays)

Relay is a service for storing and propagating nostr events, each danmaku is a nostr event. If you want to save and propagate danmaku by yourself, you can run a relay by yourself. Here are my two relay implementations:

- [nostr-relay-tray](https://github.com/CodyTseng/nostr-relay-tray): A desktop relay, implemented using electron, double-click to run. Suitable for non-technical users.
- [nostr-relay-nestjs](https://github.com/CodyTseng/nostr-relay-nestjs): A nostr relay that is more suitable for running on a server, implemented using nodejs + PostgreSQL.

There are many [other relay implementations](https://github.com/aljazceru/awesome-nostr#relays) in the nostr community.

## TODO

- [x] 可编辑中继列表 (editable relay list)
- [x] 支持自定义弹幕颜色和显示模式 (support custom danmaku color and display mode)
- [ ] 支持 NIP-07 (support NIP-07)
- [ ] 支持给弹幕点赞 (support reaction to danmaku)
- [ ] 支持查看历史弹幕 (support viewing danmaku history)
- [ ] 支持下载视频弹幕 (support downloading danmaku)
- [ ] 支持更多平台 (support more platforms)
- [ ] ...

## Donate

If you like this project, you can buy me a coffee :) ⚡️ codytseng@getalby.com ⚡️

## License

MIT
