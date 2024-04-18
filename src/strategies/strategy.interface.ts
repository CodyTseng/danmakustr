import { DanmakuEngine } from '../danmaku-engine'

export interface PlatformStrategy {
  extractId: (url: string) => string | null

  findContainerAndVideoElement: () => {
    containerElement: HTMLElement | null
    videoElement: HTMLMediaElement | null
  }

  addDanmakuControl: (danmakuEngine: DanmakuEngine) => void
}
