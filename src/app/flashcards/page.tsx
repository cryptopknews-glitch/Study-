'use client'

import { useState, useEffect, useCallback, type FormEvent } from 'react'
import { CLASSES, SUBJECTS } from '@/lib/constants'
import { isRtlSubject, type Class, type Subject } from '@/lib/types'

interface CardItem {
  front: string
  back: string
  card_key?: string
  chapter?: string | null
  subject?: string | null
}

type Result = 'easy' | 'hard' | 'forgot'

export default function FlashcardsPage() {
  const [studentClass, setStudentClass] = useState<Class>('Class 11')
  const [subject, setSubject] = useState<Subject>('Mathematics')
  const [chapter, setChapter] = useState('')
  const [loading, setLoading] = useState(false)
  const [cards, setCards] = useState<CardItem[] | null>(null)
  const [flipped, setFlipped] = useState<Record<number, boolean>>({})
  const [done, setDone] = useState<Record<number, Result>>({})
  const [error, setError] = useState<string | null>(null)
  const [dueCount, setDueCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [mode, setMode] = useState<'due' | 'new'>('due')
  const [saveNote, setSaveNote] = useState<string | null>(null)

  const rtl = isRtlSubject(subject)

  const loadDue = useCallback(async () => {
    try {
      const res = await fetch('/api/flashcards/review', { cache: 'no-store' })
      const data = await res.json()
      setDueCount(data.dueCount ?? 0)
      setTotalCount(data.totalCount ?? 0)
      return data.due as CardItem[]
    } catch {
      return []
    }
  }, [])

  useEffect(() => {
    loadDue()
  }, [loadDue])

  async function startDueReview() {
    setLoading(true)
    setError(null)
    setCards(null)
    setFlipped({})
    setDone({})
    setSaveNote(null)
    const due = await loadDue()
    setMode('due')
    if (!due || due.length === 0) {
      setError('Aaj koi card due nahi hai. Naye cards banayein ya kal wapas aayein.')
    } else {
      setCards(due)
    }
    setLoading(false)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setCards(null)
    setFlipped({})
    setDone({})
    setSaveNote(null)
    setMode('new')
    try {
      const res = await fetch('/api/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentClass, subject, chapter }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Cards nahi ban sakay.')
        setLoading(false)
        return
      }

      // Cards save karo taake aage dobara mil sakein
      const saveRes = await fetch('/api/flashcards/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cards: data.cards, studentClass, subject, chapter }),
      })
      const saveData = await saveRes.json().catch(() => ({}))

      // Save hone ke baad card_key wapas chahiye — due list se milaate hain
      const withKeys: CardItem[] = (data.cards as CardItem[]).map((c) => ({
        ...c,
        card_key: makeKey(c.front),
      }))

      setCards(withKeys)
      if (saveRes.ok) setSaveNote(`${saveData.saved ?? withKeys.length} cards save ho gaye — aage dobara milenge.`)
      loadDue()
    } catch {
      setError('Network error.')
    } finally {
      setLoading(false)
    }
  }

  async function mark(index: number, card: CardItem, result: Result) {
    setDone((prev) => ({ ...prev, [index]: result }))
    const key = card.card_key || makeKey(card.front)
    try {
      await fetch('/api/flashcards/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardKey: key, result }),
      })
      loadDue()
    } catch {
      /* chup chaap — beti ka kaam nahi rukna chahiye */
    }
  }

  const reviewed = Object.keys(done).length
  const total = cards?.length ?? 0

  return (
    <div className="px-4 py-8 space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Flashcards</h1>
        <p className="text-slate-600 text-sm">
          Card par tap kar ke jawab dekhein, phir batayein kaisa laga
        </p>
      </div>

      {/* Due summary */}
      <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {dueCount > 0 ? `Aaj ${dueCount} cards due hain` : 'Aaj koi card due nahi'}
            </p>
            <p className="text-xs text-slate-600 mt-0.5">
              Kul {totalCount} cards mehfooz hain
            </p>
          </div>
          <button
            type="button"
            onClick={startDueReview}
            disabled={loading || dueCount === 0}
            className="shrink-0 rounded-lg bg-primary text-white text-sm font-semibold px-4 py-2.5 disabled:opacity-40"
          >
            Shuru karein
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm font-semibold text-slate-700">Naye cards banayein</p>

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
              <option key={s.id} value={s.id}>
                {s.label}{s.note ? ` (${s.note})` : ''}
              </option>
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

      {saveNote && (
        <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800">
          {saveNote}
        </div>
      )}

      {cards && cards.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{mode === 'due' ? 'Aaj ka revision' : 'Naye cards'}</span>
            <span>{reviewed} / {total} ho gaye</span>
          </div>

          {cards.map((card, i) => {
            const cardRtl = isRtlSubject(card.subject ?? subject)
            return (
              <div
                key={card.card_key || i}
                className={`rounded-lg border bg-white p-4 ${
                  done[i] ? 'border-emerald-300 bg-emerald-50/40' : 'border-slate-200'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setFlipped((prev) => ({ ...prev, [i]: !prev[i] }))}
                  className="w-full text-left"
                >
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                    {flipped[i] ? 'Answer' : `Card ${i + 1} — tap to flip`}
                  </p>
                  <p
                    className="text-sm text-slate-800 font-medium"
                    dir={cardRtl ? 'rtl' : 'ltr'}
                    style={cardRtl ? { textAlign: 'right', lineHeight: 2 } : undefined}
                  >
                    {flipped[i] ? card.back : card.front}
                  </p>
                </button>

                {flipped[i] && (
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    {done[i] ? (
                      <p className="text-xs text-emerald-700 font-medium">
                        ✓ Record ho gaya — {done[i] === 'easy' ? 'aa gaya' : done[i] === 'hard' ? 'mushkil tha' : 'bhool gaya'}
                      </p>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => mark(i, card, 'forgot')}
                          className="flex-1 rounded-lg bg-red-100 text-red-800 text-xs font-semibold py-2.5"
                        >
                          Bhool gaya
                        </button>
                        <button
                          type="button"
                          onClick={() => mark(i, card, 'hard')}
                          className="flex-1 rounded-lg bg-amber-100 text-amber-800 text-xs font-semibold py-2.5"
                        >
                          Mushkil tha
                        </button>
                        <button
                          type="button"
                          onClick={() => mark(i, card, 'easy')}
                          className="flex-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-semibold py-2.5"
                        >
                          Aa gaya
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/** Server wale hash se bilkul milta hua — dono jagah ek hi key bane. */
function makeKey(front: string): string {
  const norm = front.toLowerCase().replace(/\s+/g, ' ').trim()
  let h = 5381
  for (let i = 0; i < norm.length; i++) h = ((h << 5) + h + norm.charCodeAt(i)) | 0
  return 'c' + Math.abs(h).toString(36) + '-' + norm.length
}
