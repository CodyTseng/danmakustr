export default function ScrollDanmakuIcon({
  style,
  color,
}: { style?: React.CSSProperties; color?: string } = {}) {
  return (
    <div style={style}>
      <svg data-pointer="none" viewBox="0 0 28 28" fill={color ?? 'currentColor'}>
        <path d="M23 3H5a4 4 0 0 0-4 4v14a4 4 0 0 0 4 4h18a4 4 0 0 0 4-4V7a4 4 0 0 0-4-4zM11 9h6a1 1 0 0 1 0 2h-6a1 1 0 0 1 0-2zm-3 2H6V9h2v2zm4 4h-2v-2h2v2zm9 0h-6a1 1 0 0 1 0-2h6a1 1 0 0 1 0 2z"></path>
      </svg>
    </div>
  )
}
