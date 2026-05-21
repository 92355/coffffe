'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import { useUser } from '@/hooks/useUser'

// ─── Types ───────────────────────────────────────────────────────────────────

type Axis = 'L' | 'D' | 'S' | 'B' | 'E' | 'F' | 'H' | 'C'
type Scores = Record<Axis, number>
type Phase = 'intro' | 'quiz' | 'result'

interface Choice {
  label: string
  detail: string
  axis: Axis
}

interface Question {
  emoji: string
  text: string
  choices: [Choice, Choice]
}

// ─── Quiz Data ────────────────────────────────────────────────────────────────
// L/D: 로스팅 (Light vs Dark)   · Q1, Q5, Q10
// S/B: 원두 (Single vs Blend)   · Q2, Q6, Q9
// E/F: 추출 (Espresso vs Filter) · Q3, Q7
// H/C: 온도 (Hot vs Cold)        · Q4, Q8

const QUESTIONS: Question[] = [
  {
    emoji: '👅',
    text: '커피를 마실 때 더 끌리는 맛은?',
    choices: [
      { label: '산미와 과일향 🍑', detail: '복숭아, 레몬, 베리처럼 상큼하고 화사한 맛', axis: 'L' },
      { label: '고소함과 묵직함 🍫', detail: '견과류, 카카오, 쌉쌀함처럼 깊고 진한 맛', axis: 'D' },
    ],
  },
  {
    emoji: '🌍',
    text: '원두를 고를 때 나는?',
    choices: [
      { label: '산지·농장이 궁금해', detail: '에티오피아 예가체프, 케냐 AA… 원산지가 중요해', axis: 'S' },
      { label: '맛있으면 됐지', detail: '블렌딩이든 아니든, 조화로운 맛이 중요해', axis: 'B' },
    ],
  },
  {
    emoji: '⚗️',
    text: '선호하는 커피 추출 방식은?',
    choices: [
      { label: '에스프레소 베이스 ⚡', detail: '아메리카노, 라떼, 카푸치노처럼 에스프레소 기반', axis: 'E' },
      { label: '핸드드립·필터커피 💧', detail: '천천히 내려 마시는 드리퍼, 푸어오버 스타일', axis: 'F' },
    ],
  },
  {
    emoji: '🌡️',
    text: '커피는 역시?',
    choices: [
      { label: '따뜻하게 ☕', detail: '온기가 손에 전해지는 핫커피가 진짜 커피지', axis: 'H' },
      { label: '시원하게 🧊', detail: '얼음 가득, 차갑게 마셔야 개운해', axis: 'C' },
    ],
  },
  {
    emoji: '🔥',
    text: '로스팅 레벨을 고른다면?',
    choices: [
      { label: '라이트 로스팅 ☀️', detail: '원두 본연의 맛과 향을 살린 밝은 커피', axis: 'L' },
      { label: '다크 로스팅 🌑', detail: '깊고 진하게 볶아 강렬한 풍미의 커피', axis: 'D' },
    ],
  },
  {
    emoji: '☕',
    text: '카페에서 커피 주문할 때?',
    choices: [
      { label: '오늘의 싱글오리진 주세요', detail: '이 카페 원두 카드부터 확인, 산지 보고 고름', axis: 'S' },
      { label: '아메리카노 하나요', detail: '메뉴판 보고 익숙한 걸로 빠르게 주문', axis: 'B' },
    ],
  },
  {
    emoji: '🏠',
    text: '집에서 커피를 내린다면?',
    choices: [
      { label: '에스프레소 머신으로', detail: '짧고 강렬한 한 잔, 크레마가 있어야 진짜', axis: 'E' },
      { label: '드리퍼로 천천히', detail: '향 맡으며 물줄기 조절하는 그 시간이 좋아', axis: 'F' },
    ],
  },
  {
    emoji: '❄️',
    text: '한겨울에도 카페 가면?',
    choices: [
      { label: '따뜻한 라떼나 드립', detail: '날씨에 맞게 따뜻한 걸 마셔야지', axis: 'H' },
      { label: '아이스 아메리카노 🧊', detail: '사계절 내내 아이스, 그게 나야', axis: 'C' },
    ],
  },
  {
    emoji: '🗣️',
    text: '커피 이야기를 할 때 나는?',
    choices: [
      { label: '원두 스토리 파고들기', detail: '생산자, 품종, 가공 방식까지 알고 싶어', axis: 'S' },
      { label: '맛있었다가 전부', detail: '분위기, 함께한 사람이 더 기억에 남아', axis: 'B' },
    ],
  },
  {
    emoji: '✨',
    text: '처음 가는 카페의 첫 주문은?',
    choices: [
      { label: '오늘의 드립 한 잔', detail: '이 카페만의 라이트 드립으로 시작해야지', axis: 'L' },
      { label: '진한 아메리카노', detail: '일단 아메리카노 진하게, 그게 기준점이야', axis: 'D' },
    ],
  },
]

