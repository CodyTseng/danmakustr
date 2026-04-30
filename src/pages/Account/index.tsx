import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { bytesToHex, hexToBytes } from 'nostr-tools/utils'
import { generateSecretKey, getPublicKey, nip19 } from 'nostr-tools'
import { useEffect, useState } from 'react'
import Layout from '../Layout'
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
    setPrivateKey((privateKey as string | undefined) ?? null)
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
    <Layout title={chrome.i18n.getMessage('account')}>
      <div className="space-y-4">
        <KeyField label={chrome.i18n.getMessage('public_key')} value={npub} masked={false} />
        <KeyField
          label={chrome.i18n.getMessage('private_key')}
          value={nsec}
          masked
          showMasked={showNsec}
          onToggleMasked={setShowNsec}
        />
      </div>
      <Separator className="my-6" />
      <div className="space-y-2">
        <LoginWithNsec handleLoginWithNsec={handleLoginWithNsec} />
        <GenerateRandomAccount handleGenerateRandomAccount={handleGenerateRandomAccount} />
      </div>
    </Layout>
  )
}

function KeyField({
  label,
  value,
  masked,
  showMasked,
  onToggleMasked,
}: {
  label: string
  value: string
  masked: boolean
  showMasked?: boolean
  onToggleMasked?: (show: boolean) => void
}) {
  const isHidden = masked && !showMasked
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </label>
        {masked && onToggleMasked && (
          <EyeIcon show={!!showMasked} setShow={onToggleMasked} size={14} className="-mr-1" />
        )}
      </div>
      <div className="relative">
        <Input
          type={isHidden ? 'password' : 'text'}
          value={value}
          readOnly
          className="pr-10 font-mono text-xs bg-muted/40"
        />
        <CopyIcon text={value} className="absolute right-1.5 top-1/2 -translate-y-1/2" />
      </div>
    </div>
  )
}
