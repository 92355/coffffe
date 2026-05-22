'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, type Variants } from 'framer-motion'
import {
  ArrowRight,
  Bean,
  Coffee,
  Compass,
  MapPin,
  Search,
  Sparkles,
  Star,
} from 'lucide-react'
import type { Cafe } from '@/types/cafe'
import HeroParticles from '@/components/home/HeroParticles'
import FeaturedCafesSection from '@/components/home/FeaturedCafesSection'
import MapPreviewCard from '@/components/home/MapPreviewCard'

interface HomeExperienceProps {
  featuredCafes: Cafe[]
}

const FEATURES = [
  {
    title: '안산 카페 지도',
    description: '스페셜티·로스터리·노트북·디저트 카페를 한 화면에서 탐색하고, 마커를 탭하면 바로 상세 정보를 확인합니다.',
    icon: MapPin,
    href: '/map',
  },
  {
    title: '취향 필터',
    description: '로스팅 강도, 원두 산지, 추출 방식 세 가지 축으로 오늘 마시고 싶은 커피를 빠르게 좁혀냅니다.',
    icon: Search,
    href: '/map',
  },
  {
    title: '커피 CBTI',
    description: '10개의 질문으로 라이트·다크, 에스프레소·푸어오버 등 16가지 유형 중 내 취향을 찾아드립니다.',
    icon: Sparkles,
    href: '/cbti',
  },
]

const STATS = [
  { value: '8', label: '큐레이션 카페' },
  { value: '16', label: 'CBTI 유형' },
  { value: '9', label: '원두 산지' },
]

const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.08,
    },
  },
}

const riseItem: Variants = {
  hidden: { opacity: 0, y: 28, filter: 'blur(10px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] },
  },
}

