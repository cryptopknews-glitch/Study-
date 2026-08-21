import Link from 'next/link'
import { ENGLISH_AREAS } from '@/lib/constants'

export default function EnglishPage() {
  return (
    <div className="px-4 py-8 space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Improve My English</h1>
        <p className="text-slate-600 text-sm">
          Grammar, tenses, vocabulary, and writing — step by step
        </p>
      </div>

      <Link
        href="/english/tenses"
        className="block rounded-xl bg-primary text-white p-5 text-center active:opacity-90"
      >
        <p className="font-semibold">Tenses Tool</p>
        <p className="text-xs font-normal opacity-90 mt-1">
          12 tenses — Urdu explanation, structure, examples, aur AI-checked practice
        </p>
      </Link>

      <div className="rounded-xl bg-white border border-slate-200 p-5 text-center">
        <p className="font-semibold text-slate-800">10 Minute English Practice</p>
        <p className="text-xs font-normal text-slate-500 mt-1">
          Daily practice tool comes in Phase 6 (part 2)
        </p>
      </div>

      <div>
        <p className="text-sm font-medium text-slate-700 mb-2">Areas</p>
        <div className="grid grid-cols-2 gap-3">
          {ENGLISH_AREAS.map((area) => (
            <div
              key={area}
              className="rounded-lg border border-slate-200 bg-white py-3 px-3 text-sm font-medium text-slate-700"
            >
              {area}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
