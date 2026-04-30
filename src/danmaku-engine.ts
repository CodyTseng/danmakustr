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
    // The danmaku lib appends its stage as the last child of the container
    // with z-index:auto, which on YouTube gets buried under .html5-video-container
    // (z=10) and the player chrome (up to z=2300). Force it on top, and shift
    // it down so danmaku doesn't render against the very top edge of the video.
    const stage = containerElement.lastElementChild as HTMLElement | null
    const TOP_RESERVE = 12
    const styleStage = (s: HTMLElement) => {
      s.style.zIndex = '9999'
      s.style.transform = `translateZ(0) translateY(${TOP_RESERVE}px)`
    }
    if (stage) styleStage(stage)
    this.resizeObserver = new ResizeObserver(() => {
      this.danmaku.resize()
      // The lib resets stage width/height on resize but leaves transform alone;
      // re-apply just in case the stage element gets recreated.
      const s = containerElement.lastElementChild as HTMLElement | null
      if (s) styleStage(s)
    })
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
