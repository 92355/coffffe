import { NextResponse } from 'next/server'
import { getUserSession } from '@/lib/user-auth'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { generateNickname, isNicknameAnimal } from '@/lib/nickname'

const ADMIN_KAKAO_IDS_KEY = 'ADMIN_KAKAO_IDS'

export async function GET() {
  const session = await getUserSession()
  const userProfile = session ? await readUserProfile(session.userId) : null

  return NextResponse.json({
    user: session && userProfile
      ? {
          type: 'authenticated',
          id: userProfile.id,
          kakaoId: userProfile.kakao_id,
          nickname: userProfile.nickname,
          profileImageUrl: userProfile.profile_image_url,
          siteNickname: userProfile.site_nickname,
          siteAnimal: userProfile.site_animal,
          isAdmin: isAdminKakaoId(session.kakaoId),
        }
      : null,
  })
}

export async function PATCH() {
  const session = await getUserSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const generatedProfile = generateNickname()
  const { data, error } = await createSupabaseAdminClient()
    .from('users')
    .update({
      site_nickname: generatedProfile.nickname,
      site_animal: generatedProfile.animal,
    })
    .eq('id', session.userId)
    .select('site_nickname, site_animal')
    .single()

  if (error) {
    console.error('Failed to update site profile. / 사이트 프로필 갱신 실패.', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }

  return NextResponse.json({
    siteNickname: data.site_nickname,
    siteAnimal: data.site_animal,
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

interface UserProfileRecord {
  id: string
  kakao_id: string
  nickname: string
  profile_image_url: string | null
  site_nickname: string
  site_animal: string
}

async function readUserProfile(userId: string): Promise<UserProfileRecord | null> {
  const { data, error } = await createSupabaseAdminClient()
    .from('users')
    .select('id, kakao_id, nickname, profile_image_url, site_nickname, site_animal')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    console.error('Failed to read user profile. / 사용자 프로필 조회 실패.', error)
    return null
  }

  if (!data) return null
  if (typeof data.site_nickname !== 'string' || !isNicknameAnimal(data.site_animal)) return null

  return data as UserProfileRecord
}
