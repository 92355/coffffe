import type { ReactNode } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ADMIN_SESSION_COOKIE, getAdminSecret, isAdminSessionValue } from '@/lib/admin-auth'
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
    value: password,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 8,
  })

  redirect('/admin')
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const configured = Boolean(process.env.ADMIN_SECRET)
  const cookieStore = await cookies()
  const authenticated = isAdminSessionValue(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)

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
        <form action={login} className="w-full max-w-md rounded-lg border border-[#eadfd3] bg-white p-6 shadow-sm">
          <h1 className="text-xl font-black text-[#3f2618]">관리자 로그인</h1>
          <label className="mt-5 block text-sm font-bold text-[#5f4634]" htmlFor="password">
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
            className="mt-5 h-11 w-full rounded-md bg-[#5a2e11] text-sm font-black text-white"
          >
            로그인
          </button>
        </form>
      </main>
    )
  }

  return <AdminShell>{children}</AdminShell>
}
