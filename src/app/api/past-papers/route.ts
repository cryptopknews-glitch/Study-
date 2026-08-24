import { NextRequest, NextResponse } from 'next/server'
import { getGeminiConfig } from '@/lib/aiConfig'

export const runtime = 'nodejs'
export const maxDuration = 45

const URDU_SUBJECTS = ['Urdu', 'Islamic Education', 'Pakistan Studies']
const LANGUAGE_SUBJECTS = ['English', 'Urdu']

interface Pattern {
  mcq: number
  shortGiven: number
  shortAttempt: number
  shortMarks: number
  longGiven: number
  longAttempt: number
  longMarks: number
}

interface Body {
  studentClass?: string
  subject?: string
  chapter?: string
  style?: 'board' | 'chapter'
  pattern?: Partial<Pattern>
}

/**
 * Punjab Board pattern har saal badalta hai (2026 mein Math ka syllabus hi
 * badal gaya). Is liye ye sirf default hain — user UI se badal sakti hai,
 * aur paper par saaf likha hai ke board notification se tasdeeq karein.
 */
export const DEFAULT_PATTERNS: Record<string, Pattern> = {
  Mathematics:         { mcq: 20, shortGiven: 37, shortAttempt: 25, shortMarks: 2, longGiven: 5, longAttempt: 3, longMarks: 10 },
  Economics:           { mcq: 20, shortGiven: 37, shortAttempt: 25, shortMarks: 2, longGiven: 5, longAttempt: 3, longMarks: 10 },
  'Computer Science':  { mcq: 15, shortGiven: 27, shortAttempt: 18, shortMarks: 2, longGiven: 5, longAttempt: 3, longMarks: 8 },
  English:             { mcq: 0,  shortGiven: 0,  shortAttempt: 0,  shortMarks: 0, longGiven: 0, longAttempt: 0, longMarks: 0 },
  Urdu:                { mcq: 0,  shortGiven: 0,  shortAttempt: 0,  shortMarks: 0, longGiven: 0, longAttempt: 0, longMarks: 0 },
  'Islamic Education': { mcq: 10, shortGiven: 8,  shortAttempt: 5,  shortMarks: 4, longGiven: 3, longAttempt: 2, longMarks: 10 },
  'Pakistan Studies':  { mcq: 10, shortGiven: 8,  shortAttempt: 5,  shortMarks: 4, longGiven: 3, longAttempt: 2, longMarks: 10 },
}

