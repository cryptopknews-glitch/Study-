import { NextRequest, NextResponse } from 'next/server'
import { getGeminiConfig } from '@/lib/aiConfig'

export const runtime = 'nodejs'


interface Body {
  action?: 'suggest_topic' | 'evaluate'
  topic?: string
  outline?: string
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

  if (body.action === 'suggest_topic') {
    const prompt = 'Give ONE thoughtful, analytical essay topic in the style of CSS (Pakistan) Essay paper topics (governance, society, technology, philosophy, economy). Output ONLY the topic, nothing else.'
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
      const topic: string =
        data.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('').trim() ?? ''
      if (!topic) return NextResponse.json({ error: 'AI ne khaali jawab diya.' }, { status: 502 })
      return NextResponse.json({ topic })
    } catch (err) {
      return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error.' }, { status: 500 })
    }
  }

  if (body.action === 'evaluate') {
    const { topic, outline } = body
    if (!topic || !outline || !outline.trim()) {
      return NextResponse.json({ error: 'Topic aur outline zaroori hain.' }, { status: 400 })
    }
    if (outline.length > 3000) {
      return NextResponse.json({ error: 'Outline bahut lambi hai.' }, { status: 400 })
    }

    const prompt = [
      `Essay topic: ${topic}`,
      `Student's essay outline (thesis + main points):`,
      outline,
      '',
      'Evaluate this outline like a CSS essay examiner would evaluate a plan before the student writes the full essay. Use short headings:',
      '1. Thesis Strength — is the central argument clear and debatable?',
      '2. Structure & Coverage — are there enough distinct, well-organized points? Any obvious angle missing (e.g. counterargument, Pakistan-specific angle)?',
      '3. Suggested Improvements — 2-3 concrete suggestions',
      '4. A sample expanded outline with 5-6 stronger points for reference',
      'Keep the response focused, not overly long.',
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
      if (!feedback) return NextResponse.json({ error: 'AI ne khaali jawab diya.' }, { status: 502 })
      return NextResponse.json({ feedback })
    } catch (err) {
      return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error.' }, { status: 500 })
    }
  }

  return NextResponse.json({ error: 'Invalid action.' }, { status: 400 })
}
