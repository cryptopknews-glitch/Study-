import Link from 'next/link'
import { SUBJECTS } from '@/lib/constants'

export default function SubjectsPage() {
  return (
    <div className="px-4 py-8 space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Subjects</h1>
        <p className="text-slate-600 text-sm">Class 11 &amp; 12 ICS subjects</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {SUBJECTS.map((s) => (
          <Link
            key={s.id}
            href={`/study?subject=${encodeURIComponent(s.id)}`}
            className="rounded-xl border border-slate-200 bg-white py-6 text-center active:bg-slate-50"
          >
            <span className="block text-3xl mb-2">{s.icon}</span>
            <span className="text-sm font-medium text-slate-800">{s.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
