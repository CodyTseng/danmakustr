import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash2, X } from 'lucide-react'
import { ChangeEvent, useState } from 'react'

export default function Relays() {
  const [relayList, setRelayList] = useState<string[]>([
    'wss://nostr-relay.app',
    'wss://relay.damus.io',
    'wss://relay.nostr.band',
    'wss://nos.lol',
    'wss://nostr.bitcoiner.social',
    'wss://relay.snort.social',
  ])
  const [newRelayUrlInput, setNewRelayUrlInput] = useState<string>('')
  const [newRelayUrlInputError, setNewRelayUrlInputError] = useState<string>('')

  const removeRelay = (url: string) => {
    setRelayList((list) => list.filter((item) => item !== url))
  }

  const handleNewRelayUrlInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewRelayUrlInput(e.target.value)
    setNewRelayUrlInputError('')
  }

  const addRelay = () => {
    if (!newRelayUrlInput || relayList.includes(newRelayUrlInput)) {
      setNewRelayUrlInput('')
      return
    }

    if (!/^(wss?):\/\/([^\s/:]+)(?::(\d+))?(\/[^\s]*)?$/.test(newRelayUrlInput)) {
      setNewRelayUrlInputError('Invalid URL')
      return
    }

    setRelayList((list) => [...list, newRelayUrlInput])
    setNewRelayUrlInput('')
  }

  return (
    <div className="space-y-4">
      <div className="text-3xl font-medium">Relays</div>
      <div className="space-y-2">
        {relayList.map((url) => (
          <Relay key={url} relayUrl={url} remove={removeRelay} />
        ))}
      </div>
      <div>
        <div className="flex gap-2 items-center">
          <Input
            value={newRelayUrlInput}
            placeholder="wss://xxx"
            onChange={handleNewRelayUrlInputChange}
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
      <div className="pr-4">
        <Button className="w-6 h-6 p-0" variant="ghost" onClick={() => remove(relayUrl)}>
          <Trash2 size={14} className="text-destructive" />
        </Button>
      </div>
    </div>
  )
}

function getFaviconUrl(url: URL) {
  return (
    url.origin.replace(url.protocol, url.protocol === 'wss:' ? 'https:' : 'http:') + '/favicon.ico'
  )
}
