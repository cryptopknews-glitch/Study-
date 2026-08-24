import { NextRequest, NextResponse } from 'next/server'
import { getGeminiConfig } from '@/lib/aiConfig'

export const runtime = 'nodejs'


interface Body {
  action?: 'suggest_topic' | 'evaluate' | 'score'
  topic?: string
  outline?: string
  essay?: string
}

export async function POST(req: NextRequest) {
  const { apiKey, model } = await getGeminiConfig()
  if (!apiKey) {
    return NextResponse.json({ error: 'GEMINI_API_KEY is not configured on the server.' }, { status: 500 })
  }

  let body: Body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  if (body.action === 'suggest_topic') {
    const prompt = 'Give ONE thoughtful, analytical essay topic in the style of CSS (Pakistan) Essay paper topics (governance, society, technology, philosophy, economy). Output ONLY the topic, nothing else.'
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }] }),
      })
      if (!res.ok) {
        const errText = await res.text()
        return NextResponse.json({ error: `AI request failed (${res.status}): ${errText}` }, { status: 502 })
      }
      const data = await res.json()
      const topic: string =
        data.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('').trim() ?? ''
      if (!topic) return NextResponse.json({ error: 'AI ne khaali jawab diya.' }, { status: 502 })
      return NextResponse.json({ topic })
    } catch (err) {
      return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error.' }, { status: 500 })
    }
  }

  if (body.action === 'score') {
    const { topic, essay } = body
    if (!topic || !essay || !essay.trim()) {
      return NextResponse.json({ error: 'Topic aur essay dono zaroori hain.' }, { status: 400 })
    }
    if (essay.length > 30000) {
      return NextResponse.json({ error: 'Essay bahut lamba hai.' }, { status: 400 })
    }

    const SCORE_SCHEMA = `Respond with ONLY valid JSON (no markdown fences):
{
  "total": number (0-100),
  "breakdown": {
    "clarity": {"score": number (0-25), "note": string},
    "coherence": {"score": number (0-25), "note": string},
    "vocabulary": {"score": number (0-25), "note": string},
    "argument": {"score": number (0-25), "note": string}
  },
  "strengths": [string] (2-4 points),
  "weaknesses": [string] (2-5 points),
  "nextSteps": [string] (2-3 concrete actions),
  "wordCount": number,
  "verdict": string (one honest sentence)
}`

    const prompt = [
      'You are an FPSC CSS English Essay paper examiner. This paper is 100 marks and the pass mark is 40.',
      'CSS essay examiners are famously strict — the failure rate on this paper is very high.',
      'Mark the essay on four equal criteria of 25 marks each: Clarity of thought, Coherence/structure, Vocabulary/expression, and Argument quality (including evidence and counter-argument).',
      '',
      'Marking rules:',
      '- Be honest. Do not inflate the score to be kind. An inflated score teaches nothing and sets her up to fail the real paper.',
      '- But keep the tone encouraging and specific. This student is young and building a foundation years before the real exam.',
      '- Reward a clear thesis, logical progression, real examples, and an acknowledged counter-argument.',
      '- Penalise: no clear thesis, listing points without argument, memorised filler, unsupported claims, repetition.',
      '- Do not penalise handwriting or minor typing slips.',
      '- Count the words honestly and say if the length is far below what the paper expects.',
      '',
      `Essay topic: ${topic}`,
      '',
      "Student's essay:",
      essay,
      '',
      SCORE_SCHEMA,
    ].join('\n')

    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      })
      if (!res.ok) {
        const errText = await res.text()
        return NextResponse.json({ error: `AI request failed (${res.status}): ${errText}` }, { status: 502 })
      }
      const data = await res.json()
      const raw: string =
        data.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('') ?? ''
      if (!raw) return NextResponse.json({ error: 'AI ne khaali jawab diya.' }, { status: 502 })

      let result
      try {
        result = JSON.parse(raw)
      } catch {
        return NextResponse.json({ error: 'AI ka jawab samajh nahi aaya. Dobara try karein.' }, { status: 502 })
      }

      // Har hissa 0-25 ke andar, aur total unka jama
      const keys = ['clarity', 'coherence', 'vocabulary', 'argument'] as const
      let sum = 0
      for (const k of keys) {
        const b = result?.breakdown?.[k]
        let v = Number(b?.score)
        if (!Number.isFinite(v)) v = 0
        v = Math.max(0, Math.min(25, v))
        if (result?.breakdown?.[k]) result.breakdown[k].score = v
        sum += v
      }
      result.total = sum
      result.wordCount = essay.trim().split(/\s+/).filter(Boolean).length

      return NextResponse.json(result)
    } catch (err) {
      return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error.' }, { status: 500 })
    }
  }

  if (body.action === 'evaluate') {
    const { topic, outline } = body
    if (!topic || !outline || !outline.trim()) {
      return NextResponse.json({ error: 'Topic aur outline zaroori hain.' }, { status: 400 })
    }
    if (outline.length > 3000) {
      return NextResponse.json({ error: 'Outline bahut lambi hai.' }, { status: 400 })
    }

    const prompt = [
      `Essay topic: ${topic}`,
      `Student's essay outline (thesis + main points):`,
      outline,
      '',
      'Evaluate this outline like a CSS essay examiner would evaluate a plan before the student writes the full essay. Use short headings:',
      '1. Thesis Strength — is the central argument clear and debatable?',
      '2. Structure & Coverage — are there enough distinct, well-organized points? Any obvious angle missing (e.g. counterargument, Pakistan-specific angle)?',
      '3. Suggested Improvements — 2-3 concrete suggestions',
      '4. A sample expanded outline with 5-6 stronger points for reference',
      'Keep the response focused, not overly long.',
    ].join('\n')

    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }] }),
      })
      if (!res.ok) {
        const errText = await res.text()
        return NextResponse.json({ error: `AI request failed (${res.status}): ${errText}` }, { status: 502 })
      }
      const data = await res.json()
      const feedback: string =
        data.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('\n') ?? ''
      if (!feedback) return NextResponse.json({ error: 'AI ne khaali jawab diya.' }, { status: 502 })
      return NextResponse.json({ feedback })
    } catch (err) {
      return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error.' }, { status: 500 })
    }
  }

  return NextResponse.json({ error: 'Invalid action.' }, { status: 400 })
}
