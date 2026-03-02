'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'

export function RetryButton({ label = 'Retry' }: { label?: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  return (
    <button
      type="button"
      className="button secondary"
      onClick={() => {
        startTransition(() => {
          router.refresh()
        })
      }}
      disabled={pending}
    >
      {pending ? 'Retrying...' : label}
    </button>
  )
}
