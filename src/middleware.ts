import { NextRequest, NextResponse } from 'next/server'
import { makeAuthToken, safeEqual, AUTH_COOKIE } from '@/lib/authToken'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Login page, login/logout API, Next.js internals aur PWA assets hamesha khule.
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/api/login') ||
    pathname.startsWith('/api/logout') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname === '/manifest.json' ||
    pathname === '/robots.txt' ||
    pathname.startsWith('/icon-')
  ) {
    return NextResponse.next()
  }

  const sitePassword = process.env.SITE_PASSWORD

  // Password set na ho to site khuli rehti hai — taake malik kabhi apne hi
  // app se bahar na ho jaye. Magar ab ye chupke se nahi hota: har page par
  // ek warning patti dikh jati hai (x-site-unprotected header se).
  if (!sitePassword) {
    // Flag REQUEST headers par lagana zaroori hai — server component
    // headers() se request parhta hai, response nahi.
    const requestHeaders = new Headers(req.headers)
    requestHeaders.set('x-site-unprotected', '1')
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  const cookie = req.cookies.get(AUTH_COOKIE)?.value
  if (cookie) {
    const expected = await makeAuthToken(sitePassword)
    if (safeEqual(cookie, expected)) return NextResponse.next()
  }

  const loginUrl = new URL('/login', req.url)
  loginUrl.searchParams.set('next', pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
