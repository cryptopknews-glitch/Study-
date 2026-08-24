'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import MarkdownAnswer from '@/components/MarkdownAnswer'

const AREAS = [
  { id: 'physical-sciences', label: 'Physical Sciences', icon: '⚛️', half: 'science' },
  { id: 'biological-sciences', label: 'Biological Sciences', icon: '🧬', half: 'science' },
  { id: 'environmental-science', label: 'Environmental Science', icon: '🌍', half: 'science' },
  { id: 'food-science', label: 'Food Science', icon: '🍎', half: 'science' },
  { id: 'information-technology', label: 'Information Technology', icon: '💻', half: 'science' },
  { id: 'everyday-science', label: 'Everyday Science', icon: '🔦', half: 'science' },
  { id: 'quantitative-ability', label: 'Quantitative Ability', icon: '🔢', half: 'ability' },
  { id: 'mental-ability', label: 'Mental Ability', icon: '🧩', half: 'ability' },
]

const MODES = [
  { id: 'learn', label: 'Samjhein' },
  { id: 'practice', label: 'Practice' },
  { id: 'quiz', label: 'Quiz' },
] as const

export default function GsaPage() {
  const [area, setArea] = useState('quantitative-ability')
  const [mode, setMode] = useState<'learn' | 'practice' | 'quiz'>('learn')
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [answer, setAnswer] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setAnswer(null)
    try {
      const res = await fetch('/api/css-gsa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ area, mode, question }),
      })
      const data = await res.json()
      if (!res.ok) setError(data.error || 'Kuch masla ho gaya.')
      else setAnswer(data.answer)
    } catch {
      setError('Network error.')
    } finally {
      setLoading(false)
    }
  }

  const science = AREAS.filter((a) => a.half === 'science')
  const ability = AREAS.filter((a) => a.half === 'ability')

  return (
    <div className="px-4 py-8 space-y-6 pb-16">
      <Link href="/css" className="text-sm text-primary font-medium">← CSS</Link>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">General Science &amp; Ability</h1>
        <p className="text-slate-600 text-sm">
          CSS ka laazmi paper 3 — 100 marks
        </p>
      </div>

      <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-3">
        <p className="text-xs text-emerald-900 leading-relaxed">
          <b>Ye paper aap ke liye aasan hona chahiye.</b> Aadha hissa Quantitative aur Mental Ability hai —
          ICS ki Math aur BSCS ke baad ye aap ka mazboot pehlu banega. Doosra aadha Everyday Science hai.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">Everyday Science</p>
          <div className="grid grid-cols-2 gap-2">
            {science.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setArea(a.id)}
                className={`text-left rounded-lg border px-3 py-2.5 text-sm ${
                  area === a.id ? 'border-primary bg-primary/5 text-primary font-medium' : 'border-slate-300 text-slate-700'
                }`}
              >
                <span className="mr-1">{a.icon}</span>{a.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">Ability</p>
          <div className="grid grid-cols-2 gap-2">
            {ability.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setArea(a.id)}
                className={`text-left rounded-lg border px-3 py-2.5 text-sm ${
                  area === a.id ? 'border-primary bg-primary/5 text-primary font-medium' : 'border-slate-300 text-slate-700'
                }`}
              >
                <span className="mr-1">{a.icon}</span>{a.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <p className="block text-sm font-medium text-slate-700">Kya karna hai</p>
          <div className="flex gap-2">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                className={`flex-1 rounded-lg border py-2.5 text-sm font-medium ${
                  mode === m.id ? 'bg-primary text-white border-primary' : 'border-slate-300 text-slate-600'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="q" className="block text-sm font-medium text-slate-700">
            Sawaal ya topic {mode === 'learn' ? '' : '(optional)'}
          </label>
          <textarea
            id="q"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={3}
            placeholder="e.g. Time speed distance ke sawaal kaise hal karein"
            className="w-full rounded-lg border border-slate-300 py-3 px-3 text-slate-800"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-primary text-white font-semibold py-3 disabled:opacity-60"
        >
          {loading ? 'Taiyar ho raha hai…' : 'Shuru karein'}
        </button>
      </form>

      {error && (
        <div className="rounded-lg border border-danger/30 bg-red-50 p-4 text-sm text-danger">{error}</div>
      )}

      {answer && (
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <MarkdownAnswer content={answer} />
        </div>
      )}
    </div>
  )
}
