'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { getCssTopicBySlug } from '@/lib/cssTopics'
import MarkdownAnswer from '@/components/MarkdownAnswer'

export default function CssTopicPage({ params }: { params: { topic: string } }) {
  const topic = getCssTopicBySlug(params.topic)

  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [answer, setAnswer] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!topic) {
    return (
      <div className="px-4 py-8 space-y-3">
        <p className="text-slate-600 text-sm">Ye topic nahi mila.</p>
        <Link href="/css" className="text-primary text-sm font-medium">
          ← CSS Foundation
        </Link>
      </div>
    )
  }

  if (!topic.active) {
    return (
      <div className="px-4 py-8 space-y-3">
        <Link href="/css" className="text-sm text-primary font-medium">
          ← CSS Foundation
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">{topic.name}</h1>
        <p className="text-slate-600 text-sm">
          Ye topic abhi available nahi hai — future phase mein add hoga.
        </p>
      </div>
    )
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!question.trim() || !topic) return

    setLoading(true)
    setAnswer(null)
    setError(null)

    try {
      const res = await fetch('/api/css', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic.name, question }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Kuch masla ho gaya.')
      } else {
        setAnswer(data.answer)
      }
    } catch {
      setError('Network error. Dobara koshish karein.')
    } finally {
      setLoading(false)
    }
  }

  const STALE_TOPICS = ['current-affairs', 'pakistan-affairs']
  const showStaleWarning = STALE_TOPICS.includes(params.topic)

  return (
    <div className="px-4 py-8 space-y-6 pb-16">
      <Link href="/css" className="text-sm text-primary font-medium">
        ← CSS Foundation
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">{topic.name}</h1>
        <p className="text-slate-600 text-sm">{topic.description}</p>
      </div>

      {showStaleWarning && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3">
          <p className="text-xs text-amber-900 leading-relaxed">
            <b>Ehtiyat:</b> AI ki maloomat purani ho sakti hai. Current Affairs aur Pakistan Affairs har
            mahine badalte hain — taza waqiat ke liye akhbar ya kisi mautabar khabar wali site se tasdeeq
            zaroor karein. Yahan se sirf mauzu samajhne mein madad lein, taza facts ke liye nahi.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <label htmlFor="question" className="block text-sm font-medium text-slate-700">
          Sawal ya topic likhein
        </label>
        <textarea
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={4}
          placeholder={`e.g. ${topic.name} mein mujhe kahan se start karna chahiye?`}
          className="w-full rounded-lg border border-slate-300 py-3 px-3 text-slate-800"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-primary text-white font-semibold py-3 disabled:opacity-60"
        >
          {loading ? 'Solving...' : 'Ask'}
        </button>
      </form>

      {error && (
        <div className="rounded-lg border border-danger/30 bg-red-50 p-4 text-sm text-danger">
          {error}
        </div>
      )}

      {answer && (
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <MarkdownAnswer content={answer} />
        </div>
      )}
    </div>
  )
}
