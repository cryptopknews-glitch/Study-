'use client'

import { useState } from 'react'
import { isRtlSubject } from '@/lib/types'

interface Grade {
  score: number
  maxMarks: number
  verdict: string
  correct: string[]
  missing: string[]
  improve: string[]
  modelPoints: string[]
}

/**
 * Ek sawaal ka jawab likhwa kar AI se number lene wala box.
 * Mock exam, past paper — jahan chahein laga dein.
 */
export default function AnswerGrader({
  question,
  maxMarks,
  studentClass,
  subject,
  chapter,
  source,
  modelAnswer,
}: {
  question: string
  maxMarks: number
  studentClass?: string
  subject?: string
  chapter?: string
  source?: string
  modelAnswer?: string | null
}) {
  const [open, setOpen] = useState(false)
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [grade, setGrade] = useState<Grade | null>(null)
  const [error, setError] = useState<string | null>(null)

  const rtl = isRtlSubject(subject)

  async function submit() {
    if (!answer.trim()) {
      setError('Pehle apna jawab likhein.')
      return
    }
    setLoading(true)
    setError(null)
    setGrade(null)
    try {
      const res = await fetch('/api/grade-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          answer,
          maxMarks,
          studentClass,
          subject,
          chapter,
          source,
          modelAnswer,
        }),
      })
      const data = await res.json()
      if (!res.ok) setError(data.error || 'Check nahi ho saka.')
      else setGrade(data)
    } catch {
      setError('Network error.')
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-2 text-xs font-semibold text-primary border border-primary/40 rounded-md px-3 py-1.5"
      >
        ✍️ Apna jawab likh kar check karayein
      </button>
    )
  }

  const pct = grade ? Math.round((grade.score / (grade.maxMarks || 1)) * 100) : 0
  const tone =
    pct >= 75 ? 'text-emerald-700 bg-emerald-50 border-emerald-300'
    : pct >= 45 ? 'text-amber-700 bg-amber-50 border-amber-300'
    : 'text-red-700 bg-red-50 border-red-300'

  return (
    <div className="mt-3 pt-3 border-t border-slate-200 space-y-3">
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1">
          Aap ka jawab ({maxMarks} marks)
        </label>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          rows={rtl ? 6 : 5}
          dir={rtl ? 'rtl' : 'ltr'}
          placeholder={rtl ? 'یہاں اپنا جواب لکھیں…' : 'Jaise imtihan mein likhti hain waise likhein…'}
          className="w-full rounded-lg border border-slate-300 py-2.5 px-3 text-sm text-slate-800"
          style={rtl ? { lineHeight: 2 } : undefined}
        />
        <p className="text-[11px] text-slate-400 mt-1">{answer.trim().split(/\s+/).filter(Boolean).length} words</p>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={submit}
          disabled={loading}
          className="flex-1 rounded-lg bg-primary text-white text-sm font-semibold py-2.5 disabled:opacity-60"
        >
          {loading ? 'Check ho raha hai…' : 'Check karayein'}
        </button>
        <button
          type="button"
          onClick={() => { setOpen(false); setGrade(null); setError(null) }}
          className="rounded-lg border border-slate-300 text-slate-600 text-sm font-medium px-4"
        >
          Band
        </button>
      </div>

      {error && <p className="text-xs text-danger">{error}</p>}

      {grade && (
        <div className={`rounded-lg border p-3 space-y-3 ${tone}`}>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{grade.score}</span>
            <span className="text-sm opacity-70">/ {grade.maxMarks}</span>
            <span className="text-xs ml-auto opacity-70">{pct}%</span>
          </div>

          {grade.verdict && (
            <p className="text-sm font-medium" dir={rtl ? 'rtl' : 'ltr'}>{grade.verdict}</p>
          )}

          {grade.correct?.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide opacity-70 mb-1">Ye sahi tha</p>
              <ul className="text-xs space-y-1 list-disc pl-4" dir={rtl ? 'rtl' : 'ltr'}>
                {grade.correct.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </div>
          )}

          {grade.missing?.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide opacity-70 mb-1">Ye reh gaya</p>
              <ul className="text-xs space-y-1 list-disc pl-4" dir={rtl ? 'rtl' : 'ltr'}>
                {grade.missing.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </div>
          )}

          {grade.improve?.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide opacity-70 mb-1">Agli baar</p>
              <ul className="text-xs space-y-1 list-disc pl-4" dir={rtl ? 'rtl' : 'ltr'}>
                {grade.improve.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </div>
          )}

          {grade.modelPoints?.length > 0 && (
            <details>
              <summary className="text-[11px] font-bold uppercase tracking-wide opacity-70 cursor-pointer">
                Poore number ke liye kya chahiye tha
              </summary>
              <ul className="text-xs space-y-1 list-disc pl-4 mt-2" dir={rtl ? 'rtl' : 'ltr'}>
                {grade.modelPoints.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </details>
          )}

          <p className="text-[11px] opacity-60">
            AI ki marking andaza hai — asal board examiner thora alag number de sakta hai.
          </p>
        </div>
      )}
    </div>
  )
}
