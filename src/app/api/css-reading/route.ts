import { NextResponse } from 'next/server'
import { getGeminiConfig } from '@/lib/aiConfig'

export const runtime = 'nodejs'


const SCHEMA = `Respond with ONLY valid JSON (no markdown fences):
{
  "passage": string (200-280 words, formal analytical style),
  "questions": [{"question": string, "options": [string, string, string, string], "correctIndex": number}]
} (exactly 5 questions)`

export async function POST() {
  const { apiKey, model } = await getGeminiConfig()
  if (!apiKey) {
    return NextResponse.json({ error: 'GEMINI_API_KEY is not configured on the server.' }, { status: 500 })
  }

  const prompt = [
    'Write an original passage (200-280 words) on a serious, thoughtful topic, suitable for CSS (Pakistan) Reading Comprehension practice.',
    'Then write 5 multiple-choice comprehension questions testing understanding of the passage — main idea, inference, vocabulary-in-context, and detail questions.',
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
