import { TMode } from '@/types'
import {
  Event,
  finalizeEvent,
  generateSecretKey,
  getPublicKey,
  SimplePool,
} from 'nostr-tools'
import { bytesToHex, hexToBytes } from 'nostr-tools/utils'

const KIND_DANMAKU = 2333 as number

type SendCommentMsg = {
  type: 'SEND_COMMENT'
  comment: string
  time: number
  id: string
  mode?: TMode
  color?: string
}
type InitMsg = { type: 'INIT_COMMENTS'; id: string }
type GetRelaysMsg = { type: 'GET_RELAYS' }
type FetchHistoryComments = { type: 'FETCH_HISTORY_COMMENTS'; until?: number; limit?: number }
type Msg = SendCommentMsg | InitMsg | GetRelaysMsg | FetchHistoryComments

const pool = new SimplePool()
let privateKey: Uint8Array | null = null
let pubkey: string | null = null

let relayUrls: string[] = [
  'wss://nostr-relay.app/',
  'wss://relay.damus.io/',
  'wss://relay.nostr.band/',
  'wss://nos.lol/',
  'wss://nostr.bitcoiner.social/',
  'wss://relay.snort.social/',
]

const ready = (async function init() {
  const stored = await chrome.storage.local.get(['privateKey', 'relayUrls'])
  let storedPk = stored.privateKey as string | undefined
  const storedRelays = stored.relayUrls as string[] | undefined

  if (!storedRelays) {
    await chrome.storage.local.set({ relayUrls })
  } else {
    relayUrls = storedRelays
  }
  if (!storedPk) {
    storedPk = bytesToHex(generateSecretKey())
    await chrome.storage.local.set({ privateKey: storedPk })
  }
  const pkBytes = hexToBytes(storedPk)
  privateKey = pkBytes
  pubkey = getPublicKey(pkBytes)

  // Warm up the connections so GET_RELAYS reports a useful status promptly.
  relayUrls.forEach((url) => {
    pool.ensureRelay(url).catch((err) => console.debug('Relay connect failed', url, err))
  })
})()

async function processMessage(message: Msg, sender: chrome.runtime.MessageSender) {
  await ready
  const sk = privateKey
  const pk = pubkey
  if (!sk || !pk) return

  if (message.type === 'SEND_COMMENT') {
    const { comment, time, id, mode, color } = message
    const tags: string[][] = [
      ['i', id],
      ['time', time.toString()],
    ]
    if (mode) tags.push(['mode', mode])
    if (color) tags.push(['color', color])
    const event = finalizeEvent(
      {
        kind: KIND_DANMAKU,
        created_at: Math.ceil(Date.now() / 1000),
        content: comment,
        tags,
      },
      sk,
    )
    await Promise.allSettled(pool.publish(relayUrls, event))
    return
  }

  if (message.type === 'INIT_COMMENTS') {
    const tabId = sender.tab?.id
    if (!tabId) return { error: 'no tabId' }
    const { id } = message
    console.debug('Danmaku BG: INIT_COMMENTS', id, 'relays:', relayUrls)
    const events = await pool.querySync(
      relayUrls,
      { kinds: [KIND_DANMAKU], '#i': [id], limit: 1000 } as any,
      { maxWait: 8000 },
    )
    console.debug('Danmaku BG: fetched', events.length, 'events for', id)
    for (const event of events) {
      const { time, mode, color } = parseEventTags(event)
      chrome.tabs
        .sendMessage(tabId, {
          type: 'EMIT_INIT_COMMENT',
          comment: event.content,
          mode,
          color,
          time,
          self: event.pubkey === pk,
          id,
        })
        .catch(() => {})
    }
    return { count: events.length, relays: relayUrls }
  }

  if (message.type === 'GET_RELAYS') {
    const status = pool.listConnectionStatus()
    return relayUrls.map((url) => ({ url, connected: !!status.get(url) }))
  }

  if (message.type === 'FETCH_HISTORY_COMMENTS') {
    const { until = Math.floor(Date.now() / 1000), limit = 20 } = message
    const events = await pool.querySync(
      relayUrls,
      { kinds: [KIND_DANMAKU], authors: [pk], until, limit } as any,
      { maxWait: 8000 },
    )
    return events
      .map((event) => {
        const { time, videoId, platform } = parseEventTags(event)
        if (!videoId) return null
        return {
          id: event.id,
          content: event.content,
          time,
          platform,
          videoId,
          createdAt: event.created_at,
        }
      })
      .filter(Boolean)
      .sort((a, b) => (b?.createdAt ?? 0) - (a?.createdAt ?? 0))
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  processMessage(message, sender)
    .then(sendResponse)
    .catch((err) => {
      console.error('processMessage failed', err)
      sendResponse(undefined)
    })
  return true
})

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.url) {
    chrome.tabs.sendMessage(tabId, { type: 'TAB_UPDATED' }).catch(() => {})
  }
})

chrome.storage.onChanged.addListener(async (changes) => {
  if (changes.relayUrls) {
    const newValue = (changes.relayUrls.newValue as string[] | undefined) ?? []
    const oldValue = (changes.relayUrls.oldValue as string[] | undefined) ?? []
    relayUrls = newValue
    const removed = oldValue.filter((u) => !newValue.includes(u))
    if (removed.length) pool.close(removed)
    const added = newValue.filter((u) => !oldValue.includes(u))
    added.forEach((url) => {
      pool.ensureRelay(url).catch((err) => console.debug('Relay connect failed', url, err))
    })
  }
  if (changes.privateKey) {
    const newPk = changes.privateKey.newValue as string | undefined
    const oldPk = changes.privateKey.oldValue as string | undefined
    if (!newPk || !oldPk || newPk === oldPk) return
    const pkBytes = hexToBytes(newPk)
    privateKey = pkBytes
    pubkey = getPublicKey(pkBytes)
  }
})

function parseEventTags(event: Event) {
  let time = 0
  let mode: TMode | undefined
  let color: string | undefined
  let videoId: string | undefined
  let platform: string | undefined
  event.tags.forEach((tag) => {
    const [tagName, tagValue] = tag
    if (tagName === 'time' && tagValue) {
      const parsedTime = parseFloat(tagValue)
      if (!isNaN(parsedTime)) time = parsedTime
    } else if (tagName === 'mode' && ['rtl', 'top', 'bottom'].includes(tagValue)) {
      mode = tagValue as TMode
    } else if (tagName === 'color' && /^#[0-9a-fA-F]{6}$/.test(tagValue)) {
      color = tagValue.toUpperCase()
    } else if (tagName === 'i' && tagValue) {
      ;[platform, videoId] = tagValue.split(':')
    }
  })
  return { time, mode, color, videoId, platform }
}
