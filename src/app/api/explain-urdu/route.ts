import { NextRequest, NextResponse } from 'next/server'
import { getGeminiConfig } from '@/lib/aiConfig'

export const runtime = 'nodejs'
export const maxDuration = 30

/**
 * Kisi bhi jawab ko Roman Urdu (ya Urdu script) mein dobara samjhana.
 * Mushkil concept apni zabaan mein jaldi samajh aata hai.
 */
interface Body {
  text?: string
  style?: 'roman' | 'urdu'
  subject?: string
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

  const { text, style = 'roman', subject } = body
  if (!text || !text.trim()) {
    return NextResponse.json({ error: 'Samjhane ke liye kuch nahi mila.' }, { status: 400 })
  }
  if (text.length > 20000) {
    return NextResponse.json({ error: 'Matn bahut lamba hai.' }, { status: 400 })
  }

  const prompt = [
    'You are explaining an academic answer again, in the student\'s own language, so she actually understands it.',
    'She is a Pakistani ICS student (Class 11/12). Her first language is Urdu.',
    '',
    style === 'urdu'
      ? 'اردو رسم الخط میں لکھیں۔ سادہ اور عام فہم زبان استعمال کریں۔'
      : 'Write in Roman Urdu — Urdu language, English letters. Simple everyday words, the way an older sibling would explain it.',
    '',
    'Rules:',
    '- Do NOT translate word by word. Explain the IDEA so it clicks.',
    '- Keep technical terms in English (derivative, matrix, GDP, inflation) — translating them confuses students in exams. Explain what each term means, then keep using the English word.',
    '- Formulas, equations, numbers and code stay exactly as they are. Never change them.',
    '- Start with the main idea in one or two lines, then the detail.',
    '- Use a simple everyday example if it helps.',
    '- Keep it shorter than the original — this is for understanding, not repeating.',
    '- Do not add new facts that were not in the original answer.',
    subject ? `- Subject context: ${subject}` : '',
    '',
    'Original answer:',
    text,
  ]
    .filter(Boolean)
    .join('\n')

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }] }),
      }
    )

    if (!res.ok) {
      const errText = await res.text()
      return NextResponse.json({ error: `AI request failed (${res.status}): ${errText}` }, { status: 502 })
    }

    const data = await res.json()
    const explanation: string =
      data.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('\n') ?? ''

    if (!explanation) return NextResponse.json({ error: 'AI ne khaali jawab diya.' }, { status: 502 })

    return NextResponse.json({ explanation, style })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown server error.' },
      { status: 500 }
    )
  }
}
