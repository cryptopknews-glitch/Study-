'use client'

import { useEffect, useState } from 'react'

interface Book {
  id: string
  title: string
  class: string
  subject: string
  created_at: string
  chunkCount: number
}

export default function ManagePage() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function loadBooks() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/books')
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Books load nahi ho sake.')
      } else {
        setBooks(data.books)
      }
    } catch {
      setError('Network error.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBooks()
  }, [])

  async function handleDelete(id: string) {
    setDeletingId(id)
    try {
      const res = await fetch(`/api/books/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setBooks((prev) => prev.filter((b) => b.id !== id))
      } else {
        const data = await res.json()
        setError(data.error || 'Delete nahi ho saka.')
      }
    } catch {
      setError('Network error.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="px-4 py-8 space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Uploads</h1>
        <p className="text-slate-600 text-sm">Uploaded study material dekhein ya delete karein</p>
      </div>

      {error && (
        <div className="rounded-lg border border-danger/30 bg-red-50 p-4 text-sm text-danger">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : books.length === 0 ? (
        <p className="text-sm text-slate-500">Abhi tak koi material upload nahi hua.</p>
      ) : (
        <div className="space-y-3">
          {books.map((book) => (
            <div
              key={book.id}
              className="rounded-lg border border-slate-200 bg-white p-4 flex items-start justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="font-medium text-slate-800 truncate">{book.title}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {book.class} · {book.subject} · {book.chunkCount} sections
                </p>
              </div>
              <button
                onClick={() => handleDelete(book.id)}
                disabled={deletingId === book.id}
                className="shrink-0 text-xs font-medium text-danger border border-danger/30 rounded-md px-3 py-1.5 disabled:opacity-50"
              >
                {deletingId === book.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
