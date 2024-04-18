import { findPlatformStrategy } from '@/strategies'
import { DanmakuEngine } from '../danmaku-engine'

let danmakuEngine: DanmakuEngine | null = null
let preUrl: string | null = null

function init() {
  console.debug('init function')
  const url = document.location.href
  if (preUrl === url) return
  preUrl = url

  const strategy = findPlatformStrategy(url)
  if (!strategy) {
    return console.debug('No strategy found')
  }

  danmakuEngine?.destroy()
  danmakuEngine = new DanmakuEngine(strategy)
  if (!danmakuEngine) {
    return console.error('Failed to create danmaku engine')
  }
  strategy.addDanmakuControl(danmakuEngine)

  chrome.runtime.sendMessage({ type: 'INIT_COMMENTS', id: danmakuEngine.id })
  console.debug('Initialized danmaku engine')
}
setTimeout(init, 1000)

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'TAB_UPDATED') {
    setTimeout(init, 1000)
  }
  if (message.type === 'EMIT_INIT_COMMENT') {
    const { comment, time, self, id } = message
    if (id !== danmakuEngine?.id) return

    danmakuEngine?.emit(comment, self, time)
  }
})
