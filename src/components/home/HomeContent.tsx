'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Bean, ChevronRight, Coffee, Compass, Heart, Home, Map, ShoppingBag, UserRound } from 'lucide-react'
import { useUser } from '@/hooks/useUser'
import { BEANS, ROAST_LABEL as BEAN_ROAST_LABEL } from '@/data/beans'
import { getAnimalAvatarPath } from '@/lib/animalAvatar'
import type { BeanOrigin, BrewMethod, Cafe, RoastLevel } from '@/types/cafe'
import { BREW_LABELS, ORIGIN_LABELS, ROAST_LABELS } from '@/types/cafe'
import type { LocationPoint } from '@/types/location'

const featuredCafes = [
  {
    name: '스테이 모카',
    distance: '450m',
    image: '/image/home/cafe-1.png',
    tags: ['분위기', '핸드드립'],
  },
  {
    name: '빈즈 가든',
    distance: '1.2km',
    image: '/image/home/cafe-1.png',
    tags: ['로스터리', '원두맛집'],
  },
]

const bottomNavItems = [
  { href: '/', label: '홈', icon: Home, active: true },
  { href: '/map', label: '지도', icon: Map, active: false },
  { href: '/beans', label: '원두', icon: Coffee, active: false },
  { href: '/profile', label: '내 정보', icon: UserRound, active: false },
]

const EARTH_RADIUS_KM = 6371
const GEOLOCATION_TIMEOUT_MS = 10000
const GEOLOCATION_MAXIMUM_AGE_MS = 60000
const FEATURED_CAFE_LIMIT = 2
const FEATURED_PLACEHOLDER_COUNT = 1
const RECOMMENDATION_CANDIDATE_LIMIT = 5
const HOME_BEAN_RECOMMENDATION_IDS = [
  'panama-geisha',
  'ethiopia-yirgacheffe',
  'colombia-narino',
  'sumatra-mandheling',
] as const
const QUIET_COFFEE_IMAGE = '/image/home/hero-quiet-coffee.png'
const HERO_BACKGROUND_IMAGES = [
  QUIET_COFFEE_IMAGE,
  '/image/home/hero-coffee-recommendation.png',
  '/image/home/hero-coffee-recommendation-alt.png',
] as const

interface HeroCopy {
  greeting: string
  recommendation: string
}

interface FeaturedCafeCard {
  name: string
  distance: string
  image: string
  tags: string[]
  href: string
  imageIsRemote: boolean
  isPlaceholder?: boolean
}

const DEFAULT_HERO_COPY: HeroCopy = {
  greeting: '좋은 오후입니다,',
  recommendation: '오늘은 필터커피 어때요?',
}

const TIME_LABELS = [
  { startHour: 5, endHour: 11, label: '좋은 아침입니다,' },
  { startHour: 11, endHour: 17, label: '좋은 오후입니다,' },
  { startHour: 17, endHour: 22, label: '편안한 저녁입니다,' },
  { startHour: 22, endHour: 24, label: '고요한 밤입니다,' },
  { startHour: 0, endHour: 5, label: '깊은 밤입니다,' },
]

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] as const },
})

const recommendedBeans = HOME_BEAN_RECOMMENDATION_IDS
  .map((id) => BEANS.find((bean) => bean.id === id))
  .filter((bean): bean is NonNullable<typeof bean> => Boolean(bean))

type RecommendationKind = 'brewMethod' | 'roastLevel' | 'beanOrigin' | 'tag'

interface RecommendationToken {
  kind: RecommendationKind
  value: string
  label: string
}

