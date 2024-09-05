import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash2 } from 'lucide-react'
import { ChangeEvent, useEffect, useState } from 'react'

type TRelay = { url: string; connected: boolean }

export default function Relays() {
  const [relays, setRelays] = useState<TRelay[]>([])
  const [newRelayUrlInput, setNewRelayUrlInput] = useState<string>('')
  const [newRelayUrlInputError, setNewRelayUrlInputError] = useState<string>('')

  const resetRelays = async () => {
    const relays = await chrome.runtime.sendMessage({ type: 'GET_RELAYS' })
    setRelays(relays)
  }

  useEffect(() => {
    resetRelays()
    const interval = setInterval(resetRelays, 1000)
    return () => clearInterval(interval)
  }, [])

  const updateRelayUrls = async (newRelays: TRelay[]) => {
    setRelays(newRelays)
    await chrome.storage.local.set({ relayUrls: newRelays.map((relay) => relay.url) })
  }

  const removeRelay = async (url: string) => {
    await updateRelayUrls(relays.filter((item) => item.url !== url))
  }

  const addRelay = async () => {
    if (!newRelayUrlInput) {
      return
    }
    if (!/^(wss?):\/\/([^\s/:]+)(?::(\d+))?(\/[^\s]*)?$/.test(newRelayUrlInput)) {
      setNewRelayUrlInputError('Invalid URL')
      return
    }

    const normalizedUrl = newRelayUrlInput.endsWith('/') ? newRelayUrlInput : newRelayUrlInput + '/'

    if (relays.some((relay) => relay.url === normalizedUrl)) {
      setNewRelayUrlInput('')
      return
    }

    setNewRelayUrlInput('')
    await updateRelayUrls(relays.concat({ url: normalizedUrl, connected: false }))
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
    <div className="space-y-4">
      <div className="text-3xl font-medium text-primary">{chrome.i18n.getMessage('relays')}</div>
      <div className="space-y-2">
        {relays.map((relay) => (
          <Relay key={relay.url} relay={relay} remove={removeRelay} />
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
          <Button onClick={addRelay}>{chrome.i18n.getMessage('add')}</Button>
        </div>
        {newRelayUrlInputError && (
          <div className="text-destructive pl-3">{newRelayUrlInputError}</div>
        )}
      </div>
    </div>
  )
}

function Relay({ relay, remove }: { relay: TRelay; remove: (url: string) => void }) {
  const relayUrl = relay.url
  const url = new URL(relayUrl)
  return (
    <div className="flex justify-between items-center hover:text-primary">
      <div className="flex flex-1 w-0 items-center gap-2">
        <Avatar
          className={
            'w-6 h-6 border-2 border-solid ' +
            (relay.connected ? 'border-green-500' : 'border-red-500')
          }
        >
          <AvatarImage src={getFaviconUrl(url)} />
          <AvatarFallback>{url.host.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="truncate">{relayUrl}</div>
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
