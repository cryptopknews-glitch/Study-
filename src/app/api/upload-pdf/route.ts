import { NextRequest, NextResponse } from 'next/server'
import pdfParse from 'pdf-parse'
import { getSupabaseClient } from '@/lib/supabase'
import { chunkText } from '@/lib/chunk'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const studentClass = formData.get('class') as string | null
    const subject = formData.get('subject') as string | null
    const chapter = (formData.get('chapter') as string | null) ?? ''
    const title = (formData.get('title') as string | null) ?? file?.name ?? 'Untitled'

    if (!file || !studentClass || !subject) {
      return NextResponse.json(
        { error: 'File, class, aur subject zaroori hain.' },
        { status: 400 }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const parsed = await pdfParse(buffer)
    const chunks = chunkText(parsed.text)

    if (chunks.length === 0) {
      return NextResponse.json(
        { error: 'PDF se text nahi mila. Ye scanned/image PDF ho sakta hai.' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseClient()

    const { data: book, error: bookError } = await supabase
      .from('books')
      .insert({ title, class: studentClass, subject })
      .select()
      .single()

    if (bookError || !book) {
      return NextResponse.json(
        { error: bookError?.message || 'Book record save nahi hui.' },
        { status: 500 }
      )
    }

    const rows = chunks.map((content) => ({
      book_id: book.id,
      class: studentClass,
      subject,
      chapter,
      content,
    }))

    const { error: chunksError } = await supabase.from('chunks').insert(rows)

    if (chunksError) {
      return NextResponse.json({ error: chunksError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, chunksSaved: rows.length, bookId: book.id })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Upload fail ho gaya.' },
      { status: 500 }
    )
  }
}
