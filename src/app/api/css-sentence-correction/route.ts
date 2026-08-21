import { NextRequest, NextResponse } from 'next/server'
import { getGeminiConfig } from '@/lib/aiConfig'

export const runtime = 'nodejs'


interface Body {
  action?: 'generate' | 'evaluate'
  incorrect?: string
  userCorrection?: string
}

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

  if (body.action === 'generate') {
    const prompt = [
      'Write ONE sentence containing a single grammatical error, in the style of CSS (Pakistan) English Precis and Composition "Sentence Correction" exam questions.',
      'Use realistic errors: subject-verb agreement, preposition misuse, tense mistakes, article errors, redundancy, or word-pair confusion.',
      'Output ONLY the incorrect sentence, nothing else — no quotes, no explanation.',
    ].join(' ')

    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }] }),
      })
      if (!res.ok) {
        const errText = await res.text()
        return NextResponse.json({ error: `AI request failed (${res.status}): ${errText}` }, { status: 502 })
      }
      const data = await res.json()
      const incorrect: string =
        data.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('').trim() ?? ''
      if (!incorrect) {
        return NextResponse.json({ error: 'AI ne khaali jawab diya.' }, { status: 502 })
      }
      return NextResponse.json({ incorrect })
    } catch (err) {
      return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error.' }, { status: 500 })
    }
  }

  if (body.action === 'evaluate') {
    const { incorrect, userCorrection } = body
    if (!incorrect || !userCorrection || !userCorrection.trim()) {
      return NextResponse.json({ error: 'Sentence aur correction zaroori hain.' }, { status: 400 })
    }
    if (userCorrection.length > 500) {
      return NextResponse.json({ error: 'Bahut lambi hai (max 500 characters).' }, { status: 400 })
    }

    const prompt = [
      `Original incorrect sentence: "${incorrect}"`,
      `Student's corrected version: "${userCorrection}"`,
      'Check if the student fixed the grammatical error correctly.',
      'Respond in this structure, kept short:',
      '1. Correct or Incorrect',
      '2. If incorrect or partially correct, explain the mistake briefly in simple Roman Urdu',
      '3. Give the fully correct sentence',
    ].join('\n')

    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }] }),
      })
      if (!res.ok) {
        const errText = await res.text()
        return NextResponse.json({ error: `AI request failed (${res.status}): ${errText}` }, { status: 502 })
      }
      const data = await res.json()
      const feedback: string =
        data.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('\n') ?? ''
      if (!feedback) {
        return NextResponse.json({ error: 'AI ne khaali jawab diya.' }, { status: 502 })
      }
      return NextResponse.json({ feedback })
    } catch (err) {
      return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error.' }, { status: 500 })
    }
  }

  return NextResponse.json({ error: 'Invalid action.' }, { status: 400 })
}
