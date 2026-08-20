export type Class = 'Class 11' | 'Class 12'
export type Subject = 'Mathematics' | 'Computer Science' | 'Economics' | 'English'

export interface StudyQuestion {
  class: Class
  subject: Subject
  topic: string
  question: string
}