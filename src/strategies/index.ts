import { PlatformStrategy } from './strategy.interface'
import { YoutubeStrategy } from './youtube'

export * from './strategy.interface'

const strategies: PlatformStrategy[] = [new YoutubeStrategy()]

export function findPlatformStrategy(url: string): PlatformStrategy | null {
  for (const strategy of strategies) {
    const id = strategy.extractId(url)
    if (id) {
      return strategy
    }
  }

  return null
}
