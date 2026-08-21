import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = getSupabaseClient()

    const { count: totalCount } = await supabase
      .from('activity_log')
      .select('id', { count: 'exact', head: true })

    const { data: recent } = await supabase
      .from('activity_log')
      .select('id, source, class, subject, mode, question, answer, created_at')
      .order('created_at', { ascending: false })
      .limit(20)

    const { data: allSubjects } = await supabase.from('activity_log').select('subject')

    const subjectCounts: Record<string, number> = {}
    for (const row of allSubjects ?? []) {
      const key = row.subject || 'Other'
      subjectCounts[key] = (subjectCounts[key] || 0) + 1
    }

    const { data: notes } = await supabase
      .from('notes')
      .select('id, title, content, class, subject, created_at')
      .order('created_at', { ascending: false })

    return NextResponse.json({
      totalCount: totalCount ?? 0,
      recent: recent ?? [],
      subjectCounts,
      notes: notes ?? [],
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error.' },
      { status: 500 }
    )
  }
}
