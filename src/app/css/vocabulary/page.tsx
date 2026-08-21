'use client'

import { useState } from 'react'
import Link from 'next/link'

interface WordItem {
  word: string
  meaning: string
  synonym: string
  usage: string
}

export default function VocabularyPage() {
  const [words, setWords] = useState<WordItem[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLoad() {
    setLoading(true)
    setError(null)
    setWords(null)
    try {
      const res = await fetch('/api/css-vocabulary', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) setError(data.error || 'Words load nahi ho sake.')
      else setWords(data.words)
    } catch {
      setError('Network error.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-4 py-8 space-y-6 pb-16">
      <Link href="/css" className="text-sm text-primary font-medium">← CSS Foundation</Link>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Vocabulary Builder</h1>
        <p className="text-slate-600 text-sm">CSS-level advanced words, meaning + synonym + istemal ke sath</p>
      </div>

      <button
        onClick={handleLoad}
        disabled={loading}
        className="w-full rounded-lg bg-primary text-white font-semibold py-3 disabled:opacity-60"
      >
        {loading ? 'Taiyar ho raha hai...' : words ? 'New Word Set' : 'Get Words'}
      </button>

      {error && (
        <div className="rounded-lg border border-danger/30 bg-red-50 p-4 text-sm text-danger">{error}</div>
      )}

      {words && (
        <div className="space-y-3">
          {words.map((w, i) => (
            <div key={i} className="rounded-lg border border-slate-200 bg-white p-4 space-y-1">
              <p className="font-semibold text-slate-800">{w.word}</p>
              <p className="text-sm text-slate-600">{w.meaning}</p>
              <p className="text-xs text-slate-500">Synonym: {w.synonym}</p>
              <p className="text-sm text-slate-500 italic">{w.usage}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
