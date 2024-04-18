import NDK, { NDKPrivateKeySigner, NDKEvent, NDKUser } from '@nostr-dev-kit/ndk'

type SendCommentMsg = { type: 'SEND_COMMENT'; comment: string; time: number; id: string }
type InitMsg = { type: 'INIT_COMMENTS'; id: string }
type Msg = SendCommentMsg | InitMsg

let queue: {
  message: Msg
  sender: chrome.runtime.MessageSender
  sendResponse: (response?: any) => void
}[] = []
let ndk: NDK | null = null
let pubkey: string | null = null

async function main() {
  const { privateKey } = await chrome.storage.local.get('privateKey')
  let signer: NDKPrivateKeySigner
  if (privateKey) {
    signer = new NDKPrivateKeySigner(privateKey)
  } else {
    signer = NDKPrivateKeySigner.generate()
    await chrome.storage.local.set({ privateKey: signer.privateKey })
  }

  console.debug('block until ready...')
  const user = await signer.blockUntilReady()
  console.debug('pubkey', user.pubkey)
  pubkey = user.pubkey
  ndk = new NDK({
    explicitRelayUrls: [
      'wss://nostr-relay.app',
      'wss://relay.damus.io',
      'wss://relay.nostr.band',
      'wss://nos.lol',
      'wss://nostr.bitcoiner.social',
      'wss://relay.snort.social',
    ],
    signer,
  })
  await ndk.connect(5000)
  console.debug('NDK connected')
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
    const { comment, time, id } = message
    console.debug('Emitting comment:', comment, time)

    const event = new NDKEvent(ndk, {
      kind: 2333,
      created_at: Math.ceil(Date.now() / 1000),
      content: comment,
      pubkey,
      tags: [
        ['i', id],
        ['time', time.toString()],
      ],
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
        chrome.tabs.sendMessage(sender.tab!.id!, {
          type: 'EMIT_INIT_COMMENT',
          comment,
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
