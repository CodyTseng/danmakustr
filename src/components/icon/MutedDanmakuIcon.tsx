import { useId } from 'react'

export default function MutedDanmakuIcon({
  style,
  color,
}: { style?: React.CSSProperties; color?: string } = {}) {
  const id = useId()
  const maskId = `muted-danmaku-${id}`
  return (
    <div style={style}>
      <svg data-pointer="none" viewBox="0 0 28 28" fill={color ?? 'currentColor'}>
        <defs>
          <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="28" height="28">
            <rect width="28" height="28" fill="white" />
            <line
              x1="-1"
              y1="29"
              x2="29"
              y2="-1"
              stroke="black"
              strokeWidth="5"
              strokeLinecap="round"
            />
          </mask>
        </defs>
        <g mask={`url(#${maskId})`}>
          <path d="M23 3H5a4 4 0 0 0-4 4v14a4 4 0 0 0 4 4h18a4 4 0 0 0 4-4V7a4 4 0 0 0-4-4zM11 9h6a1 1 0 0 1 0 2h-6a1 1 0 0 1 0-2zm-3 2H6V9h2v2zm4 4h-2v-2h2v2zm9 0h-6a1 1 0 0 1 0-2h6a1 1 0 0 1 0 2z"></path>
        </g>
        <line
          x1="-1"
          y1="29"
          x2="29"
          y2="-1"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}
