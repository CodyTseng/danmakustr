import './index.css'

import { BottomDanmakuIcon, ScrollDanmakuIcon, TopDanmakuIcon } from '@/components/icon'
import * as Popover from '@radix-ui/react-popover'
import { Palette, Pipette } from 'lucide-react'
import { ChangeEvent, CSSProperties, ReactElement } from 'react'
import { TMode } from '../../../types'

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
  '#F7B5CA',
  '#C68EE6',
  '#222222',
  '#FFFFFF',
]

const modes: { name: string; mode: TMode; icon: ReactElement }[] = [
  {
    name: chrome.i18n.getMessage('scroll'),
    mode: 'rtl',
    icon: <ScrollDanmakuIcon style={{ width: 22, height: 22 }} />,
  },
  {
    name: chrome.i18n.getMessage('top'),
    mode: 'top',
    icon: <TopDanmakuIcon style={{ width: 22, height: 22 }} />,
  },
  {
    name: chrome.i18n.getMessage('bottom'),
    mode: 'bottom',
    icon: <BottomDanmakuIcon style={{ width: 22, height: 22 }} />,
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
    <Popover.Root>
      <Popover.Trigger className="style-editor-trigger" aria-label="Danmaku style">
        <Palette size={18} strokeWidth={2} />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content sideOffset={10} collisionPadding={10} style={{ zIndex: 9999 }}>
          <StyleEditor
            mode={mode}
            color={color}
            onModeChange={onModeChange}
            onColorChange={onColorChange}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
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
  const handleColorInputChanged = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value.match(/^#[0-9a-fA-F]{0,6}$/)) return
    onColorChange(e.target.value.toUpperCase())
  }

  const normalizedColor = color.toUpperCase()

  return (
    <div className="style-editor-content">
      <section className="se-section">
        <div className="se-section-title">{chrome.i18n.getMessage('mode')}</div>
        <div className="se-mode-group" role="radiogroup">
          {modes.map(({ name, mode: m, icon }) => (
            <button
              type="button"
              role="radio"
              aria-checked={mode === m}
              key={m}
              className={'se-mode-option' + (mode === m ? ' selected' : '')}
              onClick={() => onModeChange(m)}
            >
              {icon}
              <span>{name}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="se-section">
        <div className="se-section-title">{chrome.i18n.getMessage('color')}</div>
        <div className="se-color-input-row">
          <span className="se-color-preview" style={{ background: color }} aria-hidden />
          <input
            className="se-color-input"
            onChange={handleColorInputChanged}
            value={color}
            spellCheck={false}
            maxLength={7}
          />
          <label className="se-color-picker" aria-label={chrome.i18n.getMessage('color')}>
            <Pipette size={14} strokeWidth={2} />
            <input
              type="color"
              value={color}
              onChange={(e) => onColorChange(e.target.value.toUpperCase())}
            />
          </label>
        </div>
        <div className="se-color-swatches">
          {recommendedColors.map((c) => (
            <button
              type="button"
              key={c}
              aria-label={c}
              className={'se-swatch' + (c === normalizedColor ? ' selected' : '')}
              style={{ background: c, ['--swatch-color' as string]: c } as CSSProperties}
              onClick={() => onColorChange(c)}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
