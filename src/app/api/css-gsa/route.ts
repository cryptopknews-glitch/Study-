import { NextRequest, NextResponse } from 'next/server'
import { getGeminiConfig } from '@/lib/aiConfig'
import { logActivity } from '@/lib/activityLog'

export const runtime = 'nodejs'
export const maxDuration = 30

/**
 * General Science & Ability — CSS ka laazmi paper 3 (100 marks).
 * Do hisse: Everyday Science aur Quantitative/Mental Ability.
 */
const AREAS: Record<string, string> = {
  'physical-sciences':
    'Physical Sciences: constituents of matter, atomic structure, energy, electricity and magnetism, sound and light, modern physics basics.',
  'biological-sciences':
    'Biological Sciences: cell, human body systems, nutrition, diseases and immunity, genetics basics, ecology and biodiversity.',
  'environmental-science':
    'Environmental Science: atmosphere, water and air pollution, climate change, renewable energy, natural hazards and disaster management.',
  'food-science':
    'Food Science: balanced diet, food preservation and spoilage, food additives, quality control.',
  'information-technology':
    'Information Technology: computer basics, networks and internet, telecommunication, IT in daily life, e-governance, cyber security basics.',
  'everyday-science':
    'Everyday Science applications: household science, health and hygiene, common phenomena explained scientifically.',
  'quantitative-ability':
    'Quantitative Ability: number system, ratio and proportion, percentage, average, profit and loss, time and work, time-speed-distance, basic algebra, geometry, mensuration.',
  'mental-ability':
    'Mental Abilities: logical reasoning, analytical reasoning, series, coding-decoding, blood relations, direction sense, syllogism, data interpretation.',
}

interface Body {
  area?: string
  mode?: 'learn' | 'practice' | 'quiz'
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

  const { area, mode = 'learn', question } = body
  if (!area || !AREAS[area]) {
    return NextResponse.json({ error: 'Sahi area chunein.' }, { status: 400 })
  }

  const isAbility = area === 'quantitative-ability' || area === 'mental-ability'

  const modeText: Record<string, string> = {
    learn:
      'Explain the concept the student asked about. Start simple, then add the exam-level detail. Use one worked example.',
    practice: isAbility
      ? 'Give 5 practice questions from easy to hard. Show the full step-by-step solution for each AFTER all five questions, under a "Solutions" heading. Verify each answer before writing it.'
      : 'Give 5 short-answer practice questions from this area, exam style. Put brief model answers at the end under a "Answers" heading.',
    quiz:
      'Give 8 MCQs with 4 options each in CSS General Science & Ability style. List correct options at the end under an "Answers" heading with a one-line reason for each.',
  }

  const systemPrompt = [
    'You are helping a Pakistani student prepare for the CSS (FPSC) compulsory paper "General Science & Ability" (100 marks).',
    'This paper has two halves: Everyday/General Science, and Quantitative & Mental Ability.',
    'The student is currently in ICS (Class 11/12) and will attempt CSS only after completing a BS degree, so build understanding rather than cramming.',
    'Be accurate. Never invent a scientific fact, formula or figure. If you are unsure, say so plainly.',
    isAbility
      ? 'For quantitative questions always show the working step by step, then verify the final answer independently before stating it.'
      : 'Keep science explanations concrete and tied to everyday examples, which is how this paper asks them.',
    'Use short headings and bullet points. Keep it readable on a phone.',
  ].join(' ')

  const userPrompt = [
    `Area: ${AREAS[area]}`,
    `Mode: ${mode}`,
    `Instructions: ${modeText[mode] ?? modeText.learn}`,
    question ? `Student's question/topic: ${question}` : 'No specific question — cover the most important parts of this area for the exam.',
  ].join('\n')

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
      source: 'css-gsa',
      subject: 'General Science & Ability',
      question: question || area,
      answer,
    })

    return NextResponse.json({ answer })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown server error.' },
      { status: 500 }
    )
  }
}
