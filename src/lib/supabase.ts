import 'server-only'

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

import { getRequiredEnv } from './env'

const SUPABASE_URL_KEY = 'SUPABASE_URL'
const SUPABASE_ANON_KEY = 'SUPABASE_ANON_KEY'
const SUPABASE_SERVICE_ROLE_KEY = 'SUPABASE_SERVICE_ROLE_KEY'

const AUTH_OPTIONS = { persistSession: false, autoRefreshToken: false } as const

let anonClient: SupabaseClient | null = null
let adminClient: SupabaseClient | null = null

// Server-only read client. / 서버 전용 읽기 클라이언트.
export function createSupabaseClient(): SupabaseClient {
  if (!anonClient) {
    anonClient = createClient(
      getRequiredEnv(SUPABASE_URL_KEY),
      getRequiredEnv(SUPABASE_ANON_KEY),
      { auth: AUTH_OPTIONS },
    )
  }
  return anonClient
}

// Server-only admin client. / 서버 전용 관리자 클라이언트.
export function createSupabaseAdminClient(): SupabaseClient {
  if (!adminClient) {
    adminClient = createClient(
      getRequiredEnv(SUPABASE_URL_KEY),
      getRequiredEnv(SUPABASE_SERVICE_ROLE_KEY),
      { auth: AUTH_OPTIONS },
    )
  }
  return adminClient
}
