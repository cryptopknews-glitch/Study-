import { headers } from 'next/headers'

/**
 * Agar SITE_PASSWORD set na ho to site khuli reh jati hai (jaan bujh kar,
 * taake malik lock-out na ho). Magar wo khamoshi se nahi hona chahiye —
 * ye patti har page par nazar aati hai jab tak password na lag jaye.
 */
export default function SecurityBanner() {
  let unprotected = false
  try {
    unprotected = headers().get('x-site-unprotected') === '1'
  } catch {
    // Static render ke waqt headers() nahi milti — us surat mein patti
    // chhupi rahegi, jo theek hai (password laga hua ho to dikhni bhi nahi chahiye).
    unprotected = false
  }

  if (!unprotected) return null

  return (
    <div className="bg-red-600 text-white px-4 py-2.5 text-xs leading-relaxed">
      <b>⚠️ Site khuli hui hai —</b> koi bhi ye link khol kar aap ka saara data dekh sakta hai.
      Vercel mein <b>Settings → Environment Variables</b> jaa kar{' '}
      <code className="bg-red-700 px-1 rounded">SITE_PASSWORD</code> set karein, phir dobara deploy karein.
    </div>
  )
}
