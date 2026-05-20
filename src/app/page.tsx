import Image from 'next/image'
import Link from 'next/link'
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

const FEATURE_ITEMS = [
  {
    title: '안산 카페 지도',
    description: '스페셜티, 로스터리, 디저트, 노트북 카페를 한 화면에서 탐색합니다.',
    icon: MapPin,
  },
  {
    title: '취향 필터',
    description: '로스팅 강도, 원두 산지, 추출 방식으로 원하는 커피를 좁혀봅니다.',
    icon: Search,
  },
  {
    title: '커피 CBTI',
    description: '10개의 질문으로 내 취향에 맞는 커피 스타일을 찾아봅니다.',
    icon: Sparkles,
  },
]

const PREVIEW_CAFES = [
  { name: '드리프트 커피', note: '에티오피아 내추럴', score: '4.8' },
  { name: '로터스 로스터스', note: '멀티 오리진 로스터리', score: '4.6' },
  { name: '워터 스트리트 커피', note: '케냐 AA 푸어오버', score: '4.7' },
]

export default function LandingPage() {
  return (
    <main className="min-h-dvh overflow-hidden bg-[#f3ede4] text-[#2c2118]">
      <section className="relative min-h-dvh px-5 py-5 sm:px-8 lg:px-12">
        <div className="mx-auto flex min-h-[calc(100dvh-2.5rem)] max-w-7xl flex-col">
          <header className="flex h-14 shrink-0 items-center justify-between gap-4">
            <Link href="/" className="flex min-w-0 items-center gap-2.5 no-underline">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-[0_8px_18px_rgba(90,46,17,0.16)]">
                <Image
                  src="/image/logo/beenRoad.png"
                  alt="원두로 로고"
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                  priority
                />
              </span>
              <span className="truncate text-lg font-black tracking-tight text-[#7b3c0f]">원두로</span>
            </Link>

            <nav className="flex items-center gap-2">
              <Link
                href="/beans"
                className="hidden h-10 items-center gap-2 rounded-full px-4 text-sm font-black text-[#5f4634] no-underline transition-colors hover:bg-white/70 sm:flex"
              >
                <Bean size={16} />
                원두
              </Link>
              <Link
                href="/cbti"
                className="hidden h-10 items-center gap-2 rounded-full px-4 text-sm font-black text-[#5f4634] no-underline transition-colors hover:bg-white/70 sm:flex"
              >
                <Coffee size={16} />
                CBTI
              </Link>
              <Link
                href="/map"
                className="flex h-10 items-center gap-2 rounded-full bg-[#5a2e11] px-4 text-sm font-black text-white no-underline shadow-[0_10px_24px_rgba(90,46,17,0.22)] transition-transform active:scale-95"
              >
                지도 열기
                <ArrowRight size={16} />
              </Link>
            </nav>
          </header>

          <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[0.92fr_1.08fr] lg:py-8">
            <div className="max-w-2xl">
              <p className="mb-4 inline-flex rounded-full border border-[#d9c4ab] bg-white/70 px-3 py-1 text-xs font-black text-[#7b3c0f]">
                안산 스페셜티 커피 큐레이션
              </p>
              <h1 className="text-5xl font-black leading-[1.04] tracking-normal text-[#2a1d14] sm:text-6xl lg:text-7xl">
                좋은 커피를 찾는 길을 더 짧게.
              </h1>
              <p className="mt-5 max-w-xl text-base font-medium leading-8 text-[#5f4634] sm:text-lg">
                원두로는 안산의 스페셜티 카페와 원두 정보를 취향 기준으로 탐색하는 지도입니다.
                산미, 로스팅, 추출 방식까지 보고 오늘 갈 카페를 고르세요.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/map"
                  className="flex h-[52px] items-center justify-center gap-2 rounded-2xl bg-[#d66612] px-6 text-base font-black text-white no-underline shadow-[0_16px_32px_rgba(214,102,18,0.25)] transition-transform active:scale-[0.98]"
                >
                  <Compass size={19} />
                  지도에서 카페 찾기
                </Link>
                <Link
                  href="/cbti"
                  className="flex h-[52px] items-center justify-center gap-2 rounded-2xl border border-[#d8c2a7] bg-white/75 px-6 text-base font-black text-[#4b3527] no-underline transition-colors hover:bg-white"
                >
                  내 커피 취향 보기
                </Link>
              </div>

              <dl className="mt-9 grid max-w-xl grid-cols-3 gap-3">
                <div>
                  <dt className="text-2xl font-black text-[#5a2e11]">8</dt>
                  <dd className="mt-1 text-xs font-bold text-[#7d6149]">큐레이션 카페</dd>
                </div>
                <div>
                  <dt className="text-2xl font-black text-[#5a2e11]">16</dt>
                  <dd className="mt-1 text-xs font-bold text-[#7d6149]">CBTI 유형</dd>
                </div>
                <div>
                  <dt className="text-2xl font-black text-[#5a2e11]">9</dt>
                  <dd className="mt-1 text-xs font-bold text-[#7d6149]">원두 산지</dd>
                </div>
              </dl>
            </div>

            <div className="relative min-h-[520px] lg:min-h-[620px]">
              <div className="absolute inset-0 rounded-[36px] bg-[#e3d1bb] shadow-[0_28px_80px_rgba(90,46,17,0.18)]" />
              <div className="absolute inset-4 overflow-hidden rounded-[28px] border border-white/70 bg-[#f8f0e4]">
                <div className="absolute inset-0 opacity-80">
                  <div className="absolute left-[8%] top-[16%] h-[2px] w-[88%] rotate-[-18deg] bg-[#d1b38e]" />
                  <div className="absolute left-[2%] top-[56%] h-[2px] w-[95%] rotate-[12deg] bg-[#d1b38e]" />
                  <div className="absolute left-[46%] top-[-8%] h-[110%] w-[2px] rotate-[18deg] bg-[#d1b38e]" />
                  <div className="absolute left-[68%] top-[4%] h-[100%] w-[2px] rotate-[-11deg] bg-[#d1b38e]" />
                </div>

                <div className="absolute left-[15%] top-[18%] flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-[#5a2e11] text-white shadow-[0_12px_24px_rgba(90,46,17,0.28)]">
                  <Coffee size={24} />
                </div>
                <div className="absolute right-[18%] top-[30%] flex h-11 w-11 items-center justify-center rounded-2xl bg-[#d66612] text-white shadow-[0_12px_24px_rgba(214,102,18,0.28)]">
                  <MapPin size={21} />
                </div>
                <div className="absolute bottom-[24%] left-[30%] flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#7b3c0f] shadow-[0_12px_24px_rgba(90,46,17,0.18)]">
                  <Bean size={23} />
                </div>

                <div className="absolute left-4 right-4 top-4 rounded-2xl border border-[#eadfd3] bg-white/90 p-3 shadow-[0_12px_30px_rgba(58,38,18,0.12)] backdrop-blur">
                  <div className="flex items-center gap-2 rounded-xl bg-[#f4eadc] px-3 py-2 text-sm font-bold text-[#7d6149]">
                    <Search size={16} />
                    산미 있는 푸어오버
                  </div>
                </div>

                <div className="absolute bottom-4 left-4 right-4 space-y-2 rounded-3xl border border-[#eadfd3] bg-white/90 p-3 shadow-[0_18px_42px_rgba(58,38,18,0.16)] backdrop-blur">
                  {PREVIEW_CAFES.map((cafe) => (
                    <div key={cafe.name} className="flex items-center justify-between gap-3 rounded-2xl bg-[#fbf8f3] px-3 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-[#2c2118]">{cafe.name}</p>
                        <p className="mt-0.5 truncate text-xs font-semibold text-[#8b7a68]">{cafe.note}</p>
                      </div>
                      <span className="flex shrink-0 items-center gap-1 rounded-full bg-[#fff3df] px-2.5 py-1 text-xs font-black text-[#b45a12]">
                        <Star size={12} fill="currentColor" />
                        {cafe.score}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[#dfcbb1] bg-[#fbf8f3] px-5 py-12 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-3 md:grid-cols-3">
          {FEATURE_ITEMS.map(({ title, description, icon: Icon }) => (
            <article key={title} className="rounded-2xl border border-[#eadfd3] bg-white p-5 shadow-[0_10px_28px_rgba(90,46,17,0.08)]">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff3df] text-[#b45a12]">
                <Icon size={21} />
              </div>
              <h2 className="mt-4 text-lg font-black text-[#2c2118]">{title}</h2>
              <p className="mt-2 text-sm font-medium leading-6 text-[#6f5845]">{description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
