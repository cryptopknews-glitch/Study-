import { NextRequest, NextResponse } from 'next/server'
import { buildSystemPrompt, buildUserPrompt } from '@/lib/prompts'
import type { Class, Subject } from '@/lib/types'
import type { AnswerModeId } from '@/lib/constants'

export const runtime = 'nodejs'

// Cost note (see project rule #26 - AI Cost Control):
// 'claude-sonnet-5' gives the best quality/cost balance for study explanations.
// For heavier usage or lower cost, switch MODEL below to 'claude-haiku-4-5-20251001'.
const MODEL = 'claude-sonnet-5'

interface StudyRequestBody {
  studentClass: Class
  subject: Subject
  question: string
  mode: AnswerModeId
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY is not configured on the server. Add it in Vercel Project Settings -> Environment Variables.' },
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

  try {
    const aiResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1500,
        system: buildSystemPrompt(),
        messages: [
          {
            role: 'user',
            content: buildUserPrompt({ studentClass, subject, question, mode }),
          },
        ],
      }),
    })

    if (!aiResponse.ok) {
      const errText = await aiResponse.text()
      return NextResponse.json(
        { error: `AI request failed (${aiResponse.status}): ${errText}` },
        { status: 502 }
      )
    }

    const data = await aiResponse.json()
    const answer: string =
      data.content
        ?.filter((block: { type: string }) => block.type === 'text')
        .map((block: { text: string }) => block.text)
        .join('\n') ?? ''

    return NextResponse.json({ answer })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown server error.' },
      { status: 500 }
    )
  }
}
