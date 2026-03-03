'use client'

import { useEffect } from 'react'

export function useUnsavedChangesGuard(enabled: boolean, message = 'You have unsaved changes. Leave without saving?') {
  useEffect(() => {
    function onBeforeUnload(event: BeforeUnloadEvent) {
      if (!enabled) {
        return
      }

      event.preventDefault()
      event.returnValue = message
    }

    function onDocumentClick(event: MouseEvent) {
      if (!enabled) {
        return
      }

      if (event.defaultPrevented) {
        return
      }

      const target = event.target as HTMLElement | null
      const anchor = target?.closest('a[href]') as HTMLAnchorElement | null
      if (!anchor) {
        return
      }

      if (anchor.target && anchor.target !== '_self') {
        return
      }

      if (anchor.getAttribute('download') !== null) {
        return
      }

      const href = anchor.getAttribute('href')
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        return
      }

      const destination = new URL(anchor.href, window.location.href)
      const current = new URL(window.location.href)
      if (destination.href === current.href) {
        return
      }

      if (!window.confirm(message)) {
        event.preventDefault()
        event.stopPropagation()
      }
    }

    window.addEventListener('beforeunload', onBeforeUnload)
    document.addEventListener('click', onDocumentClick, true)

    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload)
      document.removeEventListener('click', onDocumentClick, true)
    }
  }, [enabled, message])
}
