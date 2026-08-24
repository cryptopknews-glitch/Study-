'use client'

import { useState } from 'react'
import Link from 'next/link'
import MarkdownAnswer from '@/components/MarkdownAnswer'

const SUBJECTS = [
  {
    id: 'computer-science',
    label: 'Computer Science',
    marks: 100,
    papers: 1,
    icon: '💻',
    why: 'BSCS ka Data Structures, Algorithms, OS, DBMS, Networks — sab seedha kaam aayega.',
  },
  {
    id: 'mathematics',
    label: 'Pure / Applied Mathematics',
    marks: 200,
    papers: 2,
    icon: '📐',
    why: '200 marks — sabse zyada wazan. ICS Math aur BSCS ke Calculus, Linear Algebra ki bunyad par.',
  },
  {
    id: 'statistics',
    label: 'Statistics',
    marks: 100,
    papers: 1,
    icon: '📊',
    why: 'BSCS ke Probability & Statistics aur Data Science courses se seedha jurta hai.',
  },
]

const MODES = [
  { id: 'overview', label: 'Ye kya hai' },
  { id: 'topic', label: 'Topic samjhein' },
  { id: 'practice', label: 'Practice' },
  { id: 'plan', label: 'Tayari ka plan' },
] as const

export default function CssOptionalPage() {
  const [subject, setSubject] = useState('computer-science')
  const [mode, setMode] = useState<'overview' | 'topic' | 'practice' | 'plan'>('overview')
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [answer, setAnswer] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const picked = SUBJECTS.find((s) => s.id === subject)!
  const combined = 100 + 200 + 100

  async function submit() {
    setLoading(true)
    setError(null)
    setAnswer(null)
    try {
      const res = await fetch('/api/css-optional', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, mode, question }),
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

  return (
    <div className="px-4 py-8 space-y-6 pb-16">
      <Link href="/css" className="text-sm text-primary font-medium">← CSS</Link>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Optional Subjects</h1>
        <p className="text-slate-600 text-sm">600 marks — FPSC ke groups mein se chunne hote hain</p>
      </div>

      <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-3">
        <p className="text-xs text-emerald-900 leading-relaxed">
          <b>BSCS ka sabse bara faida yahi hai.</b> Computer Science, Mathematics aur Statistics —
          teeno FPSC ke optional groups mein hain, aur teeno aap ki degree se seedhe milte hain.
          Ye teen mila kar <b>{combined} marks</b> ban jate hain, yani 600 ka bara hissa —
          aur parhai wahi jo degree mein pehle se ho rahi hai.
        </p>
      </div>

      <div className="space-y-2">
        {SUBJECTS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSubject(s.id)}
            className={`w-full text-left rounded-lg border p-4 ${
              subject === s.id ? 'border-primary bg-primary/5' : 'border-slate-200 bg-white'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{s.icon}</span>
              <div className="min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <p className="font-medium text-slate-800">{s.label}</p>
                  <span className="text-xs text-slate-500">
                    {s.marks} marks · {s.papers} paper{s.papers > 1 ? 's' : ''}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{s.why}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex gap-2 flex-wrap">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className={`flex-1 min-w-[45%] rounded-lg border py-2.5 text-sm font-medium ${
                mode === m.id ? 'bg-primary text-white border-primary' : 'border-slate-300 text-slate-600'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {mode === 'topic' && (
          <div className="space-y-1">
            <label htmlFor="q" className="block text-sm font-medium text-slate-700">
              Kaunsa topic
            </label>
            <input
              id="q"
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Normalization in databases"
              className="w-full rounded-lg border border-slate-300 py-3 px-3 text-slate-800"
            />
          </div>
        )}

        <button
          type="button"
          onClick={submit}
          disabled={loading || (mode === 'topic' && !question.trim())}
          className="w-full rounded-lg bg-primary text-white font-semibold py-3 disabled:opacity-60"
        >
          {loading ? 'Taiyar ho raha hai…' : `${picked.label} — ${MODES.find((m) => m.id === mode)?.label}`}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-danger/30 bg-red-50 p-4 text-sm text-danger">{error}</div>
      )}

      {answer && (
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <MarkdownAnswer content={answer} />
        </div>
      )}

      <p className="text-xs text-slate-500 leading-relaxed">
        Optional subjects group ke usoolon ke mutabiq chune jate hain aur qawaid badal sakte hain.
        Faisla karne se pehle <b>FPSC ki apni syllabus PDF</b> zaroor dekh lein.
      </p>
    </div>
  )
}
