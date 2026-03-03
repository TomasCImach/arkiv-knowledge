'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'

export function MobileNavDrawer({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!open) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  return (
    <>
      <button
        type="button"
        className="button secondary mobile-nav-trigger"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="mobile-nav-drawer"
      >
        Menu
      </button>

      <button
        type="button"
        className={`mobile-nav-overlay ${open ? 'open' : ''}`}
        onClick={() => setOpen(false)}
        aria-label="Close navigation drawer"
      />

      <aside
        id="mobile-nav-drawer"
        className={`mobile-nav-drawer ${open ? 'open' : ''}`}
        aria-hidden={!open}
        aria-label="Primary navigation"
      >
        <div className="toolbar mobile-nav-header" style={{ justifyContent: 'space-between' }}>
          <strong>Navigation</strong>
          <button type="button" className="button secondary" onClick={() => setOpen(false)}>
            Close
          </button>
        </div>
        {children}
      </aside>
    </>
  )
}
