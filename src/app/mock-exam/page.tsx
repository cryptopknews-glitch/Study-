'use client'

import { useState, type FormEvent } from 'react'
import { CLASSES, SUBJECTS } from '@/lib/constants'
import type { Class, Subject } from '@/lib/types'

interface MockPaper {
  title: string
  totalMarks: number
  mcqs: { question: string; options: string[]; correctIndex: number }[]
  shortQuestions: string[]
  longQuestions: string[]
  modelAnswers: {
    shortAnswers: string[]
    longAnswerHints: string[]
  }
}

export default function MockExamPage() {
  const [studentClass, setStudentClass] = useState<Class>('Class 11')
  const [subject, setSubject] = useState<Subject>('Mathematics')
  const [chapter, setChapter] = useState('')
  const [loading, setLoading] = useState(false)
  const [paper, setPaper] = useState<MockPaper | null>(null)
  const [showAnswers, setShowAnswers] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGenerate(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setPaper(null)
    setShowAnswers(false)

    try {
      const res = await fetch('/api/mock-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentClass, subject, chapter }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Paper generate nahi ho saka.')
      } else {
        setPaper(data.paper)
      }
    } catch {
      setError('Network error. Dobara koshish karein.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-4 py-8 space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mock Exam</h1>
        <p className="text-slate-600 text-sm">
          Board-exam-style model paper — MCQs, Short aur Long Questions, marking scheme ke sath
        </p>
      </div>

      <form onSubmit={handleGenerate} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="class" className="block text-sm font-medium text-slate-700">
            Class
          </label>
          <select
            id="class"
            value={studentClass}
            onChange={(e) => setStudentClass(e.target.value as Class)}
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
            value={subject}
            onChange={(e) => setSubject(e.target.value as Subject)}
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
          <label htmlFor="chapter" className="block text-sm font-medium text-slate-700">
            Chapter Focus (optional)
          </label>
          <input
            id="chapter"
            type="text"
            value={chapter}
            onChange={(e) => setChapter(e.target.value)}
            placeholder="e.g. Trigonometry — khaali chhodein poore syllabus ke liye"
            className="w-full rounded-lg border border-slate-300 py-3 px-3 text-slate-800"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-primary text-white font-semibold py-3 disabled:opacity-60"
        >
          {loading ? 'Paper taiyar ho raha hai...' : 'Generate Mock Exam'}
        </button>
      </form>

      {error && (
        <div className="rounded-lg border border-danger/30 bg-red-50 p-4 text-sm text-danger">
          {error}
        </div>
      )}

      {paper && (
        <div className="space-y-6">
          <div className="rounded-lg border border-slate-200 bg-white p-4 text-center">
            <p className="font-bold text-slate-900">{paper.title}</p>
            <p className="text-xs text-slate-500 mt-1">Total Marks: {paper.totalMarks}</p>
          </div>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
              Section A — MCQs (1 mark each)
            </h2>
            {paper.mcqs.map((q, i) => (
              <div key={i} className="rounded-lg border border-slate-200 bg-white p-4 space-y-2">
                <p className="text-sm text-slate-800">
                  {i + 1}. {q.question}
                </p>
                <div className="grid grid-cols-1 gap-1.5">
                  {q.options.map((opt, oi) => (
                    <div
                      key={oi}
                      className={`text-sm rounded-md border px-3 py-1.5 ${
                        showAnswers && oi === q.correctIndex
                          ? 'border-success bg-green-50 text-success font-medium'
                          : 'border-slate-200 text-slate-700'
                      }`}
                    >
                      {String.fromCharCode(65 + oi)}. {opt}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
              Section B — Short Questions (attempt any 5, 3 marks each)
            </h2>
            {paper.shortQuestions.map((q, i) => (
              <div key={i} className="rounded-lg border border-slate-200 bg-white p-4 space-y-2">
                <p className="text-sm text-slate-800">
                  {i + 1}. {q}
                </p>
                {showAnswers && (
                  <p className="text-sm text-success bg-green-50 rounded-md p-2">
                    {paper.modelAnswers.shortAnswers[i]}
                  </p>
                )}
              </div>
            ))}
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
              Section C — Long Questions (attempt any 2, 12 marks each)
            </h2>
            {paper.longQuestions.map((q, i) => (
              <div key={i} className="rounded-lg border border-slate-200 bg-white p-4 space-y-2">
                <p className="text-sm text-slate-800">
                  {i + 1}. {q}
                </p>
                {showAnswers && (
                  <p className="text-sm text-success bg-green-50 rounded-md p-2">
                    {paper.modelAnswers.longAnswerHints[i]}
                  </p>
                )}
              </div>
            ))}
          </section>

          <button
            onClick={() => setShowAnswers((v) => !v)}
            className="w-full rounded-lg bg-slate-800 text-white font-semibold py-3"
          >
            {showAnswers ? 'Hide Answers / Marking Scheme' : 'Show Answers / Marking Scheme'}
          </button>
        </div>
      )}
    </div>
  )
}
