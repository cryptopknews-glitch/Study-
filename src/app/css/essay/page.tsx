'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import MarkdownAnswer from '@/components/MarkdownAnswer'

export default function EssayPage() {
  const [topic, setTopic] = useState('')
  const [loadingTopic, setLoadingTopic] = useState(false)
  const [outline, setOutline] = useState('')
  const [loadingEval, setLoadingEval] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSuggestTopic() {
    setLoadingTopic(true)
    setError(null)
    try {
      const res = await fetch('/api/css-essay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'suggest_topic' }),
      })
      const data = await res.json()
      if (!res.ok) setError(data.error || 'Topic nahi mila.')
      else setTopic(data.topic)
    } catch {
      setError('Network error.')
    } finally {
      setLoadingTopic(false)
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!topic.trim() || !outline.trim()) return
    setLoadingEval(true)
    setError(null)
    setFeedback(null)
    try {
      const res = await fetch('/api/css-essay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'evaluate', topic, outline }),
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
        <h1 className="text-2xl font-bold text-slate-900">Essay Writing</h1>
        <p className="text-slate-600 text-sm">Topic choose karein, outline likhein — structure feedback milega</p>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label htmlFor="topic" className="block text-sm font-medium text-slate-700">Essay Topic</label>
          <button
            type="button"
            onClick={handleSuggestTopic}
            disabled={loadingTopic}
            className="text-xs font-medium text-primary border border-primary/30 rounded-md px-2 py-1 disabled:opacity-50"
          >
            {loadingTopic ? 'Loading...' : 'Suggest Topic'}
          </button>
        </div>
        <input
          id="topic"
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. Is technology making us less human?"
          className="w-full rounded-lg border border-slate-300 py-3 px-3 text-slate-800"
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1">
          <label htmlFor="outline" className="block text-sm font-medium text-slate-700">
            Aapki Outline (thesis + main points)
          </label>
          <textarea
            id="outline"
            value={outline}
            onChange={(e) => setOutline(e.target.value)}
            rows={6}
            placeholder="Thesis statement, phir 4-6 main points list karein..."
            className="w-full rounded-lg border border-slate-300 py-3 px-3 text-slate-800"
          />
        </div>
        <button
          type="submit"
          disabled={loadingEval}
          className="w-full rounded-lg bg-primary text-white font-semibold py-3 disabled:opacity-60"
        >
          {loadingEval ? 'Checking...' : 'Check My Outline'}
        </button>
      </form>

      {error && (
        <div className="rounded-lg border border-danger/30 bg-red-50 p-4 text-sm text-danger">{error}</div>
      )}

      {feedback && (
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <MarkdownAnswer content={feedback} />
        </div>
      )}
    </div>
  )
}
