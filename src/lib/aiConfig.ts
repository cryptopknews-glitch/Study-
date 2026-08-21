import { getSupabaseClient } from './supabase'

export async function getGeminiConfig(): Promise<{ apiKey: string | null; model: string }> {
  let apiKey: string | null = process.env.GEMINI_API_KEY ?? null
  let model = 'gemini-3.6-flash'

  try {
    const supabase = getSupabaseClient()
    const { data } = await supabase
      .from('settings')
      .select('key, value')
      .in('key', ['GEMINI_API_KEY', 'GEMINI_MODEL'])

    for (const row of data ?? []) {
      if (row.key === 'GEMINI_API_KEY' && row.value) apiKey = row.value
      if (row.key === 'GEMINI_MODEL' && row.value) model = row.value
    }
  } catch {
    // Settings table not reachable (e.g. not migrated yet) — fall back silently.
  }

  return { apiKey, model }
}
