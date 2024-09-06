import { cn } from '@/lib/utils'
import { NavLink } from 'react-router-dom'

type TNavItem = {
  name: string
  icon: JSX.Element
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
        variant === 'popup' ? 'flex items-center justify-center w-full' : 'flex-shrink-0 space-y-2',
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
        (isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary/80') +
        ' flex flex-col items-center flex-1 p-2'
      }
    >
      {icon}
      <div className="text-xs">{name}</div>
    </NavLink>
  )
}

function OptionsNavItem({ navItem }: { navItem: TNavItem }) {
  const { name, icon, href } = navItem
  return (
    <NavLink
      to={href}
      className={({ isActive }) =>
        (isActive ? 'text-primary' : 'text-muted-foreground  hover:text-primary/90') +
        ' flex items-center flex-1 gap-2'
      }
    >
      {icon}
      <div className="text-lg">{name}</div>
    </NavLink>
  )
}
