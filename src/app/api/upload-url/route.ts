import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { fileName } = await req.json()

    if (!fileName || typeof fileName !== 'string') {
      return NextResponse.json({ error: 'fileName is required.' }, { status: 400 })
    }

    const supabase = getSupabaseClient()
    const path = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`

    const { data, error } = await supabase.storage.from('textbooks').createSignedUploadUrl(path)

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message || 'Signed upload URL nahi ban saki.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ path: data.path, token: data.token })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error.' },
      { status: 500 }
    )
  }
}
