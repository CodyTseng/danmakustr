import { PlatformStrategy } from '@/strategies'
import Danmaku from 'danmaku'
import { TMode } from './types'

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
  private readonly danmaku: Danmaku
  private readonly videoElement: HTMLMediaElement
  private readonly resizeObserver: ResizeObserver

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
    this.resizeObserver = new ResizeObserver(() => this.danmaku.resize())
    this.resizeObserver.observe(containerElement)
    console.debug('Danmaku created')
  }

  /**
   * Destroy the danmaku engine and release memory
   */
  destroy() {
    this.danmaku.destroy()
    this.resizeObserver.disconnect()
    console.debug('Danmaku destroyed')
  }

  /**
   * Hide danmaku comments
   */
  hide() {
    this.danmaku.hide()
  }

  /**
   * Show danmaku comments
   */
  show() {
    this.danmaku.show()
  }

  /**
   * Send a danmaku comment
   *
   * @param comment danmaku comment content
   * @param options.self whether the comment is sent by the user. Default is true
   * @param options.time the time of the video when the danmaku comment is sent in seconds. Default is the current time of the video
   * @param options.needSendToRelay whether the comment should be sent to the relay server. Default is true
   */
  send(
    comment: string,
    options: {
      self?: boolean
      time?: number
      needSendToRelay?: boolean
      color?: string
      mode?: TMode
    } = {},
  ) {
    comment = comment.trim()
    if (!comment) {
      return
    }

    const {
      self = true,
      time = this.videoElement.currentTime,
      needSendToRelay = true,
      mode,
      color,
    } = options
    const style = self ? { ...selfCommentStyle } : { ...normalStyle }
    if (color) {
      style.color = color
    }
    this.danmaku.emit({
      text: comment,
      mode,
      time,
      style,
    })
    if (needSendToRelay) {
      chrome.runtime.sendMessage({
        type: 'SEND_COMMENT',
        comment,
        time,
        id: this.id,
        mode,
        color,
      })
    }
  }
}
