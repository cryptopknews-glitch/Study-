'use client'

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center space-y-4 max-w-sm">
        <p className="text-4xl">⚠️</p>
        <h2 className="text-lg font-bold text-slate-900">Kuch masla ho gaya</h2>
        <p className="text-sm text-slate-600">
          Ek anjaan error aa gayi. Dobara koshish karein — agar masla rahe to
          page refresh karein.
        </p>
        <button
          onClick={reset}
          className="rounded-lg bg-primary text-white font-semibold py-2.5 px-6"
        >
          Dobara Koshish Karein
        </button>
      </div>
    </div>
  )
}
