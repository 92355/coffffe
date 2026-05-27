import { NextRequest } from 'next/server'
import { getUserSession } from '@/lib/user-auth'
import { isAdminKakaoId } from '@/lib/identity'
import { getUserProfile, updateUserSiteProfile } from '@/lib/repositories/user'
import { isNicknameAnimal } from '@/lib/nickname'
import { generateNickname } from '@/lib/nickname'
import { ok, unauthorized, serverError } from '@/lib/response'

export async function GET() {
  const session = await getUserSession()

  if (!session) return ok({ user: null })

  // 세션에 siteNickname이 있으면 DB 조회 없이 세션 데이터로 바로 응답한다.
  if (session.siteNickname && session.siteAnimal) {
    return ok({
      user: {
        type: 'authenticated',
        id: session.userId,
        kakaoId: session.kakaoId,
        nickname: session.nickname,
        profileImageUrl: session.profileImageUrl,
        siteNickname: session.siteNickname,
        siteAnimal: session.siteAnimal,
        isAdmin: session.isAdmin ?? isAdminKakaoId(session.kakaoId),
      },
    })
  }

  // 구 세션(siteNickname 미포함)은 DB에서 조회한다.
  const userProfile = await getUserProfile(session.userId)

  return ok({
    user: userProfile
      ? {
          type: 'authenticated',
          id: userProfile.id,
          kakaoId: userProfile.kakaoId,
          nickname: userProfile.nickname,
          profileImageUrl: userProfile.profileImageUrl,
          siteNickname: userProfile.siteNickname,
          siteAnimal: userProfile.siteAnimal,
          isAdmin: isAdminKakaoId(session.kakaoId),
        }
      : null,
  })
}

export async function PATCH(request: NextRequest) {
  const session = await getUserSession()
  if (!session) return unauthorized()

  let siteNickname: string
  let siteAnimal: string

  try {
    const body = await request.json() as { siteNickname?: unknown; siteAnimal?: unknown }
    if (
      typeof body.siteNickname === 'string' &&
      body.siteNickname.trim().length > 0 &&
      typeof body.siteAnimal === 'string' &&
      isNicknameAnimal(body.siteAnimal)
    ) {
      siteNickname = body.siteNickname.trim()
      siteAnimal = body.siteAnimal
    } else {
      const generated = generateNickname()
      siteNickname = generated.nickname
      siteAnimal = generated.animal
    }
  } catch {
    const generated = generateNickname()
    siteNickname = generated.nickname
    siteAnimal = generated.animal
  }

  const result = await updateUserSiteProfile(session.userId, siteNickname, siteAnimal)
  if (!result) return serverError('Failed to update profile')

  return ok({ siteNickname: result.siteNickname, siteAnimal: result.siteAnimal })
}
