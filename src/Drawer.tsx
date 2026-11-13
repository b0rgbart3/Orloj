import type { Page } from './App'
import type { PragueDateParts, PragueTime } from './clock/usePragueTime'
import { DrawerClockInfo } from './DrawerClockInfo'
import './Drawer.css'

type DrawerProps = {
  open: boolean
  onToggle: () => void
  menuOpen: boolean
  onToggleMenu: () => void
  page: Page
  onNavigate: (page: Page) => void
  pragueTime: PragueTime
  dateParts: PragueDateParts
}

type NavItem = { page: Page; label: string; indent?: boolean } | { label: string }

const NAV_ITEMS: NavItem[] = [
  { page: 'home', label: 'prazsky orloj' },
  { page: 'about', label: 'about' },
  { page: 'about/real-clock', label: 'the real clock', indent: true },
  { page: 'about/how-it-works', label: 'how it works', indent: true },
  { page: 'about/digital-version', label: 'about this digital version', indent: true },
  { page: 'about/developer', label: 'about the developer', indent: true },
  { label: 'learn more' },
  { page: 'learn/sidereal-time', label: 'sidereal time', indent: true },
  { page: 'learn/astrological-zodiac', label: 'astrological zodiac', indent: true },
  { page: 'learn/the-geometry', label: 'the geometry', indent: true },
  { page: 'learn/about-astrolabes', label: 'about astrolabes', indent: true },
]

export function Drawer({ open, onToggle, menuOpen, onToggleMenu, page, onNavigate, pragueTime, dateParts }: DrawerProps) {
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
            onToggleMenu()
          }}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>
        {open && (
          <button
            className="drawer-close"
            onClick={(e) => {
              e.stopPropagation()
              onToggle()
            }}
            aria-label="Close"
          >
            <span />
            <span />
          </button>
        )}
        {open && (
          <div className="drawer-scroll">
            <DrawerClockInfo pragueTime={pragueTime} dateParts={dateParts} />
          </div>
        )}
      </nav>
      {menuOpen && (
        <div className="drawer-menu" onClick={(e) => e.stopPropagation()}>
          <ul className="drawer-nav">
            {NAV_ITEMS.map((item) => (
              <li key={item.label}>
                {'page' in item ? (
                  <button
                    className={[
                      item.page === page ? 'drawer-nav-active' : '',
                      item.indent ? 'drawer-nav-sub' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => onNavigate(item.page)}
                  >
                    {item.label}
                  </button>
                ) : (
                  <span className="drawer-nav-header">{item.label}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}
