import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** POST — MCQ ka sahi/galat record karo */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const rows = Array.isArray(body.attempts) ? body.attempts : [body]

    const clean = rows
      .filter((r: { question?: string }) => r && r.question)
      .map((r: {
        source?: string
        studentClass?: string
        subject?: string
        topic?: string
        question: string
        correct?: boolean
        chosen?: string
        answer?: string
      }) => ({
        source: r.source || 'study',
        class: r.studentClass ?? null,
        subject: r.subject ?? null,
        topic: r.topic ?? null,
        question: r.question,
        correct: !!r.correct,
        chosen: r.chosen ?? null,
        answer: r.answer ?? null,
      }))

    if (clean.length === 0) return NextResponse.json({ saved: 0 })

    const supabase = getSupabaseClient()
    const { error } = await supabase.from('quiz_attempts').insert(clean)
    if (error) throw error

    return NextResponse.json({ saved: clean.length })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error.' },
      { status: 500 }
    )
  }
}

/** GET — galtiyan aur kamzor topics */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const only = searchParams.get('only') // 'wrong' = sirf galat
    const subject = searchParams.get('subject')

    const supabase = getSupabaseClient()

    let q = supabase
      .from('quiz_attempts')
      .select('id, source, class, subject, topic, question, correct, chosen, answer, created_at')
      .order('created_at', { ascending: false })
      .limit(200)

    if (only === 'wrong') q = q.eq('correct', false)
    if (subject) q = q.eq('subject', subject)

    const { data: rows, error } = await q
    if (error) throw error

    // Kamzor topics — jahan galtiyan zyada hain
    const { data: all } = await supabase
      .from('quiz_attempts')
      .select('subject, topic, correct')
      .limit(2000)

    const bucket: Record<string, { right: number; wrong: number; subject: string; topic: string }> = {}
    for (const r of all ?? []) {
      const subj = r.subject || 'Other'
      const top = r.topic || 'General'
      const key = subj + ' :: ' + top
      if (!bucket[key]) bucket[key] = { right: 0, wrong: 0, subject: subj, topic: top }
      if (r.correct) bucket[key].right++
      else bucket[key].wrong++
    }

    const weak = Object.values(bucket)
      .map((b) => ({
        ...b,
        total: b.right + b.wrong,
        accuracy: b.right + b.wrong > 0 ? Math.round((b.right / (b.right + b.wrong)) * 100) : 0,
      }))
      .filter((b) => b.total >= 3 && b.accuracy < 70)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 8)

    const totalAttempts = (all ?? []).length
    const totalWrong = (all ?? []).filter((r) => !r.correct).length

    return NextResponse.json({
      rows: rows ?? [],
      weak,
      totalAttempts,
      totalWrong,
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error.', rows: [], weak: [], totalAttempts: 0, totalWrong: 0 },
      { status: 500 }
    )
  }
}

/** DELETE — ek galti list se hata dein (jab yaad ho jaye) */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id zaroori hai.' }, { status: 400 })

    const supabase = getSupabaseClient()
    const { error } = await supabase.from('quiz_attempts').delete().eq('id', id)
    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error.' },
      { status: 500 }
    )
  }
}
