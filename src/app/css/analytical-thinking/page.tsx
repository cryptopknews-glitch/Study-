'use client'

import { useState } from 'react'
import Link from 'next/link'

interface QuizItem {
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export default function AnalyticalThinkingPage() {
  const [questions, setQuestions] = useState<QuizItem[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<number, number>>({})

  async function handleLoad() {
    setLoading(true)
    setError(null)
    setQuestions(null)
    setAnswers({})
    try {
      const res = await fetch('/api/css-analytical', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) setError(data.error || 'Quiz load nahi ho saka.')
      else setQuestions(data.questions)
    } catch {
      setError('Network error.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-4 py-8 space-y-6 pb-16">
      <Link href="/css" className="text-sm text-primary font-medium">← CSS Foundation</Link>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Analytical Thinking</h1>
        <p className="text-slate-600 text-sm">Logical reasoning practice questions, explanation ke sath</p>
      </div>

      <button
        onClick={handleLoad}
        disabled={loading}
        className="w-full rounded-lg bg-primary text-white font-semibold py-3 disabled:opacity-60"
      >
        {loading ? 'Taiyar ho raha hai...' : questions ? 'New Quiz' : 'Start Quiz'}
      </button>

      {error && (
        <div className="rounded-lg border border-danger/30 bg-red-50 p-4 text-sm text-danger">{error}</div>
      )}

      {questions && (
        <div className="space-y-3">
          {questions.map((q, qi) => (
            <div key={qi} className="rounded-lg border border-slate-200 bg-white p-4 space-y-2">
              <p className="text-sm text-slate-800">{qi + 1}. {q.question}</p>
              <div className="grid grid-cols-1 gap-2">
                {q.options.map((opt, oi) => {
                  const answered = answers[qi] !== undefined
                  const isSelected = answers[qi] === oi
                  const isCorrect = oi === q.correctIndex
                  let cls = 'border-slate-300 bg-white text-slate-700'
                  if (answered && isCorrect) cls = 'border-success bg-green-50 text-success'
                  else if (answered && isSelected && !isCorrect) cls = 'border-danger bg-red-50 text-danger'
                  return (
                    <button
                      type="button"
                      key={oi}
                      disabled={answered}
                      onClick={() => setAnswers((prev) => ({ ...prev, [qi]: oi }))}
                      className={`rounded-lg border py-2 px-3 text-sm text-left ${cls}`}
                    >
                      {opt}
                    </button>
                  )
                })}
              </div>
              {answers[qi] !== undefined && (
                <p className="text-xs text-slate-500 bg-slate-50 rounded-md p-2">{q.explanation}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
