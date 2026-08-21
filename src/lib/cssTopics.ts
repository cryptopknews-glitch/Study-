export interface CssTopic {
  slug: string
  name: string
  description: string
  icon: string
  active: boolean
}

export const CSS_TOPICS: CssTopic[] = [
  {
    slug: 'english',
    name: 'English',
    description: 'Grammar, vocabulary, and language accuracy for CSS.',
    icon: '📖',
    active: true,
  },
  {
    slug: 'essay-writing',
    name: 'Essay Writing',
    description: 'Structure, argument, and style for CSS essays.',
    icon: '✍️',
    active: true,
  },
  {
    slug: 'vocabulary',
    name: 'Vocabulary',
    description: 'Advanced words, synonyms, and usage for CSS English.',
    icon: '🔤',
    active: true,
  },
  {
    slug: 'general-knowledge',
    name: 'General Knowledge',
    description: 'Core GK topics tested in CSS.',
    icon: '🌍',
    active: true,
  },
  {
    slug: 'precis',
    name: 'Precis Writing',
    description: 'Summarizing passages concisely and accurately.',
    icon: '📝',
    active: false,
  },
  {
    slug: 'current-affairs',
    name: 'Current Affairs',
    description: 'Recent national and international developments.',
    icon: '📰',
    active: false,
  },
  {
    slug: 'pakistan-affairs',
    name: 'Pakistan Affairs',
    description: 'History, politics, and geography of Pakistan.',
    icon: '🇵🇰',
    active: false,
  },
  {
    slug: 'islamiat',
    name: 'Islamiat',
    description: 'Islamic studies for CSS.',
    icon: '🕌',
    active: false,
  },
  {
    slug: 'analytical-thinking',
    name: 'Analytical Thinking',
    description: 'Logical reasoning and analytical skills.',
    icon: '🧠',
    active: false,
  },
  {
    slug: 'reading-comprehension',
    name: 'Reading Comprehension',
    description: 'Understanding and answering questions on passages.',
    icon: '📚',
    active: false,
  },
]

export function getCssTopicBySlug(slug: string): CssTopic | undefined {
  return CSS_TOPICS.find((t) => t.slug === slug)
}
