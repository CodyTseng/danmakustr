import { Check, Copy } from 'lucide-react'
import { useState } from 'react'

export default function CopyIcon({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleClick = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1000)
  }

  return copied ? (
    <Check className="text-primary" />
  ) : (
    <Copy className="cursor-pointer hover:text-primary" onClick={handleClick} />
  )
}
