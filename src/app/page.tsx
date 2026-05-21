import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Bean, Coffee, Compass, MapPin, Search, Sparkles } from 'lucide-react'
import type { Cafe } from '@/types/cafe'
import cafesData from '@/data/cafes.json'
import HeroParticles from '@/components/home/HeroParticles'
import FeaturedCafesSection from '@/components/home/FeaturedCafesSection'

const featuredCafes = (cafesData as unknown as Cafe[])
  .sort((a, b) => b.qualityScore - a.qualityScore)
  .slice(0, 3)

const FEATURES = [
  {
    title: '안산 카페 지도',
    description: '스페셜티, 로스터리, 디저트, 노트북 카페를 한 화면에서 탐색합니다.',
    icon: MapPin,
    href: '/map',
  },
  {
    title: '취향 필터',
    description: '로스팅 강도, 원두 산지, 추출 방식으로 원하는 커피를 좁혀봅니다.',
    icon: Search,
    href: '/map',
  },
  {
    title: '커피 CBTI',
    description: '10개의 질문으로 내 취향에 맞는 커피 스타일을 찾아봅니다.',
    icon: Sparkles,
    href: '/cbti',
  },
]

export default function HomePage() {
  return (
    <main className="min-h-dvh">

      {/* ── Hero ── */}
      <section className="relative flex min-h-dvh flex-col overflow-hidden bg-[#0e0600]">
        <HeroParticles />

        <header className="relative z-10 flex h-16 shrink-0 items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/10">
              <Image
                src="/image/logo/beenRoad.png"
                alt="원두로 로고"
                width={36}
                height={36}
                className="h-full w-full object-cover"
                priority
              />
            </span>
            <span className="text-base font-black tracking-tight text-white/90">원두로</span>
          </Link>
          <nav className="flex items-center gap-1">
            <Link
              href="/beans"
              className="hidden h-9 items-center gap-1.5 rounded-full px-3.5 text-sm font-bold text-white/60 no-underline transition-colors hover:bg-white/10 hover:text-white/90 sm:flex"
            >
              <Bean size={14} /> 원두
            </Link>
            <Link
              href="/cbti"
              className="hidden h-9 items-center gap-1.5 rounded-full px-3.5 text-sm font-bold text-white/60 no-underline transition-colors hover:bg-white/10 hover:text-white/90 sm:flex"
            >
              <Coffee size={14} /> CBTI
            </Link>
            <Link
              href="/map"
              className="flex h-9 items-center gap-1.5 rounded-full bg-[#e8720a] px-4 text-sm font-black text-white no-underline shadow-[0_6px_18px_rgba(232,114,10,0.38)] transition-all hover:bg-[#d66612] active:scale-95"
            >
              지도 <ArrowRight size={13} />
            </Link>
          </nav>
        </header>

        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 py-16 text-center">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-bold text-white/70 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#e8720a]" />
            안산 스페셜티 커피 큐레이션
          </span>

          <h1 className="max-w-2xl text-5xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-[4.5rem]">
            좋은 커피를 찾는 길을
            <br />더 짧게.
          </h1>

          <p className="mt-6 max-w-xl text-base font-medium leading-8 text-white/50 sm:text-lg">
            안산의 스페셜티 카페와 원두를 취향 기준으로 탐색합니다.
            <br className="hidden sm:block" />
            산미, 로스팅, 추출 방식까지 보고 오늘 갈 카페를 고르세요.
          </p>

          <div className="mt-10 flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
            <Link
              href="/map"
              className="flex h-[52px] items-center justify-center gap-2 rounded-2xl bg-[#e8720a] px-8 text-base font-black text-white no-underline shadow-[0_14px_36px_rgba(232,114,10,0.32)] transition-all hover:bg-[#d66612] hover:shadow-[0_18px_44px_rgba(232,114,10,0.44)] active:scale-[0.98]"
            >
              <Compass size={18} /> 지도에서 카페 찾기
            </Link>
            <Link
              href="/cbti"
              className="flex h-[52px] items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-8 text-base font-black text-white/80 no-underline backdrop-blur-sm transition-colors hover:bg-white/10"
            >
              내 커피 취향 보기
            </Link>
          </div>

          <div className="mt-16 flex items-center justify-center divide-x divide-white/10">
            {[
              { val: '8', label: '큐레이션 카페' },
              { val: '16', label: 'CBTI 유형' },
              { val: '9', label: '원두 산지' },
            ].map(({ val, label }) => (
              <div key={label} className="px-7 text-center">
                <p className="text-3xl font-black text-[#e8720a]">{val}</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-white/35">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex shrink-0 flex-col items-center gap-2 pb-8 text-white/25">
          <p className="text-[9px] font-bold uppercase tracking-widest">scroll</p>
          <span className="scroll-arrow" />
        </div>
      </section>

      {/* ── Featured Cafes ── */}
      <FeaturedCafesSection cafes={featuredCafes} />

      {/* ── Map Preview ── */}
      <section className="border-t border-[#1e0a00] bg-[#130800] px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-[#e8720a]">MAP</p>
              <h2 className="mt-2 text-3xl font-black text-white">지도에서 카페를 찾아보세요</h2>
              <p className="mt-4 text-base font-medium leading-7 text-white/50">
                로스팅 강도, 원두 산지, 추출 방식 필터로 오늘 마시고 싶은 커피를 찾고 바로 길을 열어보세요.
              </p>
              <Link
                href="/map"
                className="mt-8 inline-flex h-12 items-center gap-2 rounded-2xl bg-[#e8720a] px-7 text-sm font-black text-white no-underline shadow-[0_10px_28px_rgba(232,114,10,0.28)] transition-all hover:bg-[#d66612]"
              >
                <MapPin size={16} /> 지도 열기
              </Link>
            </div>

            <div className="relative min-h-[320px]">
              <div className="absolute inset-0 rounded-[28px] border border-white/5 bg-[#1e0e02]" />
              <div className="absolute inset-4 overflow-hidden rounded-[20px] bg-[#160900]">
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute left-[8%] top-[16%] h-[2px] w-[88%] rotate-[-18deg] bg-[#c4a070]" />
                  <div className="absolute left-[2%] top-[56%] h-[2px] w-[95%] rotate-[12deg] bg-[#c4a070]" />
                  <div className="absolute left-[46%] top-[-8%] h-[110%] w-[2px] rotate-[18deg] bg-[#c4a070]" />
                  <div className="absolute left-[68%] top-[4%] h-full w-[2px] rotate-[-11deg] bg-[#c4a070]" />
                </div>
                <div className="absolute left-[15%] top-[20%] flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e8720a] text-white shadow-[0_8px_20px_rgba(232,114,10,0.45)]">
                  <Coffee size={20} />
                </div>
                <div className="absolute right-[24%] top-[34%] flex h-10 w-10 items-center justify-center rounded-xl bg-[#5a2e11] text-white shadow-[0_6px_16px_rgba(0,0,0,0.5)]">
                  <MapPin size={18} />
                </div>
                <div className="absolute bottom-[26%] left-[36%] flex h-10 w-10 items-center justify-center rounded-xl border border-[#e8720a]/25 bg-[#2a1200] text-[#e8720a] shadow-[0_6px_16px_rgba(0,0,0,0.4)]">
                  <Bean size={18} />
                </div>
                <div className="absolute left-3 right-3 top-3 rounded-xl border border-white/5 bg-white/5 p-2.5 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-xs font-bold text-white/35">
                    <Search size={13} /> 산미 있는 푸어오버
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="border-t border-[#dfcbb1] bg-[#fbf8f3] px-5 py-14 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <p className="text-[11px] font-black uppercase tracking-widest text-[#b45a12]">WHY 원두로</p>
            <h2 className="mt-2 text-3xl font-black text-[#2a1d14]">취향에 맞는 커피, 더 쉽게</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {FEATURES.map(({ title, description, icon: Icon, href }) => (
              <Link
                key={title}
                href={href}
                className="group block rounded-2xl border border-[#eadfd3] bg-white p-6 no-underline shadow-[0_6px_20px_rgba(90,46,17,0.07)] transition-all hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(90,46,17,0.14)]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff3df] text-[#b45a12] transition-transform group-hover:scale-110">
                  <Icon size={20} />
                </div>
                <h3 className="mt-4 text-lg font-black text-[#2c2118]">{title}</h3>
                <p className="mt-2 text-sm font-medium leading-6 text-[#6f5845]">{description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CBTI CTA ── */}
      <section className="bg-gradient-to-br from-[#3d1a00] to-[#7a3810] px-5 py-20 sm:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <span className="mb-4 text-4xl">☕</span>
          <h2 className="text-3xl font-black text-white">내 커피 취향이 뭔지 모르겠어?</h2>
          <p className="mt-4 text-base font-medium text-white/55">
            10개의 질문으로 나에게 맞는 커피 스타일을 알아보세요.
          </p>
          <Link
            href="/cbti"
            className="mt-9 flex h-[52px] items-center gap-2 rounded-2xl bg-white px-9 text-base font-black text-[#5a2e11] no-underline shadow-[0_12px_32px_rgba(0,0,0,0.3)] transition-all hover:bg-[#fff8f0] active:scale-[0.98]"
          >
            <Sparkles size={18} /> CBTI 시작하기
          </Link>
        </div>
      </section>
    </main>
  )
}
