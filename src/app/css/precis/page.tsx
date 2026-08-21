'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import MarkdownAnswer from '@/components/MarkdownAnswer'

export default function PrecisPracticePage() {
  const [passage, setPassage] = useState<string | null>(null)
  const [loadingPassage, setLoadingPassage] = useState(false)
  const [title, setTitle] = useState('')
  const [precis, setPrecis] = useState('')
  const [loadingEval, setLoadingEval] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleGeneratePassage() {
    setLoadingPassage(true)
    setError(null)
    setPassage(null)
    setFeedback(null)
    setTitle('')
    setPrecis('')

    try {
      const res = await fetch('/api/css-precis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate' }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Passage generate nahi ho saka.')
      } else {
        setPassage(data.passage)
      }
    } catch {
      setError('Network error. Dobara koshish karein.')
    } finally {
      setLoadingPassage(false)
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!passage || !precis.trim()) return

    setLoadingEval(true)
    setError(null)
    setFeedback(null)

    try {
      const res = await fetch('/api/css-precis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'evaluate', passage, title, precis }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Kuch masla ho gaya.')
      } else {
        setFeedback(data.feedback)
      }
    } catch {
      setError('Network error. Dobara koshish karein.')
    } finally {
      setLoadingEval(false)
    }
  }

  const wordCount = passage ? passage.trim().split(/\s+/).length : 0
  const targetLength = wordCount ? Math.round(wordCount / 3) : 0

  return (
    <div className="px-4 py-8 space-y-6 pb-16">
      <Link href="/css" className="text-sm text-primary font-medium">
        ← CSS Foundation
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Precis Writing Practice</h1>
        <p className="text-slate-600 text-sm">
          Passage padhein, ~1/3 length mein precis likhein — examiner-style feedback milega
        </p>
      </div>

      {!passage && (
        <button
          onClick={handleGeneratePassage}
          disabled={loadingPassage}
          className="w-full rounded-lg bg-primary text-white font-semibold py-3 disabled:opacity-60"
        >
          {loadingPassage ? 'Passage taiyar ho raha hai...' : 'Generate Passage'}
        </button>
      )}

      {error && (
        <div className="rounded-lg border border-danger/30 bg-red-50 p-4 text-sm text-danger">
          {error}
        </div>
      )}

      {passage && (
        <>
          <section className="rounded-lg border border-slate-200 bg-white p-4 space-y-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Passage ({wordCount} words)
            </p>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{passage}</p>
          </section>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            Target: tqreeban <strong>{targetLength} words</strong> (asal passage ka 1/3)
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="title" className="block text-sm font-medium text-slate-700">
                Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ek mukhtasar, munasib title likhein"
                className="w-full rounded-lg border border-slate-300 py-3 px-3 text-slate-800"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="precis" className="block text-sm font-medium text-slate-700">
                Your Precis
              </label>
              <textarea
                id="precis"
                value={precis}
                onChange={(e) => setPrecis(e.target.value)}
                rows={6}
                placeholder="Apni precis yahan likhein..."
                className="w-full rounded-lg border border-slate-300 py-3 px-3 text-slate-800"
              />
            </div>

            <button
              type="submit"
              disabled={loadingEval}
              className="w-full rounded-lg bg-primary text-white font-semibold py-3 disabled:opacity-60"
            >
              {loadingEval ? 'Check ho raha hai...' : 'Check My Precis'}
            </button>
          </form>

          <button
            onClick={handleGeneratePassage}
            disabled={loadingPassage}
            className="w-full rounded-lg bg-slate-800 text-white font-semibold py-3 disabled:opacity-60"
          >
            {loadingPassage ? 'Loading...' : 'New Passage'}
          </button>
        </>
      )}

      {feedback && (
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <MarkdownAnswer content={feedback} />
        </div>
      )}
    </div>
  )
}
