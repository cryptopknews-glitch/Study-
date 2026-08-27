import { NextRequest, NextResponse } from 'next/server'
import { getGeminiConfig } from '@/lib/aiConfig'

export const runtime = 'nodejs'
export const maxDuration = 45

const SECTION_HINTS: Record<string, string> = {
  English: 'vocabulary, synonyms/antonyms, sentence completion, error spotting, prepositions, comprehension',
  'Analytical Reasoning': 'seating arrangements, ordering, grouping, conditional logic puzzles, cause and effect',
  'Analytical / IQ': 'number and letter series, coding-decoding, blood relations, direction sense, odd one out, logical deduction',
  'General Knowledge / IQ': 'basic general knowledge plus series, analogies and logical reasoning',
  'Quantitative (Maths)': 'ratio, percentage, average, profit and loss, time-work, time-speed-distance, basic algebra and geometry',
  Mathematics: 'FSc/HSSC level: functions, quadratic equations, matrices, sequences, trigonometry, calculus basics, permutations',
  'Mathematics (subject)': 'ICS Part 1 and 2 mathematics syllabus',
  'Computer Science': 'ICS computer science: number systems, data types, algorithms, flowcharts, databases, networks, programming basics',
  Physics: 'FSc level physics: mechanics, waves, heat, electricity, magnetism, modern physics',
}

interface Body {
  test?: string
  testName?: string
  section?: string
  count?: number
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

  const { testName, section } = body
  const count = Math.min(25, Math.max(5, Number(body.count) || 10))

  if (!testName || !section) {
    return NextResponse.json({ error: 'Test aur section zaroori hain.' }, { status: 400 })
  }

  const hint = SECTION_HINTS[section] ?? section

  const SCHEMA = `Respond with ONLY valid JSON (no markdown fences):
{
  "questions": [
    {
      "question": string,
      "options": [string, string, string, string],
      "correctIndex": number,
      "why": string (ek chhota jumla: jawab tak kaise pahunchte hain)
    }
  ] (exactly ${count} items)
}`

  const prompt = [
    `You are setting practice questions for the ${testName} university admission test in Pakistan.`,
    `Section: ${section}`,
    `Topics in this section: ${hint}`,
    '',
    'The student has done ICS (Mathematics, Economics, Computer Science) from a Pakistani board and is applying for BS Computer Science.',
    '',
    'Rules:',
    '- Match real entry test difficulty and style: short, solvable in about a minute, four options.',
    '- Exactly one option correct. Wrong options must be plausible traps, not silly.',
    '- For maths and reasoning, the "why" must show the actual route to the answer, not just restate it.',
    '- Verify every answer before writing it. Never leave a question whose answer you are unsure of.',
    '- Never invent a fact or formula.',
    '',
    SCHEMA,
  ].join('\n')

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      }
    )

    if (!res.ok) {
      const errText = await res.text()
      return NextResponse.json({ error: `AI request failed (${res.status}): ${errText}` }, { status: 502 })
    }

    const data = await res.json()
    const raw: string =
      data.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('') ?? ''
    if (!raw) return NextResponse.json({ error: 'AI ne khaali jawab diya.' }, { status: 502 })

    let parsed
    try {
      parsed = JSON.parse(raw)
    } catch {
      return NextResponse.json({ error: 'AI ka jawab samajh nahi aaya. Dobara try karein.' }, { status: 502 })
    }

    return NextResponse.json({ questions: parsed.questions ?? [] })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown server error.' },
      { status: 500 }
    )
  }
}
