'use client'

import { useState, type FormEvent } from 'react'
import { CLASSES, SUBJECTS } from '@/lib/constants'
import { isRtlSubject, type Class, type Subject } from '@/lib/types'
import AnswerGrader from '@/components/AnswerGrader'

interface Q { question: string; chapter?: string }
interface Mcq { question: string; options: string[]; correctIndex: number; chapter?: string }
interface Section { heading: string; marks: number; questions: string[]; note?: string }

interface Paper {
  title: string
  totalMarks: number
  timeAllowed?: string
  instructions?: string[]
  mcqs?: Mcq[]
  shortQuestions?: Q[]
  longQuestions?: Q[]
  sections?: Section[]
  modelAnswers?: { shortAnswers?: string[]; longOutlines?: string[]; sectionOutlines?: string[] }
  frequency?: string[]
}

interface Pattern {
  mcq: number
  shortGiven: number
  shortAttempt: number
  shortMarks: number
  longGiven: number
  longAttempt: number
  longMarks: number
}

export default function PastPapersPage() {
  const [studentClass, setStudentClass] = useState<Class>('Class 11')
  const [subject, setSubject] = useState<Subject>('Mathematics')
  const [chapter, setChapter] = useState('')
  const [style, setStyle] = useState<'board' | 'chapter'>('board')
  const [loading, setLoading] = useState(false)
  const [paper, setPaper] = useState<Paper | null>(null)
  const [pattern, setPattern] = useState<Pattern | null>(null)
  const [total, setTotal] = useState(0)
  const [isLanguage, setIsLanguage] = useState(false)
  const [showAnswers, setShowAnswers] = useState(false)
  const [picked, setPicked] = useState<Record<number, number>>({})
  const [error, setError] = useState<string | null>(null)

  const rtl = isRtlSubject(subject)

  async function generate(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setPaper(null)
    setShowAnswers(false)
    setPicked({})
    try {
      const res = await fetch('/api/past-papers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentClass, subject, chapter, style }),
      })
      const data = await res.json()
      if (!res.ok) setError(data.error || 'Paper generate nahi ho saka.')
      else {
        setPaper(data.paper)
        setPattern(data.pattern ?? null)
        setTotal(data.total ?? data.paper?.totalMarks ?? 0)
        setIsLanguage(!!data.isLanguage)
      }
    } catch {
      setError('Network error. Dobara koshish karein.')
    } finally {
      setLoading(false)
    }
  }

  async function chooseMcq(qi: number, oi: number) {
    if (showAnswers || picked[qi] !== undefined || !paper?.mcqs) return
    setPicked((prev) => ({ ...prev, [qi]: oi }))
    const q = paper.mcqs[qi]
    try {
      await fetch('/api/quiz-attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'past-paper',
          studentClass,
          subject,
          topic: q.chapter || chapter || null,
          question: q.question,
          correct: oi === q.correctIndex,
          chosen: q.options[oi],
          answer: q.options[q.correctIndex],
        }),
      })
    } catch { /* chup chaap */ }
  }

  return (
    <div className="px-4 py-8 space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Past Papers</h1>
        <p className="text-slate-600 text-sm">
          Punjab Board ke asal pattern ka paper — pairing scheme ke saath
        </p>
      </div>

      <form onSubmit={generate} className="space-y-4">
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
          <p className="block text-sm font-medium text-slate-700">Paper ki qism</p>
          <div className="flex gap-2">
            <button
              type="button" onClick={() => setStyle('board')}
              className={`flex-1 rounded-lg border py-2.5 text-sm font-medium ${
                style === 'board' ? 'bg-primary text-white border-primary' : 'border-slate-300 text-slate-600'
              }`}
            >
              Poora Board Paper
            </button>
            <button
              type="button" onClick={() => setStyle('chapter')}
              className={`flex-1 rounded-lg border py-2.5 text-sm font-medium ${
                style === 'chapter' ? 'bg-primary text-white border-primary' : 'border-slate-300 text-slate-600'
              }`}
            >
              Chapter Test
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="chapter" className="block text-sm font-medium text-slate-700">
            Chapter {style === 'chapter' ? '(zaroori)' : '(optional)'}
          </label>
          <input
            id="chapter" type="text" value={chapter}
            onChange={(e) => setChapter(e.target.value)}
            placeholder="e.g. Matrices and Determinants"
            className="w-full rounded-lg border border-slate-300 py-3 px-3 text-slate-800"
          />
        </div>

        <button
          type="submit"
          disabled={loading || (style === 'chapter' && !chapter.trim())}
          className="w-full rounded-lg bg-primary text-white font-semibold py-3 disabled:opacity-60"
        >
          {loading ? 'Paper taiyar ho raha hai… (thora waqt lagega)' : 'Paper Banayein'}
        </button>
      </form>

      {error && (
        <div className="rounded-lg border border-danger/30 bg-red-50 p-4 text-sm text-danger">{error}</div>
      )}

      {paper && (
        <div className="space-y-6">
          <div className="rounded-lg border border-slate-200 bg-white p-4 text-center">
            <p className="font-bold text-slate-900" dir={rtl ? 'rtl' : 'ltr'}>{paper.title}</p>
            <p className="text-xs text-slate-500 mt-1">
              Total Marks: {isLanguage ? paper.totalMarks : total}
              {paper.timeAllowed ? ' · ' + paper.timeAllowed : ''}
            </p>
          </div>

          {paper.instructions && paper.instructions.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4" dir={rtl ? 'rtl' : 'ltr'}>
                {paper.instructions.map((x, i) => <li key={i}>{x}</li>)}
              </ul>
            </div>
          )}

          {/* Language paper: sections */}
          {isLanguage && paper.sections && paper.sections.map((sec, si) => (
            <section key={si} className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide" dir={rtl ? 'rtl' : 'ltr'}>
                {sec.heading} {sec.marks ? `(${sec.marks} marks)` : ''}
              </h2>
              {sec.note && <p className="text-xs text-slate-500 -mt-1" dir={rtl ? 'rtl' : 'ltr'}>{sec.note}</p>}
              {sec.questions.map((q, qi) => (
                <div key={qi} className="rounded-lg border border-slate-200 bg-white p-4 space-y-2">
                  <p className="text-sm text-slate-800" dir={rtl ? 'rtl' : 'ltr'} style={rtl ? { lineHeight: 2 } : undefined}>
                    {qi + 1}. {q}
                  </p>
                  <AnswerGrader
                    question={q} maxMarks={Math.max(2, Math.round((sec.marks || 10) / Math.max(1, sec.questions.length)))}
                    studentClass={studentClass} subject={subject} chapter={chapter} source="past-paper"
                  />
                </div>
              ))}
              {showAnswers && paper.modelAnswers?.sectionOutlines?.[si] && (
                <p className="text-sm text-success bg-green-50 rounded-md p-3" dir={rtl ? 'rtl' : 'ltr'}>
                  {paper.modelAnswers.sectionOutlines[si]}
                </p>
              )}
            </section>
          ))}

          {/* MCQs */}
          {!isLanguage && paper.mcqs && paper.mcqs.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                Objective — {paper.mcqs.length} MCQs (1 mark each)
              </h2>
              {paper.mcqs.map((q, i) => (
                <div key={i} className="rounded-lg border border-slate-200 bg-white p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-slate-800" dir={rtl ? 'rtl' : 'ltr'}>{i + 1}. {q.question}</p>
                    {q.chapter && <span className="shrink-0 text-[10px] text-slate-400">{q.chapter}</span>}
                  </div>
                  <div className="grid grid-cols-1 gap-1.5">
                    {q.options.map((opt, oi) => {
                      const chosen = picked[i]
                      const isChosen = chosen === oi
                      const isRight = oi === q.correctIndex
                      const reveal = showAnswers || chosen !== undefined
                      let cls = 'border-slate-200 text-slate-700'
                      if (reveal && isRight) cls = 'border-success bg-green-50 text-success font-medium'
                      else if (reveal && isChosen && !isRight) cls = 'border-danger bg-red-50 text-danger font-medium'
                      return (
                        <button
                          key={oi} type="button" onClick={() => chooseMcq(i, oi)} disabled={reveal}
                          className={`text-sm text-left rounded-md border px-3 py-1.5 ${cls}`}
                          dir={rtl ? 'rtl' : 'ltr'}
                        >
                          {String.fromCharCode(65 + oi)}. {opt}
                          {reveal && isChosen && !isRight ? '  ✗' : ''}
                          {reveal && isRight ? '  ✓' : ''}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* Short */}
          {!isLanguage && paper.shortQuestions && paper.shortQuestions.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                Section I — Short Questions
              </h2>
              {pattern && (
                <p className="text-xs text-slate-500 -mt-1">
                  {pattern.shortGiven} mein se koi {pattern.shortAttempt} karein · {pattern.shortMarks} marks each
                </p>
              )}
              {paper.shortQuestions.map((q, i) => (
                <div key={i} className="rounded-lg border border-slate-200 bg-white p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-slate-800" dir={rtl ? 'rtl' : 'ltr'}>{i + 1}. {q.question}</p>
                    {q.chapter && <span className="shrink-0 text-[10px] text-slate-400">{q.chapter}</span>}
                  </div>
                  {showAnswers && paper.modelAnswers?.shortAnswers?.[i] && (
                    <p className="text-sm text-success bg-green-50 rounded-md p-2" dir={rtl ? 'rtl' : 'ltr'}>
                      {paper.modelAnswers.shortAnswers[i]}
                    </p>
                  )}
                  <AnswerGrader
                    question={q.question} maxMarks={pattern?.shortMarks ?? 2}
                    studentClass={studentClass} subject={subject} chapter={q.chapter || chapter}
                    source="past-paper" modelAnswer={paper.modelAnswers?.shortAnswers?.[i] ?? null}
                  />
                </div>
              ))}
            </section>
          )}

          {/* Long */}
          {!isLanguage && paper.longQuestions && paper.longQuestions.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                Section II — Long Questions
              </h2>
              {pattern && (
                <p className="text-xs text-slate-500 -mt-1">
                  {pattern.longGiven} mein se koi {pattern.longAttempt} karein · {pattern.longMarks} marks each
                </p>
              )}
              {paper.longQuestions.map((q, i) => (
                <div key={i} className="rounded-lg border border-slate-200 bg-white p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-slate-800" dir={rtl ? 'rtl' : 'ltr'}>{i + 1}. {q.question}</p>
                    {q.chapter && <span className="shrink-0 text-[10px] text-slate-400">{q.chapter}</span>}
                  </div>
                  {showAnswers && paper.modelAnswers?.longOutlines?.[i] && (
                    <p className="text-sm text-success bg-green-50 rounded-md p-2" dir={rtl ? 'rtl' : 'ltr'}>
                      {paper.modelAnswers.longOutlines[i]}
                    </p>
                  )}
                  <AnswerGrader
                    question={q.question} maxMarks={pattern?.longMarks ?? 8}
                    studentClass={studentClass} subject={subject} chapter={q.chapter || chapter}
                    source="past-paper" modelAnswer={paper.modelAnswers?.longOutlines?.[i] ?? null}
                  />
                </div>
              ))}
            </section>
          )}

          {paper.frequency && paper.frequency.length > 0 && (
            <section className="rounded-lg border border-amber-300 bg-amber-50 p-4">
              <h2 className="text-sm font-semibold text-amber-900 mb-2">Aksar aane wale topics</h2>
              <ul className="text-xs text-amber-900 space-y-1 list-disc pl-4" dir={rtl ? 'rtl' : 'ltr'}>
                {paper.frequency.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            </section>
          )}

          <button
            onClick={() => setShowAnswers((v) => !v)}
            className="w-full rounded-lg bg-slate-800 text-white font-semibold py-3"
          >
            {showAnswers ? 'Answers Chhupayein' : 'Answers / Marking Scheme Dikhayein'}
          </button>

          <p className="text-xs text-slate-500 text-center leading-relaxed">
            Ye paper AI ne banaya hai, board ka asal paper nahi. Pattern aur pairing scheme har saal badalte hain —
            imtihan se pehle apne board ke <b>official notification</b> se tasdeeq zaroor karein.
          </p>
        </div>
      )}
    </div>
  )
}
