import { createClient } from '@supabase/supabase-js'

export function getSupabaseClient() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SECRET_KEY

  if (!url || !key) {
    throw new Error('Supabase environment variables are not configured.')
  }

  return createClient(url, key, {
    auth: { persistSession: false },
    global: {
      // Prevent Next.js's patched global fetch from caching Supabase's
      // internal REST calls — without this, data can appear "stuck" even
      // after new rows are inserted.
      fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }),
    },
  })
}
