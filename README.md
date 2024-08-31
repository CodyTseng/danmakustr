# danmakustr - decentralized danmaku extension

[中文文档](./README_ZH.md)

> a chrome extension for danmaku based on [the nostr protocol](https://nostr.com/), supporting YouTube

Since there are not many users at the moment, there are also few danmakus. So I made a simple [web page](https://danmaku.nostr-relay.app/) to display all the danmakus, making it easier for everyone to see other people's danmakus. If you find any danmaku interesting, you can click to jump to the corresponding video and reply using this extension.

## Screenshot

![screenshot](./screenshot.jpg)

## Install

### Install from Chrome Web Store

[Chrome Web Store](https://chromewebstore.google.com/detail/danmakustr/mohbdimkkpjjibdfipfajpgpmegnglhb)

### Install from source

1. clone this repo and cd into it

```bash
git clone https://github.com/CodyTseng/danmakustr.git
cd danmakustr
```

2. install dependencies and build

```bash
npm install
npm run build
```

3. open chrome and go to `chrome://extensions/`
4. nable developer mode
5. click `Load unpacked extension`
6. select the `build` folder
7. open YouTube and send your first nostr danmaku!

## Relay

Relay is a service for storing and propagating nostr events, each danmaku is a nostr event. If you want to save and propagate danmaku by yourself, you can run a relay by yourself. Here are my two relay implementations:

- [nostr-relay-tray](https://github.com/CodyTseng/nostr-relay-tray): A desktop relay, implemented using electron, double-click to run. Suitable for non-technical users.
- [nostr-relay-nestjs](https://github.com/CodyTseng/nostr-relay-nestjs): A nostr relay that is more suitable for running on a server, implemented using nodejs + PostgreSQL.

There are many [other relay implementations](https://github.com/aljazceru/awesome-nostr#relays) in the nostr community.

## TODO

- [x] editable relay list
- [x] support custom danmaku color and display mode
- [ ] support NIP-07
- [ ] support reaction to danmaku
- [ ] support viewing danmaku history
- [ ] support downloading danmaku
- [ ] support more platforms
- [ ] ...

## Donate

If you like this project, you can buy me a coffee :) ⚡️ codytseng@getalby.com ⚡️

## License

MIT