export function totalOf(p: Pattern): number {
  return p.mcq + p.shortAttempt * p.shortMarks + p.longAttempt * p.longMarks
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

  const { studentClass, subject, chapter, style } = body
  if (!studentClass || !subject) {
    return NextResponse.json({ error: 'Class aur subject zaroori hain.' }, { status: 400 })
  }

  const base = DEFAULT_PATTERNS[subject] ?? DEFAULT_PATTERNS.Mathematics
  const p: Pattern = { ...base, ...(body.pattern ?? {}) }
  const isUrdu = URDU_SUBJECTS.includes(subject)
  const isLanguage = LANGUAGE_SUBJECTS.includes(subject)
  const chapterOnly = style === 'chapter' && !!chapter
  const total = totalOf(p)

  const SCHEMA = isLanguage
    ? `Respond with ONLY valid JSON (no markdown fences):
{
  "title": string,
  "totalMarks": 100,
  "timeAllowed": string,
  "instructions": [string],
  "sections": [{"heading": string, "marks": number, "questions": [string], "note": string}],
  "modelAnswers": {"sectionOutlines": [string]},
  "frequency": [string]
}`
    : `Respond with ONLY valid JSON (no markdown fences):
{
  "title": string,
  "totalMarks": ${total},
  "timeAllowed": string,
  "instructions": [string],
  "mcqs": [{"question": string, "options": [string,string,string,string], "correctIndex": number, "chapter": string}] (exactly ${p.mcq} items),
  "shortQuestions": [{"question": string, "chapter": string}] (exactly ${p.shortGiven} items),
  "longQuestions": [{"question": string, "chapter": string}] (exactly ${p.longGiven} items),
  "modelAnswers": {
    "shortAnswers": [string] (har short question ka mukhtasar model jawab, isi tarteeb mein),
    "longOutlines": [string] (har long question ka marking-scheme outline, poora essay nahi)
  },
  "frequency": [string]
}`

  const structure = isLanguage
    ? [
        'This is a language paper. Follow the real Punjab Board format for this subject:',
        subject === 'English'
          ? '- Q1 Explanation of a passage from Book I with reference to context\n- Q2 Short answer questions from Book I\n- Q3 Questions from Book II (play/novel)\n- Q4 Translation (Urdu to English / English to Urdu)\n- Q5 Essay or Story\n- Q6 Letter or Application\n- Q7 Idioms / Phrases in sentences\n- Q8 Grammar (tenses, voice, narration)'
          : '- سوال 1: نثر کے اقتباس کی تشریح حوالہ کے ساتھ\n- سوال 2: نظم کے اشعار کی تشریح\n- سوال 3: سبق کا خلاصہ اور مرکزی خیال\n- سوال 4: مختصر سوالات\n- سوال 5: مضمون نویسی\n- سوال 6: خط یا درخواست\n- سوال 7: محاورات / ضرب الامثال جملوں میں\n- سوال 8: قواعد (اسم، فعل، حروف، واحد جمع)',
        'Give each section its real mark value so the paper totals 100.',
      ].join('\n')
    : [
        'Follow the real Punjab Board paper pattern:',
        `- Objective: ${p.mcq} MCQs, 1 mark each = ${p.mcq} marks`,
        `- Subjective Section I: give ${p.shortGiven} short questions, student attempts any ${p.shortAttempt}, ${p.shortMarks} marks each = ${p.shortAttempt * p.shortMarks} marks`,
        `- Subjective Section II: give ${p.longGiven} long questions, student attempts any ${p.longAttempt}, ${p.longMarks} marks each = ${p.longAttempt * p.longMarks} marks`,
        `- Total: ${total} marks`,
        '- For each question, name the chapter it belongs to in the "chapter" field. This is the pairing scheme — be accurate and spread questions across chapters the way the board does.',
      ].join('\n')

  const prompt = [
    'You are setting a Punjab Board (Pakistan) Intermediate examination paper.',
    `Class: ${studentClass}`,
    `Subject: ${subject}`,
    chapterOnly
      ? `IMPORTANT: This is a CHAPTER TEST. Every single question must come from this chapter only: "${chapter}". Do not include questions from other chapters.`
      : chapter
        ? `Weight the paper towards: ${chapter}, but keep a realistic spread across the whole ${studentClass} syllabus as a real board paper does.`
        : `Spread the questions across the whole ${studentClass} syllabus the way a real board paper does — do not cluster everything in one chapter.`,
    '',
    structure,
    '',
    'Rules:',
    '- Use the exact wording style of Pakistani board papers (Define, Prove, Explain, Differentiate, Write a note on...).',
    '- Difficulty must match a real board paper: mostly straightforward, two or three harder questions.',
    isUrdu
      ? '- Write the ENTIRE paper in Urdu script — questions, options, model answers, everything. Do not use Roman Urdu.'
      : '- Write the paper in English.',
    '- In "frequency", list the topics that genuinely appear most often in past board papers for this subject and class. If you are not certain, say plainly that it is a general guide and the student should check the official pairing scheme.',
    '- Never invent a formula, date, ayat or reference you are not confident about.',
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
      data.candidates?.[0]?.content?.parts?.map((x: { text?: string }) => x.text ?? '').join('') ?? ''

    if (!rawText) return NextResponse.json({ error: 'AI ne khaali jawab diya.' }, { status: 502 })

    let paper
    try {
      paper = JSON.parse(rawText)
    } catch {
      return NextResponse.json({ error: 'AI ka jawab samajh nahi aaya. Dobara try karein.' }, { status: 502 })
    }

    return NextResponse.json({ paper, pattern: p, total, isUrdu, isLanguage })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown server error.' },
      { status: 500 }
    )
  }
}
