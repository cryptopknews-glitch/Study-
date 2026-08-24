'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import MarkdownAnswer from '@/components/MarkdownAnswer'

interface Crit { score: number; note: string }
interface Score {
  total: number
  wordCount: number
  verdict: string
  breakdown: { clarity: Crit; coherence: Crit; vocabulary: Crit; argument: Crit }
  strengths: string[]
  weaknesses: string[]
  nextSteps: string[]
}

const CRITERIA: { key: keyof Score['breakdown']; label: string }[] = [
  { key: 'clarity', label: 'Clarity of thought' },
  { key: 'coherence', label: 'Coherence & structure' },
  { key: 'vocabulary', label: 'Vocabulary & expression' },
  { key: 'argument', label: 'Argument quality' },
]

export default function EssayPage() {
  const [topic, setTopic] = useState('')
  const [loadingTopic, setLoadingTopic] = useState(false)
  const [outline, setOutline] = useState('')
  const [loadingEval, setLoadingEval] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<'outline' | 'full'>('outline')
  const [essay, setEssay] = useState('')
  const [scoring, setScoring] = useState(false)
  const [score, setScore] = useState<Score | null>(null)

  async function handleScore() {
    if (!topic.trim() || !essay.trim()) return
    setScoring(true)
    setError(null)
    setScore(null)
    try {
      const res = await fetch('/api/css-essay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'score', topic, essay }),
      })
      const data = await res.json()
      if (!res.ok) setError(data.error || 'Check nahi ho saka.')
      else setScore(data)
    } catch {
      setError('Network error.')
    } finally {
      setScoring(false)
    }
  }

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

      {/* ---- Poora essay likh kar number lein ---- */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTab('outline')}
            className={`flex-1 rounded-lg border py-2 text-sm font-medium ${
              tab === 'outline' ? 'bg-primary text-white border-primary' : 'border-slate-300 text-slate-600'
            }`}
          >
            Outline check
          </button>
          <button
            type="button"
            onClick={() => setTab('full')}
            className={`flex-1 rounded-lg border py-2 text-sm font-medium ${
              tab === 'full' ? 'bg-primary text-white border-primary' : 'border-slate-300 text-slate-600'
            }`}
          >
            Poora essay — number lein
          </button>
        </div>

        {tab === 'full' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-500 leading-relaxed">
              CSS essay 100 marks ka hai aur pass mark 40 hai. Char cheezon par 25-25 number:
              clarity, coherence, vocabulary, argument. Examiner sakht hota hai — yahan bhi sakht marking hogi.
            </p>
            <textarea
              value={essay}
              onChange={(e) => setEssay(e.target.value)}
              rows={12}
              placeholder="Poora essay yahan likhein..."
              className="w-full rounded-lg border border-slate-300 py-3 px-3 text-sm text-slate-800"
            />
            <p className="text-[11px] text-slate-400">
              {essay.trim().split(/\s+/).filter(Boolean).length} words
            </p>
            <button
              type="button"
              onClick={handleScore}
              disabled={scoring || !topic.trim() || !essay.trim()}
              className="w-full rounded-lg bg-primary text-white font-semibold py-3 disabled:opacity-60"
            >
              {scoring ? 'Check ho raha hai...' : 'Essay ko number dein'}
            </button>
          </div>
        )}
      </div>

      {score && (
        <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-4">
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold ${
              score.total >= 60 ? 'text-success' : score.total >= 40 ? 'text-amber-600' : 'text-danger'
            }`}>{score.total}</span>
            <span className="text-sm text-slate-400">/ 100</span>
            <span className="text-xs text-slate-400 ml-auto">{score.wordCount} words</span>
          </div>

          <p className={`text-xs font-medium ${score.total >= 40 ? 'text-success' : 'text-danger'}`}>
            {score.total >= 40 ? 'Pass mark (40) se ooper' : 'Pass mark (40) se neeche'}
          </p>

          {score.verdict && <p className="text-sm text-slate-700">{score.verdict}</p>}

          <div className="space-y-2">
            {CRITERIA.map((c) => {
              const b = score.breakdown?.[c.key]
              if (!b) return null
              const pct = Math.round((b.score / 25) * 100)
              return (
                <div key={c.key}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">{c.label}</span>
                    <span className="font-semibold text-slate-800">{b.score}/25</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${pct >= 60 ? 'bg-success' : pct >= 40 ? 'bg-amber-500' : 'bg-danger'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  {b.note && <p className="text-[11px] text-slate-500 mt-1">{b.note}</p>}
                </div>
              )
            })}
          </div>

          {score.strengths?.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 mb-1">Achha tha</p>
              <ul className="text-xs text-slate-700 space-y-1 list-disc pl-4">
                {score.strengths.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}

          {score.weaknesses?.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 mb-1">Kami rahi</p>
              <ul className="text-xs text-slate-700 space-y-1 list-disc pl-4">
                {score.weaknesses.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}

          {score.nextSteps?.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 mb-1">Agli baar</p>
              <ul className="text-xs text-slate-700 space-y-1 list-disc pl-4">
                {score.nextSteps.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}

          <p className="text-[11px] text-slate-400">
            AI ki marking andaza hai — asal FPSC examiner alag number de sakta hai.
          </p>
        </div>
      )}

      {feedback && (
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <MarkdownAnswer content={feedback} />
        </div>
      )}
    </div>
  )
}
