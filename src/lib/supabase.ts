import 'server-only'

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

import { getRequiredEnv } from './env'

const SUPABASE_URL_KEY = 'SUPABASE_URL'
const SUPABASE_ANON_KEY = 'SUPABASE_ANON_KEY'
const SUPABASE_SERVICE_ROLE_KEY = 'SUPABASE_SERVICE_ROLE_KEY'

// Server-only read client. / 서버 전용 읽기 클라이언트.
export function createSupabaseClient(): SupabaseClient {
  return createClient(
    getRequiredEnv(SUPABASE_URL_KEY),
    getRequiredEnv(SUPABASE_ANON_KEY),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  )
}

// Server-only admin client. / 서버 전용 관리자 클라이언트.
export function createSupabaseAdminClient(): SupabaseClient {
  return createClient(
    getRequiredEnv(SUPABASE_URL_KEY),
    getRequiredEnv(SUPABASE_SERVICE_ROLE_KEY),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  )
}
