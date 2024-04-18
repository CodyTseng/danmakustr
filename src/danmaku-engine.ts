import { PlatformStrategy } from '@/strategies'
import Danmaku from 'danmaku'

const normalStyle = {
  fontSize: '20px',
  color: '#ffffff',
  textShadow: '-1px -1px #000, -1px 1px #000, 1px -1px #000, 1px 1px #000',
}

const selfCommentStyle = {
  ...normalStyle,
  border: '1px solid #337ab7',
}

export class DanmakuEngine {
  readonly id: string
  private danmaku: Danmaku
  private readonly videoElement: HTMLMediaElement

  constructor(strategy: PlatformStrategy) {
    const { containerElement, videoElement } = strategy.findContainerAndVideoElement()
    if (!containerElement || !videoElement) {
      throw new Error('Failed to find elements')
    }

    const id = strategy.extractId(document.location.href)
    if (!id) {
      throw new Error('Failed to extract id')
    }

    this.id = id
    this.videoElement = videoElement
    this.danmaku = new Danmaku({
      container: containerElement,
      media: videoElement,
      comments: [],
      speed: 144,
    })
    console.debug('Danmaku created')
  }

  destroy() {
    this.danmaku.destroy()
    console.debug('Danmaku destroyed')
  }

  hide() {
    this.danmaku.hide()
  }

  show() {
    this.danmaku.show()
  }

  send(comment: string) {
    const time = this.videoElement.currentTime
    this.emit(comment, true, time)
    chrome.runtime.sendMessage({ type: 'SEND_COMMENT', comment, time, id: this.id })
  }

  emit(comment: string, self: boolean, time: number) {
    this.danmaku.emit({
      text: comment,
      time,
      style: self ? selfCommentStyle : normalStyle,
    })
  }
}
