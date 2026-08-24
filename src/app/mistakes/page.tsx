'use client'

import { useEffect, useState, useCallback } from 'react'
import { isRtlSubject } from '@/lib/types'

interface Row {
  id: number
  source: string
  class: string | null
  subject: string | null
  topic: string | null
  question: string
  correct: boolean
  chosen: string | null
  answer: string | null
  created_at: string
}

interface Weak {
  subject: string
  topic: string
  right: number
  wrong: number
  total: number
  accuracy: number
}

export default function MistakesPage() {
  const [rows, setRows] = useState<Row[]>([])
  const [weak, setWeak] = useState<Weak[]>([])
  const [totalAttempts, setTotalAttempts] = useState(0)
  const [totalWrong, setTotalWrong] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [subjectFilter, setSubjectFilter] = useState<string>('')

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const url = '/api/quiz-attempts?only=wrong' + (subjectFilter ? `&subject=${encodeURIComponent(subjectFilter)}` : '')
      const res = await fetch(url, { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) setError(data.error || 'Data load nahi ho saka.')
      else {
        setRows(data.rows ?? [])
        setWeak(data.weak ?? [])
        setTotalAttempts(data.totalAttempts ?? 0)
        setTotalWrong(data.totalWrong ?? 0)
      }
    } catch {
      setError('Network error.')
    } finally {
      setLoading(false)
    }
  }, [subjectFilter])

  useEffect(() => { load() }, [load])

  async function remove(id: number) {
    try {
      await fetch(`/api/quiz-attempts?id=${id}`, { method: 'DELETE' })
      setRows((prev) => prev.filter((r) => r.id !== id))
    } catch {
      /* chup chaap */
    }
  }

  const subjects = Array.from(new Set(rows.map((r) => r.subject).filter(Boolean))) as string[]
  const accuracy = totalAttempts > 0 ? Math.round(((totalAttempts - totalWrong) / totalAttempts) * 100) : 0

  return (
    <div className="px-4 py-8 space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Galtiyon ki Kitaab</h1>
        <p className="text-slate-600 text-sm">
          Jo sawaal galat hue — imtihan se pehle sirf yahi dohrayein
        </p>
      </div>

      {loading && <p className="text-sm text-slate-500">Load ho raha hai…</p>}

      {error && (
        <div className="rounded-lg border border-danger/30 bg-red-50 p-4 text-sm text-danger">
          {error}
          <p className="text-xs mt-2 text-slate-600">
            Agar table nahi bani to Supabase mein Batch 1 wala SQL chala lein.
          </p>
        </div>
      )}

      {!loading && !error && totalAttempts === 0 && (
        <div className="rounded-lg border border-slate-200 bg-white p-5 text-center">
          <p className="text-sm text-slate-700 font-medium">Abhi koi record nahi</p>
          <p className="text-xs text-slate-500 mt-1">
            Study page par Quiz mode ya Mock Exam mein MCQs karein — galtiyan khud yahan aa jayengi.
          </p>
        </div>
      )}

      {totalAttempts > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-slate-200 bg-white p-3 text-center">
            <p className="text-xl font-bold text-slate-900">{totalAttempts}</p>
            <p className="text-[11px] text-slate-500">Kul sawaal</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-3 text-center">
            <p className="text-xl font-bold text-danger">{totalWrong}</p>
            <p className="text-[11px] text-slate-500">Galat</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-3 text-center">
            <p className={`text-xl font-bold ${accuracy >= 75 ? 'text-success' : accuracy >= 50 ? 'text-amber-600' : 'text-danger'}`}>
              {accuracy}%
            </p>
            <p className="text-[11px] text-slate-500">Sahi</p>
          </div>
        </div>
      )}

      {weak.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
            Kamzor Topics
          </h2>
          <p className="text-xs text-slate-500 -mt-1">
            Kam az kam 3 sawaal aur 70% se kam sahi
          </p>
          {weak.map((w, i) => (
            <div key={i} className="rounded-lg border border-amber-300 bg-amber-50 p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{w.topic}</p>
                  <p className="text-xs text-slate-600">{w.subject}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold text-amber-700">{w.accuracy}%</p>
                  <p className="text-[11px] text-slate-500">{w.right}/{w.total}</p>
                </div>
              </div>
            </div>
          ))}
        </section>
      )}

      {subjects.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setSubjectFilter('')}
            className={`shrink-0 text-xs font-medium rounded-full px-3 py-1.5 border ${
              subjectFilter === '' ? 'bg-primary text-white border-primary' : 'border-slate-300 text-slate-600'
            }`}
          >
            Sab
          </button>
          {subjects.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSubjectFilter(s)}
              className={`shrink-0 text-xs font-medium rounded-full px-3 py-1.5 border ${
                subjectFilter === s ? 'bg-primary text-white border-primary' : 'border-slate-300 text-slate-600'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {rows.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
            Galat Sawaal ({rows.length})
          </h2>
          {rows.map((r) => {
            const rtl = isRtlSubject(r.subject)
            return (
              <div key={r.id} className="rounded-lg border border-slate-200 bg-white p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs text-slate-400">
                    {r.subject || '—'}{r.topic ? ' · ' + r.topic : ''}
                  </p>
                  <button
                    type="button"
                    onClick={() => remove(r.id)}
                    title="Yaad ho gaya — list se hata dein"
                    className="shrink-0 text-xs text-slate-400 hover:text-danger"
                  >
                    ✓ yaad ho gaya
                  </button>
                </div>
                <p className="text-sm text-slate-800" dir={rtl ? 'rtl' : 'ltr'}>{r.question}</p>
                <div className="text-xs space-y-1" dir={rtl ? 'rtl' : 'ltr'}>
                  {r.chosen && (
                    <p className="text-danger">Aap ne likha: {r.chosen}</p>
                  )}
                  {r.answer && (
                    <p className="text-success">Sahi jawab: {r.answer}</p>
                  )}
                </div>
              </div>
            )
          })}
        </section>
      )}

      {!loading && !error && totalAttempts > 0 && rows.length === 0 && (
        <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-5 text-center">
          <p className="text-sm text-emerald-800 font-medium">Koi galti baqi nahi 🎉</p>
          <p className="text-xs text-emerald-700 mt-1">Sab sawaal sahi hue ya list saaf kar di gayi.</p>
        </div>
      )}
    </div>
  )
}
