import type { Class, Subject } from './types'

export const CLASSES: Class[] = ['Class 11', 'Class 12']

export const SUBJECTS: { id: Subject; label: string; icon: string }[] = [
  { id: 'Mathematics', label: 'Mathematics', icon: '📐' },
  { id: 'Computer Science', label: 'Computer Science', icon: '💻' },
  { id: 'Economics', label: 'Economics', icon: '📊' },
  { id: 'English', label: 'English', icon: '📖' },
]

export const ANSWER_MODES = [
  { id: 'explain', label: 'Explain' },
  { id: 'solve', label: 'Solve' },
  { id: 'summarize', label: 'Summarize' },
  { id: 'practice', label: 'Practice' },
  { id: 'quiz', label: 'Quiz' },
] as const

export type AnswerModeId = (typeof ANSWER_MODES)[number]['id']

export const ENGLISH_AREAS = [
  'Grammar',
  'Tenses',
  'Sentence Structure',
  'Vocabulary',
  'Articles',
  'Prepositions',
  'Active / Passive Voice',
  'Direct / Indirect Speech',
  'Subject-Verb Agreement',
  'Parts of Speech',
  'Common Errors',
  'Paragraph Writing',
  'Essay Writing',
  'Comprehension',
  'Translation',
  'Daily English Practice',
]
