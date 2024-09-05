import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { bytesToHex } from '@noble/hashes/utils'
import { nip19 } from 'nostr-tools'
import { useState } from 'react'
import EyeIcon from './EyeIcon'

export default function LoginWithNsec({
  handleLoginWithNsec,
}: {
  handleLoginWithNsec: (privKey: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [nsec, setNsec] = useState('')
  const [nsecError, setNsecError] = useState<string | null>(null)
  const [showNsec, setShowNsec] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNsec(e.target.value)
    setNsecError(null)
  }

  const handleLogin = () => {
    try {
      let { type, data } = nip19.decode(nsec)
      if (type === 'nsec') {
        handleLoginWithNsec(bytesToHex(data as Uint8Array))
        setOpen(false)
      } else {
        setNsecError(chrome.i18n.getMessage('invalid_private_key'))
      }
    } catch {
      setNsecError(chrome.i18n.getMessage('invalid_private_key'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="flex w-full">
        <Button variant="secondary" className="w-full">
          {chrome.i18n.getMessage('login_with_private_key')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-left">
            {chrome.i18n.getMessage('login_with_private_key')}
          </DialogTitle>
          <DialogDescription className="pt-2">
            <div className="flex gap-2 items-center">
              <Input
                type={showNsec ? 'text' : 'password'}
                placeholder={chrome.i18n.getMessage('private_key_input_placeholder')}
                value={nsec}
                onChange={handleInputChange}
                className={nsecError ? 'border-red-500' : ''}
              />
              <EyeIcon show={showNsec} setShow={setShowNsec} />
            </div>
            {nsecError && <div className="text-red-500 text-sm text-left">{nsecError}</div>}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={handleLogin}>{chrome.i18n.getMessage('login')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
