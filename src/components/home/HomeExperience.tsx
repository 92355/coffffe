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

interface HomeExperienceProps {
  featuredCafes: Cafe[]
}

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
                className="hidden h-10 items-center gap-1.5 rounded-full px-3.5 text-sm font-bold text-white/70 no-underline transition-colors hover:bg-white/12 hover:text-white sm:flex"
              >
                <Bean size={14} /> 원두
              </Link>
              <Link
                href="/cbti"
                className="hidden h-10 items-center gap-1.5 rounded-full px-3.5 text-sm font-bold text-white/70 no-underline transition-colors hover:bg-white/12 hover:text-white sm:flex"
              >
                <Coffee size={14} /> CBTI
              </Link>
              <Link
                href="/map"
                className="flex h-10 items-center gap-1.5 rounded-full bg-[var(--accent)] px-4 text-sm font-black text-[var(--primary)] no-underline shadow-[0_10px_30px_rgba(143,174,90,0.32)] transition-transform hover:scale-[1.02] active:scale-95"
              >
                시작 <ArrowRight size={14} />
              </Link>
            </div>
          </nav>
        </header>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="relative z-10 mx-auto grid w-full max-w-7xl flex-1 items-center gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:px-10"
        >
          <div className="text-center lg:text-left">
            <motion.span
              variants={riseItem}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-bold text-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] backdrop-blur-xl"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_18px_rgba(143,174,90,0.95)]" />
              안산 스페셜티 커피 큐레이션
            </motion.span>

            <motion.h1
              variants={riseItem}
              className="mt-7 text-5xl font-black leading-[1.04] text-white sm:text-6xl lg:text-[5.2rem]"
            >
              좋은 커피를
              <br />
              더 감각적으로.
            </motion.h1>

            <motion.p
              variants={riseItem}
              className="mx-auto mt-6 max-w-xl text-base font-medium leading-8 text-white/68 sm:text-lg lg:mx-0"
            >
              안산의 스페셜티 카페와 원두를 브랜드 컬러 기반의 취향 필터로 탐색합니다.
              산미, 로스팅, 추출 방식까지 보고 오늘 갈 카페를 고르세요.
            </motion.p>

            <motion.div
              variants={riseItem}
              className="mt-9 flex w-full flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start"
            >
              <Link
                href="/map"
                className="flex h-[54px] items-center justify-center gap-2 rounded-2xl bg-[var(--accent)] px-8 text-base font-black text-[var(--primary)] no-underline shadow-[0_20px_45px_rgba(143,174,90,0.28)] transition-all hover:-translate-y-0.5 hover:shadow-[0_26px_56px_rgba(143,174,90,0.38)] active:scale-[0.98]"
              >
                <Compass size={18} /> 지도에서 카페 찾기
              </Link>
              <Link
                href="/cbti"
                className="flex h-[54px] items-center justify-center gap-2 rounded-2xl border border-white/18 bg-white/10 px-8 text-base font-black text-white no-underline shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-xl transition-colors hover:bg-white/16"
              >
                내 커피 취향 보기
              </Link>
            </motion.div>

            <motion.div
              variants={riseItem}
              className="mt-10 grid grid-cols-3 overflow-hidden rounded-3xl border border-white/14 bg-white/10 text-center shadow-[0_18px_55px_rgba(0,0,0,0.18)] backdrop-blur-2xl"
            >
              {STATS.map(({ value, label }) => (
                <div key={label} className="border-r border-white/12 px-3 py-4 last:border-r-0">
                  <p className="text-3xl font-black text-[var(--accent)]">{value}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase text-white/45">{label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div variants={riseItem} className="relative mx-auto w-full max-w-[520px] lg:max-w-none">
            <div className="absolute -inset-5 rounded-[2rem] bg-white/8 blur-2xl" />
            <motion.div
              className="relative overflow-hidden rounded-[2rem] border border-white/16 bg-white/12 p-4 shadow-[0_30px_90px_rgba(0,0,0,0.28)] backdrop-blur-2xl"
              whileHover={{ y: -6, rotateX: 2, rotateY: -2 }}
              transition={{ type: 'spring', stiffness: 180, damping: 20 }}
            >
              <div className="rounded-[1.5rem] border border-white/14 bg-[rgba(246,243,236,0.88)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur-xl">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-black uppercase text-[var(--brown)]/70">Live filter</p>
                    <h2 className="mt-1 text-2xl font-black text-[var(--primary)]">오늘의 카페 루트</h2>
                  </div>
                  <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-black text-[var(--primary)]">
                    취향 92%
                  </span>
                </div>

                <div className="mt-5 rounded-3xl border border-[var(--border)]/70 bg-white/72 p-3">
                  <div className="relative h-64 overflow-hidden rounded-2xl bg-[linear-gradient(135deg,var(--brown-soft),var(--accent-soft))]">
                    <div className="absolute inset-0 opacity-50">
                      <span className="absolute left-[8%] top-[18%] h-[2px] w-[86%] rotate-[-17deg] bg-[var(--sub)]" />
                      <span className="absolute left-[1%] top-[58%] h-[2px] w-[98%] rotate-[12deg] bg-[var(--brown)]/50" />
                      <span className="absolute left-[48%] top-[-8%] h-[115%] w-[2px] rotate-[16deg] bg-[var(--sub)]/70" />
                      <span className="absolute left-[72%] top-[5%] h-full w-[2px] rotate-[-11deg] bg-[var(--brown)]/45" />
                    </div>

                    {[
                      { className: 'left-[14%] top-[20%]', icon: Coffee, label: '로스터리' },
                      { className: 'right-[20%] top-[36%]', icon: MapPin, label: '푸어오버' },
                      { className: 'bottom-[20%] left-[36%]', icon: Bean, label: '에티오피아' },
                    ].map(({ className, icon: Icon, label }, index) => (
                      <motion.div
                        key={label}
                        className={`absolute ${className} flex h-12 w-12 items-center justify-center rounded-2xl border border-white/50 bg-[var(--surface)]/85 text-[var(--brown)] shadow-[0_10px_25px_rgba(107,67,42,0.18)] backdrop-blur-xl`}
                        animate={{ y: [0, -7, 0] }}
                        transition={{
                          duration: 3.2,
                          delay: index * 0.45,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      >
                        <Icon size={20} />
                      </motion.div>
                    ))}

                    <div className="absolute left-3 right-3 top-3 rounded-2xl border border-white/45 bg-white/70 p-3 shadow-[0_10px_30px_rgba(107,67,42,0.12)] backdrop-blur-xl">
                      <div className="flex items-center gap-2 text-xs font-black text-[var(--muted)]">
                        <Search size={14} /> 산미 있는 푸어오버
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-[var(--border)]/70 bg-white/72 p-4">
                    <p className="text-xs font-bold text-[var(--muted)]">추천 카페</p>
                    <p className="mt-1 text-lg font-black text-[var(--primary)]">
                      {featuredCafes[0]?.name ?? '안산 스페셜티'}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[var(--border)]/70 bg-[var(--brown)] p-4 text-white">
                    <p className="text-xs font-bold text-white/62">커피 노트</p>
                    <p className="mt-1 text-lg font-black">Citrus · Nutty</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        <div className="relative z-10 flex shrink-0 flex-col items-center gap-2 pb-8 text-white/35">
          <p className="text-[9px] font-bold uppercase tracking-widest">scroll</p>
          <span className="scroll-arrow" />
        </div>
      </section>

      <FeaturedCafesSection cafes={featuredCafes} />

      <section className="border-t border-[var(--border)] bg-[linear-gradient(180deg,var(--bg),var(--brown-soft))] px-5 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true, margin: '-80px' }}
          >
            <p className="text-[11px] font-black uppercase text-[var(--brown)]">MAP</p>
            <h2 className="mt-2 text-3xl font-black text-[var(--primary)]">지도에서 카페를 찾아보세요</h2>
            <p className="mt-4 text-base font-medium leading-7 text-[var(--muted)]">
              로스팅 강도, 원두 산지, 추출 방식 필터로 오늘 마시고 싶은 커피를 찾고 바로 길을 열어보세요.
            </p>
            <Link
              href="/map"
              className="mt-8 inline-flex h-12 items-center gap-2 rounded-2xl bg-[var(--brown)] px-7 text-sm font-black text-white no-underline shadow-[0_14px_32px_rgba(107,67,42,0.22)] transition-all hover:-translate-y-0.5 hover:bg-[var(--primary)]"
            >
              <MapPin size={16} /> 지도 열기
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true, margin: '-80px' }}
            className="relative min-h-[340px] overflow-hidden rounded-[2rem] border border-white/70 bg-white/58 p-4 shadow-[0_26px_70px_rgba(107,67,42,0.14)] backdrop-blur-2xl"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(143,174,90,0.22),transparent_30%),radial-gradient(circle_at_80%_80%,rgba(192,138,90,0.25),transparent_34%)]" />
            <div className="relative h-full min-h-[308px] overflow-hidden rounded-[1.5rem] bg-[linear-gradient(135deg,var(--surface),var(--accent-soft))]">
              <div className="absolute left-4 right-4 top-4 rounded-2xl border border-white/70 bg-white/68 p-3 backdrop-blur-xl">
                <div className="flex items-center gap-2 text-xs font-black text-[var(--muted)]">
                  <Search size={14} /> 노트북 가능한 로스터리
                </div>
              </div>
              {FEATURES.map(({ title, icon: Icon }, index) => (
                <motion.div
                  key={title}
                  className="absolute flex items-center gap-2 rounded-2xl border border-white/70 bg-white/72 px-3 py-2 text-xs font-black text-[var(--primary)] shadow-[0_12px_30px_rgba(107,67,42,0.13)] backdrop-blur-xl"
                  style={{
                    left: `${12 + index * 18}%`,
                    top: `${32 + index * 17}%`,
                  }}
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3.4, delay: index * 0.3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Icon size={15} className="text-[var(--brown)]" /> {title}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-t border-[var(--border)] bg-[var(--surface)] px-5 py-14 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <p className="text-[11px] font-black uppercase text-[var(--brown)]">WHY 원두로</p>
            <h2 className="mt-2 text-3xl font-black text-[var(--primary)]">취향에 맞는 커피, 더 쉽게</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {FEATURES.map(({ title, description, icon: Icon, href }, index) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.58, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                viewport={{ once: true, margin: '-60px' }}
              >
                <Link
                  href={href}
                  className="group block h-full rounded-2xl border border-[var(--border)] bg-white/76 p-6 no-underline shadow-[0_12px_32px_rgba(107,67,42,0.08)] backdrop-blur-xl transition-all hover:-translate-y-1 hover:shadow-[0_24px_54px_rgba(107,67,42,0.15)]"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--primary)] transition-transform group-hover:scale-110">
                    <Icon size={20} />
                  </div>
                  <h3 className="mt-4 text-lg font-black text-[var(--primary)]">{title}</h3>
                  <p className="mt-2 text-sm font-medium leading-6 text-[var(--muted)]">{description}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[linear-gradient(135deg,var(--primary),var(--brown))] px-5 py-20 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          viewport={{ once: true, margin: '-80px' }}
          className="mx-auto flex max-w-2xl flex-col items-center rounded-[2rem] border border-white/16 bg-white/10 p-8 text-center shadow-[0_26px_80px_rgba(0,0,0,0.22)] backdrop-blur-2xl sm:p-10"
        >
          <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/12 text-white">
            <Sparkles size={28} />
          </span>
          <h2 className="text-3xl font-black text-white">내 커피 취향이 뭔지 모르겠어?</h2>
          <p className="mt-4 text-base font-medium leading-7 text-white/65">
            10개의 질문으로 나에게 맞는 커피 스타일을 알아보세요.
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
