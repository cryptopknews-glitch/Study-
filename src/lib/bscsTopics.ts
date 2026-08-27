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
  {
    slug: 'oop',
    name: 'Object Oriented Programming',
    description: 'Classes, objects, inheritance, polymorphism, encapsulation.',
    icon: '🧱',
  },
  {
    slug: 'databases',
    name: 'Database Systems (SQL)',
    description: 'ER models, normalization, SQL queries, transactions, indexing.',
    icon: '🗄️',
  },
  {
    slug: 'operating-systems',
    name: 'Operating Systems',
    description: 'Processes, threads, scheduling, memory management, deadlocks, file systems.',
    icon: '🖥️',
  },
  {
    slug: 'computer-networks',
    name: 'Computer Networks',
    description: 'OSI and TCP/IP layers, routing, protocols, sockets, network security basics.',
    icon: '🌐',
  },
  {
    slug: 'software-engineering',
    name: 'Software Engineering',
    description: 'SDLC, requirements, design patterns, testing, version control, agile.',
    icon: '📐',
  },
  {
    slug: 'web-development',
    name: 'Web Development',
    description: 'HTML, CSS, JavaScript, HTTP, front-end frameworks, REST APIs.',
    icon: '🕸️',
  },
  {
    slug: 'theory-of-automata',
    name: 'Theory of Automata',
    description: 'Finite automata, regular expressions, context-free grammars, Turing machines.',
    icon: '🔁',
  },
  {
    slug: 'ai-ml',
    name: 'Artificial Intelligence & ML',
    description: 'Search, knowledge representation, neural networks, supervised and unsupervised learning.',
    icon: '🤖',
  },
  {
    slug: 'final-year-project',
    name: 'Final Year Project',
    description: 'Choosing a topic, proposal writing, documentation, and defending the project.',
    icon: '🎓',
  },
]

export function getBscsTopicBySlug(slug: string): BscsTopic | undefined {
  return BSCS_TOPICS.find((t) => t.slug === slug)
}
