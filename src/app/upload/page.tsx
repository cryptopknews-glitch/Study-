'use client'

import { useState, type FormEvent } from 'react'
import { CLASSES, SUBJECTS } from '@/lib/constants'
import type { Class, Subject } from '@/lib/types'
import { getBrowserSupabaseClient } from '@/lib/supabaseClient'

const MAX_PDF_BYTES = 15 * 1024 * 1024

export default function UploadPage() {
  const [studentClass, setStudentClass] = useState<Class>('Class 11')
  const [subject, setSubject] = useState<Subject>('Mathematics')
  const [chapter, setChapter] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!file) {
      setError('Pehle PDF file select karein.')
      return
    }
    if (file.size > MAX_PDF_BYTES) {
      setError('PDF bahut badi hai (15MB se zyada). Ise chapters mein tod kar upload karein.')
      return
    }

    setLoading(true)
    setMessage(null)
    setError(null)

    try {
      setStatus('Upload URL taiyar ho rahi hai...')
      const urlRes = await fetch('/api/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name }),
      })
      const urlData = await urlRes.json()
      if (!urlRes.ok) {
        setError(urlData.error || 'Upload URL nahi ban saki.')
        setLoading(false)
        return
      }

      setStatus('PDF upload ho raha hai...')
      const supabase = getBrowserSupabaseClient()
      const { error: uploadError } = await supabase.storage
        .from('textbooks')
        .uploadToSignedUrl(urlData.path, urlData.token, file)

      if (uploadError) {
        setError(uploadError.message || 'File upload nahi ho saki.')
        setLoading(false)
        return
      }

      setStatus('Text nikala ja raha hai (AI se) — thoda time lag sakta hai...')
      const processRes = await fetch('/api/upload-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storagePath: urlData.path,
          class: studentClass,
          subject,
          chapter,
          title: file.name,
        }),
      })
      const processData = await processRes.json()

      if (!processRes.ok) {
        setError(processData.error || 'Processing fail ho gayi.')
      } else {
        setMessage(
          `Upload ho gaya! ${processData.chunksSaved} sections save hue. Ab "Study" page par isi Class/Subject se sawal poochein.`
        )
        setFile(null)
        setChapter('')
      }
    } catch {
      setError('Network error. Dobara koshish karein.')
    } finally {
      setLoading(false)
      setStatus(null)
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
          <p className="text-xs text-slate-400">Max 15MB. Badi textbook ho to chapters mein tod kar upload karein.</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-primary text-white font-semibold py-3 disabled:opacity-60"
        >
          {loading ? status || 'Uploading...' : 'Upload PDF'}
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
