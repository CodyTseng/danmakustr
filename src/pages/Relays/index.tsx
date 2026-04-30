import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Plus, Server, Trash2 } from 'lucide-react'
import { ChangeEvent, useEffect, useState } from 'react'
import Layout from '../Layout'

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

  const connectedCount = relays.filter((r) => r.connected).length

  return (
    <Layout title={chrome.i18n.getMessage('relays')}>
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
        <span className="relative flex w-2 h-2">
          <span
            className={cn(
              'absolute inline-flex w-full h-full rounded-full opacity-75',
              connectedCount > 0 && 'bg-green-500 animate-ping',
            )}
          />
          <span
            className={cn(
              'relative inline-flex w-2 h-2 rounded-full',
              connectedCount > 0 ? 'bg-green-500' : 'bg-muted-foreground/40',
            )}
          />
        </span>
        <span>
          {connectedCount} / {relays.length} connected
        </span>
      </div>

      {relays.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="rounded-lg border border-border/70 divide-y divide-border/70 overflow-hidden">
          {relays.map((relay) => (
            <Relay key={relay.url} relay={relay} remove={removeRelay} />
          ))}
        </div>
      )}

      <div className="pt-4">
        <div className="flex gap-2 items-center">
          <Input
            value={newRelayUrlInput}
            placeholder="wss://relay.example.com"
            onChange={handleNewRelayUrlInputChange}
            onKeyDown={handleNewRelayUrlInputKeyDown}
            className={
              newRelayUrlInputError ? 'border-destructive focus-visible:ring-destructive' : ''
            }
          />
          <Button onClick={addRelay} size="icon" aria-label={chrome.i18n.getMessage('add')}>
            <Plus size={18} />
          </Button>
        </div>
        {newRelayUrlInputError && (
          <div className="text-destructive text-xs pl-1 pt-1.5">{newRelayUrlInputError}</div>
        )}
      </div>
    </Layout>
  )
}

function Relay({ relay, remove }: { relay: TRelay; remove: (url: string) => void }) {
  const relayUrl = relay.url
  const url = new URL(relayUrl)
  const displayUrl = url.host + (url.pathname !== '/' ? url.pathname : '')
  return (
    <div className="group flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 transition-colors">
      <div className="relative flex-shrink-0">
        <Avatar className="w-7 h-7">
          <AvatarImage src={getFaviconUrl(url)} />
          <AvatarFallback className="text-[10px]">
            {url.host.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span
          className={cn(
            'absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-background',
            relay.connected ? 'bg-green-500' : 'bg-muted-foreground/40',
          )}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{displayUrl}</div>
        <div
          className={cn(
            'text-[11px]',
            relay.connected ? 'text-green-600 dark:text-green-500' : 'text-muted-foreground',
          )}
        >
          {relay.connected ? 'Connected' : 'Disconnected'}
        </div>
      </div>
      <Button
        className="w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity"
        variant="ghost"
        size="icon"
        onClick={() => remove(relayUrl)}
        aria-label="Remove"
      >
        <Trash2 size={14} className="text-destructive" />
      </Button>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground border border-dashed border-border rounded-lg">
      <Server size={28} className="mb-2 opacity-60" />
      <div className="text-sm">No relays configured</div>
    </div>
  )
}

function getFaviconUrl(url: URL) {
  return (
    url.origin.replace(url.protocol, url.protocol === 'wss:' ? 'https:' : 'http:') + '/favicon.ico'
  )
}
