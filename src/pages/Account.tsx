import { Input } from '@/components/ui/input'
import { hexToBytes } from '@noble/hashes/utils'
import { Check, Copy } from 'lucide-react'
import { getPublicKey, nip19 } from 'nostr-tools'
import { useEffect, useState } from 'react'

export default function Account() {
  const [privateKey, setPrivateKey] = useState<string | null>(null)
  const [npub, setNpub] = useState('')
  const [nsec, setNsec] = useState('')

  const init = async () => {
    const { privateKey } = await chrome.storage.local.get('privateKey')
    setPrivateKey(privateKey)
  }
  useEffect(() => {
    init()
  }, [])

  useEffect(() => {
    if (!privateKey) {
      setNpub('')
      setNsec('')
    } else {
      setNpub(nip19.npubEncode(getPublicKey(hexToBytes(privateKey))))
      setNsec(nip19.nsecEncode(hexToBytes(privateKey)))
    }
  }, [privateKey])

  return (
    <div className="space-y-4">
      <div className="text-3xl font-medium text-primary">Account</div>
      <div className="space-y-1">
        <div>public key</div>
        <div className="flex items-center gap-2">
          <Input value={npub} disabled />
          <CopyIcon text={npub} />
        </div>
      </div>
      <div className="space-y-1">
        <div>private key</div>
        <div className="flex items-center gap-2">
          <Input type="password" value={nsec} disabled />
          <CopyIcon text={nsec} />
        </div>
      </div>
    </div>
  )
}

function CopyIcon({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleClick = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1000)
  }

  return copied ? (
    <Check />
  ) : (
    <Copy
      className="cursor-pointer text-muted-foreground hover:text-foreground"
      onClick={handleClick}
    />
  )
}
