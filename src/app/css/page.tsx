import Link from 'next/link'
import { CSS_TOPICS, CSS_STRUCTURE, type CssTopic } from '@/lib/cssTopics'

const DEDICATED_ROUTES: Record<string, string> = {
  precis: '/css/precis',
  'essay-writing': '/css/essay',
  vocabulary: '/css/vocabulary',
  'analytical-thinking': '/css/analytical-thinking',
  'reading-comprehension': '/css/reading-comprehension',
  'sentence-correction': '/css/sentence-correction',
  'general-science-ability': '/css/general-science-ability',
  mpt: '/css/mpt',
  optional: '/css/optional',
}

function hrefFor(t: CssTopic) {
  return t.route || DEDICATED_ROUTES[t.slug] || `/css/${t.slug}`
}

function Card({ t }: { t: CssTopic }) {
  return (
    <Link
      href={hrefFor(t)}
      className="rounded-lg border border-slate-200 bg-white p-4 flex items-start gap-3 active:bg-slate-50"
    >
      <span className="text-2xl shrink-0">{t.icon}</span>
      <div className="min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <p className="font-medium text-slate-800">{t.name}</p>
          {t.marks ? (
            <span className="text-[11px] text-slate-500">{t.marks} marks</span>
          ) : null}
          {t.stage === 'now' ? (
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
              abhi
            </span>
          ) : null}
        </div>
        <p className="text-xs text-slate-500 mt-1">{t.description}</p>
      </div>
    </Link>
  )
}

export default function CssPage() {
  const active = CSS_TOPICS.filter((t) => t.active)
  const gate = active.filter((t) => t.group === 'gate')
  const compulsory = active.filter((t) => t.group === 'compulsory')
  const skills = active.filter((t) => t.group === 'skill')
  const optional = active.filter((t) => t.group === 'optional')
  const nowCount = active.filter((t) => t.stage === 'now').length

  return (
    <div className="px-4 py-8 space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">CSS Foundation</h1>
        <p className="text-slate-600 text-sm">
          FPSC ke asal dhanche ke mutabiq — screening test, 6 laazmi paper, aur optional subjects
        </p>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">CSS ka dhancha</h2>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">Laazmi (6 paper)</span>
            <span className="font-semibold text-slate-800">{CSS_STRUCTURE.compulsoryTotal}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Optional</span>
            <span className="font-semibold text-slate-800">{CSS_STRUCTURE.optionalTotal}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Written kul</span>
            <span className="font-semibold text-slate-800">{CSS_STRUCTURE.writtenTotal}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Viva</span>
            <span className="font-semibold text-slate-800">{CSS_STRUCTURE.viva}</span>
          </div>
        </div>
        <p className="text-[11px] text-slate-500 mt-3 leading-relaxed">
          Har laazmi paper alag pass karna hota hai ({CSS_STRUCTURE.compulsoryPassPct}%) —
          ek bhi fail ho to poora imtihan fail. Optional mein {CSS_STRUCTURE.optionalPassPct}% chahiye.
        </p>
      </section>

      <section className="rounded-lg border border-amber-300 bg-amber-50 p-4">
        <h2 className="text-sm font-semibold text-amber-900 mb-1">Abhi kya karna hai</h2>
        <p className="text-xs text-amber-900 leading-relaxed">
          CSS <b>graduation ke baad</b> hi diya ja sakta hai — ICS ke baad BSCS, phir CSS.
          Yani abhi se takreeban 6 saal.
          <br /><br />
          Is liye abhi sirf <b>{nowCount} cheezein</b> kaam ki hain — jinke aage
          <span className="mx-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">abhi</span>
          likha hai. Ye wo salahiyatein hain jo <b>waqt maangti hain</b> aur baad mein jaldi nahi aatin.
          <br /><br />
          Current Affairs aur GK jaisi cheezein <b>har saal badalti hain</b> — abhi ratna zaya hai.
          Baaki sab yahan mehfooz hai, jab zaroorat ho khol lein.
          <br /><br />
          <b>Sab se ahem cheez abhi ICS ka result hai.</b>
        </p>
      </section>

      {gate.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
            Pehla Darwaza
          </h2>
          {gate.map((t) => <Card key={t.slug} t={t} />)}
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
          6 Laazmi Paper — {CSS_STRUCTURE.compulsoryTotal} marks
        </h2>
        {compulsory.map((t) => <Card key={t.slug} t={t} />)}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
          Bunyadi Salahiyatein
        </h2>
        <p className="text-xs text-slate-500 -mt-1">
          Ye laazmi papers ki tayari ka hissa hain — aur abhi se karne wali cheezein
        </p>
        {skills.map((t) => <Card key={t.slug} t={t} />)}
      </section>

      {optional.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
            Optional — {CSS_STRUCTURE.optionalTotal} marks
          </h2>
          {optional.map((t) => <Card key={t.slug} t={t} />)}
        </section>
      )}

      <p className="text-xs text-slate-500 leading-relaxed">
        FPSC qawaid aur syllabus badalte rehte hain. Kisi bhi faisle se pehle
        <b> fpsc.gov.pk</b> se tasdeeq zaroor karein.
      </p>
    </div>
  )
}
