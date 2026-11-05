import { useState } from 'react'
import type { Page } from './App'
import type { PragueDateParts, PragueTime } from './clock/usePragueTime'
import { DrawerClockInfo } from './DrawerClockInfo'
import './Drawer.css'

type DrawerProps = {
  open: boolean
  onToggle: () => void
  page: Page
  onNavigate: (page: Page) => void
  pragueTime: PragueTime
  dateParts: PragueDateParts
}

const NAV_ITEMS: { page: Page; label: string }[] = [
  { page: 'home', label: 'home' },
  { page: 'about', label: 'about' },
]

export function Drawer({ open, onToggle, page, onNavigate, pragueTime, dateParts }: DrawerProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <nav
        className={`drawer${open ? ' drawer--open' : ''}`}
        onClick={(e) => {
          e.stopPropagation()
          onToggle()
        }}
      >
        <button
          className="drawer-hamburger"
          onClick={(e) => {
            e.stopPropagation()
            setMenuOpen((isOpen) => !isOpen)
          }}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>
        {open && <DrawerClockInfo pragueTime={pragueTime} dateParts={dateParts} />}
      </nav>
      {menuOpen && (
        <div className="drawer-menu" onClick={(e) => e.stopPropagation()}>
          <ul className="drawer-nav">
            {NAV_ITEMS.map((item) => (
              <li key={item.page}>
                <button
                  className={item.page === page ? 'drawer-nav-active' : ''}
                  onClick={() => {
                    setMenuOpen(false)
                    onNavigate(item.page)
                  }}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}
