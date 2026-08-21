'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import MarkdownAnswer from '@/components/MarkdownAnswer'

interface ActivityItem {
  id: string
  source: string
  class: string | null
  subject: string | null
  mode: string | null
  question: string
  answer: string
  created_at: string
}

interface NoteItem {
  id: string
  title: string
  content: string
  class: string | null
  subject: string | null
  created_at: string
}

interface DashboardData {
  totalCount: number
  recent: ActivityItem[]
  subjectCounts: Record<string, number>
  notes: NoteItem[]
}

export default function DashboardPage() {
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [deletingNoteId, setDeletingNoteId] = useState<string | null>(null)
  const [deletingActivityId, setDeletingActivityId] = useState<string | null>(null)

  async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/dashboard', { cache: 'no-store' })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Data load nahi ho saka.')
      } else {
        setData(json)
      }
    } catch {
      setError('Network error.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handleDeleteNote(id: string) {
    setDeletingNoteId(id)
    try {
      const res = await fetch(`/api/notes/${id}`, { method: 'DELETE' })
      if (res.ok && data) {
        setData({ ...data, notes: data.notes.filter((n) => n.id !== id) })
      }
    } finally {
      setDeletingNoteId(null)
    }
  }

  async function handleDeleteActivity(id: string) {
    setDeletingActivityId(id)
    try {
      const res = await fetch(`/api/activity/${id}`, { method: 'DELETE' })
      if (res.ok) {
        await load()
      }
    } finally {
      setDeletingActivityId(null)
    }
  }

  if (loading) {
    return <div className="px-4 py-8 text-slate-500 text-sm">Loading...</div>
  }

  if (error || !data) {
    return (
      <div className="px-4 py-8">
        <div className="rounded-lg border border-danger/30 bg-red-50 p-4 text-sm text-danger">
          {error || 'Data nahi mila.'}
        </div>
      </div>
    )
  }

  const subjectEntries = Object.entries(data.subjectCounts).sort((a, b) => b[1] - a[1])
  const maxCount = subjectEntries.length > 0 ? subjectEntries[0][1] : 1
  const weakTopics = [...subjectEntries].sort((a, b) => a[1] - b[1]).slice(0, 3)

  return (
    <div className="px-4 py-8 space-y-8 pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Dashboard</h1>
          <p className="text-slate-600 text-sm">Progress, history, aur saved notes</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={load}
            className="shrink-0 text-xs font-medium text-primary border border-primary/30 rounded-md px-3 py-1.5"
          >
            🔄 Refresh
          </button>
          <a
            href="/api/export"
            className="shrink-0 text-xs font-medium text-slate-600 border border-slate-300 rounded-md px-3 py-1.5"
          >
            📦 Export
          </a>
          <button
            onClick={handleLogout}
            className="shrink-0 text-xs font-medium text-danger border border-danger/30 rounded-md px-3 py-1.5"
          >
            Logout
          </button>
        </div>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <p className="text-3xl font-bold text-primary">{data.totalCount}</p>
        <p className="text-xs text-slate-500 mt-1">Total questions poochay gaye</p>
      </section>

      {subjectEntries.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
            Subject Breakdown
          </h2>
          <div className="space-y-2">
            {subjectEntries.map(([subject, count]) => (
              <div key={subject}>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>{subject}</span>
                  <span>{count}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {weakTopics.length > 0 && (
        <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-2">
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
            Kam Practice Hui — Inn Par Focus Karein
          </p>
          <ul className="list-disc pl-5 text-sm text-amber-800 space-y-1">
            {weakTopics.map(([subject, count]) => (
              <li key={subject}>
                {subject} ({count} sawal)
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
          Recent History
        </h2>
        {data.recent.length === 0 ? (
          <p className="text-sm text-slate-500">Abhi tak koi activity nahi.</p>
        ) : (
          <div className="space-y-2">
            {data.recent.map((item) => (
              <div key={item.id} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <button
                    onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                    className="flex-1 text-left min-w-0"
                  >
                    <p className="text-sm text-slate-800 line-clamp-2">{item.question}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {item.subject || item.source} ·{' '}
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </button>
                  <button
                    onClick={() => handleDeleteActivity(item.id)}
                    disabled={deletingActivityId === item.id}
                    className="shrink-0 text-xs font-medium text-danger border border-danger/30 rounded-md px-2 py-1 disabled:opacity-50"
                  >
                    {deletingActivityId === item.id ? '...' : 'Delete'}
                  </button>
                </div>
                {expandedId === item.id && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <MarkdownAnswer content={item.answer} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
          Saved Notes
        </h2>
        {data.notes.length === 0 ? (
          <p className="text-sm text-slate-500">
            Koi saved note nahi. Kisi bhi answer par &quot;Save to Notes&quot; dabayein.
          </p>
        ) : (
          <div className="space-y-2">
            {data.notes.map((note) => (
              <div key={note.id} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium text-slate-800 text-sm">{note.title}</p>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    disabled={deletingNoteId === note.id}
                    className="shrink-0 text-xs font-medium text-danger border border-danger/30 rounded-md px-2 py-1 disabled:opacity-50"
                  >
                    {deletingNoteId === note.id ? '...' : 'Delete'}
                  </button>
                </div>
                <div className="mt-2">
                  <MarkdownAnswer content={note.content} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
