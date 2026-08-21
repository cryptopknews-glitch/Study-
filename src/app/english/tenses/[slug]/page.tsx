'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { getTenseBySlug } from '@/lib/tenses'

export default function TenseDetailPage({ params }: { params: { slug: string } }) {
  const tense = getTenseBySlug(params.slug)

  const [sentence, setSentence] = useState('')
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!tense) {
    return (
      <div className="px-4 py-8 space-y-3">
        <p className="text-slate-600 text-sm">Ye tense nahi mili.</p>
        <Link href="/english/tenses" className="text-primary text-sm font-medium">
          ← All Tenses
        </Link>
      </div>
    )
  }

  async function handleCheck(e: FormEvent) {
    e.preventDefault()
    if (!sentence.trim() || !tense) return

    setLoading(true)
    setFeedback(null)
    setError(null)

    try {
      const res = await fetch('/api/check-sentence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenseName: tense.name, sentence }),
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
      setLoading(false)
    }
  }

  return (
    <div className="px-4 py-8 space-y-6 pb-16">
      <Link href="/english/tenses" className="text-sm text-primary font-medium">
        ← All Tenses
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">{tense.name}</h1>
        <p className="text-slate-600 text-sm">{tense.usage}</p>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-4 space-y-2">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Concept (Urdu)</p>
        <p className="text-sm text-slate-700 leading-relaxed">{tense.urduExplanation}</p>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 space-y-2">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Structure</p>
        <p className="text-sm font-mono text-slate-800">{tense.structure}</p>
      </section>

      <section className="grid grid-cols-1 gap-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Example</p>
          <p className="text-sm text-slate-700 whitespace-pre-line">{tense.example}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Negative</p>
          <p className="text-sm text-slate-700 whitespace-pre-line">{tense.negative}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Question</p>
          <p className="text-sm text-slate-700 whitespace-pre-line">{tense.question}</p>
        </div>
      </section>

      <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-2">
        <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Common Mistakes</p>
        <ul className="list-disc pl-5 space-y-1 text-sm text-amber-800">
          {tense.commonMistakes.map((m, i) => (
            <li key={i}>{m}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <p className="text-sm font-medium text-slate-700">
          Practice: {tense.name} mein ek sentence likhein
        </p>
        <form onSubmit={handleCheck} className="space-y-3">
          <label htmlFor="sentence" className="sr-only">
            Sentence
          </label>
          <textarea
            id="sentence"
            value={sentence}
            onChange={(e) => setSentence(e.target.value)}
            rows={3}
            placeholder={`e.g. ${tense.example.split('\n')[0]}`}
            className="w-full rounded-lg border border-slate-300 py-3 px-3 text-slate-800"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary text-white font-semibold py-3 disabled:opacity-60"
          >
            {loading ? 'Checking...' : 'Check My Sentence'}
          </button>
        </form>

        {error && (
          <div className="rounded-lg border border-danger/30 bg-red-50 p-4 text-sm text-danger">
            {error}
          </div>
        )}
        {feedback && (
          <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
            {feedback}
          </div>
        )}
      </section>
    </div>
  )
}
