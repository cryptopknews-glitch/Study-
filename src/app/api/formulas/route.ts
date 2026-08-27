import { NextRequest, NextResponse } from 'next/server'
import { getGeminiConfig } from '@/lib/aiConfig'
import { getSupabaseClient } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 45

/**
 * Formula / definition sheets — ek baar bante hain, phir save reh jate hain.
 * Har baar AI se banwana waqt aur Gemini quota dono zaya karta tha.
 */

/** GET — saved sheets ki list, ya ek sheet ka poora matn */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const supabase = getSupabaseClient()

    if (id) {
      const { data, error } = await supabase
        .from('notes')
        .select('id, title, content, class, subject, created_at')
        .eq('id', id)
        .maybeSingle()
      if (error) throw error
      return NextResponse.json({ sheet: data })
    }

    const { data, error } = await supabase
      .from('notes')
      .select('id, title, content, class, subject, created_at')
      .like('title', 'Formula Sheet%')
      .order('created_at', { ascending: false })
      .limit(60)
    if (error) throw error

    return NextResponse.json({ sheets: data ?? [] })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error.', sheets: [] },
      { status: 500 }
    )
  }
}

interface Body {
  studentClass?: string
  subject?: string
  chapter?: string
}

const URDU_SUBJECTS = ['Urdu', 'Islamic Education', 'Pakistan Studies']

/** POST — nayi sheet banao aur save kar do */
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

  const { studentClass, subject, chapter } = body
  if (!studentClass || !subject) {
    return NextResponse.json({ error: 'Class aur subject zaroori hain.' }, { status: 400 })
  }

  const isUrdu = URDU_SUBJECTS.includes(subject)
  const isFormulaSubject = subject === 'Mathematics' || subject === 'Economics' || subject === 'Computer Science'

  const prompt = [
    'You are making a one-page revision sheet for a Punjab Board (Pakistan) Intermediate student.',
    `Class: ${studentClass}`,
    `Subject: ${subject}`,
    chapter ? `Chapter: ${chapter}` : 'Cover the whole year syllabus, chapter by chapter.',
    '',
    isFormulaSubject
      ? 'Include: every formula she must memorise, what each symbol means, and one line on when to use it. Group by chapter. Use a markdown table per chapter with columns: Formula | Kya hai | Kab use karein.'
      : 'Include: key definitions, important terms, dates/names/events that are commonly asked, and short must-remember points. Group by chapter using markdown tables.',
    '',
    'Rules:',
    '- This is for last-minute revision — no explanations, no examples, only what must be memorised.',
    '- Be accurate. Never invent a formula, date, ayat or reference. If you are not certain of one, leave it out.',
    '- Use plain-text math notation (x^2, sqrt(x), integral) so it displays on a phone.',
    isUrdu ? '- اردو رسم الخط میں لکھیں۔' : '- Write in English.',
    '- Start with a markdown H2 heading naming the subject and class.',
  ]
    .filter(Boolean)
    .join('\n')

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }] }),
      }
    )

    if (!res.ok) {
      const errText = await res.text()
      return NextResponse.json({ error: `AI request failed (${res.status}): ${errText}` }, { status: 502 })
    }

    const data = await res.json()
    const content: string =
      data.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('\n') ?? ''

    if (!content) return NextResponse.json({ error: 'AI ne khaali jawab diya.' }, { status: 502 })

    const title = `Formula Sheet — ${subject}${chapter ? ' — ' + chapter : ''} (${studentClass})`

    let saved = null
    try {
      const supabase = getSupabaseClient()
      const { data: row } = await supabase
        .from('notes')
        .insert({ title, content, class: studentClass, subject })
        .select('id, title, content, class, subject, created_at')
        .maybeSingle()
      saved = row
    } catch {
      /* save fail ho to bhi sheet dikhni chahiye */
    }

    return NextResponse.json({ content, title, saved, isUrdu })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown server error.' },
      { status: 500 }
    )
  }
}
