export interface BscsTopic {
  slug: string
  name: string
  description: string
  icon: string
}

export const BSCS_TOPICS: BscsTopic[] = [
  {
    slug: 'programming-fundamentals',
    name: 'Programming Fundamentals',
    description: 'Variables, control flow, functions, and core programming concepts.',
    icon: '💻',
  },
  {
    slug: 'problem-solving',
    name: 'Problem Solving',
    description: 'Breaking problems down, pseudocode, and a logical approach.',
    icon: '🧩',
  },
  {
    slug: 'algorithms',
    name: 'Algorithms',
    description: 'Searching, sorting, complexity, and algorithmic thinking.',
    icon: '⚙️',
  },
  {
    slug: 'data-structures',
    name: 'Data Structures',
    description: 'Arrays, linked lists, stacks, queues, trees, and graphs.',
    icon: '🗂️',
  },
  {
    slug: 'math-for-cs',
    name: 'Mathematics for CS',
    description: 'Discrete math, logic, sets, and foundations used in CS.',
    icon: '➗',
  },
  {
    slug: 'logical-thinking',
    name: 'Logical Thinking',
    description: 'Reasoning, patterns, and analytical problem-solving.',
    icon: '🧠',
  },
  {
    slug: 'technical-communication',
    name: 'Technical Communication',
    description: 'Explaining technical ideas clearly in English.',
    icon: '🗣️',
  },
  {
    slug: 'computer-fundamentals',
    name: 'Computer Fundamentals',
    description: 'How computers work — hardware, OS, and basic architecture.',
    icon: '🖥️',
  },
]

export function getBscsTopicBySlug(slug: string): BscsTopic | undefined {
  return BSCS_TOPICS.find((t) => t.slug === slug)
}
