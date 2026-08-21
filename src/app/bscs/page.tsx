import Link from 'next/link'
import { BSCS_TOPICS } from '@/lib/bscsTopics'

export default function BscsPage() {
  return (
    <div className="px-4 py-8 space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">BSCS Preparation</h1>
        <p className="text-slate-600 text-sm">
          University-level Computer Science ki taraf ek head start
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {BSCS_TOPICS.map((t) => (
          <Link
            key={t.slug}
            href={`/bscs/${t.slug}`}
            className="rounded-lg border border-slate-200 bg-white p-4 flex items-start gap-3 active:bg-slate-50"
          >
            <span className="text-2xl">{t.icon}</span>
            <div>
              <p className="font-medium text-slate-800">{t.name}</p>
              <p className="text-xs text-slate-500 mt-1">{t.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
