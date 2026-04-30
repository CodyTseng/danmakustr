import { findPlatformStrategy } from '@/strategies'
import { DanmakuEngine } from '../danmaku-engine'

let danmakuEngine: DanmakuEngine | null = null
let currentVideoId: string | null = null
let initToken = 0

function waitFor<T>(get: () => T | null | undefined, timeoutMs = 15000): Promise<T | null> {
  const found = get()
  if (found) return Promise.resolve(found)

  return new Promise((resolve) => {
    let done = false
    const finish = (v: T | null) => {
      if (done) return
      done = true
      observer.disconnect()
      clearTimeout(timer)
      resolve(v)
    }
    const observer = new MutationObserver(() => {
      const v = get()
      if (v) finish(v)
    })
    observer.observe(document.documentElement, { childList: true, subtree: true })
    const timer = setTimeout(() => finish(null), timeoutMs)
  })
}

async function init() {
  const myToken = ++initToken
  const url = document.location.href
  const strategy = findPlatformStrategy(url)
  if (!strategy) {
    danmakuEngine?.destroy()
    danmakuEngine = null
    currentVideoId = null
    return
  }

  const id = strategy.extractId(url)
  if (!id) return
  if (id === currentVideoId && danmakuEngine) return

  const ready = await waitFor(() => {
    const { containerElement, videoElement } = strategy.findContainerAndVideoElement()
    return containerElement && videoElement ? true : null
  })
  if (myToken !== initToken) return

  if (!ready) {
    console.error('Danmaku: timed out waiting for video elements')
    return
  }

  danmakuEngine?.destroy()
  try {
    danmakuEngine = new DanmakuEngine(strategy)
  } catch (err) {
    console.error('Danmaku: failed to create engine', err)
    danmakuEngine = null
    return
  }
  currentVideoId = id
  strategy.addDanmakuControl(danmakuEngine)
  chrome.runtime.sendMessage({ type: 'INIT_COMMENTS', id: danmakuEngine.id }, () => {
    if (chrome.runtime.lastError) {
      console.error('Danmaku: SW error', chrome.runtime.lastError.message)
    }
  })
}

init()

// YouTube fires this on every SPA navigation; more reliable than chrome.tabs.onUpdated
document.addEventListener('yt-navigate-finish', () => init())

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'TAB_UPDATED') {
    init()
    return
  }
  if (message.type === 'EMIT_INIT_COMMENT') {
    const { comment, time, self, id, mode, color } = message
    if (!danmakuEngine || id !== danmakuEngine.id) return
    danmakuEngine.send(comment, {
      self,
      time,
      needSendToRelay: false,
      mode,
      color,
    })
  }
})
