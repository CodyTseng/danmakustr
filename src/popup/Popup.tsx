import Relays from '@/components/Relays'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function Popup() {
  return (
    <ScrollArea className="w-full text-base px-4">
      <Relays />
    </ScrollArea>
  )
}
