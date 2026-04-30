import { cn } from '@/lib/utils'
import { Eye, EyeOff } from 'lucide-react'

export default function EyeIcon({
  show,
  setShow,
  size = 16,
  className,
}: {
  show: boolean
  setShow: (show: boolean) => void
  size?: number
  className?: string
}) {
  const Icon = show ? Eye : EyeOff
  return (
    <button
      type="button"
      onClick={() => setShow(!show)}
      aria-label={show ? 'Hide' : 'Show'}
      className={cn(
        'inline-flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors',
        className,
      )}
    >
      <Icon size={size} />
    </button>
  )
}
