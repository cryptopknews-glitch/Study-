import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = getSupabaseClient()

    const { data: activity } = await supabase
      .from('activity_log')
      .select('*')
      .order('created_at', { ascending: false })

    const { data: notes } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false })

    const { data: books } = await supabase
      .from('books')
      .select('id, title, class, subject, created_at')
      .order('created_at', { ascending: false })

    const backup = {
      exportedAt: new Date().toISOString(),
      activity: activity ?? [],
      notes: notes ?? [],
      uploadedBooks: books ?? [],
    }

    return new NextResponse(JSON.stringify(backup, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="10minstudy-backup-${Date.now()}.json"`,
      },
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error.' },
      { status: 500 }
    )
  }
}
