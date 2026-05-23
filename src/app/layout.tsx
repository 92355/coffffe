import type { Metadata } from 'next'
import { Noto_Sans_KR, Josefin_Sans } from 'next/font/google'
import './globals.css'

const notoSansKR = Noto_Sans_KR({
  variable: '--font-noto-sans-kr',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
})

const josefinSans = Josefin_Sans({
  variable: '--font-josefin-sans',
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'],
})

export const metadata: Metadata = {
  title: '원두로 — 스페셜티 커피 지도',
  description: '진짜 고퀄리티 스페셜티 커피를 찾는 사람들을 위한 큐레이션 지도.',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={`${notoSansKR.variable} ${josefinSans.variable}`} suppressHydrationWarning>
      <head>
        {/* Prevent dark mode flash */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){var t=localStorage.getItem('theme'),d=window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='dark'||(t===null&&d))document.documentElement.classList.add('dark');})();` }} />
      </head>
      <body className="min-h-dvh">
        <div className="w-full min-h-dvh flex flex-col" style={{ background: 'var(--background)' }}>
          {children}
        </div>
      </body>
    </html>
  )
}
