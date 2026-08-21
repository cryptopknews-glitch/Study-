import { NextRequest, NextResponse } from 'next/server'
import { getGeminiConfig } from '@/lib/aiConfig'

export const runtime = 'nodejs'


interface PrecisRequestBody {
  action?: 'generate' | 'evaluate'
  passage?: string
  title?: string
  precis?: string
}

export async function POST(req: NextRequest) {
  const { apiKey, model } = await getGeminiConfig()

  if (!apiKey) {
    return NextResponse.json(
      { error: 'GEMINI_API_KEY is not configured on the server.' },
      { status: 500 }
    )
  }

  let body: PrecisRequestBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  if (body.action === 'generate') {
    const prompt = [
      'Write an original passage suitable for CSS (Pakistan Central Superior Services exam) precis practice.',
      'Length: 230-270 words. Topic: any serious, thoughtful subject (governance, society, economy, science, ethics, history) — avoid anything overly technical or region-specific niche trivia.',
      'Write in formal, analytical English similar to FPSC precis passages. Output ONLY the passage text, no title, no commentary.',
    ].join(' ')

    try {
      const aiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
          }),
        }
      )

      if (!aiResponse.ok) {
        const errText = await aiResponse.text()
        return NextResponse.json(
          { error: `AI request failed (${aiResponse.status}): ${errText}` },
          { status: 502 }
        )
      }

      const data = await aiResponse.json()
      const passage: string =
        data.candidates?.[0]?.content?.parts
          ?.map((part: { text?: string }) => part.text ?? '')
          .join('\n')
          .trim() ?? ''

      if (!passage) {
        return NextResponse.json({ error: 'AI ne khaali jawab diya.' }, { status: 502 })
      }

      return NextResponse.json({ passage })
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : 'Unknown server error.' },
        { status: 500 }
      )
    }
  }

  if (body.action === 'evaluate') {
    const { passage, title, precis } = body

    if (!passage || !precis || !precis.trim()) {
      return NextResponse.json({ error: 'Passage aur precis zaroori hain.' }, { status: 400 })
    }

    if (precis.length > 3000) {
      return NextResponse.json({ error: 'Precis bahut lambi hai.' }, { status: 400 })
    }

    const wordCount = passage.trim().split(/\s+/).length
    const targetLength = Math.round(wordCount / 3)

    const prompt = [
      'You are a CSS (Pakistan) precis-writing evaluator, similar to an FPSC examiner.',
      `Original passage (${wordCount} words):`,
      passage,
      '',
      `Student's suggested title: ${title || '(no title given)'}`,
      `Student's precis:`,
      precis,
      '',
      `A good precis should be about 1/3 of the original length (around ${targetLength} words) and capture the main ideas in the student's own words, formally and concisely.`,
      'Evaluate the precis like an examiner would. Respond in this structure using short headings:',
      '1. Title — is it appropriate and concise?',
      '2. Compression — is the length close to 1/3? Are key ideas captured, and is anything essential missing or unnecessary detail included?',
      '3. Language & Style — grammar, formality, clarity, and whether it reads as an independent piece (not copied phrasing from the original).',
      '4. Overall Score — give a rough score out of 20 with one line of reasoning.',
      '5. Model Precis — write a strong example precis (with title) for comparison.',
      'Keep the whole response focused and not overly long.',
    ].join('\n')

    try {
      const aiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
          }),
        }
      )

      if (!aiResponse.ok) {
        const errText = await aiResponse.text()
        return NextResponse.json(
          { error: `AI request failed (${aiResponse.status}): ${errText}` },
          { status: 502 }
        )
      }

      const data = await aiResponse.json()
      const feedback: string =
        data.candidates?.[0]?.content?.parts
          ?.map((part: { text?: string }) => part.text ?? '')
          .join('\n') ?? ''

      if (!feedback) {
        return NextResponse.json({ error: 'AI ne khaali jawab diya.' }, { status: 502 })
      }

      return NextResponse.json({ feedback })
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : 'Unknown server error.' },
        { status: 500 }
      )
    }
  }

  return NextResponse.json({ error: 'Invalid action.' }, { status: 400 })
}
