import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash2 } from 'lucide-react'
import { ChangeEvent, useEffect, useState } from 'react'

export default function Relays() {
  const [relayUrls, setRelayUrls] = useState<string[]>([])
  const [newRelayUrlInput, setNewRelayUrlInput] = useState<string>('')
  const [newRelayUrlInputError, setNewRelayUrlInputError] = useState<string>('')

  const init = async () => {
    const { relayUrls: localRelayUrls } = await chrome.storage.local.get('relayUrls')
    if (localRelayUrls) {
      setRelayUrls(localRelayUrls)
    }
  }

  useEffect(() => {
    init()
  }, [])

  const updateRelayUrls = async (newRelayUrls: string[]) => {
    setRelayUrls(newRelayUrls)
    await chrome.storage.local.set({ relayUrls: newRelayUrls })
  }

  const removeRelay = async (url: string) => {
    await updateRelayUrls(relayUrls.filter((item) => item !== url))
  }

  const addRelay = async () => {
    if (!newRelayUrlInput) {
      return
    }
    if (!/^(wss?):\/\/([^\s/:]+)(?::(\d+))?(\/[^\s]*)?$/.test(newRelayUrlInput)) {
      setNewRelayUrlInputError('Invalid URL')
      return
    }

    const normalizedUrl = newRelayUrlInput.endsWith('/')
      ? newRelayUrlInput.slice(0, -1)
      : newRelayUrlInput

    if (relayUrls.includes(normalizedUrl)) {
      setNewRelayUrlInput('')
      return
    }

    setNewRelayUrlInput('')
    await updateRelayUrls([...relayUrls, normalizedUrl])
  }

  const handleNewRelayUrlInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewRelayUrlInput(e.target.value)
    setNewRelayUrlInputError('')
  }

  const handleNewRelayUrlInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      addRelay()
    }
  }

  return (
    <div className="space-y-4 py-4 px-2">
      <div className="text-3xl font-medium text-primary">Relays</div>
      <div className="space-y-2">
        {relayUrls.map((url) => (
          <Relay key={url} relayUrl={url} remove={removeRelay} />
        ))}
      </div>
      <div>
        <div className="flex gap-3 items-center">
          <Input
            value={newRelayUrlInput}
            placeholder="wss://relay.example.com"
            onChange={handleNewRelayUrlInputChange}
            onKeyDown={handleNewRelayUrlInputKeyDown}
            className={newRelayUrlInputError ? 'border-destructive' : ''}
          />
          <Button onClick={addRelay}>Add</Button>
        </div>
        {newRelayUrlInputError && (
          <div className="text-destructive pl-3">{newRelayUrlInputError}</div>
        )}
      </div>
    </div>
  )
}

function Relay({ relayUrl, remove }: { relayUrl: string; remove: (url: string) => void }) {
  const url = new URL(relayUrl)
  return (
    <div className="flex justify-between items-center hover:text-primary">
      <div className="flex items-center gap-2">
        <Avatar className="w-6 h-6">
          <AvatarImage src={getFaviconUrl(url)} />
          <AvatarFallback>{url.host.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>{relayUrl}</div>
      </div>
      <Button className="w-6 h-6 p-0" variant="ghost" onClick={() => remove(relayUrl)}>
        <Trash2 size={14} className="text-destructive" />
      </Button>
    </div>
  )
}

function getFaviconUrl(url: URL) {
  return (
    url.origin.replace(url.protocol, url.protocol === 'wss:' ? 'https:' : 'http:') + '/favicon.ico'
  )
}
