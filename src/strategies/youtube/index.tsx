import { MessageSquareOff, MessageSquareText, SendHorizontal } from 'lucide-react'
import { ChangeEvent, KeyboardEvent, StrictMode, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { DanmakuEngine } from '../../danmaku-engine'
import { PlatformStrategy } from '../strategy.interface'

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

  function handleSwitchChange() {
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

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    setInputValue(event.target.value)
  }

  function onInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    // if i don't do this. when i press space, the video will be paused. i don't know why
    if (event.key !== ' ') {
      event.stopPropagation()
    }
    if (event.key === 'Enter') {
      handleSubmit()
    }
  }

  async function handleSubmit() {
    setInputValue('')
    danmakuEngine.send(inputValue)
  }

  return (
    <>
      <button onClick={handleSwitchChange} className="danmaku-button-secondary">
        {switchValue ? <MessageSquareText /> : <MessageSquareOff />}
      </button>
      <input
        className="danmaku-input"
        placeholder="Send a danmaku comment"
        value={inputValue}
        disabled={!switchValue}
        onChange={handleInputChange}
        onKeyDown={onInputKeyDown}
        maxLength={100}
      />
      <button onClick={handleSubmit} disabled={!switchValue} className="danmaku-button-primary">
        <SendHorizontal />
      </button>
    </>
  )
}
