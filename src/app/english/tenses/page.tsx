import Link from 'next/link'
import { TENSES } from '@/lib/tenses'

export default function TensesListPage() {
  return (
    <div className="px-4 py-8 space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">English Tenses</h1>
        <p className="text-slate-600 text-sm">Concept se practice tak — har tense step by step</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {TENSES.map((t) => (
          <Link
            key={t.slug}
            href={`/english/tenses/${t.slug}`}
            className="rounded-lg border border-slate-200 bg-white p-4 active:bg-slate-50"
          >
            <p className="font-medium text-slate-800">{t.name}</p>
            <p className="text-xs text-slate-500 mt-1">{t.usage}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
