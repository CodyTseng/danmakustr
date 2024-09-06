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
        <div className="flex h-screen max-md:flex-col md:w-1/3">
          <Nav navItems={navItems} variant="options" className="max-md:hidden pt-4" />
          <Outlet />
          <Nav
            navItems={navItems}
            variant="popup"
            className="md:hidden fixed bottom-0 left-0 right-0 bg-background"
          />
        </div>
      </div>
    </ThemeProvider>
  )
}
