import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // This is intentionally explicit so deployment misconfiguration is obvious.
  // In local development, copy .env.example to .env and provide credentials.
  console.warn('VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are not set.')
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '')

