'use client'

import Link from 'next/link'
import { useState } from 'react'

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/subjects', label: 'Subjects' },
  { href: '/study', label: 'Study' },
  { href: '/mock-exam', label: 'Mock Exam' },
  { href: '/english', label: 'English' },
  { href: '/bscs', label: 'BSCS Prep' },
  { href: '/css', label: 'CSS Foundation' },
  { href: '/upload', label: 'Upload' },
  { href: '/manage', label: 'My Uploads' },
  { href: '/dashboard', label: 'Dashboard' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg text-primary">
          10MinStudy
        </Link>

        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
          className="sm:hidden text-slate-700 text-2xl leading-none w-8 h-8 flex items-center justify-center"
        >
          {open ? '✕' : '☰'}
        </button>

        <nav className="hidden sm:flex gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-slate-600 hover:text-primary text-sm font-medium"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      {open && (
        <nav className="sm:hidden border-t border-slate-200 bg-white px-4 py-2 flex flex-col">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="py-3 text-slate-700 text-sm font-medium border-b border-slate-100 last:border-0"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}
