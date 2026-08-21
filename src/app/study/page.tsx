'use client'

import { Suspense, useState, useRef, type FormEvent, type ComponentProps } from 'react'
import { useSearchParams } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Class, Subject } from '@/lib/types'
import { CLASSES, SUBJECTS, ANSWER_MODES, type AnswerModeId } from '@/lib/constants'

const MATH_SYMBOLS = [
  '+', '−', '×', '÷', '=', '≠', '±',
  '≤', '≥', '≈', '≅',
  '∴', '∵', '⇒', '⊥', '∥', '∈', '∉', '↔',
  '√', '²', '³', '^',
  'π', 'φ', 'θ', 'Δ', '°', '∞',
  '(', ')',
]

const markdownComponents: ComponentProps<typeof ReactMarkdown>['components'] = {
  h1: (props) => <h2 className="text-lg font-bold text-slate-900 mt-4 mb-2 first:mt-0" {...props} />,
  h2: (props) => <h3 className="text-base font-bold text-slate-900 mt-4 mb-2 first:mt-0" {...props} />,
  h3: (props) => <h4 className="text-sm font-bold text-slate-900 mt-3 mb-1 first:mt-0" {...props} />,
  p: (props) => <p className="text-sm text-slate-700 leading-relaxed mb-2" {...props} />,
  strong: (props) => <strong className="font-semibold text-slate-900" {...props} />,
  ul: (props) => <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700 mb-3" {...props} />,
  ol: (props) => <ol className="list-decimal pl-5 space-y-1 text-sm text-slate-700 mb-3" {...props} />,
  li: (props) => <li {...props} />,
  code: (props) => <code className="bg-slate-100 rounded px-1 py-0.5 text-xs font-mono text-slate-800" {...props} />,
  pre: (props) => <pre className="bg-slate-900 text-slate-100 rounded-lg p-3 overflow-x-auto text-xs my-3" {...props} />,
  hr: () => <hr className="my-4 border-slate-200" />,
  table: (props) => (
    <div className="overflow-x-auto mb-3">
      <table className="min-w-full text-sm border border-slate-200" {...props} />
    </div>
  ),
  th: (props) => <th className="border border-slate-200 bg-slate-50 px-2 py-1 text-left font-semibold" {...props} />,
  td: (props) => <td className="border border-slate-200 px-2 py-1" {...props} />,
}

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
  const [savingNote, setSavingNote] = useState(false)
  const [noteSaved, setNoteSaved] = useState(false)
  const [copied, setCopied] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function insertSymbol(symbol: string) {
    const el = textareaRef.current
    if (!el) {
      setQuestion((q) => q + symbol)
      return
    }
    const start = el.selectionStart ?? question.length
    const end = el.selectionEnd ?? question.length
    const newValue = question.slice(0, start) + symbol + question.slice(end)
    setQuestion(newValue)
    requestAnimationFrame(() => {
      el.focus()
      const cursor = start + symbol.length
      el.setSelectionRange(cursor, cursor)
    })
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!question.trim()) return

    setLoading(true)
    setAnswer(null)
    setError(null)
    setCopied(false)

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

  async function handleSaveNote() {
    if (!answer) return
    setSavingNote(true)
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: question.slice(0, 60) || `${selectedSubject} note`,
          content: answer,
          class: selectedClass,
          subject: selectedSubject,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Note save nahi ho saka.')
      } else {
        setNoteSaved(true)
        setTimeout(() => setNoteSaved(false), 2000)
      }
    } catch {
      setError('Network error — note save nahi ho saka.')
    } finally {
      setSavingNote(false)
    }
  }

  function handleNewQuestion() {
    setQuestion('')
    setAnswer(null)
    setError(null)
    setCopied(false)
  }

  async function handleCopy() {
    if (!answer) return
    try {
      await navigator.clipboard.writeText(answer)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard not available, silently ignore
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
            ref={textareaRef}
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={4}
            placeholder="e.g. Explain derivatives"
            className="w-full rounded-lg border border-slate-300 py-3 px-3 text-slate-800"
          />
          <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
            {MATH_SYMBOLS.map((symbol) => (
              <button
                type="button"
                key={symbol}
                onClick={() => insertSymbol(symbol)}
                className="shrink-0 w-9 h-9 flex items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 text-sm font-medium active:bg-slate-100"
              >
                {symbol}
              </button>
            ))}
          </div>
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
          className="w-full rounded-lg bg-primary text-white font-semibold py-3 disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading && (
            <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          )}
          {loading ? 'Solving...' : 'Solve in 10 Minutes'}
        </button>
      </form>

      {error && (
        <div className="rounded-lg border border-danger/30 bg-red-50 p-4 text-sm text-danger">
          {error}
        </div>
      )}

      {answer && (
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              {selectedSubject} · {mode}
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="text-xs font-medium text-primary border border-primary/30 rounded-md px-2 py-1"
              >
                {copied ? 'Copied ✓' : 'Copy'}
              </button>
              <button
                onClick={handleSaveNote}
                disabled={savingNote}
                className="text-xs font-medium text-slate-600 border border-slate-300 rounded-md px-2 py-1 disabled:opacity-50"
              >
                {noteSaved ? 'Saved ✓' : savingNote ? 'Saving...' : 'Save to Notes'}
              </button>
              <button
                onClick={handleNewQuestion}
                className="text-xs font-medium text-slate-600 border border-slate-300 rounded-md px-2 py-1"
              >
                New Question
              </button>
            </div>
          </div>
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {answer}
          </ReactMarkdown>
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
