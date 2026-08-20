import type { Class, Subject } from './types'
import type { AnswerModeId } from './constants'

const MODE_INSTRUCTIONS: Record<AnswerModeId, string> = {
  explain:
    'Give a simple explanation of the concept in plain language first, then the formal definition. Use short paragraphs and one clear example.',
  solve:
    'Solve the problem step by step. Structure the answer as: Understand the problem -> Method -> Steps -> Final answer. Never skip straight to the final answer.',
  summarize:
    'Summarize the topic/chapter in short bullet points. Keep it exam-focused and easy to revise from.',
  practice:
    'Generate 3-5 practice questions on this topic, ordered from easy to hard. Do not include the answers.',
  quiz:
    'Generate 5 multiple choice questions (MCQs) with 4 options each on this topic. List the correct options at the end under an "Answers" heading.',
}

const SUBJECT_GUIDANCE: Record<Subject, string> = {
  Mathematics:
    'Show all working. Never give only the final answer for solve-type questions. Use plain-text math notation (e.g. x^2, sqrt(x)).',
  'Computer Science':
    'When code is involved, explain: what the code does, how it works, key concepts used, expected output, and (if there is an error) the corrected code with reasoning.',
  Economics:
    'Keep answers simple and exam-oriented. Use definitions and short points, and describe relevant graphs/curves in words when useful.',
  English:
    'Focus on grammar accuracy, correct sentence structure, and clear examples. Point out common mistakes where relevant.',
}

export function buildSystemPrompt(): string {
  return [
    'You are the study assistant inside 10MinStudy, a private study app for one ICS student (Class 11 & 12) preparing for BS Computer Science.',
    'Subjects covered: Mathematics, Computer Science, Economics, English.',
    'Always answer in a way that helps the student understand the concept, not just copy an answer.',
    'Keep answers focused, exam-relevant, and free of unnecessary filler.',
    'Format the answer with short clear headings and bullet points where useful.',
    'When uploaded textbook material is provided, treat it as the primary source. Never claim an answer came from the textbook if it did not — if the material does not fully cover the question, say so clearly and then add general knowledge.',
  ].join(' ')
}

export function buildUserPrompt(params: {
  studentClass: Class
  subject: Subject
  question: string
  mode: AnswerModeId
  context?: string | null
}): string {
  const { studentClass, subject, question, mode, context } = params

  const lines = [
    `Class: ${studentClass}`,
    `Subject: ${subject}`,
    `Mode: ${mode}`,
    `Subject guidance: ${SUBJECT_GUIDANCE[subject]}`,
    `Mode instructions: ${MODE_INSTRUCTIONS[mode]}`,
  ]

  if (context) {
    lines.push(
      'Uploaded textbook material (use this as the primary source; if it does not fully answer the question, clearly say the uploaded material is incomplete and then add general knowledge):',
      context
    )
  } else {
    lines.push(
      'No matching uploaded textbook material was found for this class/subject. Answer from general knowledge and mention that no uploaded material was found for this topic.'
    )
  }

  lines.push(`Student question/topic: ${question}`)

  return lines.join('\n')
}
