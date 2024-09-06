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

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <div className="h-screen bg-background text-foreground md:flex md:flex-col md:items-center text-base">
        <div className="flex h-full max-md:flex-col md:w-1/3">
          <Nav navItems={navItems} variant="options" className="max-md:hidden pt-4" />
          <ScrollArea className="h-full flex-1 md:pl-20">
            <div className="px-6 py-4">
              <Outlet />
            </div>
          </ScrollArea>
          <Nav navItems={navItems} variant="popup" className="md:hidden" />
        </div>
      </div>
    </ThemeProvider>
  )
}
