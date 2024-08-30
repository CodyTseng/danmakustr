export default function TopDanmakuIcon({
  style,
  color,
}: { style?: React.CSSProperties; color?: string } = {}) {
  return (
    <div style={style}>
      <svg data-pointer="none" viewBox="0 0 28 28" fill={color ?? 'currentColor'}>
        <path d="M23 3H5a4 4 0 0 0-4 4v14a4 4 0 0 0 4 4h18a4 4 0 0 0 4-4V7a4 4 0 0 0-4-4zM9 9H7V7h2v2zm4 0h-2V7h2v2zm4 0h-2V7h2v2zm4 0h-2V7h2v2z"></path>
      </svg>
    </div>
  )
}
