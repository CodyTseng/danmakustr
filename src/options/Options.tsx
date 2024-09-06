import { Nav } from '@/components/Nav'
import { ThemeProvider } from '@/components/theme-provider'
import { ScrollArea } from '@/components/ui/scroll-area'
import { History, Server, UserRound } from 'lucide-react'
import { Outlet } from 'react-router-dom'

const navItems = [
  { name: 'History', icon: <History size={16} />, href: '/' },
  { name: chrome.i18n.getMessage('relays'), icon: <Server size={16} />, href: '/relays' },
  { name: chrome.i18n.getMessage('account'), icon: <UserRound size={16} />, href: '/account' },
]

export default function Options() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <div className="flex flex-col items-center h-screen pt-8 bg-background text-foreground">
        <div className="text-base w-4/5 md:w-1/2 flex h-full">
          <div>
            <Nav navItems={navItems} variant="options" />
          </div>
          <ScrollArea className="flex-grow pl-10 flex h-full">
            <Outlet />
          </ScrollArea>
        </div>
      </div>
    </ThemeProvider>
  )
}
