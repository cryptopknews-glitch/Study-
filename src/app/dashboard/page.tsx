'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
  const [revision, setRevision] = useState<{ dueCount: number; totalCount: number } | null>(null)
  const [weak, setWeak] = useState<{ subject: string; topic: string; accuracy: number; right: number; total: number }[]>([])
  const [quizStats, setQuizStats] = useState<{ totalAttempts: number; totalWrong: number } | null>(null)

  /** Lagataar kitne din kaam hua — activity ki tareekhon se. */
  function calcStreak(items: { created_at: string }[]): { current: number; today: boolean } {
    if (!items.length) return { current: 0, today: false }
    const days = new Set(items.map((i) => new Date(i.created_at).toLocaleDateString('en-CA')))
    const todayStr = new Date().toLocaleDateString('en-CA')
    const today = days.has(todayStr)
    let count = 0
    const cursor = new Date()
    if (!today) cursor.setDate(cursor.getDate() - 1) // kal tak ka silsila
    for (let i = 0; i < 400; i++) {
      if (days.has(cursor.toLocaleDateString('en-CA'))) {
        count++
        cursor.setDate(cursor.getDate() - 1)
      } else break
    }
    return { current: count, today }
  }

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

      // Revision ki halat alag se — dashboard fail ho to bhi ye chal jaye
      fetch('/api/flashcards/review', { cache: 'no-store' })
        .then((r) => r.json())
        .then((d) => setRevision({ dueCount: d.dueCount ?? 0, totalCount: d.totalCount ?? 0 }))
        .catch(() => setRevision(null))

      // Kamzor topics — quiz attempts se
      fetch('/api/quiz-attempts?only=wrong', { cache: 'no-store' })
        .then((r) => r.json())
        .then((d) => {
          setWeak(d.weak ?? [])
          setQuizStats({ totalAttempts: d.totalAttempts ?? 0, totalWrong: d.totalWrong ?? 0 })
        })
        .catch(() => setWeak([]))

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

      {data.recent.length > 0 && (() => {
        const s = calcStreak(data.recent)
        if (s.current === 0) return null
        return (
          <section className={`rounded-lg border p-4 ${
            s.today ? 'border-orange-300 bg-orange-50' : 'border-slate-200 bg-white'
          }`}>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{s.today ? '🔥' : '💤'}</span>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {s.current} din
                </p>
                <p className="text-xs text-slate-600">
                  {s.today
                    ? 'lagataar — aaj bhi ho gaya, shabash'
                    : 'ka silsila tha — aaj kuch karein to barh jayega'}
                </p>
              </div>
            </div>
          </section>
        )
      })()}

      {revision && revision.totalCount > 0 && (
        <Link
          href="/flashcards"
          className={`block rounded-lg border p-4 ${
            revision.dueCount > 0
              ? 'border-primary/40 bg-primary/5'
              : 'border-slate-200 bg-white'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-3xl font-bold text-primary">{revision.dueCount}</p>
              <p className="text-xs text-slate-500 mt-1">
                {revision.dueCount > 0
                  ? 'Cards aaj revision ke liye due hain'
                  : 'Aaj koi card due nahi — sab ho gaya'}
              </p>
            </div>
            <span className="shrink-0 text-xs font-semibold text-primary">
              {revision.dueCount > 0 ? 'Shuru karein →' : `${revision.totalCount} cards`}
            </span>
          </div>
        </Link>
      )}

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <p className="text-3xl font-bold text-primary">{data.totalCount}</p>
        <p className="text-xs text-slate-500 mt-1">Total questions poochay gaye</p>
      </section>

      {quizStats && quizStats.totalAttempts > 0 && (
        <Link href="/mistakes" className="block rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-3xl font-bold text-danger">{quizStats.totalWrong}</p>
              <p className="text-xs text-slate-500 mt-1">
                Galat sawaal · {quizStats.totalAttempts} mein se
                {' '}({Math.round(((quizStats.totalAttempts - quizStats.totalWrong) / quizStats.totalAttempts) * 100)}% sahi)
              </p>
            </div>
            <span className="shrink-0 text-xs font-semibold text-primary">Galtiyan dekhein →</span>
          </div>
        </Link>
      )}

      {weak.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
            Kamzor Topics
          </h2>
          {weak.slice(0, 5).map((w, i) => (
            <div key={i} className="rounded-lg border border-amber-300 bg-amber-50 p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{w.topic}</p>
                  <p className="text-xs text-slate-600">{w.subject}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold text-amber-700">{w.accuracy}%</p>
                  <p className="text-[11px] text-slate-500">{w.right}/{w.total}</p>
                </div>
              </div>
            </div>
          ))}
        </section>
      )}

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