export default function HomeExperience({ featuredCafes }: HomeExperienceProps) {
  return (
    <main className="min-h-dvh bg-[var(--bg)] text-[var(--text)]">
      {/* ── Hero ── */}
      <section className="relative flex min-h-dvh flex-col overflow-hidden bg-[radial-gradient(circle_at_18%_16%,rgba(143,174,90,0.22),transparent_28%),radial-gradient(circle_at_82%_8%,rgba(192,138,90,0.26),transparent_30%),linear-gradient(135deg,var(--primary)_0%,var(--brown)_52%,#2d1a10_100%)]">
        <HeroParticles />

        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/35 to-transparent" />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -left-24 top-32 h-72 w-72 rounded-full bg-[var(--accent)]/20 blur-3xl"
          animate={{ x: [0, 24, 0], y: [0, -18, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -right-20 bottom-28 h-80 w-80 rounded-full bg-[var(--sub)]/25 blur-3xl"
          animate={{ x: [0, -22, 0], y: [0, 24, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Nav */}
        <header className="relative z-10 px-4 pt-4 sm:px-6 lg:px-10">
          <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between rounded-2xl border border-white/15 bg-white/10 px-3.5 shadow-[0_18px_55px_rgba(0,0,0,0.22)] backdrop-blur-2xl sm:px-5">
            <Link href="/" className="flex min-w-0 items-center gap-2.5 no-underline">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/15 bg-white/15">
                <Image
                  src="/image/logo/beenRoad.png"
                  alt="원두로 로고"
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                  priority
                />
              </span>
              <span className="text-base font-black text-white">원두로</span>
            </Link>
            <div className="flex items-center gap-1">
              <Link
                href="/beans"
                className="hidden h-10 items-center gap-1.5 rounded-full px-3.5 text-sm font-bold text-white/80 no-underline transition-colors hover:bg-white/12 hover:text-white sm:flex"
              >
                <Bean size={14} /> 원두
              </Link>
              <Link
                href="/cbti"
                className="hidden h-10 items-center gap-1.5 rounded-full px-3.5 text-sm font-bold text-white/80 no-underline transition-colors hover:bg-white/12 hover:text-white sm:flex"
              >
                <Coffee size={14} /> CBTI
              </Link>
              <Link
                href="/map"
                className="flex h-10 items-center gap-1.5 rounded-full bg-[#c87030] px-4 text-sm font-black text-white no-underline shadow-[0_10px_30px_rgba(200,112,48,0.38)] transition-all hover:scale-[1.02] hover:bg-[#b8612a] active:scale-95"
              >
                지도 열기 <ArrowRight size={14} />
              </Link>
            </div>
          </nav>
        </header>

        {/* Hero body */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="relative z-10 mx-auto grid w-full max-w-7xl flex-1 items-start gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:px-10"
        >
          <div className="text-center lg:text-left">
            <motion.span
              variants={riseItem}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/12 px-4 py-1.5 text-xs font-bold text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] backdrop-blur-xl"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_18px_rgba(143,174,90,0.95)]" />
              안산 스페셜티 커피 큐레이션
            </motion.span>

            <motion.h1
              variants={riseItem}
              className="mt-7 bg-gradient-to-br from-[#1a0a04] via-[#7a3a14] to-[#c87030] bg-clip-text text-5xl font-black leading-[1.04] text-transparent sm:text-6xl lg:text-[5.2rem]"
            >
              좋은 커피를
              <br />
              더 감각적으로.
            </motion.h1>

            <motion.p
              variants={riseItem}
              className="mx-auto mt-6 max-w-xl text-base font-bold leading-8 text-[#5a2e11] sm:text-lg lg:mx-0"
            >
              안산의 스페셜티 카페와 원두를 취향 필터로 탐색합니다.
              <br className="hidden sm:block" />
              산미·바디·로스팅까지 보고 오늘 갈 카페를 골라보세요.
            </motion.p>

            <motion.div
              variants={riseItem}
              className="mt-9 flex w-full flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start"
            >
              <Link
                href="/map"
                className="flex h-[54px] items-center justify-center gap-2 rounded-2xl bg-[#c87030] px-8 text-base font-black text-white no-underline shadow-[0_20px_45px_rgba(200,112,48,0.38)] transition-all hover:-translate-y-0.5 hover:bg-[#b8612a] hover:shadow-[0_26px_56px_rgba(200,112,48,0.48)] active:scale-[0.98]"
              >
                <Compass size={18} /> 지도에서 카페 찾기
              </Link>
              <Link
                href="/cbti"
                className="flex h-[54px] items-center justify-center gap-2 rounded-2xl border border-[#c87030]/50 bg-[#5a2e11]/40 px-8 text-base font-black text-[#f3eee7] no-underline backdrop-blur-xl transition-all hover:border-[#c87030]/70 hover:bg-[#5a2e11]/55"
              >
                내 취향 알아보기
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={riseItem}
              className="mt-10 grid grid-cols-3 overflow-hidden rounded-3xl border border-white/18 bg-white/10 text-center shadow-[0_18px_55px_rgba(0,0,0,0.18)] backdrop-blur-2xl"
            >
              {STATS.map(({ value, label }) => (
                <div key={label} className="border-r border-white/15 px-3 py-4 last:border-r-0">
                  <p className="text-3xl font-black text-[var(--accent)]">{value}</p>
                  <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-black">{label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Hero mock card */}
          <motion.div variants={riseItem} className="relative mx-auto w-full max-w-[520px] lg:max-w-none lg:pt-10">
            <div className="absolute -inset-5 rounded-[2rem] bg-white/8 blur-2xl " />
            <motion.div
              className="relative overflow-hidden rounded-[2rem] border border-white/18 bg-white/12 p-4 shadow-[0_30px_90px_rgba(0,0,0,0.28)] backdrop-blur-2xl"
              whileHover={{ y: -6, rotateX: 2, rotateY: -2 }}
              transition={{ type: 'spring', stiffness: 180, damping: 20 }}
            >
              <div className="rounded-[1.5rem] border border-[#5a2e11]/12 bg-[#fdf6ee] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-widest text-[#8fae5a]">Live Filter</p>
                    <h2 className="mt-1 text-2xl font-black text-[#2d1a10]">오늘의 카페 루트</h2>
                  </div>
                  <span className="rounded-full bg-[#8fae5a] px-3 py-1 text-xs font-black text-white shadow-[0_4px_12px_rgba(143,174,90,0.35)]">
                    오늘의 추천
                  </span>
                </div>

                <div className="mt-4 rounded-3xl border border-[#5a2e11]/10 bg-[#f3ede3] p-3">
                  <div className="relative h-60 overflow-hidden rounded-2xl" style={{ background: '#e6edd8' }}>
                    {/* 지도 격자 */}
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage:
                          'linear-gradient(rgba(143,174,90,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(143,174,90,0.18) 1px, transparent 1px)',
                        backgroundSize: '28px 28px',
                      }}
                    />
                    {/* 도로 */}
                    <div className="absolute inset-0">
                      <span className="absolute left-0 top-[47%] h-[4px] w-full bg-white/75 shadow-sm" />
                      <span className="absolute left-[40%] top-0 h-full w-[4px] bg-white/75 shadow-sm" />
                      <span className="absolute left-0 top-[70%] h-[2px] w-full bg-white/50" />
                      <span className="absolute left-[68%] top-0 h-full w-[2px] bg-white/50" />
                    </div>
                    {/* 루트 선 */}
                    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 240" preserveAspectRatio="none">
                      <polyline
                        points="80,185 160,115 270,68"
                        stroke="#c87030"
                        strokeWidth="2.5"
                        strokeDasharray="6,4"
                        fill="none"
                        strokeLinecap="round"
                      />
                    </svg>
                    {/* 마커 3개 */}
                    {[
                      { left: '18%', top: '70%', label: '로스터리', variant: 'brown' },
                      { left: '38%', top: '44%', label: '푸어오버', variant: 'olive' },
                      { left: '63%', top: '24%', label: '에티오피아', variant: 'olive' },
                    ].map(({ left, top, label, variant }, i) => (
                      <motion.div
                        key={label}
                        className="absolute"
                        style={{ left, top, transform: 'translate(-50%, -100%)' }}
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 3, delay: i * 0.55, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <div
                          className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black shadow-md"
                          style={
                            variant === 'brown'
                              ? { background: '#5a2e11', color: '#f3eee7' }
                              : { background: '#8fae5a', color: 'white' }
                          }
                        >
                          <MapPin size={9} /> {label}
                        </div>
                        <div className="mx-auto h-2.5 w-0.5" style={{ background: variant === 'brown' ? '#5a2e11' : '#8fae5a' }} />
                        <div
                          className="mx-auto h-2 w-2 rounded-full border-2 border-white"
                          style={{ background: variant === 'brown' ? '#5a2e11' : '#8fae5a' }}
                        />
                      </motion.div>
                    ))}
                    {/* 검색바 */}
                    <div className="absolute left-3 right-3 top-3 rounded-2xl border border-[#5a2e11]/15 bg-white/92 p-3 shadow-[0_8px_24px_rgba(90,46,17,0.1)]">
                      <div className="flex items-center gap-2 text-xs font-black text-[#5a2e11]">
                        <Search size={14} className="text-[#8fae5a]" /> 산미 있는 푸어오버
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-[#5a2e11]/12 bg-white p-4">
                    <p className="text-xs font-bold text-[#8fae5a]">추천 카페</p>
                    <p className="mt-1 text-lg font-black text-[#2d1a10]">
                      {featuredCafes[0]?.name ?? '안산 스페셜티'}
                    </p>
                  </div>
                  <div className="rounded-2xl p-4" style={{ background: '#5a2e11' }}>
                    <p className="text-xs font-bold text-[#f3eee7]/70">커피 노트</p>
                    <p className="mt-1 text-lg font-black text-[#f3eee7]">Citrus · Nutty</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        <div className="relative z-10 flex shrink-0 flex-col items-center gap-2 pb-8 text-white/50">
          <p className="text-[9px] font-bold uppercase tracking-widest">scroll</p>
          <span className="scroll-arrow" />
        </div>
      </section>

      {/* ── Featured Cafes ── */}
      <FeaturedCafesSection cafes={featuredCafes} />

      {/* ── Map section ── */}
      <section className="border-t border-[var(--border)] bg-[linear-gradient(180deg,var(--bg),var(--brown-soft))] px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true, margin: '-80px' }}
          >
            <div className="flex items-center gap-2">
              <span className="h-px w-6 bg-[#8fae5a]" />
              <p className="text-[11px] font-black uppercase tracking-widest text-[#8fae5a]">지도 탐색</p>
            </div>
            <h2 className="mt-4 text-3xl font-black leading-[1.12] sm:text-4xl lg:text-[2.8rem]">
              <span className="bg-gradient-to-br from-[#2d1a10] via-[#5a2e11] to-[#8fae5a] bg-clip-text text-transparent">
                지도 위에서
              </span>
              <br />
              <span className="text-[#2d1a10]">카페를 골라보세요</span>
            </h2>
            <p className="mt-5 text-base font-medium leading-7 text-[#7a5c3e]">
              로스팅 강도, 원두 산지, 추출 방식 필터를 조합해 오늘 마시고 싶은 커피를 찾고,
              마커를 탭하면 영업시간과 인스타그램까지 한 번에 확인합니다.
            </p>
            <ul className="mt-5 space-y-2 text-sm font-semibold text-[#5a2e11]">
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#8fae5a]" /> 스페셜티·로스터리·디저트·노트북·반려동물 카테고리</li>
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#8fae5a]" /> 현재 위치 기반 &apos;이 지역 검색&apos;</li>
              <li className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#8fae5a]" /> 카카오 지도 연동 길찾기</li>
            </ul>
            <Link
              href="/map"
              className="mt-8 inline-flex h-12 items-center gap-2 rounded-2xl bg-[#c87030] px-7 text-sm font-black text-white no-underline shadow-[0_14px_32px_rgba(200,112,48,0.3)] transition-all hover:-translate-y-0.5 hover:bg-[#b8612a]"
            >
              <MapPin size={16} /> 지도 열기
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true, margin: '-80px' }}
            className="relative min-h-[380px] overflow-hidden rounded-[2rem] border border-[#5a2e11]/12 shadow-[0_26px_70px_rgba(90,46,17,0.14)]"
          >
            {/* 실제 카카오 지도 (현재 위치 기반) */}
            <MapPreviewCard />

            {/* 검색바 */}
            <div className="absolute left-4 right-4 top-4 z-10 rounded-2xl border border-white/70 bg-white/90 p-3 shadow-[0_8px_24px_rgba(90,46,17,0.12)] backdrop-blur-xl">
              <div className="flex items-center gap-2 text-xs font-black text-[#5a2e11]">
                <Search size={14} className="text-[#8fae5a]" /> 노트북 가능한 로스터리
              </div>
            </div>

            {/* 플로팅 태그 */}
            {FEATURES.map(({ title, icon: Icon }, index) => (
              <motion.div
                key={title}
                className="absolute z-10 flex items-center gap-2 rounded-2xl border border-white/80 bg-white/90 px-3 py-2 text-xs font-black text-[#2d1a10] shadow-[0_12px_30px_rgba(90,46,17,0.15)] backdrop-blur-xl"
                style={{
                  left: `${10 + index * 20}%`,
                  top: `${38 + index * 16}%`,
                }}
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3.4, delay: index * 0.3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Icon size={15} className="text-[#8fae5a]" /> {title}
              </motion.div>
            ))}

            {/* 하단 위치 안내 배지 */}
            <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 rounded-full bg-[#5a2e11]/85 px-3 py-1.5 text-[10px] font-black text-[#f3eee7] backdrop-blur-sm">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#8fae5a]" />
              현재 위치 기준
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="border-t border-[var(--border)] bg-[var(--surface)] px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <div className="mb-3 flex items-center justify-center gap-2">
              <span className="h-px w-8 bg-[#8fae5a]" />
              <p className="text-[11px] font-black uppercase tracking-widest text-[#8fae5a]">WHY 원두로</p>
              <span className="h-px w-8 bg-[#8fae5a]" />
            </div>
            <h2 className="text-3xl font-black text-[#2d1a10] sm:text-4xl">취향에 맞는 커피, 더 쉽게</h2>
            <p className="mx-auto mt-4 max-w-lg text-sm font-medium leading-7 text-[#7a5c3e]">
              카페 검색부터 취향 분석까지, 안산 스페셜티 커피 씬을 한 곳에서 탐색하세요.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {FEATURES.map(({ title, description, icon: Icon, href }, index) => {
              const accents = [
                { bar: '#5a2e11', iconBg: '#f0e4d4', iconColor: '#5a2e11', num: '01', shadow: 'rgba(90,46,17,0.18)' },
                { bar: '#8fae5a', iconBg: '#e6edd8', iconColor: '#5a7a2a', num: '02', shadow: 'rgba(143,174,90,0.18)' },
                { bar: '#c87030', iconBg: '#f5e8d4', iconColor: '#c87030', num: '03', shadow: 'rgba(200,112,48,0.18)' },
              ]
              const a = accents[index]
              return (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.58, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  viewport={{ once: true, margin: '-60px' }}
                >
                  <Link
                    href={href}
                    className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-[#e8ddd0] bg-white no-underline shadow-[0_8px_28px_rgba(90,46,17,0.07)] transition-all duration-300 hover:-translate-y-1.5"
                    style={{ boxShadow: `0 8px 28px ${a.shadow}` }}
                  >
                    {/* 상단 컬러 바 */}
                    <div className="h-1.5 w-full transition-all duration-300 group-hover:h-2" style={{ background: a.bar }} />

                    <div className="relative flex flex-1 flex-col p-7">
                      {/* 배경 숫자 */}
                      <span
                        className="pointer-events-none absolute right-5 top-3 select-none text-[5rem] font-black leading-none opacity-[0.06] transition-opacity duration-300 group-hover:opacity-[0.1]"
                        style={{ color: a.bar }}
                      >
                        {a.num}
                      </span>

                      {/* 아이콘 */}
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110"
                        style={{ background: a.iconBg, color: a.iconColor }}
                      >
                        <Icon size={22} />
                      </div>

                      <h3 className="mt-5 text-lg font-black text-[#2d1a10]">{title}</h3>
                      <p className="mt-2 flex-1 text-sm font-medium leading-6 text-[#7a5c3e]">{description}</p>

                      <span
                        className="mt-5 inline-flex items-center gap-1.5 text-xs font-black transition-all duration-200 group-hover:gap-2"
                        style={{ color: a.bar }}
                      >
                        바로가기 <ArrowRight size={12} />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-[linear-gradient(135deg,var(--primary),var(--brown))] px-5 py-20 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true, margin: '-80px' }}
          className="mx-auto flex max-w-2xl flex-col items-center rounded-[2rem] border border-white/18 bg-white/10 p-8 text-center shadow-[0_26px_80px_rgba(0,0,0,0.22)] backdrop-blur-2xl sm:p-12"
        >
          <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-white">
            <Sparkles size={28} />
          </span>
          <h2 className="text-3xl font-black text-white sm:text-4xl">
            내 커피 취향,<br />아직 모르겠어?
          </h2>
          <p className="mt-5 max-w-sm text-base font-medium leading-7 text-white/78">
            라이트·다크, 에스프레소·푸어오버, 산미·바디감까지.
            10개의 질문으로 16가지 유형 중 내 스타일을 찾아드립니다.
          </p>
          <Link
            href="/cbti"
            className="mt-9 flex h-[52px] items-center gap-2 rounded-2xl bg-white px-9 text-base font-black text-[var(--brown)] no-underline shadow-[0_14px_34px_rgba(0,0,0,0.28)] transition-all hover:-translate-y-0.5 hover:bg-[var(--accent-soft)] active:scale-[0.98]"
          >
            <Star size={18} /> CBTI 시작하기
          </Link>
        </motion.div>
      </section>
    </main>
  )
}
