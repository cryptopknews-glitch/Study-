'use client'

import { useState, useEffect, useRef } from 'react'
import { ENTRY_TESTS, type EntryTest } from '@/lib/entryTests'

interface Q { question: string; options: string[]; correctIndex: number; why?: string }

export default function EntryTestPage() {
  const [test, setTest] = useState<EntryTest>(ENTRY_TESTS[0])
  const [section, setSection] = useState(ENTRY_TESTS[0].sections[0].name)
  const [count, setCount] = useState(10)
  const [timed, setTimed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [questions, setQuestions] = useState<Q[] | null>(null)
  const [picked, setPicked] = useState<Record<number, number>>({})
  const [error, setError] = useState<string | null>(null)
  const [left, setLeft] = useState(0)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => { if (timer.current) clearInterval(timer.current) }
  }, [])

  function pickTest(t: EntryTest) {
    setTest(t)
    setSection(t.sections[0].name)
    setQuestions(null)
    setPicked({})
    if (timer.current) clearInterval(timer.current)
    setLeft(0)
  }

  async function generate() {
    setLoading(true); setError(null); setQuestions(null); setPicked({})
    if (timer.current) clearInterval(timer.current)
    try {
      const res = await fetch('/api/entry-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testName: test.name, section, count }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Test nahi ban saka.'); return }
      setQuestions(data.questions)
      if (timed) {
        const perQ = Math.round((test.minutes * 60) / test.totalMcqs)
        let t = perQ * count
        setLeft(t)
        timer.current = setInterval(() => {
          t -= 1
          setLeft(t)
          if (t <= 0 && timer.current) clearInterval(timer.current)
        }, 1000)
      }
    } catch {
      setError('Network error.')
    } finally {
      setLoading(false)
    }
  }

  async function choose(qi: number, oi: number) {
    if (picked[qi] !== undefined || !questions) return
    if (timed && left <= 0) return
    setPicked((p) => ({ ...p, [qi]: oi }))
    const q = questions[qi]
    try {
      await fetch('/api/quiz-attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'entry-test',
          subject: test.name,
          topic: section,
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
  const mm = String(Math.floor(Math.max(0, left) / 60)).padStart(2, '0')
  const ss = String(Math.max(0, left) % 60).padStart(2, '0')

  const fitColor =
    test.fitsHer === 'yes' ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
    : test.fitsHer === 'check' ? 'border-amber-300 bg-amber-50 text-amber-900'
    : 'border-red-300 bg-red-50 text-red-900'

  return (
    <div className="px-4 py-8 space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Entry Test</h1>
        <p className="text-slate-600 text-sm">
          ICS ke baad BSCS mein admission ke liye — abhi se taiyar
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-3">
        <p className="text-xs text-slate-600 leading-relaxed">
          <b>Analytical / IQ wale sawaal ICS syllabus mein hote hi nahi</b> — aksar bacche yahin phanste hain.
          Isi liye ye hisse pehle se yahan maujood hain.
        </p>
      </div>

      <div className="space-y-2">
        {ENTRY_TESTS.map((t) => (
          <button
            key={t.slug}
            type="button"
            onClick={() => pickTest(t)}
            className={`w-full text-left rounded-lg border p-3 ${
              test.slug === t.slug ? 'border-primary bg-primary/5' : 'border-slate-200 bg-white'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-xl shrink-0">{t.icon}</span>
              <div className="min-w-0">
                <p className="font-medium text-slate-800 text-sm">{t.name}</p>
                <p className="text-[11px] text-slate-500">
                  {t.totalMcqs} MCQs · {t.minutes} min · {t.negativeMarking ? 'negative marking hai' : 'negative marking nahi'}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className={`rounded-lg border p-3 ${fitColor}`}>
        <p className="text-xs leading-relaxed">
          <b>{test.full}</b><br />{test.fitNote}
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-slate-700">Section chunein</p>
        <div className="grid grid-cols-1 gap-2">
          {test.sections.map((s) => (
            <button
              key={s.name}
              type="button"
              onClick={() => setSection(s.name)}
              className={`text-left rounded-lg border px-3 py-2.5 ${
                section === s.name ? 'border-primary bg-primary/5' : 'border-slate-300'
              }`}
            >
              <div className="flex justify-between gap-2">
                <span className="text-sm text-slate-800">{s.name}</span>
                <span className="text-xs text-slate-500 shrink-0">{s.count} MCQs</span>
              </div>
              {s.note && <p className="text-[11px] text-amber-700 mt-0.5">{s.note}</p>}
            </button>
          ))}
        </div>

        <div className="space-y-1">
          <label htmlFor="count" className="block text-sm font-medium text-slate-700">
            Kitne sawaal: {count}
          </label>
          <input id="count" type="range" min={5} max={25} step={5}
            value={count} onChange={(e) => setCount(Number(e.target.value))} className="w-full" />
        </div>

        <label className="flex items-center gap-2.5 text-sm text-slate-700">
          <input type="checkbox" checked={timed} onChange={(e) => setTimed(e.target.checked)}
            className="w-5 h-5 accent-blue-600" />
          Timer lagayein (asal test ki raftar par)
        </label>

        <button type="button" onClick={generate} disabled={loading}
          className="w-full rounded-lg bg-primary text-white font-semibold py-3 disabled:opacity-60">
          {loading ? 'Test taiyar ho raha hai…' : 'Practice Test Banayein'}
        </button>
      </div>

      {error && <div className="rounded-lg border border-danger/30 bg-red-50 p-4 text-sm text-danger">{error}</div>}

      {questions && questions.length > 0 && (
        <div className="space-y-3">
          <div className="rounded-lg border border-slate-200 bg-white p-3 flex items-center justify-between sticky top-0 z-10">
            <p className="text-sm font-medium text-slate-800">{section}</p>
            <div className="flex items-center gap-3">
              {timed && (
                <span className={`text-sm font-bold ${left <= 30 ? 'text-danger' : 'text-slate-700'}`}>
                  {mm}:{ss}
                </span>
              )}
              <span className="text-sm">
                <span className="font-bold text-success">{right}</span>
                <span className="text-slate-400"> / {done}</span>
              </span>
            </div>
          </div>

          {timed && left <= 0 && (
            <div className="rounded-lg border border-danger/30 bg-red-50 p-3 text-sm text-danger">
              Waqt khatam. Asal test mein bhi itna hi waqt milta hai — raftar barhani hogi.
            </div>
          )}

          {questions.map((q, i) => {
            const chosen = picked[i]
            const revealed = chosen !== undefined
            return (
              <div key={i} className="rounded-lg border border-slate-200 bg-white p-4 space-y-2">
                <p className="text-sm text-slate-800">{i + 1}. {q.question}</p>
                <div className="grid grid-cols-1 gap-1.5">
                  {q.options.map((opt, oi) => {
                    const isChosen = chosen === oi
                    const isRight = oi === q.correctIndex
                    let cls = 'border-slate-200 text-slate-700'
                    if (revealed && isRight) cls = 'border-success bg-green-50 text-success font-medium'
                    else if (revealed && isChosen && !isRight) cls = 'border-danger bg-red-50 text-danger font-medium'
                    return (
                      <button key={oi} type="button" onClick={() => choose(i, oi)} disabled={revealed}
                        className={`text-sm text-left rounded-md border px-3 py-1.5 ${cls}`}>
                        {String.fromCharCode(65 + oi)}. {opt}
                        {revealed && isChosen && !isRight ? '  ✗' : ''}
                        {revealed && isRight ? '  ✓' : ''}
                      </button>
                    )
                  })}
                </div>
                {revealed && q.why && (
                  <p className="text-xs text-slate-600 bg-slate-50 rounded-md p-2">{q.why}</p>
                )}
              </div>
            )
          })}
        </div>
      )}

      <p className="text-xs text-slate-500 leading-relaxed">
        Har university apna pattern har saal badalti hai. Apply karne se pehle us university ki apni
        admission site se tasdeeq zaroor karein.
      </p>
    </div>
  )
}
