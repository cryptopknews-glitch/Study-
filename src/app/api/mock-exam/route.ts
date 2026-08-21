import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 30

const MODEL = 'gemini-3.6-flash'

const SCHEMA_INSTRUCTIONS = `Respond with ONLY valid JSON (no markdown fences, no commentary) in exactly this shape:
{
  "title": string (e.g. "Class 11 Mathematics — Model Paper"),
  "totalMarks": number,
  "mcqs": [{"question": string, "options": [string, string, string, string], "correctIndex": number}] (exactly 8 items, 1 mark each),
  "shortQuestions": [string] (exactly 7 items, student attempts any 5, 3 marks each),
  "longQuestions": [string] (exactly 3 items, student attempts any 2, 12 marks each),
  "modelAnswers": {
    "shortAnswers": [string] (brief model answer for each of the 7 short questions, same order),
    "longAnswerHints": [string] (key points / outline for each of the 3 long questions, same order — not a full essay, just the marking-scheme outline)
  }
}`

interface MockExamBody {
  studentClass?: string
  subject?: string
  chapter?: string
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'GEMINI_API_KEY is not configured on the server.' },
      { status: 500 }
    )
  }

  let body: MockExamBody
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
    `Generate a full board-exam-style model paper for a Pakistani ICS student.`,
    `Class: ${studentClass}`,
    `Subject: ${subject}`,
    chapter ? `Focus mainly on: ${chapter} (but a couple of MCQs can cover general course topics)` : 'Cover a good general spread of the Class syllabus for this subject.',
    'Match the real board-exam paper style and difficulty for this class/subject in Pakistan (Federal/Punjab board style): clear, exam-appropriate language, sensible mark distribution.',
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

    let paper
    try {
      paper = JSON.parse(rawText)
    } catch {
      return NextResponse.json(
        { error: 'AI ka jawab samajh nahi aaya. Dobara try karein.' },
        { status: 502 }
      )
    }

    return NextResponse.json({ paper })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown server error.' },
      { status: 500 }
    )
  }
}
