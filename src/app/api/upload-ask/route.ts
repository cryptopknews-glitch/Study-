import { NextRequest, NextResponse } from 'next/server'
import { getGeminiConfig } from '@/lib/aiConfig'
import { logActivity } from '@/lib/activityLog'

export const runtime = 'nodejs'
export const maxDuration = 60

const MAX_TOTAL_BYTES = 4 * 1024 * 1024

export async function POST(req: NextRequest) {
  const { apiKey, model } = await getGeminiConfig()

  if (!apiKey) {
    return NextResponse.json(
      { error: 'GEMINI_API_KEY is not configured. Check AI Settings.' },
      { status: 500 }
    )
  }

  try {
    const formData = await req.formData()
    const question = (formData.get('question') as string | null)?.trim()
    const studentClass = (formData.get('studentClass') as string | null) ?? null
    const subject = (formData.get('subject') as string | null) ?? null
    const files = formData.getAll('files') as File[]

    if (!question) {
      return NextResponse.json({ error: 'Sawal likhna zaroori hai.' }, { status: 400 })
    }
    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'Pehle PDF ya screenshot(s) select karein.' }, { status: 400 })
    }

    let totalSize = 0
    for (const f of files) totalSize += f.size
    if (totalSize > MAX_TOTAL_BYTES) {
      return NextResponse.json(
        { error: 'Files ka total size bahut bara hai (max 4MB combined for Upload & Ask). Bade PDF ke liye "Upload" (library) tool use karein.' },
        { status: 400 }
      )
    }

    const parts: Array<{ inline_data: { mime_type: string; data: string } } | { text: string }> = []
    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer()
      const base64 = Buffer.from(arrayBuffer).toString('base64')
      parts.push({ inline_data: { mime_type: file.type || 'application/pdf', data: base64 } })
    }
    parts.push({ text: question })

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 50_000)

    let aiResponse: Response
    try {
      aiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
          signal: controller.signal,
          body: JSON.stringify({ contents: [{ role: 'user', parts }] }),
        }
      )
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return NextResponse.json(
          {
            error: `AI 50 seconds mein jawab nahi de saki (model: ${model}). Kam files/chhoti screenshots try karein, ya model name AI Settings mein check karein.`,
          },
          { status: 504 }
        )
      }
      throw err
    } finally {
      clearTimeout(timeoutId)
    }

    if (!aiResponse.ok) {
      const errText = await aiResponse.text()
      return NextResponse.json(
        { error: `AI request failed (${aiResponse.status}): ${errText}` },
        { status: 502 }
      )
    }

    const data = await aiResponse.json()
    const answer: string =
      data.candidates?.[0]?.content?.parts
        ?.map((part: { text?: string }) => part.text ?? '')
        .join('\n') ?? ''

    if (!answer) {
      return NextResponse.json({ error: 'AI ne khaali jawab diya.' }, { status: 502 })
    }

    await logActivity({
      source: 'study',
      studentClass,
      subject,
      mode: 'upload-ask',
      question,
      answer,
    })

    return NextResponse.json({ answer })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Upload fail ho gaya.' },
      { status: 500 }
    )
  }
}
