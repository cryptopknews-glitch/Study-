import Link from 'next/link'
import { SUBJECTS, ANSWER_MODES } from '@/lib/constants'

export default function Home() {
  return (
    <div className="px-4 py-8 space-y-10 pb-16">
      <section className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">10MinStudy</h1>
        <p className="text-slate-600">Your Personal Study Assistant</p>
      </section>

      <section className="space-y-2">
        <p className="text-sm font-medium text-slate-700">Class</p>
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/subjects?class=Class%2011"
            className="rounded-xl border border-slate-200 bg-white py-4 text-center font-semibold text-slate-800 active:bg-slate-50"
          >
            Class 11
          </Link>
          <Link
            href="/subjects?class=Class%2012"
            className="rounded-xl border border-slate-200 bg-white py-4 text-center font-semibold text-slate-800 active:bg-slate-50"
          >
            Class 12
          </Link>
        </div>
      </section>

      <section className="space-y-2">
        <p className="text-sm font-medium text-slate-700">Subjects</p>
        <div className="grid grid-cols-2 gap-3">
          {SUBJECTS.map((s) => (
            <Link
              key={s.id}
              href={`/study?subject=${encodeURIComponent(s.id)}`}
              className="rounded-xl border border-slate-200 bg-white py-4 text-center active:bg-slate-50"
            >
              <span className="block text-2xl mb-1">{s.icon}</span>
              <span className="text-sm font-medium text-slate-800">{s.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-xl bg-primary text-white p-5 text-center space-y-3">
        <p className="font-semibold">What do you want to study?</p>
        <Link
          href="/study"
          className="inline-block w-full rounded-lg bg-white text-primary font-semibold py-3"
        >
          Solve in 10 Minutes
        </Link>
      </section>

      <section className="space-y-2">
        <p className="text-sm font-medium text-slate-700">Quick Tools</p>
        <div className="grid grid-cols-3 gap-3">
          {ANSWER_MODES.map((mode) => (
            <Link
              key={mode.id}
              href={`/study?mode=${mode.id}`}
              className="rounded-lg border border-slate-200 bg-white py-3 text-center text-sm font-medium text-slate-700 active:bg-slate-50"
            >
              {mode.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 text-center space-y-2">
        <p className="font-semibold text-slate-800">English</p>
        <Link href="/english" className="inline-block text-primary font-medium text-sm">
          Improve My English →
        </Link>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-dashed border-slate-300 py-4 text-center text-sm text-slate-400">
          BSCS Preparation
          <br />
          <span className="text-xs">(coming soon)</span>
        </div>
        <div className="rounded-lg border border-dashed border-slate-300 py-4 text-center text-sm text-slate-400">
          CSS Foundation
          <br />
          <span className="text-xs">(coming soon)</span>
        </div>
      </section>
    </div>
  )
}
