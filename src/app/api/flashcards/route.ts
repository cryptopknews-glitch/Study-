import { NextRequest, NextResponse } from 'next/server'
import { getGeminiConfig } from '@/lib/aiConfig'

export const runtime = 'nodejs'


const SCHEMA = `Respond with ONLY valid JSON (no markdown fences):
{
  "cards": [{"front": string, "back": string}]
} (exactly 10 items)`

interface Body {
  studentClass?: string
  subject?: string
  chapter?: string
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

  const { studentClass, subject, chapter } = body
  if (!studentClass || !subject) {
    return NextResponse.json({ error: 'Class aur subject zaroori hain.' }, { status: 400 })
  }

  const prompt = [
    `Generate 10 quick-revision flashcards for a Pakistani ICS student.`,
    `Class: ${studentClass}`,
    `Subject: ${subject}`,
    chapter ? `Chapter/Topic: ${chapter}` : 'Cover key terms, formulas, or definitions from across the syllabus.',
    'Front = a term, formula name, or short question. Back = a concise definition, formula, or answer (1-3 sentences, exam-ready).',
    'For Math/CS, prioritize formulas and key definitions. For Economics/English, prioritize key terms and concepts.',
    'For Urdu, Islamic Education and Pakistan Studies, write BOTH front and back in Urdu script (not Roman Urdu). For Urdu prioritize muhavare, zarb-ul-amsal, grammar terms and shair ki tashreeh. For Islamic Education prioritize ayat, ahadith, seerat events and ibadat terms. For Pakistan Studies prioritize dates, events, personalities and constitutional facts.',
    'Never invent a Quranic reference, hadith, date or formula. If unsure, use a well-established one instead.',
    SCHEMA,
  ].join('\n')

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    })
    if (!res.ok) {
      const errText = await res.text()
      return NextResponse.json({ error: `AI request failed (${res.status}): ${errText}` }, { status: 502 })
    }
    const data = await res.json()
    const rawText: string =
      data.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('') ?? ''
    if (!rawText) return NextResponse.json({ error: 'AI ne khaali jawab diya.' }, { status: 502 })
    const parsed = JSON.parse(rawText)
    return NextResponse.json(parsed)
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error.' }, { status: 500 })
  }
}
