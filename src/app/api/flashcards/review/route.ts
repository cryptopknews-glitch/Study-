import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Card ka sthir key — wahi sawaal dobara aaye to nayi row na bane. */
function cardKey(front: string): string {
  const norm = front.toLowerCase().replace(/\s+/g, ' ').trim()
  let h = 5381
  for (let i = 0; i < norm.length; i++) h = ((h << 5) + h + norm.charCodeAt(i)) | 0
  return 'c' + Math.abs(h).toString(36) + '-' + norm.length
}

/** SM-2 ka aasan roop: ease aur agla wafqa. */
function nextSchedule(
  result: 'easy' | 'hard' | 'forgot',
  ease: number,
  intervalDays: number
): { ease: number; intervalDays: number } {
  let e = ease
  let iv = intervalDays

  if (result === 'forgot') {
    e = Math.max(1.3, e - 0.2)
    iv = 0 // kal dobara
  } else if (result === 'hard') {
    e = Math.max(1.3, e - 0.05)
    iv = iv <= 0 ? 1 : Math.max(1, Math.round(iv * 1.2))
  } else {
    e = Math.min(2.8, e + 0.1)
    if (iv <= 0) iv = 1
    else if (iv === 1) iv = 3
    else iv = Math.round(iv * e)
  }

  if (iv > 180) iv = 180 // 6 mahine se zyada nahi
  return { ease: e, intervalDays: iv }
}

/** GET — aaj due cards (aur kul ginti) */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentClass = searchParams.get('class')
    const subject = searchParams.get('subject')
    const today = new Date().toISOString().slice(0, 10)

    const supabase = getSupabaseClient()

    let q = supabase
      .from('flashcard_reviews')
      .select('id, card_key, front, back, class, subject, chapter, ease, interval_days, due_date')
      .lte('due_date', today)
      .order('due_date', { ascending: true })
      .limit(60)

    if (studentClass) q = q.eq('class', studentClass)
    if (subject) q = q.eq('subject', subject)

    const { data: due, error } = await q
    if (error) throw error

    const { count: dueCount } = await supabase
      .from('flashcard_reviews')
      .select('id', { count: 'exact', head: true })
      .lte('due_date', today)

    const { count: totalCount } = await supabase
      .from('flashcard_reviews')
      .select('id', { count: 'exact', head: true })

    return NextResponse.json({
      due: due ?? [],
      dueCount: dueCount ?? 0,
      totalCount: totalCount ?? 0,
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error.', due: [], dueCount: 0, totalCount: 0 },
      { status: 500 }
    )
  }
}

/** POST — naye cards save karein, ya kisi card ka result record karein */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const supabase = getSupabaseClient()

    // --- (a) AI se bane naye cards save karo ---
    if (Array.isArray(body.cards)) {
      const { studentClass, subject, chapter } = body
      const rows = body.cards
        .filter((c: { front?: string; back?: string }) => c && c.front && c.back)
        .map((c: { front: string; back: string }) => ({
          card_key: cardKey(c.front),
          front: c.front,
          back: c.back,
          class: studentClass ?? null,
          subject: subject ?? null,
          chapter: chapter || null,
        }))

      if (rows.length === 0) return NextResponse.json({ saved: 0 })

      // card_key unique hai — pehle se maujood card ka progress mit-ta nahi
      const { error } = await supabase
        .from('flashcard_reviews')
        .upsert(rows, { onConflict: 'card_key', ignoreDuplicates: true })

      if (error) throw error
      return NextResponse.json({ saved: rows.length })
    }

    // --- (b) Ek card ka result ---
    const { cardKey: key, result } = body as {
      cardKey?: string
      result?: 'easy' | 'hard' | 'forgot'
    }
    if (!key || !result) {
      return NextResponse.json({ error: 'cardKey aur result zaroori hain.' }, { status: 400 })
    }

    const { data: row, error: readErr } = await supabase
      .from('flashcard_reviews')
      .select('id, ease, interval_days, times_seen, times_wrong')
      .eq('card_key', key)
      .maybeSingle()

    if (readErr) throw readErr
    if (!row) return NextResponse.json({ error: 'Card nahi mila.' }, { status: 404 })

    const { ease, intervalDays } = nextSchedule(result, row.ease ?? 2.5, row.interval_days ?? 0)
    const due = new Date()
    due.setDate(due.getDate() + (intervalDays <= 0 ? 1 : intervalDays))

    const { error: updErr } = await supabase
      .from('flashcard_reviews')
      .update({
        ease,
        interval_days: intervalDays,
        due_date: due.toISOString().slice(0, 10),
        times_seen: (row.times_seen ?? 0) + 1,
        times_wrong: (row.times_wrong ?? 0) + (result === 'forgot' ? 1 : 0),
        last_result: result,
        updated_at: new Date().toISOString(),
      })
      .eq('id', row.id)

    if (updErr) throw updErr

    return NextResponse.json({
      ok: true,
      nextDue: due.toISOString().slice(0, 10),
      intervalDays,
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error.' },
      { status: 500 }
    )
  }
}
