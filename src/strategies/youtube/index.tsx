import './index.css'

import { MutedDanmakuIcon, ScrollDanmakuIcon } from '@/components/icon'
import { Pencil, Send, X } from 'lucide-react'
import {
  ChangeEvent,
  KeyboardEvent,
  StrictMode,
  useEffect,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import ReactDOM from 'react-dom/client'
import { DanmakuEngine } from '../../danmaku-engine'
import { TMode } from '../../types'
import { PlatformStrategy } from '../strategy.interface'
import StyleEditorTrigger from './StyleEditorTrigger'

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
    // remove the old danmaku control
    this.removeDanmakuControl()

    const liveBadge = document.getElementsByClassName('ytp-live-badge')[0]
    if (liveBadge && this.checkIsLiveByLiveBadge(liveBadge)) {
      console.debug('is live')
      return
    }

    const mount = (aboveTheFold: HTMLElement) => {
      const danmakuControl = document.createElement('div')
      danmakuControl.id = 'danmaku-controls'
      aboveTheFold.insertBefore(danmakuControl, aboveTheFold.firstChild)

      ReactDOM.createRoot(danmakuControl).render(
        <StrictMode>
          <DanmakuControl danmakuEngine={danmakuEngine} />
        </StrictMode>,
      )
    }

    const existing = document.getElementById('above-the-fold')
    if (existing) return mount(existing)

    // YouTube can render the player before the metadata block; wait for it
    const observer = new MutationObserver(() => {
      const el = document.getElementById('above-the-fold')
      if (el) {
        observer.disconnect()
        clearTimeout(timer)
        mount(el)
      }
    })
    observer.observe(document.documentElement, { childList: true, subtree: true })
    const timer = setTimeout(() => {
      observer.disconnect()
      console.error('Failed to find above the fold')
    }, 15000)
  }

  private removeDanmakuControl() {
    const danmakuControls = document.getElementById('danmaku-controls')
    if (danmakuControls) {
      danmakuControls.remove()
    }
  }

  private checkIsLiveByLiveBadge(liveBadge: Element) {
    const style = window.getComputedStyle(liveBadge)
    return style.display !== 'none'
  }
}

function DanmakuControl({ danmakuEngine }: { danmakuEngine: DanmakuEngine }) {
  const [switchValue, setSwitchValue] = useState(true)
  const [inputValue, setInputValue] = useState('')
  const [mode, setMode] = useState<TMode>('rtl')
  const [color, setColor] = useState('#FFFFFF')

  const init = async () => {
    const { mode, color } = await chrome.storage.local.get(['mode', 'color'])
    if (mode) {
      setMode(mode as TMode)
    }
    if (color) {
      setColor(color as string)
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

  // Fullscreen mini overlay: portal a compact, click-to-expand input into
  // the player so users can send danmaku without leaving fullscreen.
  const [fsPlayer, setFsPlayer] = useState<HTMLElement | null>(null)
  useEffect(() => {
    const update = () => {
      const fse = document.fullscreenElement as HTMLElement | null
      const moviePlayer = document.getElementById('movie_player')
      if (
        fse &&
        moviePlayer &&
        (fse === moviePlayer || fse.contains(moviePlayer))
      ) {
        setFsPlayer(moviePlayer)
      } else {
        setFsPlayer(null)
      }
    }
    update()
    document.addEventListener('fullscreenchange', update)
    return () => document.removeEventListener('fullscreenchange', update)
  }, [])

  const [miniExpanded, setMiniExpanded] = useState(false)
  const miniInputRef = useRef<HTMLInputElement | null>(null)
  useEffect(() => {
    if (miniExpanded) miniInputRef.current?.focus()
  }, [miniExpanded])
  // Collapse when leaving fullscreen so we don't reopen mid-expanded next time
  useEffect(() => {
    if (!fsPlayer) setMiniExpanded(false)
  }, [fsPlayer])
  // Collapse if the user toggles danmaku off while composing
  useEffect(() => {
    if (!switchValue) setMiniExpanded(false)
  }, [switchValue])

  const handleMiniSubmit = () => {
    if (inputValue.trim()) handleSubmit()
    setMiniExpanded(false)
  }

  const handleMiniKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      setMiniExpanded(false)
      return
    }
    handleInputKeyDown(event)
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
      <button
        onClick={handleSwitchChange}
        className="danmaku-button-secondary"
        title={
          switchValue
            ? chrome.i18n.getMessage('hide_danmaku')
            : chrome.i18n.getMessage('show_danmaku')
        }
      >
        {switchValue ? (
          <ScrollDanmakuIcon style={{ width: 22, height: 22 }} />
        ) : (
          <MutedDanmakuIcon style={{ width: 22, height: 22 }} />
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
          placeholder={chrome.i18n.getMessage('danmaku_input_placeholder')}
          value={inputValue}
          disabled={!switchValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          maxLength={100}
        />
      </div>
      <button onClick={handleSubmit} disabled={!switchValue} className="danmaku-button-primary">
        {chrome.i18n.getMessage('send')}
      </button>
      {fsPlayer &&
        createPortal(
          <div className={'danmaku-mini' + (miniExpanded ? ' expanded' : '')}>
            <div className="danmaku-mini-actions">
              <button
                onClick={handleSwitchChange}
                className="danmaku-mini-toggle"
                title={
                  switchValue
                    ? chrome.i18n.getMessage('hide_danmaku')
                    : chrome.i18n.getMessage('show_danmaku')
                }
              >
                {switchValue ? (
                  <ScrollDanmakuIcon style={{ width: 22, height: 22 }} />
                ) : (
                  <MutedDanmakuIcon style={{ width: 22, height: 22 }} />
                )}
              </button>
              <button
                onClick={() => setMiniExpanded((v) => !v)}
                disabled={!switchValue}
                className="danmaku-mini-trigger"
                title={chrome.i18n.getMessage('danmaku_input_placeholder')}
              >
                {miniExpanded ? (
                  <X size={18} strokeWidth={2.25} />
                ) : (
                  <Pencil size={16} strokeWidth={2} />
                )}
              </button>
            </div>
            {miniExpanded && (
              <div className="danmaku-mini-compose">
                <StyleEditorTrigger
                  mode={mode}
                  color={color}
                  onModeChange={handleModeChange}
                  onColorChange={handleColorChange}
                />
                <input
                  ref={miniInputRef}
                  className="danmaku-mini-input"
                  placeholder={chrome.i18n.getMessage('danmaku_input_placeholder')}
                  value={inputValue}
                  disabled={!switchValue}
                  onChange={handleInputChange}
                  onKeyDown={handleMiniKeyDown}
                  maxLength={100}
                />
                <button
                  onClick={handleMiniSubmit}
                  disabled={!switchValue}
                  className="danmaku-mini-send"
                  title={chrome.i18n.getMessage('send')}
                >
                  <Send size={14} strokeWidth={2.25} />
                </button>
              </div>
            )}
          </div>,
          fsPlayer,
        )}
    </>
  )
}
