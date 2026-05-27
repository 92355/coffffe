import type { ReactNode } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  getAdminSecret,
  getAdminSessionMaxAgeSeconds,
  isAdminSessionValue,
} from '@/lib/admin-auth'
import { getUserSession } from '@/lib/user-auth'
import AdminShell from '@/components/AdminShell'

interface AdminLayoutProps {
  children: ReactNode
}

async function login(formData: FormData) {
  'use server'

  const password = formData.get('password')

  if (typeof password !== 'string' || password !== getAdminSecret()) {
    redirect('/admin')
  }

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

  redirect('/admin')
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const configured = Boolean(process.env.ADMIN_SECRET)
  const cookieStore = await cookies()
  const authenticated = isAdminSessionValue(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)

  // 카카오로 로그인된 관리자는 자동으로 admin_session을 발급받도록 리디렉션
  if (!authenticated) {
    const userSession = await getUserSession()
    if (userSession?.isAdmin) {
      redirect('/api/admin/auto-auth')
    }
  }

  if (!configured) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#f3eee7] px-6">
        <section className="w-full max-w-md rounded-lg border border-[#eadfd3] bg-white p-6 shadow-sm">
          <h1 className="text-xl font-black text-[#3f2618]">관리자 설정 필요</h1>
          <p className="mt-3 text-sm font-semibold leading-6 text-[#7a6654]">
            `ADMIN_SECRET` 환경 변수를 설정한 뒤 관리자 페이지를 사용할 수 있습니다.
          </p>
        </section>
      </main>
    )
  }

  if (!authenticated) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#f3eee7] px-6">
        <div className="w-full max-w-md space-y-4">
          {/* 카카오 로그인 유도 */}
          <section className="rounded-lg border border-[#eadfd3] bg-white p-5 shadow-sm">
            <h1 className="text-xl font-black text-[#3f2618]">관리자 로그인</h1>
            <p className="mt-3 text-sm font-semibold text-[#7a6654]">
              관리자 계정으로 카카오 로그인 후 이 페이지에 접근하면 자동으로 인증됩니다.
            </p>
            <a
              href={`/api/auth/kakao/start?returnTo=/admin`}
              className="mt-4 flex h-11 items-center justify-center gap-2 rounded-md bg-[#FEE500] text-sm font-black text-[#3C1E1E] hover:bg-[#F5DC00] transition-colors"
            >
              카카오로 로그인
            </a>
          </section>

          {/* 비밀번호 로그인 (기존 방식 유지) */}
          <details className="rounded-lg border border-[#eadfd3] bg-white shadow-sm">
            <summary className="cursor-pointer px-5 py-3 text-sm font-bold text-[#7a6654] hover:text-[#5f4634]">
              비밀번호로 로그인
            </summary>
            <form action={login} className="px-5 pb-5">
              <label className="mt-3 block text-sm font-bold text-[#5f4634]" htmlFor="password">
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-2 h-11 w-full rounded-md border border-[#d8c8b8] px-3 text-sm font-semibold text-[#2c2118] outline-none focus:border-[#d66612]"
              />
              <button
                type="submit"
                className="mt-4 h-11 w-full rounded-md bg-[#5a2e11] text-sm font-black text-white"
              >
                로그인
              </button>
            </form>
          </details>
        </div>
      </main>
    )
  }

  return <AdminShell>{children}</AdminShell>
}
