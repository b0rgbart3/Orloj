import type { Page } from './App'
import './Drawer.css'

type DrawerProps = {
  open: boolean
  onToggle: () => void
  page: Page
  onNavigate: (page: Page) => void
}

const NAV_ITEMS: { page: Page; label: string }[] = [
  { page: 'home', label: 'home' },
  { page: 'about', label: 'about' },
]

export function Drawer({ open, onToggle, page, onNavigate }: DrawerProps) {
  return (
    <nav className={`drawer${open ? ' drawer--open' : ''}`}>
      <button
        className="drawer-hamburger"
        onClick={onToggle}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
      >
        <span />
        <span />
        <span />
      </button>
      {open && (
        <ul className="drawer-nav">
          {NAV_ITEMS.map((item) => (
            <li key={item.page}>
              <button
                className={item.page === page ? 'drawer-nav-active' : ''}
                onClick={() => onNavigate(item.page)}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </nav>
  )
}
