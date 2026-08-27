'use client'

import { useEffect, useState, type FormEvent } from 'react'
import LogoutButton from '@/components/LogoutButton'

export default function SettingsPage() {
  const [maskedApiKey, setMaskedApiKey] = useState('')
  const [apiKeySource, setApiKeySource] = useState('')
  const [currentModel, setCurrentModel] = useState('')
  const [newApiKey, setNewApiKey] = useState('')
  const [newModel, setNewModel] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/settings', { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Settings load nahi ho sake.')
      } else {
        setMaskedApiKey(data.maskedApiKey)
        setApiKeySource(data.apiKeySource)
        setCurrentModel(data.model)
        setNewModel(data.model)
      }
    } catch {
      setError('Network error.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSaved(false)

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ geminiApiKey: newApiKey, geminiModel: newModel }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Save nahi ho saka.')
      } else {
        setSaved(true)
        setNewApiKey('')
        await load()
        setTimeout(() => setSaved(false), 3000)
      }
    } catch {
      setError('Network error.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="px-4 py-8 space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">AI Settings</h1>
        <p className="text-slate-600 text-sm">
          Gemini API key aur model naam yahan se change karein — Vercel jaane ki zaroorat nahi
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : (
        <>
          <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-2 text-sm">
            <p className="text-slate-600">
              Current key:{' '}
              <span className="font-mono text-slate-800">
                {maskedApiKey || '(set nahi hai)'}
              </span>
            </p>
            <p className="text-xs text-slate-400">
              Source: {apiKeySource === 'database' ? 'App Settings (database)' : apiKeySource === 'environment' ? 'Vercel Environment Variable' : 'kahin se bhi set nahi'}
            </p>
            <p className="text-slate-600">
              Current model: <span className="font-mono text-slate-800">{currentModel}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="apiKey" className="block text-sm font-medium text-slate-700">
                Naya Gemini API Key (optional — khaali chhod dein agar change nahi karna)
              </label>
              <input
                id="apiKey"
                type="password"
                value={newApiKey}
                onChange={(e) => setNewApiKey(e.target.value)}
                placeholder="AIza..."
                className="w-full rounded-lg border border-slate-300 py-3 px-3 text-slate-800"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="model" className="block text-sm font-medium text-slate-700">
                Model Name
              </label>
              <input
                id="model"
                type="text"
                value={newModel}
                onChange={(e) => setNewModel(e.target.value)}
                placeholder="gemini-3.6-flash"
                className="w-full rounded-lg border border-slate-300 py-3 px-3 text-slate-800 font-mono text-sm"
              />
              <p className="text-xs text-slate-400">
                Agar Google model ka naam badal de (jaise pehle hua tha), sirf yahan naya naam daal
                dein — koi deploy nahi karna padega.
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-primary text-white font-semibold py-3 disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save AI Settings'}
            </button>
          </form>

          {saved && (
            <div className="rounded-lg border border-success/30 bg-green-50 p-3 text-sm text-success">
              ✅ Save ho gaya. Naye sawal turant naye settings se jawab denge.
            </div>
          )}
          {error && (
            <div className="rounded-lg border border-danger/30 bg-red-50 p-4 text-sm text-danger">
              {error}
            </div>
          )}
        </>
      )}

      <section className="pt-2 space-y-3 border-t border-slate-200">
        <h2 className="text-sm font-semibold text-slate-700">Hifazat</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Sanjhe ya udhaar liye phone par kaam khatam kar ke logout zaroor karein.
          Dobara khulne par password poochha jayega.
        </p>
        <LogoutButton />
      </section>
    </div>
  )
}
