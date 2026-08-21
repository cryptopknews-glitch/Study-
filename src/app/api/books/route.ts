import { NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const supabase = getSupabaseClient()

    const { data: books, error } = await supabase
      .from('books')
      .select('id, title, class, subject, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const booksWithCounts = await Promise.all(
      (books ?? []).map(async (book) => {
        const { count } = await supabase
          .from('chunks')
          .select('id', { count: 'exact', head: true })
          .eq('book_id', book.id)
        return { ...book, chunkCount: count ?? 0 }
      })
    )

    return NextResponse.json({ books: booksWithCounts })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error.' },
      { status: 500 }
    )
  }
}
