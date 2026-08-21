'use client'

import { useState, type FormEvent } from 'react'
import { CLASSES, SUBJECTS } from '@/lib/constants'
import type { Class, Subject } from '@/lib/types'

export default function UploadPage() {
  const [studentClass, setStudentClass] = useState<Class>('Class 11')
  const [subject, setSubject] = useState<Subject>('Mathematics')
  const [chapter, setChapter] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!file) {
      setError('Pehle PDF file select karein.')
      return
    }
    if (file.size > 4 * 1024 * 1024) {
      setError('PDF bahut badi hai (4MB se zyada). Chhoti file ya kam pages wali PDF try karein.')
      return
    }

    setLoading(true)
    setMessage(null)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('class', studentClass)
    formData.append('subject', subject)
    formData.append('chapter', chapter)
    formData.append('title', file.name)

    try {
      const res = await fetch('/api/upload-pdf', { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Upload fail ho gaya.')
      } else {
        setMessage(`Upload ho gaya! ${data.chunksSaved} sections save hue. Ab "Study" page par isi Class/Subject se sawal poochein.`)
        setFile(null)
        setChapter('')
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
        <h1 className="text-2xl font-bold text-slate-900">Upload Study Material</h1>
        <p className="text-slate-600 text-sm">
          Textbook, notes, ya chapter PDF upload karein — AI inhe answers ke liye use karega
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
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
            Chapter (optional)
          </label>
          <input
            id="chapter"
            type="text"
            value={chapter}
            onChange={(e) => setChapter(e.target.value)}
            placeholder="e.g. Chapter 3 - Differentiation"
            className="w-full rounded-lg border border-slate-300 py-3 px-3 text-slate-800"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="file" className="block text-sm font-medium text-slate-700">
            PDF File
          </label>
          <input
            id="file"
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full rounded-lg border border-slate-300 py-3 px-3 text-slate-800 bg-white text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-primary text-white font-semibold py-3 disabled:opacity-60"
        >
          {loading ? 'Uploading...' : 'Upload PDF'}
        </button>
      </form>

      {error && (
        <div className="rounded-lg border border-danger/30 bg-red-50 p-4 text-sm text-danger">
          {error}
        </div>
      )}
      {message && (
        <div className="rounded-lg border border-success/30 bg-green-50 p-4 text-sm text-success">
          {message}
        </div>
      )}
    </div>
  )
}
