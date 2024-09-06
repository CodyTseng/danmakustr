import { Nav } from '@/components/Nav'
import { ThemeProvider } from '@/components/theme-provider'
import { ScrollArea } from '@/components/ui/scroll-area'
import { History, Server, UserRound } from 'lucide-react'
import { Outlet } from 'react-router-dom'

const navItems = [
  { name: chrome.i18n.getMessage('history'), icon: <History size={16} />, href: '/' },
  { name: chrome.i18n.getMessage('relays'), icon: <Server size={16} />, href: '/relays' },
  { name: chrome.i18n.getMessage('account'), icon: <UserRound size={16} />, href: '/account' },
]

export default function Options() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <div className="flex flex-col items-center h-screen bg-background text-foreground">
        <div className="text-base w-4/5 md:w-1/3 flex h-full">
          <div className="pt-8">
            <Nav navItems={navItems} variant="options" />
          </div>
          <ScrollArea className="flex-grow pl-24 flex h-full">
            <div className="pt-8">
              <Outlet />
            </div>
          </ScrollArea>
        </div>
      </div>
    </ThemeProvider>
  )
}