// ─── Result Data ──────────────────────────────────────────────────────────────

interface CbtiResult {
  emoji: string
  name: string
  desc: string
  traits: string[]
  recommend: string
  pairingNotes: string[]
  cafeStyle: string
}

const RESULTS: Record<string, CbtiResult> = {
  LSEH: {
    emoji: '🌸',
    name: '예가체프 에스프레소',
    desc: '밝고 화사한 산미의 싱글오리진을 뜨겁게 추출한 당신. 섬세하고 감성적이며, 커피 한 잔에도 스토리를 찾는 로맨티스트예요.',
    traits: ['감성적', '섬세함', '탐구적', '따뜻함'],
    recommend: '에티오피아 예가체프 싱글오리진 에스프레소',
    pairingNotes: ['플로럴', '복숭아', '재스민'],
    cafeStyle: '직접 소량 로스팅하는 로스터리 카페',
  },
  LSEC: {
    emoji: '🍋',
    name: '콜드 싱글오리진 샷',
    desc: '라이트 싱글오리진을 차갑게 즐기는 실험가. 트렌디하고 주관이 뚜렷하며, 새로운 맛에 항상 열려있는 어드벤처러예요.',
    traits: ['트렌디', '주관뚜렷', '실험적', '쿨함'],
    recommend: '케냐 AA 아이스 에스프레소',
    pairingNotes: ['블랙커런트', '시트러스', '베리'],
    cafeStyle: '싱글오리진에 真진심인 스페셜티 에스프레소 바',
  },
  LSFH: {
    emoji: '🎋',
    name: '게이샤 핸드드립',
    desc: '희귀한 싱글오리진을 드리퍼로 천천히 내려 마시는 커피 감별사. 깊이 있는 취향과 인내심을 가진 퍼펙셔니스트예요.',
    traits: ['완벽주의', '깊은취향', '인내심', '감별사'],
    recommend: '파나마 게이샤 또는 에티오피아 내추럴 핸드드립',
    pairingNotes: ['재스민', '복숭아', '허브'],
    cafeStyle: '핸드드립 한 잔에 집중하는 조용한 드립 전문점',
  },
  LSFC: {
    emoji: '🧊',
    name: '싱글오리진 콜드브루',
    desc: '라이트 싱글의 섬세함을 차갑게 오래 우려낸 미식가. 조용하지만 강한 취향을 가진 진짜 커피 마니아예요.',
    traits: ['미식가', '조용한강함', '개성있음', '독자적'],
    recommend: '에티오피아 내추럴 싱글오리진 콜드브루',
    pairingNotes: ['블루베리', '와인', '플로럴'],
    cafeStyle: '싱글오리진 콜드브루를 직접 내리는 로스터리',
  },
  LBEH: {
    emoji: '🌻',
    name: '브라이트 블렌드 라떼',
    desc: '밝은 블렌드를 에스프레소로 따뜻하게 즐기는 소셜 커피인. 사교적이고 트렌드에 민감하며, 커피를 라이프스타일로 즐겨요.',
    traits: ['사교적', '트렌드세터', '밝은에너지', '소통잘함'],
    recommend: '브라이트 블렌드 플랫화이트 또는 카푸치노',
    pairingNotes: ['캐러멜', '시트러스', '견과류'],
    cafeStyle: '분위기 좋고 사람 많은 트렌디 스페셜티 카페',
  },
  LBEC: {
    emoji: '🏃',
    name: '라이트 아이스 아메리카노',
    desc: '산미 있는 블렌드를 시원하게 마시는 활동가. 효율적이고 현실적이며, 커피를 에너지원으로 삼는 현대인 대표예요.',
    traits: ['활동적', '현실적', '효율추구', '스피디'],
    recommend: '라이트 블렌드 아이스 아메리카노',
    pairingNotes: ['상큼한산미', '과일향', '깔끔함'],
    cafeStyle: '접근성 좋고 빠른 서비스의 스페셜티 카페',
  },
  LBFH: {
    emoji: '📚',
    name: '드립 블렌드 감성러',
    desc: '화사한 블렌드를 드립으로 천천히 즐기는 힐링러. 카페 분위기와 커피 향을 동시에 즐기며, 여유로운 시간을 소중히 여겨요.',
    traits: ['힐링추구', '감성적', '여유로움', '카페러버'],
    recommend: '오늘의 드립 블렌드 한 잔',
    pairingNotes: ['꽃향기', '과일', '부드러운단맛'],
    cafeStyle: '조용하고 감성적인 분위기의 드립 카페',
  },
  LBFC: {
    emoji: '🌊',
    name: '라이트 콜드브루',
    desc: '밝은 블렌드의 콜드브루를 즐기는 여유파. 트렌디하면서도 자기만의 페이스를 유지하는 쿨한 커피인이에요.',
    traits: ['힙한감성', '여유로움', '트렌디', '자기페이스'],
    recommend: '라이트 블렌드 더치커피 또는 콜드브루',
    pairingNotes: ['상큼함', '허브', '밝은산미'],
    cafeStyle: '콜드브루를 직접 제조하는 힙한 스페셜티 카페',
  },
  DSEH: {
    emoji: '🔬',
    name: '다크 싱글 에스프레소',
    desc: '진한 싱글오리진을 에스프레소로 추출해 뜨겁게 즐기는 커피 연구자. 깊이 있는 탐구와 높은 기준을 가진 전문가예요.',
    traits: ['전문가기질', '진지함', '높은기준', '탐구적'],
    recommend: '인도네시아 만델링 또는 과테말라 싱글오리진 에스프레소',
    pairingNotes: ['다크초콜릿', '허브', '스모키'],
    cafeStyle: '에스프레소 퀄리티에 진심인 진지한 스페셜티 바',
  },
  DSEC: {
    emoji: '⚡',
    name: '다크 싱글 아이스샷',
    desc: '강렬한 싱글오리진을 차갑게 즐기는 독특한 취향의 소유자. 강하고 독립적이며, 자신만의 커피 세계를 구축한 개인주의자예요.',
    traits: ['강렬함', '독립적', '개인주의', '독특한취향'],
    recommend: '인도네시아 싱글오리진 아이스 에스프레소',
    pairingNotes: ['다크초콜릿', '스모키', '강렬한쓴맛'],
    cafeStyle: '개성 강한 독립 에스프레소 바',
  },
  DSFH: {
    emoji: '🏔️',
    name: '다크 싱글 핸드드립',
    desc: '진한 싱글오리진을 드립으로 천천히 탐구하는 철학자. 깊이 있고 신중하며, 커피 한 잔에 삶의 의미를 찾는 사색가예요.',
    traits: ['철학적', '신중함', '깊이있음', '사색가'],
    recommend: '과테말라 또는 인도네시아 싱글오리진 핸드드립',
    pairingNotes: ['다크카카오', '견과류', '흙향'],
    cafeStyle: '조용하고 진지한 분위기의 드립 전문 카페',
  },
  DSFC: {
    emoji: '🌙',
    name: '다크 싱글 콜드브루',
    desc: '진한 싱글의 깊은 맛을 차갑게 오래 추출하는 미스터리. 세련되고 과묵하며, 강렬한 카리스마를 숨기고 있는 타입이에요.',
    traits: ['카리스마', '과묵함', '세련됨', '미스테리'],
    recommend: '인도네시아 다크 싱글오리진 콜드브루',
    pairingNotes: ['스모키', '다크초콜릿', '우디'],
    cafeStyle: '세련되고 조용한 분위기의 콜드브루 전문점',
  },
  DBEH: {
    emoji: '👑',
    name: '클래식 에스프레소',
    desc: '진한 다크 블렌드를 에스프레소로 즐기는 정통파. 전통과 기본을 사랑하며, 커피의 본질에서 최고를 추구하는 원칙주의자예요.',
    traits: ['정통파', '전통중시', '클래식', '신뢰감'],
    recommend: '다크 블렌드 에스프레소 또는 리스트레또',
    pairingNotes: ['카카오', '캐러멜', '견과류'],
    cafeStyle: '클래식하고 정통 있는 에스프레소 카페',
  },
  DBEC: {
    emoji: '💼',
    name: '아이스 아메리카노의 신',
    desc: '대한민국 커피 인구 대표, 다크 블렌드 아이스 아메리카노. 효율적이고 실용적이며, 언제 어디서나 기대를 저버리지 않는 신뢰의 아이콘이에요.',
    traits: ['실용적', '신뢰감', '효율적', '대세감성'],
    recommend: '다크 블렌드 아이스 아메리카노 (얼음 많이)',
    pairingNotes: ['쌉쌀함', '구수함', '진한바디'],
    cafeStyle: '어디서든 부담 없이 들를 수 있는 카페',
  },
  DBFH: {
    emoji: '🏡',
    name: '다크 드립 힐링러',
    desc: '진한 블렌드를 드립으로 따뜻하게 즐기는 위로의 커피인. 따뜻하고 포근하며, 커피 한 잔으로 하루를 위로받는 감성파예요.',
    traits: ['따뜻함', '위로의존재', '가정적', '힐링'],
    recommend: '다크 블렌드 핸드드립 한 잔',
    pairingNotes: ['초콜릿', '캐러멜', '고소한견과류'],
    cafeStyle: '따뜻하고 포근한 분위기의 드립 카페',
  },
  DBFC: {
    emoji: '🌑',
    name: '다크 콜드브루 마스터',
    desc: '진한 블렌드를 차갑게 오래 추출하는 인내의 커피인. 묵직한 카리스마와 깊이 있는 매력으로 주변을 이끄는 리더형이에요.',
    traits: ['리더십', '묵직한카리스마', '인내심', '깊이'],
    recommend: '다크 블렌드 더치커피 (질소 주입 추천)',
    pairingNotes: ['다크초콜릿', '몰트', '쌉쌀한여운'],
    cafeStyle: '묵직한 분위기의 콜드브루 전문 카페',
  },
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function computeResult(s: Scores): string {
  return [
    s.L >= s.D ? 'L' : 'D',
    s.S >= s.B ? 'S' : 'B',
    s.E >= s.F ? 'E' : 'F',
    s.H >= s.C ? 'H' : 'C',
  ].join('')
}

const INIT_SCORES: Scores = { L: 0, D: 0, S: 0, B: 0, E: 0, F: 0, H: 0, C: 0 }

// ─── Component ────────────────────────────────────────────────────────────────

export default function CbtiPage() {
  const { user } = useUser()
  const [phase, setPhase] = useState<Phase>('intro')
  const [currentQ, setCurrentQ] = useState(0)
  const [scores, setScores] = useState<Scores>(INIT_SCORES)
  const [history, setHistory] = useState<Axis[]>([])
  const [result, setResult] = useState<string | null>(null)
  const [selected, setSelected] = useState<0 | 1 | null>(null)
  const lastSavedResultRef = useRef<string | null>(null)

  useEffect(() => {
    if (user?.type !== 'authenticated' || phase !== 'result' || !result || result === lastSavedResultRef.current) return

    let cancelled = false

    async function saveCbtiResult(): Promise<void> {
      try {
        const response = await fetch('/api/me/cbti', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cbtiType: result }),
        })
        if (!response.ok) return
        if (cancelled) return

        lastSavedResultRef.current = result
      } catch (error) {
        console.warn('Failed to save CBTI profile. / CBTI 프로필 저장 실패.', error)
      }
    }

    void saveCbtiResult()

    return () => {
      cancelled = true
    }
  }, [phase, result, user])

  function handleChoice(axis: Axis, idx: 0 | 1) {
    if (selected !== null) return
    setSelected(idx)
    setTimeout(() => {
      const next = { ...scores, [axis]: scores[axis] + 1 }
      setScores(next)
      setHistory(h => [...h, axis])
      setSelected(null)
      if (currentQ < QUESTIONS.length - 1) {
        setCurrentQ((q) => q + 1)
      } else {
        setResult(computeResult(next))
        setPhase('result')
      }
    }, 320)
  }

  function goBack() {
    if (currentQ === 0 || selected !== null) return
    const prevAxis = history[history.length - 1]
    setHistory(h => h.slice(0, -1))
    setScores(s => ({ ...s, [prevAxis]: s[prevAxis] - 1 }))
    setCurrentQ(q => q - 1)
  }

  function restart() {
    setPhase('intro')
    setCurrentQ(0)
    setScores(INIT_SCORES)
    setHistory([])
    setResult(null)
    setSelected(null)
  }

  const progress = (currentQ / QUESTIONS.length) * 100

  return (
    <div className="flex flex-col min-h-dvh">
      {/* Header */}
      <header className="flex items-center justify-between px-4 h-14 border-b border-gray-100 dark:border-gray-800 shrink-0">
        <div className="flex items-center gap-2">
          <Link
            href="/home"
            className="flex items-center justify-center w-8 h-8 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="홈으로"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
          <Link href="/home" className="flex items-baseline gap-2 no-underline">
            <span className="text-base font-bold tracking-tight text-gray-900 dark:text-gray-100">
              co<span className="text-amber-700 dark:text-amber-500">FFFFF</span>e map
            </span>
          </Link>
        </div>
        <ThemeToggle />
      </header>

      {/* ── Intro ── */}
      {phase === 'intro' && (
        <div className="flex flex-col items-center justify-center flex-1 px-6 py-10 text-center">
          <div className="text-7xl mb-6 anim-in" style={{ animationDelay: '0ms' }}>☕</div>
          <h1
            className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3 anim-in"
            style={{ animationDelay: '80ms' }}
          >
            커피 CBTI
          </h1>
          <p
            className="text-gray-500 dark:text-gray-400 mb-1 anim-in"
            style={{ animationDelay: '140ms' }}
          >
            10가지 질문으로 알아보는
          </p>
          <p
            className="text-gray-500 dark:text-gray-400 mb-10 anim-in"
            style={{ animationDelay: '180ms' }}
          >
            나의 커피 성격 유형
          </p>
          <button
            onClick={() => setPhase('quiz')}
            className="anim-in bg-amber-700 dark:bg-amber-600 text-white font-semibold px-10 py-3.5 rounded-2xl hover:bg-amber-800 dark:hover:bg-amber-700 active:scale-95 transition-all duration-200 text-base"
            style={{ animationDelay: '260ms' }}
          >
            시작하기 →
          </button>
          <p
            className="mt-4 text-xs text-gray-400 dark:text-gray-500 anim-in"
            style={{ animationDelay: '320ms' }}
          >
            16가지 커피 유형 중 나는?
          </p>
        </div>
      )}

      {/* ── Quiz ── */}
      {phase === 'quiz' && (
        <div className="flex flex-col flex-1 px-4 pt-5 pb-8">
          {/* Progress bar */}
          <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full mb-4 overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Counter */}
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center mb-5 font-medium tracking-wide">
            {currentQ + 1} / {QUESTIONS.length}
          </p>

          {/* Question — key forces remount → triggers .anim-in */}
          <div key={currentQ} className="anim-in flex flex-col flex-1">

            <div className="text-center mb-8">
              <div className="text-5xl mb-4">{QUESTIONS[currentQ].emoji}</div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-snug px-2">
                {QUESTIONS[currentQ].text}
              </h2>
            </div>

            {/* Choices */}
            <div className="flex flex-col gap-3 max-w-md mx-auto w-full">
              {QUESTIONS[currentQ].choices.map((choice, idx) => {
                const isSelected = selected === idx
                const isOther = selected !== null && selected !== idx
                return (
                  <button
                    key={idx}
                    onClick={() => handleChoice(choice.axis, idx as 0 | 1)}
                    disabled={selected !== null}
                    className={[
                      'rounded-2xl p-5 text-left border transition-all duration-200',
                      isSelected
                        ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-400 dark:border-amber-500 scale-[0.98]'
                        : isOther
                          ? 'opacity-30 scale-[0.97]'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-amber-300 dark:hover:border-amber-600 hover:bg-amber-50/50 dark:hover:bg-amber-900/10 active:scale-[0.98]',
                    ].join(' ')}
                  >
                    <div className="font-semibold text-gray-900 dark:text-gray-100 mb-1 text-[15px]">
                      {choice.label}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                      {choice.detail}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Back button */}
            {currentQ > 0 && (
              <button
                onClick={goBack}
                disabled={selected !== null}
                className="mt-5 mx-auto flex items-center gap-1 text-xs font-medium text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-30"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
                이전 질문으로
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Result ── */}
      {phase === 'result' && result && RESULTS[result] && (
        <div className="flex flex-col flex-1 px-4 py-8 items-center">
          <div className="anim-in w-full max-w-sm mx-auto">
            {/* Type header */}
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">{RESULTS[result].emoji}</div>
              <div className="text-xs font-mono font-bold text-amber-700 dark:text-amber-500 tracking-[0.3em] mb-2">
                {result}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {RESULTS[result].name}
              </h2>
            </div>

            {/* Description */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-5 mb-5">
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-[1.8]">
                {RESULTS[result].desc}
              </p>
            </div>

            {/* Traits */}
            <div className="flex flex-wrap gap-2 justify-center mb-5">
              {RESULTS[result].traits.map((t) => (
                <span
                  key={t}
                  className="text-sm bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 rounded-full px-3.5 py-1 font-medium"
                >
                  # {t}
                </span>
              ))}
            </div>

            {/* Recommend & Pairing */}
            <div className="rounded-2xl border border-gray-100 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800 overflow-hidden mb-5">
              <div className="px-4 py-3.5">
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-500 mb-1">추천 한 잔</p>
                <p className="text-sm text-gray-800 dark:text-gray-200">{RESULTS[result].recommend}</p>
              </div>
              <div className="px-4 py-3.5">
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-500 mb-2">어울리는 향미</p>
                <div className="flex flex-wrap gap-1.5">
                  {RESULTS[result].pairingNotes.map((note) => (
                    <span
                      key={note}
                      className="text-xs rounded-full px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                    >
                      {note}
                    </span>
                  ))}
                </div>
              </div>
              <div className="px-4 py-3.5">
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-500 mb-1">어울리는 카페 스타일</p>
                <p className="text-sm text-gray-800 dark:text-gray-200">{RESULTS[result].cafeStyle}</p>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex gap-3">
              <button
                onClick={restart}
                className="flex-1 py-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                다시 하기
              </button>
              <Link
                href="/map"
                className="flex-1 py-3.5 rounded-2xl bg-amber-700 dark:bg-amber-600 text-white text-sm font-semibold text-center hover:bg-amber-800 dark:hover:bg-amber-700 transition-colors"
                style={{ textDecoration: 'none' }}
              >
                카페 찾아보기 📍
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
