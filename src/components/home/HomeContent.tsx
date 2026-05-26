'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Bean, ChevronRight, Coffee, Compass, Heart, Home, Map, ShoppingBag, UserRound } from 'lucide-react'
import { useUser } from '@/hooks/useUser'
import type { Cafe } from '@/types/cafe'
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
  { href: '#profile', label: '내 정보', icon: UserRound, active: false },
]

const EARTH_RADIUS_KM = 6371
const GEOLOCATION_TIMEOUT_MS = 10000
const GEOLOCATION_MAXIMUM_AGE_MS = 60000

interface HeroCopy {
  greeting: string
  recommendation: string
}

interface WeatherState {
  label: string
  temperature: number
}

const DEFAULT_HERO_COPY: HeroCopy = {
  greeting: '좋은 오후입니다,',
  recommendation: '기분 좋은 시간에 필터커피 한잔 어때요?',
}

const TIME_LABELS = [
  { startHour: 5, endHour: 11, label: '좋은 아침입니다,' },
  { startHour: 11, endHour: 17, label: '좋은 오후입니다,' },
  { startHour: 17, endHour: 22, label: '편안한 저녁입니다,' },
  { startHour: 22, endHour: 24, label: '고요한 밤입니다,' },
  { startHour: 0, endHour: 5, label: '깊은 밤입니다,' },
]

const SEASON_MOODS = [
  { months: [2, 3, 4], labels: ['포근한 날씨에', '산뜻한 공기에', '볕 좋은 시간에'] },
  { months: [5, 6, 7], labels: ['시원한 커피가 당기는 날씨에', '느긋한 오후 공기에', '햇살 좋은 시간에'] },
  { months: [8, 9, 10], labels: ['선선한 바람에', '차분한 날씨에', '향이 깊어지는 시간에'] },
  { months: [11, 0, 1], labels: ['따뜻한 커피가 어울리는 날씨에', '차가운 공기에', '몸을 녹이고 싶은 시간에'] },
]

const COFFEE_RECOMMENDATIONS = [
  '필터커피 한잔 어때요?',
  '고소한 라떼 한잔 어때요?',
  '싱글오리진 커피 어때요?',
  '향 좋은 드립커피 어때요?',
  '오늘의 추천 커피 어때요?',
]

const WEATHER_LABELS: Array<{ codes: number[], label: string }> = [
  { codes: [0], label: '맑은 날씨에' },
  { codes: [1, 2, 3], label: '구름 낀 날씨에' },
  { codes: [45, 48], label: '안개 낀 공기에' },
  { codes: [51, 53, 55, 56, 57], label: '가볍게 비가 스치는 날씨에' },
  { codes: [61, 63, 65, 66, 67, 80, 81, 82], label: '비 오는 날에' },
  { codes: [71, 73, 75, 77, 85, 86], label: '눈 내리는 날에' },
  { codes: [95, 96, 99], label: '흐린 하늘 아래' },
]

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] as const },
})

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

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

function createHeroCopy(now: Date): HeroCopy {
  const hour = now.getHours()
  const month = now.getMonth()
  const greeting = TIME_LABELS.find(({ startHour, endHour }) => hour >= startHour && hour < endHour)?.label
    ?? DEFAULT_HERO_COPY.greeting
  const seasonMood = SEASON_MOODS.find(({ months }) => months.includes(month))?.labels
    ?? ['기분 좋은 시간에']

  return {
    greeting,
    recommendation: `${pickRandom(seasonMood)} ${pickRandom(COFFEE_RECOMMENDATIONS)}`,
  }
}

function getWeatherLabel(weatherCode: number): string {
  return WEATHER_LABELS.find(({ codes }) => codes.includes(weatherCode))?.label ?? '기분 좋은 날씨에'
}

function createWeatherHeroCopy(now: Date, weather: WeatherState): HeroCopy {
  const hour = now.getHours()
  const greeting = TIME_LABELS.find(({ startHour, endHour }) => hour >= startHour && hour < endHour)?.label
    ?? DEFAULT_HERO_COPY.greeting
  const temperatureLabel = weather.temperature >= 28
    ? '시원한 커피가 생각나는 날씨에'
    : weather.temperature <= 5
      ? '따뜻한 커피가 어울리는 날씨에'
      : weather.label

  return {
    greeting,
    recommendation: `${temperatureLabel} ${pickRandom(COFFEE_RECOMMENDATIONS)}`,
  }
}

