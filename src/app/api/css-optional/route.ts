import { NextRequest, NextResponse } from 'next/server'
import { getGeminiConfig } from '@/lib/aiConfig'
import { logActivity } from '@/lib/activityLog'

export const runtime = 'nodejs'
export const maxDuration = 30

/**
 * CSS optional subjects — 600 marks, FPSC ke groups mein se chune jate hain.
 * Yahan sirf wo teen rakhe hain jo BSCS wali beti ke liye qudrati hain,
 * kyunki degree ka parha hua seedha kaam aata hai.
 */
const OPTIONALS: Record<string, { label: string; marks: number; papers: number; scope: string; overlap: string }> = {
  'computer-science': {
    label: 'Computer Science',
    marks: 100,
    papers: 1,
    scope:
      'Theory of computation, algorithms and complexity, data structures, operating systems, databases, computer networks, software engineering, computer architecture, programming concepts.',
    overlap:
      'BSCS ke Data Structures, Algorithms, OS, DBMS, Networks aur Software Engineering courses seedhe is paper mein aate hain.',
  },
  mathematics: {
    label: 'Pure / Applied Mathematics',
    marks: 200,
    papers: 2,
    scope:
      'Pure: modern algebra, calculus, complex analysis, differential geometry, topology. Applied: mechanics, differential equations, numerical methods, vector analysis.',
    overlap:
      'ICS ki Math aur BSCS ke Calculus, Linear Algebra, Discrete Maths aur Numerical Methods is paper ki bunyad hain.',
  },
  statistics: {
    label: 'Statistics',
    marks: 100,
    papers: 1,
    scope:
      'Probability, distributions, sampling, estimation, hypothesis testing, regression and correlation, design of experiments, index numbers, time series.',
    overlap:
      'BSCS ke Probability & Statistics aur Data Science/ML courses is paper mein bohat madad karte hain.',
  },
}

interface Body {
  subject?: string
  mode?: 'overview' | 'topic' | 'practice' | 'plan'
  question?: string
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

  const { subject, mode = 'overview', question } = body
  if (!subject || !OPTIONALS[subject]) {
    return NextResponse.json({ error: 'Sahi optional subject chunein.' }, { status: 400 })
  }

  const s = OPTIONALS[subject]

  const modeText: Record<string, string> = {
    overview:
      'Give an honest overview of this optional subject for CSS: what it covers, how it is marked, what makes candidates score well or badly in it, and who should NOT pick it. Be balanced — do not sell it.',
    topic:
      'Explain the topic the student asked about at CSS optional-paper depth. Start with the idea in plain language, then the formal treatment, then how it is typically asked in the paper.',
    practice:
      'Give 4 past-paper-style questions for this subject, from easy to hard. After all four, give marking-scheme outlines under a "Marking Scheme" heading — key points expected, not full answers.',
    plan:
      'Give a realistic preparation plan for this subject for a student who will attempt CSS after completing BSCS. Say what to read, in what order, and roughly how long each part takes. Be honest about the workload.',
  }

  const systemPrompt = [
    'You are advising a Pakistani student on a CSS (FPSC) OPTIONAL subject.',
    'She is currently in ICS (Class 11/12) and plans BS Computer Science, then CSS. She cannot attempt CSS until her degree is complete.',
    'Optional subjects total 600 marks and are chosen from FPSC groups. Passing mark for optional papers is 33%.',
    'Because she will have a Computer Science degree, subjects that overlap her degree save her enormous time — say so where it is true, but never overstate.',
    'Be honest about difficulty and scoring. Do not encourage picking a subject just because it sounds impressive.',
    'Never invent syllabus items, book names or marks distribution you are not sure about. If unsure, tell her to check the FPSC syllabus PDF.',
  ].join(' ')

  const userPrompt = [
    `Optional subject: ${s.label} (${s.marks} marks, ${s.papers} paper${s.papers > 1 ? 's' : ''})`,
    `Scope: ${s.scope}`,
    `Overlap with her degree: ${s.overlap}`,
    `Mode: ${mode}`,
    `Instructions: ${modeText[mode] ?? modeText.overview}`,
    question ? `Her question: ${question}` : '',
  ]
    .filter(Boolean)
    .join('\n')

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        }),
      }
    )

    if (!res.ok) {
      const errText = await res.text()
      return NextResponse.json({ error: `AI request failed (${res.status}): ${errText}` }, { status: 502 })
    }

    const data = await res.json()
    const answer: string =
      data.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('\n') ?? ''

    if (!answer) return NextResponse.json({ error: 'AI ne khaali jawab diya.' }, { status: 502 })

    await logActivity({
      source: 'css',
      subject: `CSS Optional — ${s.label}`,
      mode: `optional-${mode}`,
      question: question || mode,
      answer,
    })

    return NextResponse.json({ answer, meta: s })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown server error.' },
      { status: 500 }
    )
  }
}
