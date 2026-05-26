'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, type Variants } from 'framer-motion'
import { Bean, Home, Map, Play, ShoppingBag, Sparkles, UserRound } from 'lucide-react'
import { useUser } from '@/hooks/useUser'
import { getAnimalAvatarPath } from '@/lib/animalAvatar'

const CURATED_BEANS = [
  {
    initial: 'P',
    origin: 'Panama',
    name: '파나마 게이샤',
    description: '화려한 꽃향기와 기분 좋은 산미가 어우러지는 밸런스. 스페셜티 커피의 여왕이라 불리는 품종입니다.',
    notes: 'Jasmine, Peach, Honey',
    swatches: ['#fdf2f0', '#fae5e1'],
    gradient: 'from-[#ae8d87] to-[#3e2723]',
  },
  {
    initial: 'E',
    origin: 'Ethiopia',
    name: '에티오피아 예가체프',
    description: '베르가못의 향긋함과 레몬의 산뜻함이 주는 깔끔한 피니시. 아침을 깨우는 상쾌한 활력을 선사합니다.',
    notes: 'Bergamot, Lemon, Tea',
    swatches: ['#f1f4ea', '#e8f0d8'],
    gradient: 'from-[#bdcca3] to-[#3e4b2c]',
  },
]

const bottomNavItems = [
  { href: '/', label: 'Home', icon: Home, active: true },
  { href: '/map', label: 'Map', icon: Map, active: false },
  { href: '/cbti', label: 'CBTI', icon: Sparkles, active: false },
  { href: '/beans', label: 'Beans', icon: ShoppingBag, active: false },
  { href: '#profile', label: 'User', icon: UserRound, active: false },
]

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as const },
})

const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.12,
    },
  },
}

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
}

