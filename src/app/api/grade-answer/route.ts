import { NextRequest, NextResponse } from 'next/server'
import { getGeminiConfig } from '@/lib/aiConfig'
import { getSupabaseClient } from '@/lib/supabase'

export const runtime = 'nodejs'
export const maxDuration = 30

const SCHEMA = `Respond with ONLY valid JSON (no markdown fences):
{
  "score": number (0 se maxMarks tak, aadha number bhi de sakte ho jaise 2.5),
  "maxMarks": number,
  "verdict": string (ek jumla: kaisa jawab tha),
  "correct": [string] (jo baatein sahi likhi gayin — 1 se 4 points),
  "missing": [string] (jo baatein reh gayin aur number kaat gaya — 1 se 5 points),
  "improve": [string] (agli baar kya behtar karein — 1 se 3 amli mashware),
  "modelPoints": [string] (poore number ke liye jawab mein kya kya hona chahiye tha)
}`

interface Body {
  question?: string
  answer?: string
  maxMarks?: number
  studentClass?: string
  subject?: string
  chapter?: string
  source?: string
  modelAnswer?: string | null
}

const URDU_SUBJECTS = ['Urdu', 'Islamic Education', 'Pakistan Studies']

export async function POST(req: NextRequest) {
  const { apiKey, model } = await getGeminiConfig()
  if (!apiKey) {
    return NextResponse.json({ error: 'GEMINI_API_KEY is not configured on the server.' }, { status: 500 })
  }

  let body: Body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const { question, answer, studentClass, subject, chapter, source, modelAnswer } = body
  const maxMarks = Number(body.maxMarks) || 3

  if (!question || !answer || !answer.trim()) {
    return NextResponse.json({ error: 'Sawaal aur jawab dono zaroori hain.' }, { status: 400 })
  }

  const isUrdu = URDU_SUBJECTS.includes(subject || '')

  const prompt = [
    'You are a Punjab Board (Pakistan) Intermediate examiner marking one student answer.',
    `Class: ${studentClass ?? 'Class 11'}`,
    `Subject: ${subject ?? 'General'}`,
    chapter ? `Chapter: ${chapter}` : '',
    `Maximum marks for this question: ${maxMarks}`,
    '',
    'Mark exactly the way a real board examiner marks:',
    '- Give marks for correct points, not for length. A short correct answer scores full marks.',
    '- Do not deduct marks for handwriting, spelling slips or grammar unless the subject is a language paper.',
    '- Be fair but honest. Do not inflate the score to be kind — an inflated score teaches nothing.',
    '- If the answer is completely off-topic or blank, give 0 and say so plainly.',
    isUrdu
      ? '- This is an Urdu-medium paper. Write verdict, correct, missing, improve and modelPoints in Urdu script.'
      : '- Write your feedback in simple English mixed with Roman Urdu where it helps the student understand.',
    '- Be encouraging in tone even when the score is low. This student is 16-17 years old.',
    '',
    `Question: ${question}`,
    modelAnswer ? `Official model answer / marking scheme (use this as the standard): ${modelAnswer}` : '',
    '',
    `Student's answer:\n${answer}`,
    '',
    SCHEMA,
  ]
    .filter(Boolean)
    .join('\n')

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      }
    )

    if (!res.ok) {
      const errText = await res.text()
      return NextResponse.json({ error: `AI request failed (${res.status}): ${errText}` }, { status: 502 })
    }

    const data = await res.json()
    const rawText: string =
      data.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('') ?? ''

    if (!rawText) return NextResponse.json({ error: 'AI ne khaali jawab diya.' }, { status: 502 })

    let result
    try {
      result = JSON.parse(rawText)
    } catch {
      return NextResponse.json({ error: 'AI ka jawab samajh nahi aaya. Dobara try karein.' }, { status: 502 })
    }

    // Score ko hadd ke andar rakho — AI kabhi maxMarks se zyada de deta hai
    let score = Number(result.score)
    if (!Number.isFinite(score)) score = 0
    score = Math.max(0, Math.min(maxMarks, score))
    result.score = score
    result.maxMarks = maxMarks

    // Record karo — dashboard aur progress ke liye
    try {
      const supabase = getSupabaseClient()
      await supabase.from('exam_attempts').insert({
        source: source || 'mock-exam',
        class: studentClass ?? null,
        subject: subject ?? null,
        chapter: chapter || null,
        question,
        her_answer: answer,
        ai_score: score,
        max_marks: maxMarks,
        ai_feedback: JSON.stringify({
          verdict: result.verdict ?? '',
          correct: result.correct ?? [],
          missing: result.missing ?? [],
          improve: result.improve ?? [],
        }),
      })
    } catch {
      /* save fail ho to bhi feedback dikhna chahiye */
    }

    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown server error.' },
      { status: 500 }
    )
  }
}
