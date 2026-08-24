export type Class = 'Class 11' | 'Class 12'

export type Subject =
  | 'Mathematics'
  | 'Computer Science'
  | 'Economics'
  | 'English'
  | 'Urdu'
  | 'Islamic Education'
  | 'Pakistan Studies'

export interface StudyQuestion {
  class: Class
  subject: Subject
  topic: string
  question: string
}

/** Ye subjects Urdu script mein likhe jate hain — jawab RTL mein dikhana chahiye. */
export const RTL_SUBJECTS: Subject[] = ['Urdu', 'Islamic Education']

export function isRtlSubject(subject: string | null | undefined): boolean {
  return RTL_SUBJECTS.includes(subject as Subject)
}
