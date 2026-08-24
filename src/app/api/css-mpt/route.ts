import { NextRequest, NextResponse } from 'next/server'
import { getGeminiConfig } from '@/lib/aiConfig'

export const runtime = 'nodejs'
export const maxDuration = 45

/**
 * MPT — FPSC ka MCQ screening test.
 * Ye pass kiye bagair CSS written exam ke liye apply hi nahi kiya ja sakta.
 * MPT ke number 1200 written marks mein shamil nahi hote.
 *
 * Hisse (FPSC ke elaan ke mutabiq): English, Urdu, Islamic Studies ya
 * Civics & Ethics, General Abilities, Current Affairs, Pakistan Affairs,
 * Everyday Science.
 */
const MPT_SECTIONS: Record<string, { label: string; brief: string; urdu?: boolean }> = {
  english: {
    label: 'English',
    brief: 'Vocabulary, synonyms/antonyms, sentence correction, prepositions, tenses, comprehension.',
  },
  urdu: {
    label: 'Urdu',
    brief: 'اردو قواعد، محاورات، ضرب الامثال، مترادفات، متضاد الفاظ، فہمِ عبارت',
    urdu: true,
  },
  'islamic-studies': {
    label: 'Islamic Studies / Civics & Ethics',
    brief: 'Quran and Seerat basics, ibadat, Islamic history, ethics. (Non-Muslim candidates take Civics & Ethics.)',
  },
  'general-abilities': {
    label: 'General Abilities',
    brief: 'Basic arithmetic, algebra, series, logical and analytical reasoning, data interpretation.',
  },
  'current-affairs': {
    label: 'Current Affairs',
    brief: 'National and international developments, organisations, treaties, recent events.',
  },
  'pakistan-affairs': {
    label: 'Pakistan Affairs',
    brief: 'Pakistan movement, constitution, geography, economy, foreign policy.',
  },
  'everyday-science': {
    label: 'Everyday Science',
    brief: 'Basic physics, chemistry, biology and technology as they appear in daily life.',
  },
}

interface Body {
  section?: string
  count?: number
  mixed?: boolean
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

  const count = Math.min(30, Math.max(5, Number(body.count) || 10))
  const mixed = !!body.mixed
  const section = body.section

  if (!mixed && (!section || !MPT_SECTIONS[section])) {
    return NextResponse.json({ error: 'Sahi section chunein.' }, { status: 400 })
  }

  const isUrdu = !mixed && section === 'urdu'

  const scope = mixed
    ? Object.entries(MPT_SECTIONS)
        .map(([k, v]) => `- ${v.label}: ${v.brief}`)
        .join('\n')
    : `- ${MPT_SECTIONS[section!].label}: ${MPT_SECTIONS[section!].brief}`

  const SCHEMA = `Respond with ONLY valid JSON (no markdown fences):
{
  "questions": [
    {
      "question": string,
      "options": [string, string, string, string],
      "correctIndex": number,
      "section": string,
      "why": string (ek chhota jumla: ye jawab sahi kyun hai)
    }
  ] (exactly ${count} items)
}`

  const prompt = [
    'You are setting questions for the FPSC MPT (MCQ-based Preliminary Test) — the screening test a candidate must pass before applying for the CSS written examination.',
    '',
    mixed
      ? `Make a MIXED practice set covering all MPT sections, spread the ${count} questions across them fairly:`
      : 'Questions must come only from this section:',
    scope,
    '',
    'Rules:',
    '- Match the real MPT difficulty: mostly factual and straightforward, a few that need reasoning.',
    '- Exactly one option must be correct. The wrong options should be plausible, not silly.',
    '- Never invent a fact, date, figure or reference. If unsure of a fact, use a well-established one instead.',
    '- Current Affairs questions: prefer settled facts over very recent events, because your information may be out of date.',
    isUrdu
      ? '- Ye Urdu section hai: sawaal, options aur wajah sab اردو script mein likhein. Roman Urdu bilkul nahi.'
      : '- Write in clear English.',
    '',
    SCHEMA,
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
    const rawText: string =
      data.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('') ?? ''

    if (!rawText) return NextResponse.json({ error: 'AI ne khaali jawab diya.' }, { status: 502 })

    let parsed
    try {
      parsed = JSON.parse(rawText)
    } catch {
      return NextResponse.json({ error: 'AI ka jawab samajh nahi aaya. Dobara try karein.' }, { status: 502 })
    }

    return NextResponse.json({
      questions: parsed.questions ?? [],
      isUrdu,
      sectionLabel: mixed ? 'Mixed — sab sections' : MPT_SECTIONS[section!].label,
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown server error.' },
      { status: 500 }
    )
  }
}
