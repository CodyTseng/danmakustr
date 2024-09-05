import { NavLink } from 'react-router-dom'

type TNavItem = {
  name: string
  icon: JSX.Element
  href: string
}

export function Nav({ navItems, variant }: { navItems: TNavItem[]; variant: 'popup' | 'options' }) {
  return (
    <nav
      className={
        variant === 'popup' ? 'flex items-center justify-center w-full' : 'flex-shrink-0 space-y-2'
      }
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
      <div>{name}</div>
    </NavLink>
  )
}

function OptionsNavItem({ navItem }: { navItem: TNavItem }) {
  const { name, icon, href } = navItem
  return (
    <NavLink
      to={href}
      className={({ isActive }) =>
        (isActive ? 'text-primary' : 'text-muted-foreground  hover:text-primary/60') +
        ' flex items-center flex-1 gap-2'
      }
    >
      {icon}
      <div>{name}</div>
    </NavLink>
  )
}
