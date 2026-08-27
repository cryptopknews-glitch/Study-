'use client'

import { useState, useEffect, useCallback } from 'react'
import { CLASSES, SUBJECTS } from '@/lib/constants'
import { isRtlSubject, type Class, type Subject } from '@/lib/types'
import MarkdownAnswer from '@/components/MarkdownAnswer'

interface Sheet {
  id: string
  title: string
  content: string
  class: string | null
  subject: string | null
  created_at: string
}

export default function FormulasPage() {
  const [studentClass, setStudentClass] = useState<Class>('Class 11')
  const [subject, setSubject] = useState<Subject>('Mathematics')
  const [chapter, setChapter] = useState('')
  const [loading, setLoading] = useState(false)
  const [sheets, setSheets] = useState<Sheet[]>([])
  const [openId, setOpenId] = useState<string | null>(null)
  const [fresh, setFresh] = useState<{ title: string; content: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/formulas', { cache: 'no-store' })
      const data = await res.json()
      setSheets(data.sheets ?? [])
    } catch {
      /* chup chaap */
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function generate() {
    setLoading(true)
    setError(null)
    setFresh(null)
    setOpenId(null)
    try {
      const res = await fetch('/api/formulas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentClass, subject, chapter }),
      })
      const data = await res.json()
      if (!res.ok) setError(data.error || 'Sheet nahi ban saki.')
      else {
        setFresh({ title: data.title, content: data.content })
        load()
      }
    } catch {
      setError('Network error.')
    } finally {
      setLoading(false)
    }
  }

  const openSheet = sheets.find((s) => s.id === openId)

  return (
    <div className="px-4 py-8 space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Formula Sheets</h1>
        <p className="text-slate-600 text-sm">
          Ek baar banti hai, phir hamesha ke liye save — imtihan se pehle sirf yahi dohrayein
        </p>
      </div>

      {sheets.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
            Saved Sheets ({sheets.length})
          </h2>
          {sheets.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => { setOpenId(openId === s.id ? null : s.id); setFresh(null) }}
              className={`w-full text-left rounded-lg border p-3 ${
                openId === s.id ? 'border-primary bg-primary/5' : 'border-slate-200 bg-white'
              }`}
            >
              <p className="text-sm font-medium text-slate-800">
                {s.title.replace('Formula Sheet — ', '')}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {new Date(s.created_at).toLocaleDateString()}
              </p>
            </button>
          ))}
        </section>
      )}

      {openSheet && (
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <MarkdownAnswer content={openSheet.content} rtl={isRtlSubject(openSheet.subject)} />
        </div>
      )}

      <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-700">Nayi sheet banayein</h2>

        <div className="space-y-1">
          <label htmlFor="class" className="block text-sm font-medium text-slate-700">Class</label>
          <select
            id="class" value={studentClass}
            onChange={(e) => setStudentClass(e.target.value as Class)}
            className="w-full rounded-lg border border-slate-300 py-3 px-3 text-slate-800 bg-white"
          >
            {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="subject" className="block text-sm font-medium text-slate-700">Subject</label>
          <select
            id="subject" value={subject}
            onChange={(e) => setSubject(e.target.value as Subject)}
            className="w-full rounded-lg border border-slate-300 py-3 px-3 text-slate-800 bg-white"
          >
            {SUBJECTS.map((s) => (
              <option key={s.id} value={s.id}>{s.label}{s.note ? ` (${s.note})` : ''}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="chapter" className="block text-sm font-medium text-slate-700">
            Chapter (khaali chhodein to poora saal)
          </label>
          <input
            id="chapter" type="text" value={chapter}
            onChange={(e) => setChapter(e.target.value)}
            placeholder="e.g. Differentiation"
            className="w-full rounded-lg border border-slate-300 py-3 px-3 text-slate-800"
          />
        </div>

        <button
          type="button"
          onClick={generate}
          disabled={loading}
          className="w-full rounded-lg bg-primary text-white font-semibold py-3 disabled:opacity-60"
        >
          {loading ? 'Sheet ban rahi hai…' : 'Sheet Banayein aur Save Karein'}
        </button>
      </section>

      {error && (
        <div className="rounded-lg border border-danger/30 bg-red-50 p-4 text-sm text-danger">{error}</div>
      )}

      {fresh && (
        <div className="space-y-2">
          <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-3">
            <p className="text-xs text-emerald-800">
              ✅ Save ho gayi — ab upar ki list mein hamesha milegi.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <MarkdownAnswer content={fresh.content} rtl={isRtlSubject(subject)} />
          </div>
        </div>
      )}

      <p className="text-xs text-slate-500 leading-relaxed">
        Formule aur tareekhen apni kitaab se ek baar milaa lein — AI kabhi ghalti kar sakta hai.
      </p>
    </div>
  )
}
