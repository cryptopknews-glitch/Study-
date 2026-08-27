import { NextResponse } from 'next/server'
import { AUTH_COOKIE } from '@/lib/authToken'

export const runtime = 'nodejs'

/** Sanjhe ya udhaar liye phone par kaam khatam kar ke nikalne ke liye. */
export async function POST() {
  const res = NextResponse.json({ success: true })
  res.cookies.set(AUTH_COOKIE, '', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
  return res
}
