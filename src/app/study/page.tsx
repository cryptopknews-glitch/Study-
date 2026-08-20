'use client'

import { Suspense, useState, type FormEvent } from 'react'
import { useSearchParams } from 'next/navigation'
import type { Class, Subject } from '@/lib/types'
import { CLASSES, SUBJECTS, ANSWER_MODES, type AnswerModeId } from '@/lib/constants'

function StudyForm() {
  const searchParams = useSearchParams()
  const presetSubject = searchParams.get('subject') as Subject | null
  const presetMode = searchParams.get('mode') as AnswerModeId | null

  const [selectedClass, setSelectedClass] = useState<Class>('Class 11')
  const [selectedSubject, setSelectedSubject] = useState<Subject>(
    presetSubject ?? 'Mathematics'
  )
  const [mode, setMode] = useState<AnswerModeId>(presetMode ?? 'explain')
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [answer, setAnswer] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!question.trim()) return

    setLoading(true)
    setAnswer(null)
    setError(null)

    try {
      const res = await fetch('/api/study', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentClass: selectedClass,
          subject: selectedSubject,
          question,
          mode,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Kuch masla ho gaya, dobara koshish karein.')
      } else {
        setAnswer(data.answer)
      }
    } catch {
      setError('Network error. Internet check karein aur dobara koshish karein.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-4 py-8 space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Study in 10 Minutes</h1>
        <p className="text-slate-600 text-sm">Ask a question, get a fast, clear answer</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1">
          <label htmlFor="class" className="block text-sm font-medium text-slate-700">
            Class
          </label>
          <select
            id="class"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value as Class)}
            className="w-full rounded-lg border border-slate-300 py-3 px-3 text-slate-800 bg-white"
          >
            {CLASSES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="subject" className="block text-sm font-medium text-slate-700">
            Subject
          </label>
          <select
            id="subject"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value as Subject)}
            className="w-full rounded-lg border border-slate-300 py-3 px-3 text-slate-800 bg-white"
          >
            {SUBJECTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="question" className="block text-sm font-medium text-slate-700">
            Question
          </label>
          <textarea
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={4}
            placeholder="e.g. Explain derivatives"
            className="w-full rounded-lg border border-slate-300 py-3 px-3 text-slate-800"
          />
        </div>

        <div className="space-y-1">
          <p className="block text-sm font-medium text-slate-700">Answer Mode</p>
          <div className="grid grid-cols-3 gap-2">
            {ANSWER_MODES.map((m) => (
              <button
                type="button"
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`rounded-lg py-2 text-sm font-medium border ${
                  mode === m.id
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-slate-700 border-slate-300'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-primary text-white font-semibold py-3 disabled:opacity-60"
        >
          {loading ? 'Solving...' : 'Solve in 10 Minutes'}
        </button>
      </form>

      {error && (
        <div className="rounded-lg border border-danger/30 bg-red-50 p-4 text-sm text-danger">
          {error}
        </div>
      )}

      {answer && (
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  )
}

export default function StudyPage() {
  return (
    <Suspense fallback={<div className="px-4 py-8 text-slate-500">Loading...</div>}>
      <StudyForm />
    </Suspense>
  )
}
