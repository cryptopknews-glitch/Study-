import { getSupabaseClient } from './supabase'

export async function findRelevantContext(params: {
  studentClass: string
  subject: string
  question: string
}): Promise<string | null> {
  const { studentClass, subject, question } = params

  try {
    const supabase = getSupabaseClient()

    // Try a loose keyword search first (OR-style, not strict AND matching).
    const { data: searchResults } = await supabase
      .from('chunks')
      .select('content')
      .eq('class', studentClass)
      .eq('subject', subject)
      .textSearch('search', question, { type: 'websearch', config: 'english' })
      .limit(4)

    if (searchResults && searchResults.length > 0) {
      return searchResults.map((row: { content: string }) => row.content).join('\n---\n')
    }

    // Fallback: no exact keyword match, but material exists for this class/subject.
    // For a small personal library this is still more useful than nothing.
    const { data: fallbackResults } = await supabase
      .from('chunks')
      .select('content')
      .eq('class', studentClass)
      .eq('subject', subject)
      .order('created_at', { ascending: false })
      .limit(4)

    if (fallbackResults && fallbackResults.length > 0) {
      return fallbackResults.map((row: { content: string }) => row.content).join('\n---\n')
    }

    return null
  } catch {
    return null
  }
}
