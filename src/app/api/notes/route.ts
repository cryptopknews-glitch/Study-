import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { title, content, class: studentClass, subject } = await req.json()

    if (!title || !content) {
      return NextResponse.json({ error: 'Title aur content zaroori hain.' }, { status: 400 })
    }

    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from('notes')
      .insert({
        title,
        content,
        class: studentClass ?? null,
        subject: subject ?? null,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ note: data })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error.' },
      { status: 500 }
    )
  }
}
