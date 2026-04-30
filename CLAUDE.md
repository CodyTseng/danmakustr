# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Chrome extension (Manifest V3) that overlays decentralized danmaku on videos using the Nostr protocol. Currently supports YouTube only. Built with Vite + `@crxjs/vite-plugin`, React 18, TypeScript, Tailwind, and shadcn/ui (style: `default`, baseColor: `slate`, alias: `@/*` → `src/*`).

## Commands

- `npm install` — installs deps and runs `patch-package` (applies `patches/danmaku+2.0.6.patch` to the `danmaku` lib; reapply this patch if upgrading the lib).
- `npm run dev` — Vite dev mode for the extension. Load the `build/` (or `dev` output) dir as an unpacked extension at `chrome://extensions`.
- `npm run build` — `tsc` typecheck + Vite build into `build/`. This is what users load as the unpacked extension.
- `npm run zip` — builds, then bundles `build/` into `package/danmakustr-<version>.zip` for Chrome Web Store upload.
- `npm run fmt` — Prettier (config: 100-col, no semi, single quotes, trailing-comma all, LF, 2-space).

There is no test suite or linter configured.

## Architecture

### Three execution contexts, one Vite build

The CRX plugin compiles the manifest in `src/manifest.ts` into a single `build/manifest.json`, producing three separate runtime contexts that **only communicate via `chrome.runtime.sendMessage` / `chrome.tabs.sendMessage`**:

1. **Background service worker** — `src/background/index.ts`. Owns the Nostr connection (`NDK`), the user's private key, and the relay pool. All Nostr I/O happens here.
2. **Content script** — `src/contentScript/index.ts`, injected on `*.youtube.com`. Owns the `DanmakuEngine` (the on-page overlay) and the in-page input UI.
3. **Extension pages** — `src/pages/popup.html` and `src/pages/options.html`. Both load the **same** React app (`src/pages/index.tsx`) via a `createHashRouter`; the popup and options page are differentiated only by viewport (CSS `md:` breakpoint in `pages/App.tsx` swaps between bottom-nav and side-nav layouts).

When editing extension entry points, remember the manifest is generated from `src/manifest.ts` — change paths/permissions/matches there, not in any JSON file.

### Message protocol (background ↔ content/pages)

Defined inline in `src/background/index.ts`. The union type `Msg` is the source of truth:

- `SEND_COMMENT` — content script → bg: publish a kind `2333` Nostr event (tags: `i` = `<platform>:<videoId>`, `time`, optional `mode`, `color`).
- `INIT_COMMENTS` — content script → bg: paginated `fetchEvents` of kind 2333 filtered by `#i`; bg streams each one back as `EMIT_INIT_COMMENT` via `chrome.tabs.sendMessage`.
- `GET_RELAYS` — pages → bg: returns relay URLs + connected status.
- `FETCH_HISTORY_COMMENTS` — pages → bg: returns the user's own past danmaku (filtered by `authors: [pubkey]`).
- `TAB_UPDATED` — bg → content (on `chrome.tabs.onUpdated` w/ url change): tells the content script to re-`init()` (YouTube is an SPA, so navigation doesn't reload the script).
- `EMIT_INIT_COMMENT` — bg → content: replay one historical comment into the running `DanmakuEngine`.

The bg has a `queue` for messages received before `initializeNDK` finishes; it's drained at the end of `main()`. There's a `// FIXME: not a good way` on this — be aware before refactoring.

### Nostr event shape

- Kind: `2333` (custom, not a NIP).
- `content`: the danmaku text.
- Tags: `['i', '<platform>:<videoId>']`, `['time', '<seconds>']`, optional `['mode', 'rtl'|'top'|'bottom']`, optional `['color', '#RRGGBB']`.
- `parseEventTags` in `background/index.ts` is the canonical parser; mirror it if reading these elsewhere.
- Default relays are hardcoded in `background/index.ts` and seeded into `chrome.storage.local` on first run; user edits via the Relays page propagate to NDK through `chrome.storage.onChanged` (adds/removes relays without re-creating the NDK instance).
- Private key is generated on first run and stored in `chrome.storage.local.privateKey` (hex). Replacing it triggers a full `initializeNDK` re-init.

### Adding a new platform

Platforms are pluggable via the **strategy pattern**:

1. Implement `PlatformStrategy` (`src/strategies/strategy.interface.ts`): `extractId(url)` returning `'<platform>:<id>'` or `null`, `findContainerAndVideoElement()`, `addDanmakuControl(engine)`.
2. Register the new strategy in the `strategies` array in `src/strategies/index.ts`.
3. Add the host to `content_scripts.matches` in `src/manifest.ts`.

`extractId` is also the discriminator: `findPlatformStrategy(url)` returns the first strategy whose `extractId` returns non-null. The id format `<platform>:<videoId>` is critical because it's used as the Nostr `#i` filter and the History page splits on `:` to reconstruct the platform.

The YouTube strategy (`src/strategies/youtube/index.tsx`) injects its DanmakuControl React tree into a `<div id="danmaku-controls">` placed inside `#above-the-fold`, and detects YouTube dark mode by observing the `dark` attribute on `<html>` to toggle a `.dark-mode` class — replicate that pattern for new platforms.

### `danmaku` library patch

`patches/danmaku+2.0.6.patch` is large and applied automatically by `postinstall`. If `npm install` fails on the patch step (e.g. after a `danmaku` version bump), regenerate it with `patch-package danmaku` rather than skipping `postinstall`.

### i18n

UI strings go through `chrome.i18n.getMessage('key')`. Locale files live in `public/_locales/{en,ja,zh_CN,zh_TW}/messages.json`. `default_locale` is `en`. When adding a string, add it to **all four** locale files or fallback will silently drop it.
