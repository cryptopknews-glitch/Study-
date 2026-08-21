import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

const MODEL = 'gemini-3.6-flash'

const SCHEMA = `Respond with ONLY valid JSON (no markdown fences):
{
  "words": [{"word": string, "meaning": string, "synonym": string, "usage": string}]
} (exactly 8 items)`

export async function POST() {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'GEMINI_API_KEY is not configured on the server.' }, { status: 500 })
  }

  const prompt = [
    'Generate 8 advanced vocabulary words useful for CSS (Pakistan) English Precis and Composition preparation — words commonly found in CSS "Pairs of Words" or vocabulary sections.',
    'Include a mix of moderately advanced and genuinely challenging words. Meanings should be clear and concise.',
    SCHEMA,
  ].join('\n')

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
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
    if (!rawText) {
      return NextResponse.json({ error: 'AI ne khaali jawab diya.' }, { status: 502 })
    }
    const parsed = JSON.parse(rawText)
    return NextResponse.json(parsed)
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error.' }, { status: 500 })
  }
}
