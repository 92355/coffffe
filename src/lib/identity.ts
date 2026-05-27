import 'server-only'

import { getOptionalEnv } from './env'

export { isAuthorizedAdminRequest } from './admin-auth'
export { getUserSession } from './user-auth'
export { extractClientIdentity } from './clientIdentity'
export type { UserSession } from './user-auth'
export type { ClientIdentity } from './clientIdentity'

const ADMIN_KAKAO_IDS_KEY = 'ADMIN_KAKAO_IDS'

export function isAdminKakaoId(kakaoId: string): boolean {
  const raw = getOptionalEnv(ADMIN_KAKAO_IDS_KEY)
  if (!raw) return false
  return raw.split(',').map((id) => id.trim()).filter(Boolean).includes(kakaoId)
}
