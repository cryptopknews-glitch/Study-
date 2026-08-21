import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

const MODEL = 'gemini-3.6-flash'

interface CheckRequestBody {
  tenseName?: string
  sentence?: string
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'GEMINI_API_KEY is not configured on the server.' },
      { status: 500 }
    )
  }

  let body: CheckRequestBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const { tenseName, sentence } = body

  if (!tenseName || !sentence || !sentence.trim()) {
    return NextResponse.json({ error: 'Sentence zaroori hai.' }, { status: 400 })
  }

  if (sentence.length > 500) {
    return NextResponse.json({ error: 'Sentence bahut lambi hai (max 500 characters).' }, { status: 400 })
  }

  const prompt = [
    'You are an English tenses tutor for a Pakistani ICS student.',
    `The student is practicing the "${tenseName}" tense.`,
    `Their sentence: "${sentence}"`,
    '',
    `Check if the sentence correctly uses the ${tenseName} tense.`,
    'Respond in this exact structure:',
    '1. State clearly: Correct or Incorrect',
    '2. If incorrect, explain the mistake briefly in simple Roman Urdu',
    '3. Give the corrected sentence',
    'Keep the whole response short (under 80 words).',
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
    const feedback: string =
      data.candidates?.[0]?.content?.parts
        ?.map((part: { text?: string }) => part.text ?? '')
        .join('\n') ?? ''

    if (!feedback) {
      return NextResponse.json({ error: 'AI ne khaali jawab diya.' }, { status: 502 })
    }

    return NextResponse.json({ feedback })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown server error.' },
      { status: 500 }
    )
  }
}
