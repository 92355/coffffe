import { NextResponse } from 'next/server'
import { getUserSession } from '@/lib/user-auth'

const ADMIN_KAKAO_IDS_KEY = 'ADMIN_KAKAO_IDS'

export async function GET() {
  const session = await getUserSession()

  return NextResponse.json({
    user: session
      ? {
          type: 'authenticated',
          id: session.userId,
          kakaoId: session.kakaoId,
          nickname: session.nickname,
          profileImageUrl: session.profileImageUrl,
          isAdmin: isAdminKakaoId(session.kakaoId),
        }
      : null,
  })
}

function isAdminKakaoId(kakaoId: string): boolean {
  const adminKakaoIds = process.env[ADMIN_KAKAO_IDS_KEY]

  if (!adminKakaoIds) return false

  return adminKakaoIds
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)
    .includes(kakaoId)
}
