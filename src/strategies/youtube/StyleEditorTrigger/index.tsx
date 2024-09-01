import { BottomDanmakuIcon, ScrollDanmakuIcon, TopDanmakuIcon } from '@/components/icon'
import * as HoverCard from '@radix-ui/react-hover-card'
import { Palette, Settings2 } from 'lucide-react'
import { ChangeEvent, ReactElement } from 'react'
import { TMode } from '../../../types'

import './index.css'

const recommendedColors = [
  '#FE0302',
  '#FF7204',
  '#FFAA02',
  '#FFD302',
  '#FFFF00',
  '#A0EE00',
  '#00CD00',
  '#019899',
  '#4266BE',
  '#89D5FF',
  '#DB9CFF',
  '#8E30EB',
  '#222222',
  '#FFFFFF',
]

const modes: { name: string; mode: TMode; icon: ReactElement }[] = [
  {
    name: chrome.i18n.getMessage('scroll'),
    mode: 'rtl',
    icon: <ScrollDanmakuIcon style={{ width: '3rem', height: '3rem' }} />,
  },
  {
    name: chrome.i18n.getMessage('top'),
    mode: 'top',
    icon: <TopDanmakuIcon style={{ width: '3rem', height: '3rem' }} />,
  },
  {
    name: chrome.i18n.getMessage('bottom'),
    mode: 'bottom',
    icon: <BottomDanmakuIcon style={{ width: '3rem', height: '3rem' }} />,
  },
]

export default function StyleEditorTrigger({
  mode,
  color,
  onModeChange,
  onColorChange,
}: {
  mode: TMode
  color: string
  onModeChange: (mode: TMode) => void
  onColorChange: (color: string) => void
}) {
  return (
    <HoverCard.Root>
      <HoverCard.Trigger className="style-editor-trigger">
        <Palette size={18} strokeWidth={3} />
      </HoverCard.Trigger>
      <HoverCard.Portal>
        <HoverCard.Content sideOffset={10} collisionPadding={10} style={{ zIndex: 9999 }}>
          <StyleEditor
            mode={mode}
            color={color}
            onModeChange={onModeChange}
            onColorChange={onColorChange}
          />
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  )
}

export function StyleEditor({
  mode,
  color,
  onModeChange,
  onColorChange,
}: {
  mode: TMode
  color: string
  onModeChange: (mode: TMode) => void
  onColorChange: (color: string) => void
}) {
  const handleModeSelectorClicked = (m: TMode) => {
    onModeChange(m)
  }

  const handleColorInputChanged = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value.match(/^#[0-9a-fA-F]{0,6}$/)) return
    onColorChange(e.target.value.toUpperCase())
  }

  const handleRecommendColorClicked = (c: string) => {
    onColorChange(c)
  }

  return (
    <div className="style-editor-content">
      <div>
        <div className="style-editor-content-section-title">{chrome.i18n.getMessage('mode')}</div>
        <div style={{ display: 'flex', gap: '2rem' }}>
          {modes.map(({ name, mode: m, icon }) => (
            <div
              key={m}
              className="mode-selector"
              style={{ color: mode === m ? '#DB9CFF' : 'gray' }}
              onClick={() => handleModeSelectorClicked(m)}
            >
              {icon}
              <div>{name}</div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="style-editor-content-section-title">{chrome.i18n.getMessage('color')}</div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <input
            onChange={handleColorInputChanged}
            value={color}
            style={{ flex: 1, width: 0 }}
            className="color-input"
          />
          <div style={{ background: color }} className="color-preview" />
        </div>
      </div>
      <div className="recommended-colors">
        {recommendedColors.map((c) => (
          <div
            key={c}
            style={{ background: c }}
            className="recommended-color"
            onClick={() => handleRecommendColorClicked(c)}
          />
        ))}
      </div>
    </div>
  )
}
