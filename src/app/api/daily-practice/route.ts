import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 30

const MODEL = 'gemini-3.6-flash'

const SCHEMA_INSTRUCTIONS = `Respond with ONLY valid JSON (no markdown fences, no commentary) in exactly this shape:
{
  "vocabulary": [{"word": string, "meaning": string, "example": string}] (exactly 5 items),
  "grammarQuestions": [{"question": string, "answer": string}] (exactly 5 items),
  "sentenceCorrections": [{"incorrect": string, "correct": string}] (exactly 5 items),
  "writingTask": string (one short writing prompt, 1-2 sentences),
  "quiz": [{"question": string, "options": [string, string, string, string], "correctIndex": number}] (exactly 5 items)
}`

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'GEMINI_API_KEY is not configured on the server.' },
      { status: 500 }
    )
  }

  const prompt = [
    'Generate a fresh "10 Minute English Practice" session for a Pakistani ICS student (Class 11/12) working on grammar, vocabulary, and writing.',
    'Vocabulary words should be moderately advanced but useful for daily/academic English (not overly obscure). Meanings can mix simple English with a Roman Urdu hint.',
    'Grammar questions should mix tenses, prepositions, articles, and subject-verb agreement, with short direct answers.',
    'Sentence corrections should contain a realistic common mistake a Pakistani English learner makes.',
    'Quiz questions should be short and test grammar or vocabulary, ideally related to this same session.',
    SCHEMA_INSTRUCTIONS,
  ].join('\n')

  try {
    const aiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      }
    )

    if (!aiResponse.ok) {
      const errText = await aiResponse.text()
      return NextResponse.json(
        { error: `AI request failed (${aiResponse.status}): ${errText}` },
        { status: 502 }
      )
    }

    const data = await aiResponse.json()
    const rawText: string =
      data.candidates?.[0]?.content?.parts
        ?.map((part: { text?: string }) => part.text ?? '')
        .join('') ?? ''

    if (!rawText) {
      return NextResponse.json({ error: 'AI ne khaali jawab diya.' }, { status: 502 })
    }

    let session
    try {
      session = JSON.parse(rawText)
    } catch {
      return NextResponse.json(
        { error: 'AI ka jawab samajh nahi aaya. Dobara try karein.' },
        { status: 502 }
      )
    }

    return NextResponse.json({ session })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown server error.' },
      { status: 500 }
    )
  }
}
