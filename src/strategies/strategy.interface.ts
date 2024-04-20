import { DanmakuEngine } from '../danmaku-engine'

export interface PlatformStrategy {
  /**
   * Extract the id of the video from the url
   *
   * @param url the url of the page
   * @returns the id of the video, or null if the id cannot be extracted
   */
  extractId: (url: string) => string | null

  /**
   * Find the container element and the video element. The container element is
   * the element that you want to display the danmaku on. Generally, it is the
   * element that contains the video element.
   *
   * @returns the container element and the video element
   */
  findContainerAndVideoElement: () => {
    containerElement: HTMLElement | null
    videoElement: HTMLMediaElement | null
  }

  /**
   * Add the danmaku control to the page.
   *
   * @param danmakuEngine danmaku engine
   */
  addDanmakuControl: (danmakuEngine: DanmakuEngine) => void
}
