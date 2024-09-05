import { TMode } from '@/types'
import { bytesToHex, hexToBytes } from '@noble/hashes/utils'
import NDK, { NDKEvent, NDKPrivateKeySigner, NDKRelay } from '@nostr-dev-kit/ndk'
import { generateSecretKey, getPublicKey } from 'nostr-tools'

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
type Msg = SendCommentMsg | InitMsg | GetRelaysMsg

let queue: {
  message: Msg
  sender: chrome.runtime.MessageSender
  sendResponse: (response?: any) => void
}[] = []
let ndk: NDK | null = null
let pubkey: string | null = null
let relayUrls: string[] = [
  'wss://nostr-relay.app/',
  'wss://relay.damus.io/',
  'wss://relay.nostr.band/',
  'wss://nos.lol/',
  'wss://nostr.bitcoiner.social/',
  'wss://relay.snort.social/',
]

async function main() {
  let { privateKey, relayUrls: localRelayUrls } = await chrome.storage.local.get([
    'privateKey',
    'relayUrls',
  ])
  if (!localRelayUrls) {
    await chrome.storage.local.set({
      relayUrls,
    })
  } else {
    relayUrls = localRelayUrls
  }

  await initializeNDK(relayUrls, privateKey)

  if (queue.length) {
    console.debug('Processing queue...')
    await Promise.allSettled(
      queue.map(({ message, sender, sendResponse }) =>
        processMessage(message, sender, sendResponse),
      ),
    )
    queue = []
  }
}
main()

function generatePrivateKey() {
  let sk = generateSecretKey()
  return bytesToHex(sk)
}

async function initializeNDK(relayUrls: string[], privateKey?: string) {
  console.debug('Initializing NDK...')
  if (!privateKey) {
    privateKey = generatePrivateKey()
    await chrome.storage.local.set({ privateKey })
  }
  const signer = new NDKPrivateKeySigner(privateKey)
  pubkey = getPublicKey(hexToBytes(privateKey))
  console.debug('Pubkey', pubkey)
  ndk = new NDK({
    explicitRelayUrls: relayUrls,
    signer,
  })
  await ndk.connect(5000)
  console.debug('NDK connected')
}

async function processMessage(
  message: Msg,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void,
) {
  if (!ndk || !pubkey) {
    queue.push({ message, sender, sendResponse })
    return
  }

  if (message.type === 'SEND_COMMENT') {
    const { comment, time, id, mode, color } = message
    console.debug('Emitting comment:', comment, time)

    const tags = [
      ['i', id],
      ['time', time.toString()],
    ]
    if (mode) {
      tags.push(['mode', mode])
    }
    if (color) {
      tags.push(['color', color])
    }

    const event = new NDKEvent(ndk, {
      kind: 2333,
      created_at: Math.ceil(Date.now() / 1000),
      content: comment,
      pubkey,
      tags,
    })
    const result = await event.publish()
    console.debug('Event published:', result)
  } else if (message.type === 'INIT_COMMENTS') {
    if (!sender.tab?.id) return
    const { id } = message
    console.debug('Init comments for:', id)

    let until = Math.ceil(Date.now() / 1000)
    let hasNext = false
    let count = 0
    do {
      const events = await ndk.fetchEvents({
        kinds: [2333 as any],
        '#i': [id],
        limit: 1000,
        until,
      })
      count += events.size
      console.debug(`Fetched ${events.size} events for ${id} until ${until}`)

      events.forEach((event) => {
        const comment = event.content
        const { time, mode, color } = parseEventTags(event)
        chrome.tabs.sendMessage(sender.tab!.id!, {
          type: 'EMIT_INIT_COMMENT',
          comment,
          mode,
          color,
          time,
          self: event.pubkey === pubkey,
          id,
        })

        if (event.created_at && event.created_at < until) {
          until = event.created_at - 1
        }
      })
      hasNext = events.size > 0
    } while (hasNext || count > 10000)
  } else if (message.type === 'GET_RELAYS') {
    const relays: { url: string; connected: boolean }[] = []
    ndk.pool.relays.forEach((relay) => {
      relays.push({
        url: relay.url,
        connected: relay.connected,
      })
    })
    sendResponse(relays)
  }
}

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  await processMessage(message, sender, sendResponse)
})

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.url) {
    chrome.tabs.sendMessage(tabId, { type: 'TAB_UPDATED' })
  }
})

chrome.storage.onChanged.addListener(async (changes) => {
  if (changes.relayUrls && ndk) {
    const { newValue = [], oldValue = [] } = changes.relayUrls
    relayUrls = newValue
    const added = newValue.filter((url: string) => !oldValue.includes(url))
    const removed = oldValue.filter((url: string) => !newValue.includes(url))
    added.forEach((url: string) => {
      ndk!.pool.addRelay(new NDKRelay(url), true)
      console.debug('Added relay:', url)
    })
    removed.forEach((url: string) => {
      ndk!.pool.removeRelay(normalizeUrl(url))
      console.debug('Removed relay:', url)
    })
  }
  if (changes.privateKey) {
    const { newValue: newPrivateKey, oldValue: oldPrivateKey } = changes.privateKey
    if (!newPrivateKey || !oldPrivateKey || newPrivateKey === oldPrivateKey) return
    await initializeNDK(relayUrls, newPrivateKey)
  }
})

function normalizeUrl(url: string) {
  return url.endsWith('/') ? url : url + '/'
}

function parseEventTags(event: NDKEvent) {
  let time: number = 0
  let mode: TMode | undefined
  let color: string | undefined
  event.tags.forEach(([tagName, tagValue]) => {
    if (tagName === 'time' && tagValue) {
      const parsedTime = parseFloat(tagValue)
      if (!isNaN(parsedTime)) {
        time = parsedTime
      }
    } else if (tagName === 'mode' && ['rtl', 'top', 'bottom'].includes(tagValue)) {
      mode = tagValue as TMode
    } else if (tagName === 'color' && /^#[0-9a-fA-F]{6}$/.test(tagValue)) {
      color = tagValue.toUpperCase()
    }
  })
  return { time, mode, color }
}
