import { TMode } from '@/types'
import NDK, { NDKEvent, NDKPrivateKeySigner, NDKRelay } from '@nostr-dev-kit/ndk'

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

type DanmakuStyle = { mode?: TMode; color?: string }

let queue: {
  message: Msg
  sender: chrome.runtime.MessageSender
  sendResponse: (response?: any) => void
}[] = []
let ndk: NDK | null = null
let pubkey: string | null = null
let signer: NDKPrivateKeySigner = NDKPrivateKeySigner.generate()

async function main() {
  let { privateKey, relayUrls } = await chrome.storage.local.get(['privateKey', 'relayUrls'])
  if (!relayUrls) {
    relayUrls = [
      'wss://nostr-relay.app/',
      'wss://relay.damus.io/',
      'wss://relay.nostr.band/',
      'wss://nos.lol/',
      'wss://nostr.bitcoiner.social/',
      'wss://relay.snort.social/',
    ]
    await chrome.storage.local.set({
      relayUrls,
    })
  }
  if (privateKey) {
    signer = new NDKPrivateKeySigner(privateKey)
  } else {
    await chrome.storage.local.set({ privateKey: signer.privateKey })
  }

  console.debug('block until ready...')
  const user = await signer.blockUntilReady()
  console.debug('pubkey', user.pubkey)
  pubkey = user.pubkey
  ndk = await createNDK(signer, relayUrls)
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

async function createNDK(signer: NDKPrivateKeySigner, relayUrls: string[]) {
  const ndk = new NDK({
    explicitRelayUrls: relayUrls,
    signer,
  })
  await ndk.connect(5000)
  console.debug('NDK connected')
  return ndk
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

    const style: DanmakuStyle = {}
    if (mode) {
      style.mode = mode
    }
    if (color) {
      style.color = color
    }

    const tags = [
      ['i', id],
      ['time', time.toString()],
    ]
    if (style.mode || style.color) {
      tags.push(['style', JSON.stringify(style)])
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
        const time = parseFloat(event.tags.find((tag) => tag[0] === 'time')?.[1] ?? '0')
        let style: DanmakuStyle = {}
        try {
          const customStyle = JSON.parse(event.tags.find((tag) => tag[0] === 'style')?.[1] ?? '{}')
          if (customStyle.mode && ['rtl', 'top', 'bottom'].includes(customStyle.mode)) {
            style.mode = customStyle.mode
          }
          if (customStyle.color && /^#[0-9a-fA-F]{6}$/.test(customStyle.color)) {
            style.color = customStyle.color
          }
        } catch {
          // do nothing
        }
        chrome.tabs.sendMessage(sender.tab!.id!, {
          type: 'EMIT_INIT_COMMENT',
          comment,
          mode: style.mode,
          color: style.color,
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
    const added = newValue.filter((url: string) => !oldValue.includes(url))
    const removed = oldValue.filter((url: string) => !newValue.includes(url))
    added.forEach((url: string) => {
      ndk!.pool.addRelay(new NDKRelay(url), true)
    })
    removed.forEach((url: string) => {
      ndk!.pool.removeRelay(normalizeUrl(url))
    })
  }
})

function normalizeUrl(url: string) {
  return url.endsWith('/') ? url : url + '/'
}
