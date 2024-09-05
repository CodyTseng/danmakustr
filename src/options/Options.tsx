import { ThemeProvider } from '@/components/theme-provider'
import { Server, UserRound } from 'lucide-react'
import { Outlet } from 'react-router-dom'
import { Nav } from '@/components/Nav'

const navItems = [
  { name: chrome.i18n.getMessage('relays'), icon: <Server size={16} />, href: '/' },
  { name: chrome.i18n.getMessage('account'), icon: <UserRound size={16} />, href: '/account' },
]

export default function Options() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <div className="flex flex-col items-center h-screen pt-8 bg-background text-foreground">
        <div className="text-base w-4/5 md:w-1/2 flex">
          <div>
            <Nav navItems={navItems} variant="options" />
          </div>
          <div className="flex-1 w-0 pl-10">
            <Outlet />
          </div>
        </div>
      </div>
    </ThemeProvider>
  )
}
