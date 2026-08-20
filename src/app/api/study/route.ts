import { NextRequest, NextResponse } from 'next/server'
import { buildSystemPrompt, buildUserPrompt } from '@/lib/prompts'
import { findRelevantContext } from '@/lib/retrieval'
import type { Class, Subject } from '@/lib/types'
import type { AnswerModeId } from '@/lib/constants'

export const runtime = 'nodejs'

// Free-tier model via Google AI Studio (no billing required).
// 'gemini-3.6-flash' = better quality, still free.
// 'gemini-3.5-flash-lite' = fastest / highest free daily quota.
const MODEL = 'gemini-3.6-flash'

interface StudyRequestBody {
  studentClass: Class
  subject: Subject
  question: string
  mode: AnswerModeId
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'GEMINI_API_KEY is not configured on the server. Add it in Vercel Project Settings -> Environment Variables.' },
      { status: 500 }
    )
  }

  let body: StudyRequestBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const { studentClass, subject, question, mode } = body

  if (!studentClass || !subject || !mode || !question || !question.trim()) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
  }

  const context = await findRelevantContext({ studentClass, subject, question })

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
          system_instruction: {
            parts: [{ text: buildSystemPrompt() }],
          },
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: buildUserPrompt({ studentClass, subject, question, mode, context }),
                },
              ],
            },
          ],
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
      return NextResponse.json(
        { error: 'AI ne khaali jawab diya. Dobara koshish karein ya question thoda rephrase karein.' },
        { status: 502 }
      )
    }

    return NextResponse.json({ answer, usedUploadedMaterial: Boolean(context) })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown server error.' },
      { status: 500 }
    )
  }
}
