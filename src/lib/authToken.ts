/**
 * Cookie mein password khud rakhna theek nahi tha — agar cookie kisi tarah
 * leak ho jaye to password bhi leak. Ab cookie mein password ka hash jata
 * hai, jis se password wapas nikaala nahi ja sakta.
 *
 * Ye file middleware (Edge) aur login route (Node) dono jagah chalti hai,
 * is liye sirf Web Crypto use kiya hai jo dono mein maujood hai.
 */
const SALT = '10minstudy:site-auth:v1'

export async function makeAuthToken(password: string): Promise<string> {
  const data = new TextEncoder().encode(SALT + '|' + password)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/** Waqt ke lihaz se yaksan muqabla — timing se password guess na kiya ja sake. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

export const AUTH_COOKIE = 'site_auth'