function distanceKm(cafe: Cafe, origin: LocationPoint): number {
  const dLat = ((cafe.lat - origin.lat) * Math.PI) / 180
  const dLng = ((cafe.lng - origin.lng) * Math.PI) / 180
  const lat1 = (origin.lat * Math.PI) / 180
  const lat2 = (cafe.lat * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return EARTH_RADIUS_KM * c
}

function formatDistance(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`
}

function findNearestCafe(cafes: Cafe[], userLocation: LocationPoint): Cafe | null {
  return cafes.reduce<Cafe | null>((nearest, cafe) => {
    if (!nearest) return cafe
    return distanceKm(cafe, userLocation) < distanceKm(nearest, userLocation) ? cafe : nearest
  }, null)
}

function getCandidateCafes(cafes: Cafe[], userLocation: LocationPoint | null): Cafe[] {
  const orderedCafes = userLocation
    ? [...cafes].sort((a, b) => distanceKm(a, userLocation) - distanceKm(b, userLocation))
    : cafes

  return orderedCafes.slice(0, RECOMMENDATION_CANDIDATE_LIMIT)
}

function makeDateSeed(now: Date): number {
  return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate()
}

function uniqueTokens(tokens: RecommendationToken[]): RecommendationToken[] {
  const seen = new Set<string>()

  return tokens.filter((token) => {
    const key = `${token.kind}:${token.value}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function getRecommendationTokens(cafes: Cafe[]): RecommendationToken[] {
  const brewMethodTokens = cafes.flatMap((cafe) => cafe.brewMethods.map((value) => ({
    kind: 'brewMethod' as const,
    value,
    label: `${BREW_LABELS[value]} 커피`,
  })))
  if (brewMethodTokens.length > 0) return uniqueTokens(brewMethodTokens)

  const roastLevelTokens = cafes.flatMap((cafe) => cafe.roastLevels.map((value) => ({
    kind: 'roastLevel' as const,
    value,
    label: `${ROAST_LABELS[value]} 로스팅 커피`,
  })))
  if (roastLevelTokens.length > 0) return uniqueTokens(roastLevelTokens)

  const beanOriginTokens = cafes.flatMap((cafe) => cafe.beanOrigins.map((value) => ({
    kind: 'beanOrigin' as const,
    value,
    label: `${ORIGIN_LABELS[value]} 원두 커피`,
  })))
  if (beanOriginTokens.length > 0) return uniqueTokens(beanOriginTokens)

  return uniqueTokens(cafes.flatMap((cafe) => cafe.tags.map((value) => ({
    kind: 'tag' as const,
    value,
    label: `${value} 커피`,
  }))))
}

function getDailyRecommendation(cafes: Cafe[], now: Date): RecommendationToken | null {
  const tokens = getRecommendationTokens(cafes)
  if (tokens.length === 0) return null

  return tokens[makeDateSeed(now) % tokens.length]
}

function cafeMatchesRecommendation(cafe: Cafe, recommendation: RecommendationToken | null): boolean {
  if (!recommendation) return false

  switch (recommendation.kind) {
    case 'brewMethod':
      return cafe.brewMethods.includes(recommendation.value as BrewMethod)
    case 'roastLevel':
      return cafe.roastLevels.includes(recommendation.value as RoastLevel)
    case 'beanOrigin':
      return cafe.beanOrigins.includes(recommendation.value as BeanOrigin)
    case 'tag':
      return cafe.tags.includes(recommendation.value)
  }
}

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

function getFeaturedCafeCards(
  cafes: Cafe[],
  userLocation: LocationPoint | null,
  locationStatus: 'checking' | 'ready' | 'unavailable',
  recommendation: RecommendationToken | null,
): FeaturedCafeCard[] {
  if (!cafes.length || locationStatus === 'checking') {
    const placeholderCount = Math.min(FEATURED_PLACEHOLDER_COUNT, featuredCafes.length)

    return Array.from({ length: placeholderCount }, () => ({
      name: '',
      distance: '',
      image: '/image/home/cafe-1.png',
      tags: [],
      href: '/map',
      imageIsRemote: false,
      isPlaceholder: true,
    }))
  }

  const orderedCafes = userLocation
    ? [...cafes].sort((a, b) => distanceKm(a, userLocation) - distanceKm(b, userLocation))
    : cafes
  const sortedCafes = [...orderedCafes].sort((a, b) => {
    const aMatched = cafeMatchesRecommendation(a, recommendation)
    const bMatched = cafeMatchesRecommendation(b, recommendation)
    if (aMatched === bMatched) return 0

    return aMatched ? -1 : 1
  })

  return sortedCafes.slice(0, FEATURED_CAFE_LIMIT).map((cafe) => ({
    name: cafe.name,
    distance: userLocation ? formatDistance(distanceKm(cafe, userLocation)) : '추천 카페',
    image: cafe.images?.[0] ?? '/image/home/cafe-1.png',
    tags: cafe.tags.slice(0, 2),
    href: `/map?cafe=${encodeURIComponent(cafe.id)}`,
    imageIsRemote: cafe.images?.[0]?.startsWith('http') ?? false,
  }))
}

function createHeroCopy(now: Date, recommendation: RecommendationToken | null): HeroCopy {
  const hour = now.getHours()
  const greeting = TIME_LABELS.find(({ startHour, endHour }) => hour >= startHour && hour < endHour)?.label
    ?? DEFAULT_HERO_COPY.greeting

  return {
    greeting,
    recommendation: `오늘은 ${recommendation?.label ?? '필터커피'} 어때요?`,
  }
}

export default function HomeContent() {
  const { user, profilePrefs } = useUser()
  const [cafes, setCafes] = useState<Cafe[]>([])
  const [userLocation, setUserLocation] = useState<LocationPoint | null>(null)
  const [locationStatus, setLocationStatus] = useState<'checking' | 'ready' | 'unavailable'>('checking')
  const [heroCopy, setHeroCopy] = useState<HeroCopy>(DEFAULT_HERO_COPY)
  const [heroBackgroundImage, setHeroBackgroundImage] = useState<string>(HERO_BACKGROUND_IMAGES[0])
  const displayName = user?.nickname ?? '개발하는 검정곰'
  const siteAnimal = user?.type === 'authenticated' ? user.siteAnimal : user?.animal
  const kakaoProfileImageUrl = user?.type === 'authenticated' ? user.kakaoProfileImageUrl : undefined
  const useKakaoAvatar = profilePrefs.avatarPreference === 'kakao' && Boolean(kakaoProfileImageUrl)
  const profileImageUrl = useKakaoAvatar
    ? kakaoProfileImageUrl!
    : siteAnimal ? getAnimalAvatarPath(siteAnimal) : null
  const nearestCafe = useMemo(() => {
    if (!cafes.length) return null
    if (!userLocation) return cafes[0]
    return findNearestCafe(cafes, userLocation)
  }, [cafes, userLocation])
  const nearestDistance = nearestCafe && userLocation ? formatDistance(distanceKm(nearestCafe, userLocation)) : null
  const heroCafeHref = nearestCafe ? `/map?cafe=${encodeURIComponent(nearestCafe.id)}` : '/map'
  const heroCafeName = nearestCafe?.name ?? '스페셜티 카페'
  const heroCafeImage = nearestCafe?.images?.[0] ?? '/image/logo/beenRoad.png'
  const heroCafeImageIsRemote = heroCafeImage.startsWith('http')
  const recommendationCandidateCafes = useMemo(
    () => getCandidateCafes(cafes, userLocation),
    [cafes, userLocation],
  )
  const dailyRecommendation = useMemo(
    () => getDailyRecommendation(recommendationCandidateCafes, new Date()),
    [recommendationCandidateCafes],
  )
  const recommendedCafes = useMemo(
    () => getFeaturedCafeCards(cafes, userLocation, locationStatus, dailyRecommendation),
    [cafes, dailyRecommendation, locationStatus, userLocation],
  )
  const heroDistanceLabel = nearestDistance
    ?? (locationStatus === 'checking' ? '위치 확인중' : '추천 카페')

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setHeroCopy(createHeroCopy(new Date(), dailyRecommendation)), 0)
    return () => window.clearTimeout(timeoutId)
  }, [dailyRecommendation])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setHeroBackgroundImage(pickRandom([...HERO_BACKGROUND_IMAGES])), 0)
    return () => window.clearTimeout(timeoutId)
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    async function loadCafes(): Promise<void> {
      try {
        const response = await fetch('/api/cafes', { signal: controller.signal })
        if (!response.ok) throw new Error('Failed to load cafes.')
        const loadedCafes = await response.json() as Cafe[]
        setCafes(loadedCafes)
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
        console.warn('Failed to load home cafe recommendation. / 홈 카페 추천 로드 실패.', error)
      }
    }

    void loadCafes()

    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (!navigator.geolocation) {
      window.setTimeout(() => setLocationStatus('unavailable'), 0)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
        setLocationStatus('ready')
      },
      (error) => {
        if (error.code !== error.PERMISSION_DENIED) {
          console.warn('Failed to load home geolocation. / 홈 위치 확인 실패.', error)
        }
        setLocationStatus('unavailable')
      },
      {
        enableHighAccuracy: true,
        timeout: GEOLOCATION_TIMEOUT_MS,
        maximumAge: GEOLOCATION_MAXIMUM_AGE_MS,
      },
    )
  }, [])

  return (
    <>
      <main className="relative z-10 mx-auto w-full max-w-md flex-1 overflow-hidden bg-[#f4eadf] pb-[calc(5rem+env(safe-area-inset-bottom))] pt-16 text-[#201b16] dark:bg-[#241c16] dark:text-[#f3f0ef]">
        <motion.section
          {...fadeUp(0)}
          className="relative z-10 overflow-hidden rounded-b-[2.5rem] bg-[#45493d] px-5 pb-6 pt-5 shadow-[0_18px_38px_rgba(32,27,22,0.16)]"
        >
          <Image
            src={heroBackgroundImage}
            alt=""
            fill
            priority
            sizes="(max-width: 480px) 100vw, 448px"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1d2118]/28 via-[#303629]/36 to-[#23291f]/58" />

          <div className="relative z-10">
            <div className="mb-10 flex flex-col items-start gap-2 text-left font-extrabold text-white">
              <span className="truncate text-[28px] leading-tight">{heroCopy.greeting}</span>
              <span className="mt-3 inline-flex max-w-[300px] rounded-xl border border-white/15 bg-white/16 px-3 py-2 text-xl font-bold text-white backdrop-blur-md">
                <span className="mr-2 flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/25 bg-white/20">
                  {profileImageUrl ? (
                    <Image
                      src={profileImageUrl}
                      alt=""
                      width={28}
                      height={28}
                      unoptimized={useKakaoAvatar}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserRound size={16} className="text-white/86" />
                  )}
                </span>
                <span className="min-w-0 truncate">{displayName}님</span>
              </span>
              <span className="max-w-[300px] break-keep pt-3 text-2xl font-bold leading-snug text-white/90">
                {heroCopy.recommendation}
              </span>
            </div>

            <Link
              href={heroCafeHref}
              className="flex items-center justify-between rounded-[1.75rem] border border-white/5 bg-black/14 p-4 shadow-[0_16px_32px_rgba(20,24,18,0.26)] backdrop-blur-xl transition active:scale-[0.98]"
            >
              <span className="flex min-w-0 flex-col">
                <span className="mb-1 flex items-center gap-2 text-xs font-bold text-white/78">
                  <span className="h-2 w-2 rounded-full bg-[#d8eab0]" />
                  {heroDistanceLabel}
                </span>
                <span className="truncate text-lg font-extrabold text-white">{heroCafeName}</span>
              </span>
              <span className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#f9fbf1] shadow-lg">
                <Image
                  src={heroCafeImage}
                  alt=""
                  fill
                  sizes="56px"
                  unoptimized={heroCafeImageIsRemote}
                  className="object-cover"
                />
              </span>
            </Link>
          </div>
        </motion.section>

        <section className="relative z-10 grid grid-cols-2 gap-4 px-5 pt-5">
          <Link
            href="/cbti"
            className="relative flex h-44 flex-col justify-between overflow-hidden rounded-[1.6rem] border border-[#526134]/5 bg-[#eef1e6] p-5 shadow-[0_8px_30px_rgba(32,27,22,0.05)] transition active:scale-[0.98] dark:border-white/10 dark:bg-white/8"
          >
            <Image
              src="/image/home/cbti-card-bg2.png"
              alt=""
              fill
              loading="eager"
              sizes="(max-width: 480px) 50vw, 224px"
              className="object-cover"
            />
            <span className="absolute inset-0 bg-gradient-to-b from-[#1d2118]/16 via-[#1d2118]/8 to-[#1d2118]/42" />
            <span className="relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/24 text-white shadow-sm backdrop-blur-md">
              <Bean size={25} />
            </span>
            <span className="relative z-10">
              <span className="block text-lg font-extrabold text-white">커피 CBTI</span>
              <span className="mt-1 block break-keep text-[13px] font-semibold leading-tight text-white/76">
                내 취향 찾기
              </span>
            </span>
          </Link>

          <Link
            href="/beans"
            className="relative flex h-44 flex-col justify-between overflow-hidden rounded-[1.6rem] border border-[#77583e]/5 bg-[#fff0e3] p-5 shadow-[0_8px_30px_rgba(32,27,22,0.05)] transition active:scale-[0.98] dark:border-white/10 dark:bg-white/8"
          >
            <Image
              src="/image/home/beans-card-bg.png"
              alt=""
              fill
              loading="eager"
              sizes="(max-width: 480px) 50vw, 224px"
              className="object-cover"
            />
            <span className="absolute inset-0 bg-gradient-to-b from-[#1b1008]/10 via-[#1b1008]/20 to-[#1b1008]/58" />
            <span className="relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/24 text-white shadow-sm backdrop-blur-md">
              <Compass size={25} />
            </span>
            <span className="relative z-10">
              <span className="block text-lg font-extrabold text-white">원두 정보</span>
              <span className="mt-1 block break-keep text-[13px] font-semibold leading-tight text-white/78">
                지역별 원두 탐색
              </span>
            </span>
          </Link>
        </section>

        <section className="relative z-10 px-5 pt-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#6f5835] dark:text-[#d8eab0]">Beans Pick</p>
              <h2 className="text-lg font-extrabold tracking-[-0.01em] text-[#201b16] dark:text-[#f3f0ef]">
                오늘의 원두 추천
              </h2>
            </div>
            <Link href="/beans" className="flex items-center gap-0.5 text-xs font-bold text-[#6f5835] dark:text-[#d8eab0]">
              더보기
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-4 scrollbar-hide">
            {recommendedBeans.map((bean, index) => (
              <motion.article
                key={bean.id}
                {...fadeUp(0.06 + index * 0.05)}
                className="min-w-[168px] overflow-hidden rounded-[1.45rem] border border-[#f3e9df] bg-white shadow-[0_8px_28px_rgba(32,27,22,0.06)] dark:border-white/10 dark:bg-white/8"
              >
                <Link href="/beans" className="group block transition active:scale-[0.98]">
                  <div className="relative h-32 overflow-hidden bg-[#ece0d9]">
                    {bean.image && (
                      <Image
                        src={bean.image}
                        alt={bean.name}
                        fill
                        sizes="180px"
                        className="object-cover transition duration-700 group-hover:scale-105"
                      />
                    )}
                    <span className="absolute inset-0 bg-gradient-to-b from-black/8 via-black/16 to-black/62" />
                    <span className="absolute left-3 top-3 rounded-full border border-white/25 bg-black/24 px-2 py-0.5 text-[10px] font-extrabold text-white backdrop-blur-md">
                      {BEAN_ROAST_LABEL[bean.roast]}
                    </span>
                    <span className="absolute inset-x-3 bottom-3">
                      <span className="block text-[11px] font-bold text-white/75">{bean.origin}</span>
                      <span className="mt-0.5 block truncate text-base font-extrabold text-white">{bean.name}</span>
                    </span>
                  </div>
                  <div className="p-3">
                    <div className="flex flex-wrap gap-1">
                      {bean.notes.slice(0, 3).map((note) => (
                        <span key={note} className="rounded-full bg-[#fdf1ea] px-2 py-0.5 text-[10px] font-bold text-[#8a714b] dark:bg-white/10 dark:text-white/70">
                          {note}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="relative z-10 px-5 pt-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-extrabold tracking-[-0.01em] text-[#201b16] dark:text-[#f3f0ef]">
              주변 스페셜티 카페
            </h2>
            <Link href="/map" className="flex items-center gap-0.5 text-xs font-bold text-[#6f5835] dark:text-[#d8eab0]">
              전체보기
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="-mx-5 flex gap-4 overflow-x-auto px-5 pb-4 scrollbar-hide">
            {recommendedCafes.map((cafe, index) => (
              <motion.article
                key={cafe.name}
                {...fadeUp(0.08 + index * 0.06)}
                className="min-w-[186px] overflow-hidden rounded-[1.6rem] border border-[#f3e9df] bg-white shadow-[0_8px_30px_rgba(32,27,22,0.06)] dark:border-white/10 dark:bg-white/8"
              >
                <Link href={cafe.href} className="group block transition active:scale-[0.98]">
                  <div className="relative h-28 overflow-hidden bg-[#ece0d9]">
                    {cafe.isPlaceholder ? (
                      <div className="h-full w-full bg-[#ece0d9] dark:bg-white/10" />
                    ) : (
                      <>
                        <Image
                          src={cafe.image}
                          alt={cafe.name}
                          fill
                          sizes="190px"
                          unoptimized={cafe.imageIsRemote}
                          className={`object-cover transition duration-700 group-hover:scale-105 ${index === 1 ? 'scale-125 object-right' : 'object-center'}`}
                        />
                        <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/92 text-[#526134] shadow-sm backdrop-blur">
                          <Heart size={18} />
                        </span>
                      </>
                    )}
                  </div>
                  <div className="p-4">
                    {cafe.isPlaceholder ? (
                      <div className="space-y-3">
                        <div className="h-4 w-24 rounded-full bg-[#efe5da] dark:bg-white/10" />
                        <div className="flex gap-2">
                          <div className="h-6 w-14 rounded-full bg-[#f3e9df] dark:bg-white/10" />
                          <div className="h-6 w-16 rounded-full bg-[#f3e9df] dark:bg-white/10" />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="mb-3 flex items-start justify-between gap-2">
                          <h3 className="min-w-0 truncate text-base font-bold text-[#201b16] dark:text-[#f3f0ef]">{cafe.name}</h3>
                          <span className="shrink-0 pt-0.5 text-[11px] font-bold text-[#45483d] dark:text-white/62">{cafe.distance}</span>
                        </div>
                        <div className="flex gap-2">
                          {cafe.tags.map((tag) => (
                            <span key={tag} className="rounded-full bg-[#fdf1ea] px-3 py-1 text-[10px] font-bold text-[#8a714b] dark:bg-white/10 dark:text-white/70">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="relative z-10 px-5 pt-5">
          <Link
            href="/beans"
            className="flex items-center justify-between rounded-[1.6rem] border border-[#c6c8ba]/30 bg-white p-5 shadow-[0_8px_30px_rgba(32,27,22,0.06)] transition active:scale-[0.98] dark:border-white/10 dark:bg-white/8"
          >
            <span className="flex min-w-0 items-center gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#f7ece5] text-[#6f5835] dark:bg-white/10 dark:text-[#d8eab0]">
                <ShoppingBag size={28} />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-extrabold text-[#201b16] dark:text-[#f3f0ef]">원두 마켓플레이스</span>
                <span className="mt-1 block break-keep text-sm font-medium text-[#45483d] dark:text-white/60">
                  스페셜티 원두 구매 · 준비 중
                </span>
              </span>
            </span>
            <span className="shrink-0 rounded-full bg-[#e3d8d1] px-3 py-1 text-[11px] font-extrabold text-[#45483d] dark:bg-white/12 dark:text-white/70">
              SOON
            </span>
          </Link>
        </section>

      </main>

      <nav className="fixed inset-x-0 bottom-0 z-50">
        <div className="mx-auto flex w-full max-w-md items-center justify-between gap-1 border-x border-t border-[#eadfd3] bg-[#fff8f3] px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_24px_rgba(80,48,24,0.08)] dark:border-white/10 dark:bg-[#241c16]">
          {bottomNavItems.map(({ href, label, icon: Icon, active }) => (
            <Link
              key={label}
              href={href}
              className={`flex min-w-0 flex-1 flex-col items-center justify-center rounded-[1.2rem] px-2 py-2 transition ${
                active
                  ? 'bg-[#526134] text-white shadow-sm'
                  : 'text-[#45483d] hover:bg-white/45 dark:text-white/60 dark:hover:bg-white/10'
              }`}
            >
              <Icon size={20} fill={active ? 'currentColor' : 'none'} />
              <span className="mt-0.5 text-[10px] font-bold whitespace-nowrap">{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  )
}
