import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Always allow the login page, login API, and Next.js internals through.
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/api/login') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next()
  }

  const sitePassword = process.env.SITE_PASSWORD

  // If no password is configured, the site stays open (fail-open so the
  // owner never gets locked out by forgetting to set the env var).
  if (!sitePassword) {
    return NextResponse.next()
  }

  const authCookie = req.cookies.get('site_auth')?.value

  if (authCookie === sitePassword) {
    return NextResponse.next()
  }

  const loginUrl = new URL('/login', req.url)
  loginUrl.searchParams.set('next', pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
