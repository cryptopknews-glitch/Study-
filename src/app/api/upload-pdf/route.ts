import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient } from '@/lib/supabase'
import { chunkText } from '@/lib/chunk'
import { getGeminiConfig } from '@/lib/aiConfig'

export const runtime = 'nodejs'
export const maxDuration = 60

// Gemini inline document requests top out well above this; keep a safe ceiling
// so extraction stays reliable within the serverless function's time limit.
const MAX_PDF_BYTES = 15 * 1024 * 1024

async function extractTextWithGemini(base64Pdf: string, apiKey: string, model: string): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
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
              { inline_data: { mime_type: 'application/pdf', data: base64Pdf } },
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
  const { apiKey, model } = await getGeminiConfig()

  if (!apiKey) {
    return NextResponse.json(
      { error: 'GEMINI_API_KEY is not configured on the server.' },
      { status: 500 }
    )
  }

  try {
    const { storagePath, class: studentClass, subject, chapter, title } = await req.json()

    if (!storagePath || !studentClass || !subject) {
      return NextResponse.json(
        { error: 'storagePath, class, aur subject zaroori hain.' },
        { status: 400 }
      )
    }

    const supabase = getSupabaseClient()

    const { data: fileData, error: downloadError } = await supabase.storage
      .from('textbooks')
      .download(storagePath)

    if (downloadError || !fileData) {
      return NextResponse.json(
        { error: downloadError?.message || 'File storage se download nahi ho saki.' },
        { status: 500 }
      )
    }

    const arrayBuffer = await fileData.arrayBuffer()

    if (arrayBuffer.byteLength > MAX_PDF_BYTES) {
      await supabase.storage.from('textbooks').remove([storagePath])
      return NextResponse.json(
        { error: 'PDF bahut badi hai (15MB se zyada). Ise chapters mein tod kar upload karein.' },
        { status: 400 }
      )
    }

    const base64Pdf = Buffer.from(arrayBuffer).toString('base64')
    const extractedText = await extractTextWithGemini(base64Pdf, apiKey, model)
    const chunks = chunkText(extractedText)

    // Clean up: we only need the extracted text going forward, not the raw PDF.
    await supabase.storage.from('textbooks').remove([storagePath])

    if (chunks.length === 0) {
      return NextResponse.json(
        { error: 'PDF se text nahi nikala ja saka. File corrupt ho sakti hai ya bilkul khaali hai.' },
        { status: 400 }
      )
    }

    const { data: book, error: bookError } = await supabase
      .from('books')
      .insert({ title: title || 'Untitled', class: studentClass, subject })
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
      chapter: chapter || '',
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
