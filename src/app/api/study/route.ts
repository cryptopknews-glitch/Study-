import { NextRequest, NextResponse } from 'next/server'
import { buildSystemPrompt, buildUserPrompt } from '@/lib/prompts'
import { findRelevantContext } from '@/lib/retrieval'
import { logActivity } from '@/lib/activityLog'
import type { Class, Subject } from '@/lib/types'
import type { AnswerModeId } from '@/lib/constants'
import { getGeminiConfig } from '@/lib/aiConfig'

export const runtime = 'nodejs'


interface StudyRequestBody {
  studentClass: Class
  subject: Subject
  question: string
  mode: AnswerModeId
}

export async function POST(req: NextRequest) {
  const { apiKey, model } = await getGeminiConfig()

  if (!apiKey) {
    return NextResponse.json(
      { error: 'GEMINI_API_KEY is not configured on the server. Add it in Vercel Project Settings -> Environment Variables.' },
      { status: 500 }
    )
  }

  let body: StudyRequestBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const { studentClass, subject, question, mode } = body

  if (!studentClass || !subject || !mode || !question || !question.trim()) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
  }

  if (question.length > 2000) {
    return NextResponse.json({ error: 'Question bahut lambi hai (max 2000 characters).' }, { status: 400 })
  }

  const context = await findRelevantContext({ studentClass, subject, question })

  /**
   * Quiz mode structured JSON deta hai taake har MCQ ka sahi/galat
   * record ho sake (Mistakes page aur kamzor topics ke liye).
   * Baqi modes pehle ki tarah markdown hi dete hain.
   */
  const isQuiz = mode === 'quiz'

  const QUIZ_SCHEMA = `Respond with ONLY valid JSON (no markdown fences):
{
  "intro": string (ek chhota jumla is topic ke bare mein),
  "questions": [
    {
      "question": string,
      "options": [string, string, string, string],
      "correctIndex": number,
      "why": string (ek jumla: ye jawab sahi kyun hai)
    }
  ] (exactly 5 items)
}`

  const userPromptText = isQuiz
    ? [
        buildUserPrompt({ studentClass, subject, question, mode, context }),
        '',
        'Exactly one option must be correct. Wrong options should be plausible, not silly.',
        'Never invent a fact, formula, date or reference you are not confident about.',
        '',
        QUIZ_SCHEMA,
      ].join('\n')
    : buildUserPrompt({ studentClass, subject, question, mode, context })

  try {
    const aiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: buildSystemPrompt() }],
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: userPromptText }],
            },
          ],
          ...(isQuiz ? { generationConfig: { responseMimeType: 'application/json' } } : {}),
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
    const answer: string =
      data.candidates?.[0]?.content?.parts
        ?.map((part: { text?: string }) => part.text ?? '')
        .join('\n') ?? ''

    if (!answer) {
      return NextResponse.json(
        { error: 'AI ne khaali jawab diya. Dobara koshish karein ya question thoda rephrase karein.' },
        { status: 502 }
      )
    }

    if (isQuiz) {
      let quiz
      try {
        quiz = JSON.parse(answer)
      } catch {
        // JSON na aaye to markdown hi de do — quiz phir bhi kaam karega,
        // bas record nahi hoga.
        await logActivity({ source: 'study', studentClass, subject, mode, question, answer })
        return NextResponse.json({ answer, usedUploadedMaterial: Boolean(context) })
      }

      const questions = Array.isArray(quiz?.questions) ? quiz.questions : []

      await logActivity({
        source: 'study',
        studentClass,
        subject,
        mode,
        question,
        answer: questions
          .map(
            (q: { question: string; options: string[]; correctIndex: number }, i: number) =>
              `${i + 1}. ${q.question}\n` +
              (q.options ?? []).map((o, oi) => `   ${String.fromCharCode(65 + oi)}. ${o}`).join('\n') +
              `\n   Answer: ${String.fromCharCode(65 + (q.correctIndex ?? 0))}`
          )
          .join('\n\n'),
      })

      return NextResponse.json({
        quiz: { intro: quiz?.intro ?? '', questions },
        usedUploadedMaterial: Boolean(context),
      })
    }

    await logActivity({
      source: 'study',
      studentClass,
      subject,
      mode,
      question,
      answer,
    })

    return NextResponse.json({ answer, usedUploadedMaterial: Boolean(context) })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown server error.' },
      { status: 500 }
    )
  }
}
