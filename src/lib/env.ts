import 'server-only'

// Server-only environment variables — never exposed to the client.
//
// Required server vars:
//   ADMIN_SECRET              — admin session signing key
//   KAKAO_SESSION_SECRET      — user session signing key
//   KAKAO_REST_API_KEY        — Kakao REST API key (place search, geocode, OAuth)
//   SUPABASE_URL              — Supabase project URL
//   SUPABASE_ANON_KEY         — Supabase anon key
//   SUPABASE_SERVICE_ROLE_KEY — Supabase service role key (admin writes only)
//   ADMIN_KAKAO_IDS           — comma-separated Kakao IDs with admin access
//
// Optional server vars:
//   KAKAO_CLIENT_SECRET       — Kakao OAuth client secret (optional PKCE)
//   KAKAO_REDIRECT_URI        — explicit OAuth redirect URI override
//
// Public vars (safe to expose, domain-restricted at Kakao console):
//   NEXT_PUBLIC_KAKAO_MAP_API_KEY — Kakao Map JS SDK key

export function getRequiredEnv(key: string): string {
  const value = process.env[key]

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }

  return value
}

export function getOptionalEnv(key: string): string | undefined {
  const value = process.env[key]
  return value && value.length > 0 ? value : undefined
}
