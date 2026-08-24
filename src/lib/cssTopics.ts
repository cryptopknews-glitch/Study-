export interface CssTopic {
  slug: string
  name: string
  description: string
  icon: string
  active: boolean
  /** FPSC ka darja — is se pata chalta hai ye asal paper hai ya uski tayari ka hissa. */
  group: 'gate' | 'compulsory' | 'skill' | 'optional'
  /** Laazmi paper ke number (FPSC: har compulsory paper 100 marks). */
  marks?: number
  /** Beti ke liye abhi karne wala hai ya BSCS ke baad? */
  stage: 'now' | 'later'
  route?: string
}

/**
 * FPSC CSS ka asal dhancha:
 *  - MPT (screening test) — pass kiye bagair written exam nahi
 *  - 6 laazmi paper, har ek 100 marks = 600
 *  - 6 optional paper = 600
 *  - Written kul 1200 + viva 300 = 1500
 *
 * Laazmi papers: English Essay · English (Precis & Composition) ·
 * General Science & Ability · Current Affairs · Pakistan Affairs · Islamic Studies
 *
 * Beti abhi ICS mein hai — CSS BSCS ke baad hi diya ja sakta hai.
 * Is liye har topic par "stage" likha hai: abhi kaam ka hai ya baad ka.
 */
export const CSS_TOPICS: CssTopic[] = [
  // ---------- Screening gate ----------
  {
    slug: 'mpt',
    name: 'MPT — Screening Test',
    description: 'Pehla darwaza. MCQ test: English, Urdu, Islamiat/Civics, General Abilities, Current Affairs, Pakistan Affairs, Everyday Science.',
    icon: '🚪',
    active: true,
    group: 'gate',
    stage: 'later',
    route: '/css/mpt',
  },

  // ---------- 6 laazmi papers ----------
  {
    slug: 'essay-writing',
    name: 'English Essay',
    description: 'Laazmi paper 1. Structure, argument, coherence — 2500+ words ka mazmoon.',
    icon: '✍️',
    active: true,
    group: 'compulsory',
    marks: 100,
    stage: 'later',
    route: '/css/essay',
  },
  {
    slug: 'precis',
    name: 'English (Precis & Composition)',
    description: 'Laazmi paper 2. Precis, comprehension, grammar, vocabulary, translation.',
    icon: '📝',
    active: true,
    group: 'compulsory',
    marks: 100,
    stage: 'now',
    route: '/css/precis',
  },
  {
    slug: 'general-science-ability',
    name: 'General Science & Ability',
    description: 'Laazmi paper 3. Everyday Science + Quantitative aur Mental Ability. Math wale ke liye aasan paper.',
    icon: '🔬',
    active: true,
    group: 'compulsory',
    marks: 100,
    stage: 'later',
    route: '/css/general-science-ability',
  },
  {
    slug: 'current-affairs',
    name: 'Current Affairs',
    description: 'Laazmi paper 4. Mulki aur beruni halat, taluqat, aalmi masail.',
    icon: '📰',
    active: true,
    group: 'compulsory',
    marks: 100,
    stage: 'later',
  },
  {
    slug: 'pakistan-affairs',
    name: 'Pakistan Affairs',
    description: 'Laazmi paper 5. Tareekh, siyasat, maeeshat, jughrafia, ain.',
    icon: '🇵🇰',
    active: true,
    group: 'compulsory',
    marks: 100,
    stage: 'later',
  },
  {
    slug: 'islamiat',
    name: 'Islamic Studies',
    description: 'Laazmi paper 6. Quran, Seerat, Ibadat, Islami muashra aur nizam.',
    icon: '🕌',
    active: true,
    group: 'compulsory',
    marks: 100,
    stage: 'later',
  },

  // ---------- Bunyadi salahiyatein (abhi kaam ki) ----------
  {
    slug: 'vocabulary',
    name: 'Vocabulary',
    description: 'Lafz jama karna — ye 6 saal ka kaam hai, koi coaching nahi de sakti. Abhi shuru karein.',
    icon: '🔤',
    active: true,
    group: 'skill',
    stage: 'now',
    route: '/css/vocabulary',
  },
  {
    slug: 'sentence-correction',
    name: 'Sentence Correction',
    description: 'Grammar ki ghaltiyan pakarna — Precis paper ka hissa aur ICS English mein bhi kaam.',
    icon: '✏️',
    active: true,
    group: 'skill',
    stage: 'now',
    route: '/css/sentence-correction',
  },
  {
    slug: 'reading-comprehension',
    name: 'Reading Comprehension',
    description: 'Parhne ki raftar aur samajh — Precis paper ka hissa. Waqt maangti hai, abhi shuru karein.',
    icon: '📚',
    active: true,
    group: 'skill',
    stage: 'now',
    route: '/css/reading-comprehension',
  },
  {
    slug: 'analytical-thinking',
    name: 'Analytical Thinking',
    description: 'Mantiqi soch — General Science & Ability ka hissa.',
    icon: '🧠',
    active: true,
    group: 'skill',
    stage: 'now',
    route: '/css/analytical-thinking',
  },
  {
    slug: 'english',
    name: 'English Grammar',
    description: 'Bunyadi grammar aur zabaan ki durusti.',
    icon: '📖',
    active: true,
    group: 'skill',
    stage: 'now',
  },

  // ---------- Optional papers ----------
  {
    slug: 'optional',
    name: 'Optional Subjects',
    description: '600 marks. Beti ke liye qudrati chunao: Computer Science, Mathematics, Statistics — teeno BSCS se seedhe milte hain.',
    icon: '🎯',
    active: true,
    group: 'optional',
    marks: 600,
    stage: 'later',
    route: '/css/optional',
  },
]

export function getCssTopicBySlug(slug: string): CssTopic | undefined {
  return CSS_TOPICS.find((t) => t.slug === slug)
}

export const CSS_STRUCTURE = {
  writtenTotal: 1200,
  compulsoryTotal: 600,
  optionalTotal: 600,
  viva: 300,
  grandTotal: 1500,
  compulsoryPassPct: 40,
  optionalPassPct: 33,
}
