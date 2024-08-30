import { MessageSquareOff, MessageSquareText } from 'lucide-react'
import { ChangeEvent, KeyboardEvent, StrictMode, useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { DanmakuEngine } from '../../danmaku-engine'
import { TMode } from '../../types'
import { PlatformStrategy } from '../strategy.interface'
import StyleEditorTrigger from './StyleEditorTrigger'

import './index.css'

export class YoutubeStrategy implements PlatformStrategy {
  extractId(url: string) {
    const match = url.match(/youtube\.com\/watch\?v=(?<id>[^&]+)/)
    const youtubeId = match?.groups?.id ?? null
    return youtubeId ? `youtube:${youtubeId}` : null
  }

  findContainerAndVideoElement() {
    console.debug('Finding container and video element', document.location.href)
    const containerElement = document.getElementById('movie_player')
    if (!containerElement) {
      return { containerElement, videoElement: null }
    }

    const videoElement = containerElement
      .querySelector('.html5-video-container')
      ?.querySelector('video') as HTMLMediaElement | null

    return {
      containerElement,
      videoElement,
    }
  }

  addDanmakuControl(danmakuEngine: DanmakuEngine) {
    const oldDanmakuControls = document.getElementById('danmaku-controls')
    if (oldDanmakuControls) {
      oldDanmakuControls.remove()
    }

    const aboveTheFold = document.getElementById('above-the-fold')
    if (!aboveTheFold) {
      return console.error('Failed to find above the fold')
    }

    const danmakuControl = document.createElement('div')
    danmakuControl.className = 'flex w-full items-center'
    danmakuControl.id = 'danmaku-controls'
    aboveTheFold.insertBefore(danmakuControl, aboveTheFold.firstChild)

    ReactDOM.createRoot(document.getElementById('danmaku-controls') as HTMLElement).render(
      <StrictMode>
        <DanmakuControl danmakuEngine={danmakuEngine} />
      </StrictMode>,
    )
  }
}

function DanmakuControl({ danmakuEngine }: { danmakuEngine: DanmakuEngine }): JSX.Element {
  const [switchValue, setSwitchValue] = useState(true)
  const [inputValue, setInputValue] = useState('')
  const [mode, setMode] = useState<TMode>('rtl')
  const [color, setColor] = useState('#FFFFFF')

  const init = async () => {
    const { mode, color } = await chrome.storage.local.get(['mode', 'color'])
    if (mode) {
      setMode(mode)
    }
    if (color) {
      setColor(color)
    }
  }

  useEffect(() => {
    init()
  }, [])

  // check if the dark mode is enabled
  const isYouTubeDarkMode = document.documentElement.hasAttribute('dark')
  if (isYouTubeDarkMode) {
    document.body.classList.add('dark-mode')
  } else {
    document.body.classList.remove('dark-mode')
  }

  // observe the root element for changes to the dark attribute
  const observer = new MutationObserver(() => {
    const newDarkMode = document.documentElement.hasAttribute('dark')
    if (newDarkMode) {
      document.body.classList.add('dark-mode')
    } else {
      document.body.classList.remove('dark-mode')
    }
  })

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['dark'],
  })

  const handleSwitchChange = () => {
    setSwitchValue((prev) => {
      const newValue = !prev
      if (newValue) {
        danmakuEngine.show()
      } else {
        danmakuEngine.hide()
      }
      return newValue
    })
  }

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value)
  }

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    // if i don't do this. when i press space, the video will be paused. i don't know why
    if (event.key !== ' ') {
      event.stopPropagation()
    }
    if (event.key === 'Enter') {
      handleSubmit()
    }
  }

  const handleSubmit = async () => {
    setInputValue('')
    danmakuEngine.send(inputValue, { color, mode })
  }

  const handleModeChange = async (mode: TMode) => {
    setMode(mode)
    await chrome.storage.local.set({ mode })
  }

  const handleColorChange = async (color: string) => {
    setColor(color)
    await chrome.storage.local.set({ color })
  }

  return (
    <>
      <button onClick={handleSwitchChange} className="danmaku-button-secondary">
        {switchValue ? (
          <MessageSquareText size={16} strokeWidth={3} />
        ) : (
          <MessageSquareOff size={16} strokeWidth={3} />
        )}
      </button>
      <div className="danmaku-input-wrapper">
        <StyleEditorTrigger
          mode={mode}
          color={color}
          onModeChange={handleModeChange}
          onColorChange={handleColorChange}
        />
        <input
          className="danmaku-input"
          placeholder="Send a danmaku comment"
          value={inputValue}
          disabled={!switchValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          maxLength={100}
        />
      </div>
      <button onClick={handleSubmit} disabled={!switchValue} className="danmaku-button-primary">
        Send
      </button>
    </>
  )
}
