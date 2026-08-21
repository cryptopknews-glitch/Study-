import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'
import { chunkText } from '@/lib/chunk'

export const runtime = 'nodejs'

const MODEL = 'gemini-3.6-flash'

async function extractTextWithGemini(base64Pdf: string, apiKey: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              {
                inline_data: {
                  mime_type: 'application/pdf',
                  data: base64Pdf,
                },
              },
              {
                text: 'Extract all readable text from this document exactly as written, including text from scanned or handwritten pages if present. Preserve headings and structure using plain text. Do not summarize and do not add commentary — output only the extracted text.',
              },
            ],
          },
        ],
      }),
    }
  )

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Text extraction failed (${res.status}): ${errText}`)
  }

  const data = await res.json()
  const text: string =
    data.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part.text ?? '')
      .join('\n') ?? ''

  return text
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'GEMINI_API_KEY is not configured on the server.' },
      { status: 500 }
    )
  }

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

    // Vercel serverless functions have a request body size limit (~4.5MB on Hobby plan).
    if (file.size > 4 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'PDF bahut badi hai (4MB se zyada). Chhoti file ya kam pages wali PDF try karein.' },
        { status: 400 }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const base64Pdf = Buffer.from(arrayBuffer).toString('base64')

    const extractedText = await extractTextWithGemini(base64Pdf, apiKey)
    const chunks = chunkText(extractedText)

    if (chunks.length === 0) {
      return NextResponse.json(
        { error: 'PDF se text nahi nikala ja saka. File corrupt ho sakti hai ya bilkul khaali hai.' },
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
