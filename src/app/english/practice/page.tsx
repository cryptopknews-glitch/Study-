'use client'

import { useState } from 'react'

interface VocabItem {
  word: string
  meaning: string
  example: string
}
interface GrammarItem {
  question: string
  answer: string
}
interface CorrectionItem {
  incorrect: string
  correct: string
}
interface QuizItem {
  question: string
  options: string[]
  correctIndex: number
}
interface PracticeSession {
  vocabulary: VocabItem[]
  grammarQuestions: GrammarItem[]
  sentenceCorrections: CorrectionItem[]
  writingTask: string
  quiz: QuizItem[]
}

export default function PracticePage() {
  const [session, setSession] = useState<PracticeSession | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [revealedGrammar, setRevealedGrammar] = useState<Record<number, boolean>>({})
  const [revealedCorrections, setRevealedCorrections] = useState<Record<number, boolean>>({})
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({})
  const [writing, setWriting] = useState('')

  async function startSession() {
    setLoading(true)
    setError(null)
    setSession(null)
    setRevealedGrammar({})
    setRevealedCorrections({})
    setQuizAnswers({})
    setWriting('')

    try {
      const res = await fetch('/api/daily-practice', { method: 'POST' })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Practice session nahi ban saka.')
      } else {
        setSession(data.session)
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
        <h1 className="text-2xl font-bold text-slate-900">10 Minute English Practice</h1>
        <p className="text-slate-600 text-sm">
          Vocabulary, grammar, sentence correction, writing, aur quiz — ek session mein
        </p>
      </div>

      {!session && (
        <button
          onClick={startSession}
          disabled={loading}
          className="w-full rounded-lg bg-primary text-white font-semibold py-3 disabled:opacity-60"
        >
          {loading ? 'Session taiyar ho raha hai...' : "Start Today's Practice"}
        </button>
      )}

      {error && (
        <div className="rounded-lg border border-danger/30 bg-red-50 p-4 text-sm text-danger">
          {error}
        </div>
      )}

      {session && (
        <div className="space-y-8">
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
              1. Vocabulary
            </h2>
            {session.vocabulary.map((v, i) => (
              <div key={i} className="rounded-lg border border-slate-200 bg-white p-4">
                <p className="font-semibold text-slate-800">{v.word}</p>
                <p className="text-sm text-slate-600 mt-1">{v.meaning}</p>
                <p className="text-sm text-slate-500 italic mt-1">{v.example}</p>
              </div>
            ))}
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
              2. Grammar Questions
            </h2>
            {session.grammarQuestions.map((g, i) => (
              <div key={i} className="rounded-lg border border-slate-200 bg-white p-4 space-y-2">
                <p className="text-sm text-slate-800">
                  {i + 1}. {g.question}
                </p>
                {revealedGrammar[i] ? (
                  <p className="text-sm text-success font-medium">{g.answer}</p>
                ) : (
                  <button
                    onClick={() => setRevealedGrammar((prev) => ({ ...prev, [i]: true }))}
                    className="text-xs font-medium text-primary border border-primary/30 rounded-md px-2 py-1"
                  >
                    Show Answer
                  </button>
                )}
              </div>
            ))}
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
              3. Sentence Correction
            </h2>
            {session.sentenceCorrections.map((c, i) => (
              <div key={i} className="rounded-lg border border-slate-200 bg-white p-4 space-y-2">
                <p className="text-sm text-slate-800">
                  {i + 1}. {c.incorrect}
                </p>
                {revealedCorrections[i] ? (
                  <p className="text-sm text-success font-medium">{c.correct}</p>
                ) : (
                  <button
                    onClick={() => setRevealedCorrections((prev) => ({ ...prev, [i]: true }))}
                    className="text-xs font-medium text-primary border border-primary/30 rounded-md px-2 py-1"
                  >
                    Show Correction
                  </button>
                )}
              </div>
            ))}
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
              4. Writing Task
            </h2>
            <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-3">
              <p className="text-sm text-slate-800">{session.writingTask}</p>
              <label htmlFor="writing" className="sr-only">
                Your writing
              </label>
              <textarea
                id="writing"
                value={writing}
                onChange={(e) => setWriting(e.target.value)}
                rows={5}
                placeholder="Apna jawab yahan likhein..."
                className="w-full rounded-lg border border-slate-300 py-3 px-3 text-slate-800"
              />
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
              5. Mini Quiz
            </h2>
            {session.quiz.map((q, qi) => (
              <div key={qi} className="rounded-lg border border-slate-200 bg-white p-4 space-y-2">
                <p className="text-sm text-slate-800">
                  {qi + 1}. {q.question}
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {q.options.map((opt, oi) => {
                    const answered = quizAnswers[qi] !== undefined
                    const isSelected = quizAnswers[qi] === oi
                    const isCorrect = oi === q.correctIndex
                    let stateClass = 'border-slate-300 bg-white text-slate-700'
                    if (answered && isCorrect) stateClass = 'border-success bg-green-50 text-success'
                    else if (answered && isSelected && !isCorrect)
                      stateClass = 'border-danger bg-red-50 text-danger'
                    return (
                      <button
                        type="button"
                        key={oi}
                        disabled={answered}
                        onClick={() => setQuizAnswers((prev) => ({ ...prev, [qi]: oi }))}
                        className={`rounded-lg border py-2 px-3 text-sm text-left ${stateClass}`}
                      >
                        {opt}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </section>

          <button
            onClick={startSession}
            disabled={loading}
            className="w-full rounded-lg bg-slate-800 text-white font-semibold py-3 disabled:opacity-60"
          >
            {loading ? 'Loading...' : 'New Practice Session'}
          </button>
        </div>
      )}
    </div>
  )
}
