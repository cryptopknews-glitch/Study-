export interface EntryTest {
  slug: string
  name: string
  full: string
  totalMcqs: number
  minutes: number
  negativeMarking: boolean
  sections: { name: string; count: number; note?: string }[]
  fitsHer: 'yes' | 'check' | 'no'
  fitNote: string
  icon: string
}

/**
 * Beti ke subjects: Mathematics + Economics + Computer Science (ICS).
 * Us ne PHYSICS nahi liya — is se kuch entry tests mushkil ho jate hain.
 *
 * Ehtiyat: har university apna pattern har saal badalti hai. Ye sirf
 * rahnumai ke liye hai — apply karne se pehle university ki apni
 * admission site se tasdeeq zaroori hai.
 */
export const ENTRY_TESTS: EntryTest[] = [
  {
    slug: 'nts-nat-ics',
    name: 'NTS NAT-ICS',
    full: 'National Aptitude Test — ICS group',
    totalMcqs: 90,
    minutes: 120,
    negativeMarking: false,
    sections: [
      { name: 'English', count: 20 },
      { name: 'Analytical Reasoning', count: 20, note: 'ICS syllabus mein nahi hota' },
      { name: 'Quantitative (Maths)', count: 20 },
      { name: 'Computer Science', count: 15 },
      { name: 'Mathematics (subject)', count: 15 },
    ],
    fitsHer: 'yes',
    fitNote: 'Aap ke subjects se poori tarah milta hai. Bohat si universities NAT qubool karti hain.',
    icon: '📋',
  },
  {
    slug: 'fast-nu',
    name: 'FAST-NU',
    full: 'FAST National University admission test (BS Computer Science)',
    totalMcqs: 100,
    minutes: 120,
    negativeMarking: true,
    sections: [
      { name: 'Mathematics', count: 50 },
      { name: 'English', count: 30 },
      { name: 'Analytical / IQ', count: 20, note: 'ICS syllabus mein nahi hota' },
    ],
    fitsHer: 'yes',
    fitNote: 'CS ke liye sabse mashhoor test — aur is mein Physics nahi hoti. Aap ke liye achha option.',
    icon: '⚡',
  },
  {
    slug: 'nust-net',
    name: 'NUST NET',
    full: 'NUST Entry Test — Engineering & Computing stream',
    totalMcqs: 200,
    minutes: 180,
    negativeMarking: false,
    sections: [
      { name: 'Mathematics', count: 100 },
      { name: 'Physics', count: 60, note: 'Aap ne Physics nahi parhi' },
      { name: 'English', count: 40, note: 'SAT jaisa andaz' },
    ],
    fitsHer: 'check',
    fitNote:
      'Is mein 60 Physics ke sawaal hain aur aap ne Physics nahi li. Dena hai to Physics alag se parhni paregi — ya doosre test par tawajjo dein.',
    icon: '🎓',
  },
  {
    slug: 'pu-general',
    name: 'PU / General University Test',
    full: 'Punjab University aur doosri universities ka aam admission test',
    totalMcqs: 100,
    minutes: 120,
    negativeMarking: false,
    sections: [
      { name: 'English', count: 25 },
      { name: 'Mathematics', count: 30 },
      { name: 'Computer Science', count: 25 },
      { name: 'General Knowledge / IQ', count: 20 },
    ],
    fitsHer: 'yes',
    fitNote: 'Aam pattern — har university thora alag rakhti hai, apni university se tasdeeq karein.',
    icon: '🏛️',
  },
]

export function getEntryTest(slug: string): EntryTest | undefined {
  return ENTRY_TESTS.find((t) => t.slug === slug)
}
