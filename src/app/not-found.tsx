import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center space-y-4 max-w-sm">
        <p className="text-4xl">🔍</p>
        <h2 className="text-lg font-bold text-slate-900">Page nahi mila</h2>
        <p className="text-sm text-slate-600">
          Ye page exist nahi karta. Homepage par wapas chalein.
        </p>
        <Link
          href="/"
          className="inline-block rounded-lg bg-primary text-white font-semibold py-2.5 px-6"
        >
          Homepage
        </Link>
      </div>
    </div>
  )
}
