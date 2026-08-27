'use client'

import { useState } from 'react'
import MarkdownAnswer from '@/components/MarkdownAnswer'

/**
 * "Ise Roman Urdu mein samjhao" — kisi bhi jawab ke neeche laga dein.
 */
export default function ExplainInUrdu({
  text,
  subject,
}: {
  text: string
  subject?: string
}) {
  const [loading, setLoading] = useState(false)
  const [explanation, setExplanation] = useState<string | null>(null)
  const [style, setStyle] = useState<'roman' | 'urdu'>('roman')
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  async function run(s: 'roman' | 'urdu') {
    setStyle(s)
    setOpen(true)
    setLoading(true)
    setError(null)
    setExplanation(null)
    try {
      const res = await fetch('/api/explain-urdu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, style: s, subject }),
      })
      const data = await res.json()
      if (!res.ok) setError(data.error || 'Samjhaya nahi ja saka.')
      else setExplanation(data.explanation)
    } catch {
      setError('Network error.')
    } finally {
      setLoading(false)
    }
  }

  if (!text || !text.trim()) return null

  return (
    <div className="mt-3 pt-3 border-t border-slate-200">
      {!open ? (
        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => run('roman')}
            className="text-xs font-semibold text-primary border border-primary/40 rounded-md px-3 py-1.5"
          >
            🗣️ Roman Urdu mein samjhao
          </button>
          <button
            type="button"
            onClick={() => run('urdu')}
            className="text-xs font-semibold text-slate-600 border border-slate-300 rounded-md px-3 py-1.5"
          >
            اردو میں
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              {style === 'urdu' ? 'اردو وضاحت' : 'Roman Urdu mein'}
            </p>
            <div className="flex gap-2">
              {!loading && (
                <button
                  type="button"
                  onClick={() => run(style === 'roman' ? 'urdu' : 'roman')}
                  className="text-[11px] text-primary font-medium"
                >
                  {style === 'roman' ? 'اردو میں' : 'Roman mein'}
                </button>
              )}
              <button
                type="button"
                onClick={() => { setOpen(false); setExplanation(null); setError(null) }}
                className="text-[11px] text-slate-400"
              >
                band
              </button>
            </div>
          </div>

          {loading && <p className="text-xs text-slate-500">Samjha raha hoon…</p>}
          {error && <p className="text-xs text-danger">{error}</p>}

          {explanation && (
            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
              <MarkdownAnswer content={explanation} rtl={style === 'urdu'} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
