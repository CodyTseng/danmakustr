import { ThemeProvider } from '@/components/theme-provider'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Server, UserRound } from 'lucide-react'
import { Outlet } from 'react-router-dom'
import { Nav } from '@/components/Nav'

const navItems = [
  { name: 'Relays', icon: <Server />, href: '/' },
  { name: 'Account', icon: <UserRound />, href: '/account' },
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
