import { NextResponse } from 'next/server'
import { getUserSession } from '@/lib/user-auth'

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
        }
      : null,
  })
}
