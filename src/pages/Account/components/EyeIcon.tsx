import { Eye, EyeOff } from 'lucide-react'

export default function EyeIcon({
  show,
  setShow,
  size = 24,
}: {
  show: boolean
  setShow: (show: boolean) => void
  size?: number
}) {
  return show ? (
    <Eye size={size} className="cursor-pointer hover:text-primary" onClick={() => setShow(false)} />
  ) : (
    <EyeOff
      size={size}
      className="cursor-pointer hover:text-primary"
      onClick={() => setShow(true)}
    />
  )
}
