import { createClient, processLock } from '@supabase/supabase-js'
import { authStorage } from '@/lib/auth-storage'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is required')
}

if (!supabaseKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is required')
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    lock: processLock,
    storage: authStorage,
  },
})
