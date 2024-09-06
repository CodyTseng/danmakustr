import { Nav } from '@/components/Nav'
import { ThemeProvider } from '@/components/theme-provider'
import { ScrollArea } from '@/components/ui/scroll-area'
import { History, Server, UserRound } from 'lucide-react'
import { Outlet } from 'react-router-dom'

const navItems = [
  { name: chrome.i18n.getMessage('history'), icon: <History />, href: '/' },
  { name: chrome.i18n.getMessage('relays'), icon: <Server />, href: '/relays' },
  { name: chrome.i18n.getMessage('account'), icon: <UserRound />, href: '/account' },
]

export default function Popup() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <div className="flex flex-col items-center w-[350px] h-[500px] bg-background text-foreground">
        <ScrollArea className="flex-1 w-[350px] text-base">
          <div className="py-4 px-6 w-[350px]">
            <Outlet />
          </div>
        </ScrollArea>
        <Nav navItems={navItems} variant="popup" />
      </div>
    </ThemeProvider>
  )
}
