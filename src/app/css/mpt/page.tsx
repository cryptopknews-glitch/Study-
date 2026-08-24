'use client'

import { useState } from 'react'
import Link from 'next/link'

const SECTIONS = [
  { id: 'english', label: 'English', icon: '📖' },
  { id: 'urdu', label: 'اردو', icon: '📜' },
  { id: 'islamic-studies', label: 'Islamic Studies / Civics', icon: '🕌' },
  { id: 'general-abilities', label: 'General Abilities', icon: '🔢' },
  { id: 'current-affairs', label: 'Current Affairs', icon: '📰' },
  { id: 'pakistan-affairs', label: 'Pakistan Affairs', icon: '🇵🇰' },
  { id: 'everyday-science', label: 'Everyday Science', icon: '🔬' },
]

interface Q {
  question: string
  options: string[]
  correctIndex: number
  section: string
  why: string
}

export default function MptPage() {
  const [section, setSection] = useState('general-abilities')
  const [mixed, setMixed] = useState(false)
  const [count, setCount] = useState(10)
  const [loading, setLoading] = useState(false)
  const [questions, setQuestions] = useState<Q[] | null>(null)
  const [isUrdu, setIsUrdu] = useState(false)
  const [label, setLabel] = useState('')
  const [picked, setPicked] = useState<Record<number, number>>({})
  const [error, setError] = useState<string | null>(null)

  async function generate() {
    setLoading(true)
    setError(null)
    setQuestions(null)
    setPicked({})
    try {
      const res = await fetch('/api/css-mpt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, count, mixed }),
      })
      const data = await res.json()
      if (!res.ok) setError(data.error || 'Test nahi ban saka.')
      else {
        setQuestions(data.questions)
        setIsUrdu(!!data.isUrdu)
        setLabel(data.sectionLabel || '')
      }
    } catch {
      setError('Network error.')
    } finally {
      setLoading(false)
    }
  }

  async function choose(qi: number, oi: number) {
    if (picked[qi] !== undefined || !questions) return
    setPicked((prev) => ({ ...prev, [qi]: oi }))
    const q = questions[qi]
    try {
      await fetch('/api/quiz-attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'css-mpt',
          subject: 'CSS MPT',
          topic: q.section || label,
          question: q.question,
          correct: oi === q.correctIndex,
          chosen: q.options[oi],
          answer: q.options[q.correctIndex],
        }),
      })
    } catch { /* chup chaap */ }
  }

  const done = Object.keys(picked).length
  const right = questions
    ? Object.entries(picked).filter(([qi, oi]) => questions[Number(qi)]?.correctIndex === oi).length
    : 0

  return (
    <div className="px-4 py-8 space-y-6 pb-16">
      <Link href="/css" className="text-sm text-primary font-medium">← CSS</Link>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">MPT — Screening Test</h1>
        <p className="text-slate-600 text-sm">FPSC ka MCQ test — pehla darwaza</p>
      </div>

      <div className="rounded-lg border border-amber-300 bg-amber-50 p-3">
        <p className="text-xs text-amber-900 leading-relaxed">
          <b>MPT pass kiye bagair CSS ka written paper diya hi nahi ja sakta.</b> Iske number 1200 written
          marks mein shamil nahi hote — ye sirf darwaza kholta hai.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMixed(false)}
            className={`flex-1 rounded-lg border py-2.5 text-sm font-medium ${
              !mixed ? 'bg-primary text-white border-primary' : 'border-slate-300 text-slate-600'
            }`}
          >
            Ek Section
          </button>
          <button
            type="button"
            onClick={() => setMixed(true)}
            className={`flex-1 rounded-lg border py-2.5 text-sm font-medium ${
              mixed ? 'bg-primary text-white border-primary' : 'border-slate-300 text-slate-600'
            }`}
          >
            Mixed Test
          </button>
        </div>

        {!mixed && (
          <div className="grid grid-cols-2 gap-2">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSection(s.id)}
                className={`text-left rounded-lg border px-3 py-2.5 text-sm ${
                  section === s.id ? 'border-primary bg-primary/5 text-primary font-medium' : 'border-slate-300 text-slate-700'
                }`}
              >
                <span className="mr-1">{s.icon}</span>{s.label}
              </button>
            ))}
          </div>
        )}

        <div className="space-y-1">
          <label htmlFor="count" className="block text-sm font-medium text-slate-700">
            Kitne sawaal: {count}
          </label>
          <input
            id="count"
            type="range"
            min={5}
            max={30}
            step={5}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <button
          type="button"
          onClick={generate}
          disabled={loading}
          className="w-full rounded-lg bg-primary text-white font-semibold py-3 disabled:opacity-60"
        >
          {loading ? 'Test taiyar ho raha hai…' : 'Test Banayein'}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-danger/30 bg-red-50 p-4 text-sm text-danger">{error}</div>
      )}

      {questions && questions.length > 0 && (
        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-3 flex items-center justify-between">
            <p className="text-sm font-medium text-slate-800">{label}</p>
            <p className="text-sm">
              <span className="font-bold text-success">{right}</span>
              <span className="text-slate-400"> / {done} sahi</span>
            </p>
          </div>

          {questions.map((q, i) => {
            const chosen = picked[i]
            const revealed = chosen !== undefined
            return (
              <div key={i} className="rounded-lg border border-slate-200 bg-white p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-slate-800" dir={isUrdu ? 'rtl' : 'ltr'}>
                    {i + 1}. {q.question}
                  </p>
                  {q.section && <span className="shrink-0 text-[10px] text-slate-400">{q.section}</span>}
                </div>

                <div className="grid grid-cols-1 gap-1.5">
                  {q.options.map((opt, oi) => {
                    const isChosen = chosen === oi
                    const isRight = oi === q.correctIndex
                    let cls = 'border-slate-200 text-slate-700'
                    if (revealed && isRight) cls = 'border-success bg-green-50 text-success font-medium'
                    else if (revealed && isChosen && !isRight) cls = 'border-danger bg-red-50 text-danger font-medium'
                    return (
                      <button
                        key={oi}
                        type="button"
                        onClick={() => choose(i, oi)}
                        disabled={revealed}
                        dir={isUrdu ? 'rtl' : 'ltr'}
                        className={`text-sm text-left rounded-md border px-3 py-1.5 ${cls}`}
                      >
                        {String.fromCharCode(65 + oi)}. {opt}
                        {revealed && isChosen && !isRight ? '  ✗' : ''}
                        {revealed && isRight ? '  ✓' : ''}
                      </button>
                    )
                  })}
                </div>

                {revealed && q.why && (
                  <p className="text-xs text-slate-600 bg-slate-50 rounded-md p-2" dir={isUrdu ? 'rtl' : 'ltr'}>
                    {q.why}
                  </p>
                )}
              </div>
            )
          })}

          <p className="text-xs text-slate-500 text-center leading-relaxed">
            Galat jawab khud <Link href="/mistakes" className="text-primary underline">Mistakes</Link> page par
            chale jate hain.<br />
            Current Affairs ke sawaal purane ho sakte hain — taza maloomat akhbar se lein.
          </p>
        </div>
      )}
    </div>
  )
}
