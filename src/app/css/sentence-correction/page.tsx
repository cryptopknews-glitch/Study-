'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function SentenceCorrectionPage() {
  const [incorrect, setIncorrect] = useState<string | null>(null)
  const [loadingSentence, setLoadingSentence] = useState(false)
  const [userCorrection, setUserCorrection] = useState('')
  const [loadingEval, setLoadingEval] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleNewSentence() {
    setLoadingSentence(true)
    setError(null)
    setIncorrect(null)
    setFeedback(null)
    setUserCorrection('')
    try {
      const res = await fetch('/api/css-sentence-correction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate' }),
      })
      const data = await res.json()
      if (!res.ok) setError(data.error || 'Sentence generate nahi ho saka.')
      else setIncorrect(data.incorrect)
    } catch {
      setError('Network error.')
    } finally {
      setLoadingSentence(false)
    }
  }

  async function handleCheck() {
    if (!incorrect || !userCorrection.trim()) return
    setLoadingEval(true)
    setError(null)
    setFeedback(null)
    try {
      const res = await fetch('/api/css-sentence-correction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'evaluate', incorrect, userCorrection }),
      })
      const data = await res.json()
      if (!res.ok) setError(data.error || 'Kuch masla ho gaya.')
      else setFeedback(data.feedback)
    } catch {
      setError('Network error.')
    } finally {
      setLoadingEval(false)
    }
  }

  return (
    <div className="px-4 py-8 space-y-6 pb-16">
      <Link href="/css" className="text-sm text-primary font-medium">← CSS Foundation</Link>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Sentence Correction</h1>
        <p className="text-slate-600 text-sm">CSS-style ghalat sentence dhoondein aur theek karein</p>
      </div>

      {!incorrect && (
        <button
          onClick={handleNewSentence}
          disabled={loadingSentence}
          className="w-full rounded-lg bg-primary text-white font-semibold py-3 disabled:opacity-60"
        >
          {loadingSentence ? 'Taiyar ho raha hai...' : 'New Sentence'}
        </button>
      )}

      {error && (
        <div className="rounded-lg border border-danger/30 bg-red-50 p-4 text-sm text-danger">{error}</div>
      )}

      {incorrect && (
        <>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Ghalat Sentence</p>
            <p className="text-sm text-slate-800">{incorrect}</p>
          </div>

          <div className="space-y-1">
            <label htmlFor="correction" className="block text-sm font-medium text-slate-700">
              Apni Correction Likhein
            </label>
            <textarea
              id="correction"
              value={userCorrection}
              onChange={(e) => setUserCorrection(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-slate-300 py-3 px-3 text-slate-800"
            />
          </div>

          <button
            onClick={handleCheck}
            disabled={loadingEval}
            className="w-full rounded-lg bg-primary text-white font-semibold py-3 disabled:opacity-60"
          >
            {loadingEval ? 'Checking...' : 'Check My Correction'}
          </button>

          <button
            onClick={handleNewSentence}
            disabled={loadingSentence}
            className="w-full rounded-lg bg-slate-800 text-white font-semibold py-3 disabled:opacity-60"
          >
            {loadingSentence ? 'Loading...' : 'New Sentence'}
          </button>
        </>
      )}

      {feedback && (
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
          {feedback}
        </div>
      )}
    </div>
  )
}
