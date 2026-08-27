'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function logout() {
    if (!confirm('Logout kar dein? Dobara password daalna hoga.')) return
    setBusy(true)
    try {
      await fetch('/api/logout', { method: 'POST' })
      router.push('/login')
      router.refresh()
    } catch {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={busy}
      className="w-full rounded-lg border border-slate-300 text-slate-600 font-medium py-3 disabled:opacity-60"
    >
      {busy ? 'Logout ho raha hai…' : '🔒 Logout'}
    </button>
  )
}
