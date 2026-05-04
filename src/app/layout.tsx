import type { Metadata } from 'next'
import { Noto_Sans_KR } from 'next/font/google'
import KakaoMapScript from '@/components/KakaoMapScript'
import './globals.css'

const notoSansKR = Noto_Sans_KR({
  variable: '--font-noto-sans-kr',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
})

export const metadata: Metadata = {
  title: 'coFFFFFe map — 안산 스페셜티 커피 지도',
  description: '진짜 고퀄리티 스페셜티 커피를 찾는 사람들을 위한 큐레이션 지도.',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={notoSansKR.variable} suppressHydrationWarning>
      <head>
        {/* Prevent dark mode flash */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){var t=localStorage.getItem('theme'),d=window.matchMedia('(prefers-color-scheme: dark)').matches;if(t==='dark'||(t===null&&d))document.documentElement.classList.add('dark');})();` }} />
      </head>
      <body className="bg-gray-100 dark:bg-gray-950 min-h-dvh">
        {/* Centered 70%-ish container */}
        <div className="mx-auto w-full max-w-4xl min-h-dvh bg-white dark:bg-gray-900 shadow-[0_0_0_1px] shadow-gray-200 dark:shadow-gray-800 flex flex-col">
          {children}
        </div>
      </body>
      <KakaoMapScript />
    </html>
  )
}