export default function HomeContent() {
  const { user, profilePrefs } = useUser()
  const displayName = user?.nickname ?? '개발하는 검정곰'
  const siteAnimal = user?.type === 'authenticated' ? user.siteAnimal : user?.animal
  const kakaoProfileImageUrl = user?.type === 'authenticated' ? user.kakaoProfileImageUrl : undefined
  const useKakaoAvatar = profilePrefs.avatarPreference === 'kakao' && Boolean(kakaoProfileImageUrl)
  const avatarSrc = useKakaoAvatar
    ? kakaoProfileImageUrl!
    : siteAnimal ? getAnimalAvatarPath(siteAnimal) : '/image/animal_profill/bear.webp'

  return (
    <>
      <main className="relative z-10 mx-auto w-full max-w-md flex-1 px-5 pb-32 pt-24 text-[#1b1c1c] dark:text-[#f3f0ef]">
        <motion.section {...fadeUp(0)} className="mb-16">
          <Link href="/map" className="group relative mb-8 block aspect-[4/5] overflow-hidden rounded-2xl bg-[#271310] shadow-[0_26px_70px_rgba(62,39,35,0.24)]">
            <Image
              src="/image/home/cafe-1.png"
              alt="따뜻한 조명의 스페셜티 카페 바"
              fill
              priority
              sizes="(max-width: 480px) 100vw, 448px"
              className="object-cover object-center transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#271310]/86 via-[#271310]/18 to-transparent" />
            <div className="absolute bottom-8 left-8 right-8">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-white/70">Today&apos;s Selection</p>
              <h1 className="font-serif text-4xl font-bold italic leading-tight text-white">
                기분좋은<br />오후에요.
              </h1>
              <div className="mt-6 flex items-center gap-3">
                <Image
                  src={avatarSrc}
                  alt=""
                  width={40}
                  height={40}
                  unoptimized={useKakaoAvatar}
                  className="h-10 w-10 rounded-full border border-white/30 object-cover"
                />
                <span className="min-w-0 truncate text-sm font-bold text-white/90">{displayName}님</span>
              </div>
            </div>
            <div className="absolute right-0 top-8 bg-[#d8e8be] px-3 py-4 text-[10px] font-bold uppercase tracking-widest text-[#131f05] [writing-mode:vertical-rl]">
              LV.4 TASTER
            </div>
          </Link>

          <div className="flex items-center justify-between border-t border-[#e5e2e1] pt-6 dark:border-white/10">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#504442] dark:text-white/60">Bean of the Day</p>
              <h2 className="mt-1 text-base font-bold text-[#271310] dark:text-[#e3beb8]">에스메랄다 프라이빗</h2>
            </div>
            <Link
              href="/beans"
              aria-label="오늘의 원두 보기"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[#271310] text-white shadow-xl transition hover:bg-[#3e2723] dark:bg-[#e3beb8] dark:text-[#2b1613]"
            >
              <Play size={19} fill="currentColor" />
            </Link>
          </div>
        </motion.section>

        <motion.section
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="mb-16 grid grid-cols-12 gap-4"
        >
          <motion.div variants={staggerItem} className="col-span-8">
            <Link
              href="/cbti"
              className="group flex min-h-56 flex-col justify-between rounded-xl border border-transparent bg-[#f6f3f2] p-8 transition hover:border-[#d3c3c0] dark:bg-white/8 dark:hover:border-white/16"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#556341] dark:text-[#bdcca3]">Test</span>
                <h3 className="mt-4 font-serif text-3xl font-bold text-[#271310] dark:text-[#e3beb8]">커피 CBTI</h3>
                <p className="mt-2 break-keep text-sm leading-relaxed text-[#504442] dark:text-white/68">
                  당신만의 유니크한 커피 취향을 발견하는 시간.
                </p>
              </div>
              <Sparkles className="ml-auto mt-8 text-[#271310]/15 transition group-hover:text-[#271310]/25 dark:text-white/14" size={42} />
            </Link>
          </motion.div>
          <motion.div variants={staggerItem} className="col-span-4 flex flex-col gap-4">
            <Link href="/beans" className="flex aspect-square flex-col justify-between rounded-xl bg-[#3e2723] p-5 text-white">
              <Bean size={20} />
              <p className="break-keep text-[11px] font-bold leading-tight text-white/70">원두 정보<br />아카이브</p>
            </Link>
            <Link href="/map" className="group relative min-h-28 flex-1 overflow-hidden rounded-xl bg-[#fdf2f0]">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(174,141,135,.52),rgba(214,230,187,.62))] transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <span className="rounded-full border border-[#271310]/20 bg-white/30 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-[#271310] backdrop-blur-sm">
                  Magazine
                </span>
              </div>
            </Link>
          </motion.div>
        </motion.section>

        <section className="mb-16">
          <div className="mb-8 flex items-baseline justify-between px-1">
            <h3 className="font-serif text-3xl font-bold italic text-[#271310] dark:text-[#e3beb8]">Curated Beans</h3>
            <Link href="/beans" className="border-b border-[#827472]/30 pb-0.5 text-[11px] font-bold uppercase tracking-wider text-[#827472] dark:text-white/54">
              View All
            </Link>
          </div>

          <div className="space-y-12">
            {CURATED_BEANS.map((bean, index) => {
              const reversed = index % 2 === 1
              return (
                <motion.article
                  key={bean.name}
                  {...fadeUp(0.08 + index * 0.08)}
                  className={`flex items-start gap-6 ${reversed ? 'flex-row-reverse text-right' : ''}`}
                >
                  <div className={`flex aspect-[3/4] w-1/3 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br ${bean.gradient} text-6xl font-bold text-white/10 shadow-sm`}>
                    {bean.initial}
                  </div>
                  <div className="min-w-0 flex-1 pt-2">
                    <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#556341] dark:text-[#bdcca3]">{bean.origin}</p>
                    <h4 className="mb-4 text-xl font-bold leading-tight text-[#271310] dark:text-[#e3beb8]">{bean.name}</h4>
                    <p className="mb-6 line-clamp-3 break-keep text-xs font-normal leading-relaxed text-[#504442] dark:text-white/68">
                      {bean.description}
                    </p>
                    <div className={`flex items-center gap-4 ${reversed ? 'justify-end' : ''}`}>
                      {!reversed && (
                        <div className="flex gap-1.5">
                          {bean.swatches.map((swatch) => <span key={swatch} className="h-3 w-3 rounded-full border border-[#e5e2e1]" style={{ backgroundColor: swatch }} />)}
                        </div>
                      )}
                      <span className="text-[10px] font-bold text-[#827472] dark:text-white/50">{bean.notes}</span>
                      {reversed && (
                        <div className="flex gap-1.5">
                          {bean.swatches.map((swatch) => <span key={swatch} className="h-3 w-3 rounded-full border border-[#e5e2e1]" style={{ backgroundColor: swatch }} />)}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.article>
              )
            })}
          </div>
        </section>

        <motion.section {...fadeUp(0.25)} className="mb-10">
          <Link href="/beans" className="group relative block overflow-hidden rounded-2xl bg-[#271310] p-10 text-center text-[#fcf9f8]">
            <div className="absolute right-0 top-0 h-24 w-24 -translate-y-1/2 translate-x-1/2 rounded-full bg-white/5 blur-2xl" />
            <div className="relative z-10">
              <h3 className="font-serif text-2xl font-bold italic">Coming Soon</h3>
              <p className="mb-8 mt-2 text-[11px] font-bold uppercase tracking-widest text-[#fcf9f8]/60">Bean Marketplace</p>
              <span className="inline-block rounded-full border border-[#fcf9f8]/20 px-6 py-2 text-[10px] font-bold uppercase tracking-[0.3em] transition group-hover:bg-white group-hover:text-[#271310]">
                Explore Market
              </span>
            </div>
          </Link>
        </motion.section>
      </main>

      <nav className="fixed bottom-0 left-0 z-50 w-full border-t border-[#f0eded] bg-[#fcf9f8]/95 backdrop-blur-xl dark:border-white/10 dark:bg-[#161616]/92">
        <div className="mx-auto flex h-20 max-w-md items-center justify-around px-6">
          {bottomNavItems.map(({ href, label, icon: Icon, active }) => (
            <Link
              key={label}
              href={href}
              className={`flex flex-col items-center justify-center transition ${active ? 'scale-110 text-[#271310] dark:text-[#e3beb8]' : 'text-[#d3c3c0] hover:text-[#271310] dark:text-white/34 dark:hover:text-white/80'}`}
            >
              <Icon size={21} fill={active ? 'currentColor' : 'none'} />
              <span className="mt-1 text-[9px] font-bold uppercase tracking-tight">{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  )
}
