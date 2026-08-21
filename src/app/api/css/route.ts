import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

const MODEL = 'gemini-3.6-flash'

interface CssRequestBody {
  topic?: string
  question?: string
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'GEMINI_API_KEY is not configured on the server.' },
      { status: 500 }
    )
  }

  let body: CssRequestBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const { topic, question } = body

  if (!topic || !question || !question.trim()) {
    return NextResponse.json({ error: 'Topic aur question zaroori hain.' }, { status: 400 })
  }

  const systemPrompt = [
    'You are a CSS (Central Superior Services, Pakistan) exam foundation tutor inside 10MinStudy.',
    'The student is an ICS student (Class 11/12) building an early, long-term foundation for CSS — years before actually attempting the exam.',
    'Keep answers foundational, simple, and encouraging. Do not assume exam-level depth this early.',
    'For essay or writing topics, focus on structure, clarity, and technique — do not write a full finished essay for the student, guide them to write it themselves.',
    'Use short headings and bullet points where useful.',
  ].join(' ')

  const userPrompt = `CSS Foundation Topic: ${topic}\nQuestion: ${question}`

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
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
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
    const answer: string =
      data.candidates?.[0]?.content?.parts
        ?.map((part: { text?: string }) => part.text ?? '')
        .join('\n') ?? ''

    if (!answer) {
      return NextResponse.json({ error: 'AI ne khaali jawab diya.' }, { status: 502 })
    }

    return NextResponse.json({ answer })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown server error.' },
      { status: 500 }
    )
  }
}