export default function HomeContent() {
  const { user } = useUser()
  const [cafes, setCafes] = useState<Cafe[]>([])
  const [userLocation, setUserLocation] = useState<LocationPoint | null>(null)
  const [locationStatus, setLocationStatus] = useState<'checking' | 'ready' | 'unavailable'>('checking')
  const [weather, setWeather] = useState<WeatherState | null>(null)
  const [heroCopy, setHeroCopy] = useState<HeroCopy>(DEFAULT_HERO_COPY)
  const displayName = user?.nickname ?? '개발하는 검정곰'
  const nearestCafe = useMemo(() => {
    if (!cafes.length) return null
    if (!userLocation) return cafes[0]
    return findNearestCafe(cafes, userLocation)
  }, [cafes, userLocation])
  const nearestDistance = nearestCafe && userLocation ? formatDistance(distanceKm(nearestCafe, userLocation)) : null
  const heroCafeHref = nearestCafe ? `/cafes/${nearestCafe.id}` : '/map'
  const heroCafeName = nearestCafe?.name ?? '스페셜티 카페'
  const heroCafeImage = nearestCafe?.images?.[0] ?? '/image/logo/beenRoad.png'
  const heroCafeImageIsRemote = heroCafeImage.startsWith('http')
  const heroDistanceLabel = nearestDistance
    ?? (locationStatus === 'checking' ? '위치 확인중' : '추천 카페')

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setHeroCopy(createHeroCopy(new Date())), 0)
    return () => window.clearTimeout(timeoutId)
  }, [])

  useEffect(() => {
    if (!weather) return

    const timeoutId = window.setTimeout(() => setHeroCopy(createWeatherHeroCopy(new Date(), weather)), 0)
    return () => window.clearTimeout(timeoutId)
  }, [weather])

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
        console.warn('Failed to load home geolocation. / 홈 위치 확인 실패.', error)
        setLocationStatus('unavailable')
      },
      {
        enableHighAccuracy: true,
        timeout: GEOLOCATION_TIMEOUT_MS,
        maximumAge: GEOLOCATION_MAXIMUM_AGE_MS,
      },
    )
  }, [])

  useEffect(() => {
    if (!userLocation) return

    const controller = new AbortController()
    const currentLocation = userLocation

    async function loadWeather(): Promise<void> {
      try {
        const params = new URLSearchParams({
          latitude: String(currentLocation.lat),
          longitude: String(currentLocation.lng),
          current: 'temperature_2m,weather_code',
          timezone: 'auto',
        })
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`, {
          signal: controller.signal,
        })
        if (!response.ok) throw new Error('Failed to load weather.')
        const data = await response.json() as {
          current?: {
            temperature_2m?: number
            weather_code?: number
          }
        }
        const temperature = data.current?.temperature_2m
        const weatherCode = data.current?.weather_code

        if (typeof temperature !== 'number' || typeof weatherCode !== 'number') {
          throw new Error('Invalid weather response.')
        }

        setWeather({
          label: getWeatherLabel(weatherCode),
          temperature,
        })
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
        console.warn('Failed to load home weather. / 홈 날씨 로드 실패.', error)
      }
    }

    void loadWeather()

    return () => controller.abort()
  }, [userLocation])

  return (
    <>
      <main className="relative z-10 mx-auto w-full max-w-md flex-1 overflow-hidden bg-[var(--main-bg)] pb-32 pt-16 text-[#201b16] dark:bg-[#161616] dark:text-[#f3f0ef]">
        <motion.section
          {...fadeUp(0)}
          className="relative overflow-hidden rounded-b-[2.5rem] bg-[#45493d] px-5 pb-6 pt-5 shadow-[0_18px_38px_rgba(32,27,22,0.16)]"
        >
          <Image
            src="/image/home/hero-coffee-recommendation.png"
            alt=""
            fill
            priority
            sizes="(max-width: 480px) 100vw, 448px"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1d2118]/28 via-[#303629]/36 to-[#23291f]/58" />

          <div className="relative z-10">
            <div className="mb-12 flex flex-col items-start gap-2 text-left font-extrabold text-white">
              <span className="truncate text-[28px] leading-tight">{heroCopy.greeting}</span>
              <span className="mt-5 inline-flex max-w-[300px] rounded-full border border-white/10 bg-white/12 px-5 py-2 text-xl font-bold text-white/82 backdrop-blur-md">
                <span className="min-w-0 truncate">{displayName}님</span>
              </span>
              <span className="max-w-[300px] break-keep pt-5 text-xl font-bold leading-snug text-white/86">
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

        <section className="px-5 pt-5">
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
            {featuredCafes.map((cafe, index) => (
              <motion.article
                key={cafe.name}
                {...fadeUp(0.08 + index * 0.06)}
                className="min-w-[186px] overflow-hidden rounded-[1.6rem] border border-[#f3e9df] bg-white shadow-[0_8px_30px_rgba(32,27,22,0.06)] dark:border-white/10 dark:bg-white/8"
              >
                <Link href="/map" className="group block transition active:scale-[0.98]">
                  <div className="relative h-28 overflow-hidden bg-[#ece0d9]">
                    <Image
                      src={cafe.image}
                      alt={cafe.name}
                      fill
                      sizes="190px"
                      className={`object-cover transition duration-700 group-hover:scale-105 ${index === 1 ? 'scale-125 object-right' : 'object-center'}`}
                    />
                    <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/92 text-[#526134] shadow-sm backdrop-blur">
                      <Heart size={18} />
                    </span>
                  </div>
                  <div className="p-4">
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
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-2 gap-4 px-5 pt-1">
          <Link
            href="/cbti"
            className="flex h-44 flex-col justify-between rounded-[1.6rem] border border-[#526134]/5 bg-[#eef1e6] p-5 shadow-[0_8px_30px_rgba(32,27,22,0.05)] transition active:scale-[0.98] dark:border-white/10 dark:bg-white/8"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#6a7a4b] text-white shadow-sm">
              <Bean size={25} />
            </span>
            <span>
              <span className="block text-lg font-extrabold text-[#201b16] dark:text-[#f3f0ef]">커피 CBTI</span>
              <span className="mt-1 block break-keep text-[13px] font-medium leading-tight text-[#45483d] dark:text-white/60">
                내 취향 타입 찾기
              </span>
            </span>
          </Link>

          <Link
            href="/beans"
            className="flex h-44 flex-col justify-between rounded-[1.6rem] border border-[#77583e]/5 bg-[#fff0e3] p-5 shadow-[0_8px_30px_rgba(32,27,22,0.05)] transition active:scale-[0.98] dark:border-white/10 dark:bg-white/8"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#8a714b] text-white shadow-sm">
              <Compass size={25} />
            </span>
            <span>
              <span className="block text-lg font-extrabold text-[#201b16] dark:text-[#f3f0ef]">원두 정보</span>
              <span className="mt-1 block break-keep text-[13px] font-medium leading-tight text-[#45483d] dark:text-white/60">
                산지별 원두 탐색
              </span>
            </span>
          </Link>
        </section>

        <section className="px-5 pt-5">
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

      <nav className="pointer-events-none fixed bottom-0 left-0 z-50 w-full pb-6">
        <div className="pointer-events-auto mx-auto flex w-fit items-center gap-1 rounded-[2rem] border border-white/20 bg-white/80 px-3 py-2 shadow-[0_8px_40px_rgba(28,23,19,0.18)] backdrop-blur-xl dark:border-white/10 dark:bg-[#1e1e1e]/85">
          {bottomNavItems.map(({ href, label, icon: Icon, active }) => (
            <Link
              key={label}
              href={href}
              className={`flex flex-col items-center justify-center rounded-[1.4rem] px-4 py-2 transition ${
                active
                  ? 'bg-[#526134] text-white shadow-sm'
                  : 'text-[#45483d] hover:bg-[#f0ebe5] dark:text-white/60 dark:hover:bg-white/10'
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
