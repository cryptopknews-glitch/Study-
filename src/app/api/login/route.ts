import { NextRequest, NextResponse } from 'next/server'
import { makeAuthToken, AUTH_COOKIE } from '@/lib/authToken'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const sitePassword = process.env.SITE_PASSWORD

  if (!sitePassword) {
    return NextResponse.json({ success: true, unprotected: true })
  }

  let body: { password?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  if (typeof body.password !== 'string' || body.password !== sitePassword) {
    // Thora sa intezar — password guess karne ki koshish sust ho jaye.
    await new Promise((r) => setTimeout(r, 400))
    return NextResponse.json({ error: 'Ghalat password.' }, { status: 401 })
  }

  const token = await makeAuthToken(sitePassword)

  const res = NextResponse.json({ success: true })
  res.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  })
  return res
}
