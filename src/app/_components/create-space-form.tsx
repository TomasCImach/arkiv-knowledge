'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Hex } from 'viem'
import { useAccount } from 'wagmi'
import { useSignMessage } from 'wagmi'
import { createSpace } from '@/arkiv/mutations/spaces'
import { useArkivWalletClient } from '@/arkiv/useArkivWallet'
import { ensureWalletReadSession } from '@/features/auth/client-session'
import { slugify } from '@/lib/text'
import { formatWalletError, runWritePreflight } from '@/lib/wallet'

export function CreateSpaceForm() {
  const router = useRouter()
  const walletClient = useArkivWalletClient()
  const { address, chainId, isConnected } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [visibility, setVisibility] = useState<'public' | 'unlisted' | 'private'>('public')
  const [statusText, setStatusText] = useState('')
  const [pending, setPending] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!walletClient || !isConnected || !address) {
      setStatusText('Connect wallet to create a space.')
      return
    }

    const preflight = await runWritePreflight(address, chainId)
    if (!preflight.ok) {
      setStatusText(preflight.message)
      return
    }

    const finalSlug = slugify(slug || name)
    if (!finalSlug) {
      setStatusText('Provide a valid space name or slug.')
      return
    }

    setPending(true)
    setStatusText('')
    console.info('[create-space] requesting wallet signature', {
      spaceSlug: finalSlug,
      visibility
    })

    try {
      const result = await createSpace(walletClient, {
        name,
        description,
        spaceSlug: finalSlug,
        visibility
      })
      setStatusText(`Created (${result.txHash.slice(0, 10)}...)`)

      if (visibility === 'private') {
        await ensureWalletReadSession(address as Hex, (message) => signMessageAsync({ message }))
      }

      router.push(`/spaces/${finalSlug}`)
      router.refresh()
    } catch (error) {
      console.error('create-space failed', error)
      setStatusText(formatWalletError(error, 'Failed to create space.'))
    } finally {
      setPending(false)
    }
  }

  return (
    <form className="card stack" onSubmit={onSubmit}>
      <h1 className="title">Create Space</h1>
      <p className="subtitle">Anyone can browse spaces. Connect a wallet to create one.</p>

      <label>
        Space name
        <input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Arkiv Architecture" />
      </label>

      <label>
        Space slug
        <input value={slug} onChange={(event) => setSlug(event.target.value)} placeholder="arkiv-architecture" />
      </label>

      <label>
        Description
        <textarea
          required
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="What this knowledge space contains"
        />
      </label>

      <label>
        Visibility
        <select value={visibility} onChange={(event) => setVisibility(event.target.value as typeof visibility)}>
          <option value="public">Public</option>
          <option value="unlisted">Unlisted</option>
          <option value="private">Private</option>
        </select>
      </label>

      {statusText ? <p className="subtitle">{statusText}</p> : null}
      <div className="toolbar form-actions mobile-action-bar">
        <input type="submit" disabled={pending} value={pending ? 'Creating...' : 'Create Space'} />
      </div>
    </form>
  )
}
