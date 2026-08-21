'use client'

import { useState, type FormEvent } from 'react'
import { CLASSES, SUBJECTS } from '@/lib/constants'
import type { Class, Subject } from '@/lib/types'

interface CardItem {
  front: string
  back: string
}

export default function FlashcardsPage() {
  const [studentClass, setStudentClass] = useState<Class>('Class 11')
  const [subject, setSubject] = useState<Subject>('Mathematics')
  const [chapter, setChapter] = useState('')
  const [loading, setLoading] = useState(false)
  const [cards, setCards] = useState<CardItem[] | null>(null)
  const [flipped, setFlipped] = useState<Record<number, boolean>>({})
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setCards(null)
    setFlipped({})
    try {
      const res = await fetch('/api/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentClass, subject, chapter }),
      })
      const data = await res.json()
      if (!res.ok) setError(data.error || 'Cards nahi ban sakay.')
      else setCards(data.cards)
    } catch {
      setError('Network error.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-4 py-8 space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Flashcards</h1>
        <p className="text-slate-600 text-sm">Jaldi revision — card par tap kar ke answer dekhein</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="class" className="block text-sm font-medium text-slate-700">Class</label>
          <select
            id="class"
            value={studentClass}
            onChange={(e) => setStudentClass(e.target.value as Class)}
            className="w-full rounded-lg border border-slate-300 py-3 px-3 text-slate-800 bg-white"
          >
            {CLASSES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="subject" className="block text-sm font-medium text-slate-700">Subject</label>
          <select
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value as Subject)}
            className="w-full rounded-lg border border-slate-300 py-3 px-3 text-slate-800 bg-white"
          >
            {SUBJECTS.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="chapter" className="block text-sm font-medium text-slate-700">Chapter (optional)</label>
          <input
            id="chapter"
            type="text"
            value={chapter}
            onChange={(e) => setChapter(e.target.value)}
            placeholder="e.g. Differentiation — khaali chhodein poore syllabus ke liye"
            className="w-full rounded-lg border border-slate-300 py-3 px-3 text-slate-800"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-primary text-white font-semibold py-3 disabled:opacity-60"
        >
          {loading ? 'Cards taiyar ho rahe hain...' : 'Generate Flashcards'}
        </button>
      </form>

      {error && (
        <div className="rounded-lg border border-danger/30 bg-red-50 p-4 text-sm text-danger">{error}</div>
      )}

      {cards && (
        <div className="space-y-3">
          {cards.map((card, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setFlipped((prev) => ({ ...prev, [i]: !prev[i] }))}
              className="w-full text-left rounded-lg border border-slate-200 bg-white p-4 active:bg-slate-50"
            >
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                {flipped[i] ? 'Answer' : 'Card ' + (i + 1) + ' — tap to flip'}
              </p>
              <p className="text-sm text-slate-800 font-medium">
                {flipped[i] ? card.back : card.front}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
