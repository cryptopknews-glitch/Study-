import { getSupabaseClient } from './supabase'

export async function logActivity(params: {
  source: 'study' | 'bscs' | 'css' | 'tenses'
  studentClass?: string | null
  subject?: string | null
  mode?: string | null
  question: string
  answer: string
}) {
  try {
    const supabase = getSupabaseClient()
    await supabase.from('activity_log').insert({
      source: params.source,
      class: params.studentClass ?? null,
      subject: params.subject ?? null,
      mode: params.mode ?? null,
      question: params.question,
      answer: params.answer,
    })
  } catch {
    // Logging must never break the main student-facing response.
  }
}
