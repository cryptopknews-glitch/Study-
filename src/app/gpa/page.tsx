'use client'

import { useState, useEffect } from 'react'

interface Course { id: number; name: string; credits: number; grade: string }

/** HEC ka aam 4.0 scale — university thora alag rakh sakti hai. */
const GRADE_POINTS: Record<string, number> = {
  'A+': 4.0, A: 4.0, 'A-': 3.7,
  'B+': 3.3, B: 3.0, 'B-': 2.7,
  'C+': 2.3, C: 2.0, 'C-': 1.7,
  'D+': 1.3, D: 1.0, F: 0.0,
}
const GRADES = Object.keys(GRADE_POINTS)
const KEY = 'tn-gpa-courses'
const PREV_KEY = 'tn-gpa-prev'

export default function GpaPage() {
  const [courses, setCourses] = useState<Course[]>([
    { id: 1, name: '', credits: 3, grade: 'A' },
    { id: 2, name: '', credits: 3, grade: 'A' },
  ])
  const [prevCgpa, setPrevCgpa] = useState('')
  const [prevCredits, setPrevCredits] = useState('')

  useEffect(() => {
    try {
      const c = localStorage.getItem(KEY)
      if (c) setCourses(JSON.parse(c))
      const p = localStorage.getItem(PREV_KEY)
      if (p) { const o = JSON.parse(p); setPrevCgpa(o.cgpa ?? ''); setPrevCredits(o.credits ?? '') }
    } catch { /* pehli baar */ }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(courses))
      localStorage.setItem(PREV_KEY, JSON.stringify({ cgpa: prevCgpa, credits: prevCredits }))
    } catch { /* storage bhara hua */ }
  }, [courses, prevCgpa, prevCredits])

  function update(id: number, patch: Partial<Course>) {
    setCourses((cs) => cs.map((c) => (c.id === id ? { ...c, ...patch } : c)))
  }
  function add() {
    setCourses((cs) => [...cs, { id: Date.now(), name: '', credits: 3, grade: 'A' }])
  }
  function remove(id: number) {
    setCourses((cs) => (cs.length > 1 ? cs.filter((c) => c.id !== id) : cs))
  }

  const totalCredits = courses.reduce((s, c) => s + (Number(c.credits) || 0), 0)
  const points = courses.reduce((s, c) => s + (Number(c.credits) || 0) * (GRADE_POINTS[c.grade] ?? 0), 0)
  const gpa = totalCredits > 0 ? points / totalCredits : 0

  const pc = Number(prevCredits) || 0
  const pg = Number(prevCgpa) || 0
  const cgpa = pc + totalCredits > 0 ? (pg * pc + points) / (pc + totalCredits) : gpa

  const tone = (v: number) => (v >= 3.5 ? 'text-success' : v >= 2.5 ? 'text-amber-600' : 'text-danger')

  return (
    <div className="px-4 py-8 space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">GPA / CGPA Calculator</h1>
        <p className="text-slate-600 text-sm">Semester ka GPA aur poora CGPA — sab is device par save</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-center">
          <p className={`text-3xl font-bold ${tone(gpa)}`}>{gpa.toFixed(2)}</p>
          <p className="text-xs text-slate-500 mt-1">Is semester ka GPA</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-center">
          <p className={`text-3xl font-bold ${tone(cgpa)}`}>{cgpa.toFixed(2)}</p>
          <p className="text-xs text-slate-500 mt-1">CGPA</p>
        </div>
      </div>

      <p className="text-xs text-slate-500 text-center">
        {totalCredits} credit hours is semester{pc > 0 ? ` · ${pc + totalCredits} kul` : ''}
      </p>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-slate-700">Is semester ke courses</h2>
        {courses.map((c) => (
          <div key={c.id} className="rounded-lg border border-slate-200 bg-white p-3 space-y-2">
            <div className="flex gap-2">
              <input
                type="text" value={c.name}
                onChange={(e) => update(c.id, { name: e.target.value })}
                placeholder="Course ka naam"
                className="flex-1 min-w-0 rounded-lg border border-slate-300 py-2 px-3 text-sm text-slate-800"
              />
              <button type="button" onClick={() => remove(c.id)}
                className="shrink-0 text-slate-400 px-2" aria-label="Hataayein">✕</button>
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-[11px] text-slate-500 mb-1">Credit hours</label>
                <input type="number" min={0} max={6} value={c.credits}
                  onChange={(e) => update(c.id, { credits: Number(e.target.value) })}
                  className="w-full rounded-lg border border-slate-300 py-2 px-3 text-sm text-slate-800" />
              </div>
              <div className="flex-1">
                <label className="block text-[11px] text-slate-500 mb-1">Grade</label>
                <select value={c.grade} onChange={(e) => update(c.id, { grade: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 py-2 px-3 text-sm text-slate-800 bg-white">
                  {GRADES.map((g) => (
                    <option key={g} value={g}>{g} ({GRADE_POINTS[g].toFixed(1)})</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}
        <button type="button" onClick={add}
          className="w-full rounded-lg border border-dashed border-slate-300 text-slate-600 py-2.5 text-sm font-medium">
          + Course add karein
        </button>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 space-y-3">
        <h2 className="text-sm font-semibold text-slate-700">Pichla record (CGPA ke liye)</h2>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-[11px] text-slate-500 mb-1">Pichla CGPA</label>
            <input type="number" step="0.01" min={0} max={4} value={prevCgpa}
              onChange={(e) => setPrevCgpa(e.target.value)} placeholder="3.42"
              className="w-full rounded-lg border border-slate-300 py-2 px-3 text-sm text-slate-800" />
          </div>
          <div className="flex-1">
            <label className="block text-[11px] text-slate-500 mb-1">Pichle credit hours</label>
            <input type="number" min={0} value={prevCredits}
              onChange={(e) => setPrevCredits(e.target.value)} placeholder="48"
              className="w-full rounded-lg border border-slate-300 py-2 px-3 text-sm text-slate-800" />
          </div>
        </div>
        <p className="text-[11px] text-slate-500">
          Pehle semester mein khaali chhod dein — CGPA wahi GPA ban jayega.
        </p>
      </section>

      <p className="text-xs text-slate-500 leading-relaxed">
        Ye HEC ka aam 4.0 scale hai. Har university apna grading thora alag rakhti hai —
        apni university ka scale ek baar milaa lein.
      </p>
    </div>
  )
}
