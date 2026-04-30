import { cn } from '@/lib/utils'
import type { ReactElement } from 'react'
import { NavLink } from 'react-router-dom'

type TNavItem = {
  name: string
  icon: ReactElement
  href: string
}

export function Nav({
  navItems,
  variant,
  className,
}: {
  navItems: TNavItem[]
  variant: 'popup' | 'options'
  className?: string
}) {
  return (
    <nav
      className={cn(
        variant === 'popup'
          ? 'flex items-stretch justify-around w-full h-16'
          : 'flex-shrink-0 space-y-1 px-3',
        className,
      )}
    >
      {navItems.map((navItem) =>
        variant === 'popup' ? (
          <PopupNavItem key={navItem.name} navItem={navItem} />
        ) : (
          <OptionsNavItem key={navItem.name} navItem={navItem} />
        ),
      )}
    </nav>
  )
}

function PopupNavItem({ navItem }: { navItem: TNavItem }) {
  const { name, icon, href } = navItem
  return (
    <NavLink
      to={href}
      className={({ isActive }) =>
        cn(
          'relative flex flex-col items-center justify-center gap-1 flex-1 transition-colors [&_svg]:size-5',
          isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
        )
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={cn(
              'absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-8 rounded-b-full bg-primary transition-opacity',
              isActive ? 'opacity-100' : 'opacity-0',
            )}
          />
          {icon}
          <div className="text-[11px] font-medium leading-none">{name}</div>
        </>
      )}
    </NavLink>
  )
}

function OptionsNavItem({ navItem }: { navItem: TNavItem }) {
  const { name, icon, href } = navItem
  return (
    <NavLink
      to={href}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-3 py-2 rounded-md transition-colors [&_svg]:size-5',
          isActive
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        )
      }
    >
      {icon}
      <div className="text-base font-medium">{name}</div>
    </NavLink>
  )
}
