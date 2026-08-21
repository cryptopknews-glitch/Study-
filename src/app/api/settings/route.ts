import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function maskKey(key: string | null): string {
  if (!key) return ''
  if (key.length <= 8) return '••••••••'
  return key.slice(0, 4) + '••••••••' + key.slice(-4)
}

export async function GET() {
  try {
    const supabase = getSupabaseClient()
    const { data } = await supabase
      .from('settings')
      .select('key, value')
      .in('key', ['GEMINI_API_KEY', 'GEMINI_MODEL'])

    let apiKey: string | null = null
    let model = 'gemini-3.6-flash'
    let apiKeySource: 'database' | 'environment' | 'none' = 'none'

    for (const row of data ?? []) {
      if (row.key === 'GEMINI_API_KEY' && row.value) {
        apiKey = row.value
        apiKeySource = 'database'
      }
      if (row.key === 'GEMINI_MODEL' && row.value) model = row.value
    }

    if (!apiKey && process.env.GEMINI_API_KEY) {
      apiKey = process.env.GEMINI_API_KEY
      apiKeySource = 'environment'
    }

    return NextResponse.json({
      maskedApiKey: maskKey(apiKey),
      apiKeySource,
      model,
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error.' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const { geminiApiKey, geminiModel } = await req.json()
    const supabase = getSupabaseClient()

    if (geminiApiKey && geminiApiKey.trim()) {
      await supabase
        .from('settings')
        .upsert({ key: 'GEMINI_API_KEY', value: geminiApiKey.trim(), updated_at: new Date().toISOString() })
    }

    if (geminiModel && geminiModel.trim()) {
      await supabase
        .from('settings')
        .upsert({ key: 'GEMINI_MODEL', value: geminiModel.trim(), updated_at: new Date().toISOString() })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error.' },
      { status: 500 }
    )
  }
}
