import Link from 'next/link'
import { CSS_TOPICS } from '@/lib/cssTopics'

const DEDICATED_ROUTES: Record<string, string> = {
  precis: '/css/precis',
  'essay-writing': '/css/essay',
  vocabulary: '/css/vocabulary',
  'analytical-thinking': '/css/analytical-thinking',
  'reading-comprehension': '/css/reading-comprehension',
  'sentence-correction': '/css/sentence-correction',
}

export default function CssPage() {
  return (
    <div className="px-4 py-8 space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">CSS Foundation</h1>
        <p className="text-slate-600 text-sm">
          English, Writing, Vocabulary, Reading, Reasoning, aur General Knowledge par focus.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {CSS_TOPICS.map((t) =>
          t.active ? (
            <Link
              key={t.slug}
              href={DEDICATED_ROUTES[t.slug] || `/css/${t.slug}`}
              className="rounded-lg border border-slate-200 bg-white p-4 flex items-start gap-3 active:bg-slate-50"
            >
              <span className="text-2xl">{t.icon}</span>
              <div>
                <p className="font-medium text-slate-800">{t.name}</p>
                <p className="text-xs text-slate-500 mt-1">{t.description}</p>
              </div>
            </Link>
          ) : (
            <div
              key={t.slug}
              className="rounded-lg border border-dashed border-slate-300 p-4 flex items-start gap-3 opacity-60"
            >
              <span className="text-2xl">{t.icon}</span>
              <div>
                <p className="font-medium text-slate-600">{t.name}</p>
                <p className="text-xs text-slate-400 mt-1">{t.description} (coming soon)</p>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  )
}
