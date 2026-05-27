import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getUserSession } from '@/lib/user-auth'
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  getAdminSessionMaxAgeSeconds,
} from '@/lib/admin-auth'

// 카카오로 로그인된 관리자에게 admin_session 쿠키를 자동 발급한다.
// ADMIN_SECRET이 설정되어 있어야 동작한다.
export async function GET() {
  const session = await getUserSession()

  if (!session?.isAdmin) {
    redirect('/admin')
  }

  try {
    const cookieStore = await cookies()
    cookieStore.set({
      name: ADMIN_SESSION_COOKIE,
      value: createAdminSessionToken(),
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: getAdminSessionMaxAgeSeconds(),
    })
  } catch {
    // ADMIN_SECRET 미설정 시 — 그냥 /admin으로 리디렉션 (로그인 폼 표시됨)
  }

  redirect('/admin')
}
