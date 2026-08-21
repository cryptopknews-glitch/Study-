import Link from 'next/link'
import { CSS_TOPICS } from '@/lib/cssTopics'

export default function CssPage() {
  return (
    <div className="px-4 py-8 space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">CSS Foundation</h1>
        <p className="text-slate-600 text-sm">
          Abhi shuruat — English, Essay Writing, Vocabulary, aur General Knowledge par focus. Baaki
          topics baad mein add honge.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {CSS_TOPICS.map((t) =>
          t.active ? (
            <Link
              key={t.slug}
              href={t.slug === 'precis' ? '/css/precis' : `/css/${t.slug}`}
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
