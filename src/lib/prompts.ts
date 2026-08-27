import type { Class, Subject } from './types'
import type { AnswerModeId } from './constants'

const MODE_INSTRUCTIONS: Record<AnswerModeId, string> = {
  explain:
    'Give a simple explanation of the concept in plain language first, then the formal definition. Use short paragraphs and one clear example.',
  solve:
    'Solve the problem step by step. Structure the answer as: Understand the problem -> Method -> Steps -> Final answer. Never skip straight to the final answer. After the final answer, verify it independently (for example by substituting back) and state whether the check passes.',
  summarize:
    'Summarize the topic/chapter in short bullet points. Keep it exam-focused and easy to revise from.',
  practice:
    'Generate 3-5 practice questions on this topic, ordered from easy to hard. Do not include the answers.',
  numericals:
    'Generate 8 numerical/problem-solving questions on this topic, ordered from easy to hard, exactly in the style the Punjab Board asks them. Number them 1 to 8. Do NOT show any working or answers with the questions. After all eight, add a markdown horizontal rule, then a heading "## Solutions", then the full step-by-step solution for each one. Verify every final answer independently before writing it.',
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
  Urdu:
    'This is Urdu Compulsory for Punjab Board Intermediate (100 marks). Write the answer in proper Urdu script, not Roman Urdu, unless the student explicitly asks for Roman Urdu. Cover the parts the board actually examines: nasar (prose) ka khulasa aur sabaq ka markazi khayal, nazm ki tashreeh with poet and context, muhavare aur zarb-ul-amsal with meaning and usage in a sentence, grammar (ism, fail, harf, wahid-jama, muzakkar-muannas), and writing skills (mazmoon nigari, khat nigari, darkhwast, kahani). For tashreeh questions follow the board format: ashaar, phir hawala (shair aur nazm ka naam), phir tashreeh. Keep the language simple enough for an Intermediate student.',
  'Islamic Education':
    'This is Islamiat Compulsory for Punjab Board Intermediate Part 1 (50 marks). Write in Urdu script by default. Quote Quranic ayat in Arabic with Urdu tarjuma, and give the surah name and ayat number. For ahadith, mention the source where it is well known. Cover the syllabus areas: Quran ke muntakhab asbaq, Hadith, Seerat-un-Nabi (SAW), Ibadat, Ikhlaqiat, aur Islami muashra. Be accurate and neutral in tone; where scholars differ, say so plainly instead of presenting one view as the only view. Never invent an ayat, hadith or reference — if you are not certain of a reference, say so.',
  'Pakistan Studies':
    'This is Pakistan Studies Compulsory for Punjab Board Intermediate Part 2 (50 marks). Answer in Urdu script by default, but switch to English if the student writes in English. Cover the syllabus areas: Tehreek-e-Pakistan aur ibtidai halat, Nazariya-e-Pakistan, Pakistan ka jughrafia, aabadi aur wasail, maeeshat, hukumat aur ain, aur khareja policy. Use dates and names carefully — this paper is marked on accuracy of facts. Keep answers in the short-question and long-question format the board uses.',
}

export function buildSystemPrompt(): string {
  return [
    'You are the study assistant inside 10MinStudy, a private study app for one ICS student (Class 11 & 12) preparing for BS Computer Science.',
    'Her subjects are: Mathematics, Computer Science, Economics, English, Urdu, Islamic Education (Part 1) and Pakistan Studies (Part 2), following the Punjab Board Intermediate scheme.',
    'Always answer in a way that helps the student understand the concept, not just copy an answer.',
    'Keep answers focused, exam-relevant, and free of unnecessary filler.',
    'Format the answer with short clear headings and bullet points where useful.',
    'When uploaded textbook material is provided, treat it as the primary source. Never claim an answer came from the textbook if it did not — if the material does not fully cover the question, say so clearly and then add general knowledge.',
    'Never state a fact, date, formula, ayat or reference you are not confident about. If you are unsure, say plainly that it should be checked in the textbook.',
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
