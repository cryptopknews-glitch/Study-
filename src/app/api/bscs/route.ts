import { NextRequest, NextResponse } from 'next/server'
import { logActivity } from '@/lib/activityLog'

export const runtime = 'nodejs'

const MODEL = 'gemini-3.6-flash'

interface BscsRequestBody {
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

  let body: BscsRequestBody
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
    'You are a BS Computer Science preparation tutor inside 10MinStudy.',
    'The student is currently in ICS (Class 11/12) and preparing for a university Computer Science degree.',
    'Explain at a level slightly above ICS but still accessible — build university-level intuition gently before formal detail.',
    'Keep answers focused, practical, and encouraging. Use short headings and bullet points where useful.',
    'For code, use clear comments and explain the reasoning, not just the syntax.',
  ].join(' ')

  const userPrompt = `BSCS Prep Topic: ${topic}\nQuestion: ${question}`

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

    await logActivity({ source: 'bscs', subject: topic, question, answer })

    return NextResponse.json({ answer })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown server error.' },
      { status: 500 }
    )
  }
}
