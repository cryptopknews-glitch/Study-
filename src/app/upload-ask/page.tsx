'use client'

import { useState, useRef, type FormEvent, type ChangeEvent } from 'react'
import { CLASSES, SUBJECTS } from '@/lib/constants'
import type { Class, Subject } from '@/lib/types'

const MATH_SYMBOLS = [
  '+', '−', '×', '÷', '=', '≠', '±',
  '≤', '≥', '≈', '≅',
  '∴', '∵', '⇒', '⊥', '∥', '∈', '∉', '↔',
  '√', '²', '³', '^',
  'π', 'φ', 'θ', 'Δ', '°', '∞',
  '(', ')',
]

const MAX_TOTAL_BYTES = 4 * 1024 * 1024

export default function UploadAskPage() {
  const [studentClass, setStudentClass] = useState<Class>('Class 11')
  const [subject, setSubject] = useState<Subject>('Mathematics')
  const [files, setFiles] = useState<File[]>([])
  const [chapter, setChapter] = useState('')
  const [exercise, setExercise] = useState('')
  const [qNo, setQNo] = useState('')
  const [part, setPart] = useState('')
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [answer, setAnswer] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
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

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    setFiles(e.target.files ? Array.from(e.target.files) : [])
  }

  function handleQuickFill() {
    if (!chapter && !exercise && !qNo) return
    let text = 'Attached screenshot(s)/PDF mein'
    if (chapter) text += ` Chapter ${chapter}`
    if (exercise) text += `, Exercise ${exercise}`
    if (qNo) {
      text += ` ka Question ${qNo}`
      if (part) text += ` part (${part})`
      text += ' solve karein, poora working/steps ke sath.'
    } else {
      text += ' ka poora summary aur important points de dein.'
    }
    setQuestion(text)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setAnswer(null)

    if (files.length === 0) {
      setError('Pehle PDF ya screenshot(s) select karein.')
      return
    }
    if (!question.trim()) {
      setError('Pehle apna sawal likhein.')
      return
    }
    const totalSize = files.reduce((sum, f) => sum + f.size, 0)
    if (totalSize > MAX_TOTAL_BYTES) {
      setError('Files ka total size bahut bara hai (max 4MB combined).')
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('question', question)
      formData.append('studentClass', studentClass)
      formData.append('subject', subject)
      files.forEach((f) => formData.append('files', f))

      let res: Response
      try {
        res = await fetch('/api/upload-ask', { method: 'POST', body: formData })
      } catch (e) {
        setError('Request bhej hi nahi saki: ' + (e instanceof Error ? e.message : String(e)))
        setLoading(false)
        return
      }

      let data: { answer?: string; error?: string }
      try {
        data = await res.json()
      } catch {
        const rawText = await res.text().catch(() => '')
        setError(`Server ne JSON nahi diya (status ${res.status}): ${rawText.slice(0, 200)}`)
        setLoading(false)
        return
      }

      if (!res.ok) {
        setError(data.error || `Kuch masla ho gaya (status ${res.status}).`)
      } else {
        setAnswer(data.answer || '')
      }
    } catch (e) {
      setError('Anjaan error: ' + (e instanceof Error ? e.message : String(e)))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-4 py-8 space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Upload &amp; Ask</h1>
        <p className="text-slate-600 text-sm">
          PDF ya screenshot(s) upload karein, seedha sawal poochein — file kahin save nahi hoti,
          sirf isi sawal ke liye AI ko dikhai jati hai.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label htmlFor="uaClass" className="block text-sm font-medium text-slate-700">
              Class
            </label>
            <select
              id="uaClass"
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
            <label htmlFor="uaSubject" className="block text-sm font-medium text-slate-700">
              Subject
            </label>
            <select
              id="uaSubject"
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
        </div>

        <div className="space-y-1">
          <label htmlFor="uaFiles" className="block text-sm font-medium text-slate-700">
            PDF ya Screenshots (ek ya zyada select kar sakte hain)
          </label>
          <input
            id="uaFiles"
            type="file"
            accept="application/pdf,image/*"
            multiple
            onChange={handleFileChange}
            className="w-full rounded-lg border border-slate-300 py-3 px-3 text-slate-800 bg-white text-sm"
          />
          {files.length > 0 && (
            <p className="text-xs text-slate-500">
              📎 {files.length} file(s): {files.map((f) => f.name).join(', ')}
            </p>
          )}
          <p className="text-xs text-slate-400">Max 4MB combined. Bade PDF ke liye &quot;Upload&quot; tool use karein.</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label htmlFor="uaChapter" className="block text-sm font-medium text-slate-700">
              Chapter #
            </label>
            <input
              id="uaChapter"
              type="text"
              value={chapter}
              onChange={(e) => setChapter(e.target.value)}
              placeholder="e.g. 1"
              className="w-full rounded-lg border border-slate-300 py-3 px-3 text-slate-800"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="uaExercise" className="block text-sm font-medium text-slate-700">
              Exercise #
            </label>
            <input
              id="uaExercise"
              type="text"
              value={exercise}
              onChange={(e) => setExercise(e.target.value)}
              placeholder="e.g. 1.1"
              className="w-full rounded-lg border border-slate-300 py-3 px-3 text-slate-800"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label htmlFor="uaQNo" className="block text-sm font-medium text-slate-700">
              Question #
            </label>
            <input
              id="uaQNo"
              type="text"
              value={qNo}
              onChange={(e) => setQNo(e.target.value)}
              placeholder="e.g. 4"
              className="w-full rounded-lg border border-slate-300 py-3 px-3 text-slate-800"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="uaPart" className="block text-sm font-medium text-slate-700">
              Part (agar ho)
            </label>
            <input
              id="uaPart"
              type="text"
              value={part}
              onChange={(e) => setPart(e.target.value)}
              placeholder="e.g. iii"
              className="w-full rounded-lg border border-slate-300 py-3 px-3 text-slate-800"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleQuickFill}
          className="w-full rounded-lg bg-slate-800 text-white font-semibold py-2.5"
        >
          ⚡ Quick Fill
        </button>

        <div className="space-y-1">
          <label htmlFor="uaQuestion" className="block text-sm font-medium text-slate-700">
            Sawal
          </label>
          <textarea
            ref={textareaRef}
            id="uaQuestion"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={4}
            placeholder="e.g. Chapter 3 ka summary de dein"
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

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-primary text-white font-semibold py-3 disabled:opacity-60"
        >
          {loading ? 'Solving...' : 'Ask AI About These Files'}
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
