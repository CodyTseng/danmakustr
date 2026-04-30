import { cn } from '@/lib/utils'
import { Check, Copy } from 'lucide-react'
import { useState } from 'react'

export default function CopyIcon({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false)

  const handleClick = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1000)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Copy"
      className={cn(
        'inline-flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground transition-colors',
        copied ? 'text-primary' : 'hover:text-foreground hover:bg-muted',
        className,
      )}
    >
      {copied ? <Check size={16} /> : <Copy size={16} />}
    </button>
  )
}
