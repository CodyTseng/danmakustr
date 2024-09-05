import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { bytesToHex, hexToBytes } from '@noble/hashes/utils'
import { generateSecretKey, getPublicKey, nip19 } from 'nostr-tools'
import { useEffect, useState } from 'react'
import CopyIcon from './components/CopyIcon'
import EyeIcon from './components/EyeIcon'
import GenerateRandomAccount from './components/GenerateRandomAccount'
import LoginWithNsec from './components/LoginWithNsec'

export default function Account() {
  const [privateKey, setPrivateKey] = useState<string | null>(null)
  const [npub, setNpub] = useState('')
  const [nsec, setNsec] = useState('')
  const [showNsec, setShowNsec] = useState(false)

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

  const updatePrivateKey = async (newPrivateKey: string) => {
    if (newPrivateKey === privateKey) {
      return
    }
    setPrivateKey(newPrivateKey)
    chrome.storage.local.set({ privateKey: newPrivateKey })
  }

  const handleGenerateRandomAccount = async () => {
    const sk = generateSecretKey()
    updatePrivateKey(bytesToHex(sk))
  }

  const handleLoginWithNsec = async (privKey: string) => {
    updatePrivateKey(privKey)
  }

  return (
    <div>
      <div className="text-3xl font-medium text-primary">Account</div>
      <div className="space-y-1 mt-4">
        <div className="font-bold">Public key</div>
        <div className="flex items-center gap-2">
          <Input value={npub} />
          <CopyIcon text={npub} />
        </div>
      </div>
      <div className="space-y-1 mt-2">
        <div className="flex gap-2 items-center">
          <div className="font-bold">Private key</div>
          <EyeIcon show={showNsec} setShow={setShowNsec} size={16} />
        </div>
        <div className="flex items-center gap-2">
          <Input type={showNsec ? 'text' : 'password'} value={nsec} />
          <CopyIcon text={nsec} />
        </div>
      </div>
      <Separator className="my-8" />
      <div className="space-y-2">
        <LoginWithNsec handleLoginWithNsec={handleLoginWithNsec} />
        <GenerateRandomAccount handleGenerateRandomAccount={handleGenerateRandomAccount} />
      </div>
    </div>
  )
}
