import { getSupabaseClient } from './supabase'

/**
 * Uploaded textbook material se sirf wo hissa dhoondta hai jo sawaal se
 * waqai milta ho.
 *
 * Ehtiyat: pehle yahan ek fallback tha jo koi match na milne par us
 * class/subject ke aakhri chunks utha leta tha — chahe unka sawaal se koi
 * taalluq na ho. Prompt AI ko kehta hai ke uploaded material ko "primary
 * source" samjho, is liye AI ghair-mutalliq matn se jawab bana kar use
 * textbook ka jawab keh deta tha. Ab match na milne par `null` return hota
 * hai aur prompt khud AI ko bata deta hai ke koi material nahi mila.
 */
export async function findRelevantContext(params: {
  studentClass: string
  subject: string
  question: string
}): Promise<string | null> {
  const { studentClass, subject, question } = params

  try {
    const supabase = getSupabaseClient()

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

    return null
  } catch {
    return null
  }
}
