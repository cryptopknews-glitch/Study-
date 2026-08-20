import { getSupabaseClient } from './supabase'

export async function findRelevantContext(params: {
  studentClass: string
  subject: string
  question: string
}): Promise<string | null> {
  const { studentClass, subject, question } = params

  try {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from('chunks')
      .select('content')
      .eq('class', studentClass)
      .eq('subject', subject)
      .textSearch('search', question, { type: 'plain', config: 'english' })
      .limit(4)

    if (error || !data || data.length === 0) return null

    return data.map((row: { content: string }) => row.content).join('\n---\n')
  } catch {
    // If Supabase is not configured yet, silently fall back to general knowledge.
    return null
  }
}
