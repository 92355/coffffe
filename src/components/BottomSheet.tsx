'use client'

import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import { AtSign, Heart, Phone, X } from 'lucide-react'
import type { Cafe } from '@/types/cafe'
import { BREW_LABELS, ORIGIN_LABELS, ROAST_LABELS } from '@/types/cafe'
import { googleMapUrl, kakaoMapUrl, naverMapUrl } from '@/lib/mapNavigation'
import { cafeHue } from '@/lib/cafeThumb'
import { useViewTracker } from '@/hooks/useViewTracker'
import CafeFootprintPanel from './CafeFootprintPanel'

interface BottomSheetProps {
  cafe: Cafe | null
  onClose: () => void
  favorite?: boolean
  onFavoriteToggle?: (cafeId: string) => void
}

const MAX_HEIGHT_DVH = 82
const MIN_HEIGHT_DVH = 35

const glassStyle = {
  background: 'color-mix(in srgb, var(--background) 94%, transparent)',
  border: '1px solid color-mix(in srgb, var(--foreground) 18%, transparent)',
  boxShadow: '0 -8px 36px rgba(0, 0, 0, 0.22), inset 0 1px 0 rgba(255,255,255,0.06)',
} as const

export default function BottomSheet({
  cafe,
  onClose,
  favorite = false,
  onFavoriteToggle,
}: BottomSheetProps) {
  const [sheetHeight, setSheetHeight] = useState(MAX_HEIGHT_DVH)
  const sheetRef = useRef<HTMLDivElement>(null)
  const rafIdRef = useRef<number | null>(null)
  useViewTracker(cafe?.id ?? null)

  useEffect(() => {
    // Reset sheet height when a new cafe is selected. / 새 카페 선택 시 시트 높이 초기화.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSheetHeight(MAX_HEIGHT_DVH)
  }, [cafe?.id])

  function handleDragHandlePointerDown(e: React.PointerEvent) {
    e.preventDefault()
    const startY = e.clientY
    const startHeight = sheetHeight

    function onMove(moveEvent: PointerEvent) {
      // RAF throttle: cancel pending frame and schedule a new one.
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current)
      rafIdRef.current = requestAnimationFrame(() => {
        const deltaY = startY - moveEvent.clientY
        const deltaPercent = (deltaY / window.innerHeight) * 100
        const next = Math.min(MAX_HEIGHT_DVH, Math.max(MIN_HEIGHT_DVH, startHeight + deltaPercent))
        // Directly mutate DOM style — no React re-render in the hot path.
        if (sheetRef.current) sheetRef.current.style.height = `${next}dvh`
      })
    }

    function onUp() {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
        rafIdRef.current = null
      }
      // Sync React state once so the next render matches the dragged position.
      const current = sheetRef.current?.style.height
      if (current) {
        const parsed = parseFloat(current)
        if (!Number.isNaN(parsed)) setSheetHeight(parsed)
      }
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerup', onUp)
    }

    document.addEventListener('pointermove', onMove)
    document.addEventListener('pointerup', onUp)
  }

  return (
    <AnimatePresence>
      {cafe && (
        <motion.div
          key={cafe.id}
          className="pointer-events-auto fixed inset-x-0 bottom-0 z-[60] px-3"
          style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 32, stiffness: 320 }}
        >
          <div
            ref={sheetRef}
            className="glass-map-sheet overflow-hidden rounded-3xl"
            style={{ ...glassStyle, height: `${sheetHeight}dvh` }}
          >
            {/* 드래그 핸들 */}
            <div
              className="flex justify-center py-3 cursor-grab active:cursor-grabbing touch-none select-none"
              onPointerDown={handleDragHandlePointerDown}
            >
              <div className="h-1.5 w-10 rounded-full bg-[#c4b5a5] dark:bg-white/30" />
            </div>

            <div className="overflow-y-auto" style={{ height: `calc(${sheetHeight}dvh - 2.75rem)` }}>
              {/* 썸네일 */}
              {(() => {
                const hue = cafeHue(cafe.id)
                const placeholderBg = [
                  `radial-gradient(circle at 25% 35%, transparent 22%, rgba(255,255,255,0.10) 22.5%, rgba(255,255,255,0.10) 26%, transparent 26.5%)`,
                  `radial-gradient(circle at 68% 58%, transparent 17%, rgba(255,255,255,0.07) 17.5%, rgba(255,255,255,0.07) 21%, transparent 21.5%)`,
                  `hsl(${hue}, 42%, 38%)`,
                ].join(', ')
                return (
                  <div className="relative mx-3 mt-2 h-[120px] overflow-hidden rounded-2xl">
                    {cafe.images?.[0] ? (
                      <Image src={cafe.images[0]} alt={cafe.name} fill className="object-cover" unoptimized />
                    ) : (
                      <div className="absolute inset-0" style={{ background: placeholderBg }}>
                        <span className="absolute inset-0 flex select-none items-center justify-center text-4xl font-black text-white/80">
                          {cafe.name[0]}
                        </span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={onClose}
                      className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm"
                      aria-label="닫기"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )
              })()}

              {/* 이름 + 찜 */}
              <div className="flex items-start justify-between gap-2 px-4 pt-3">
                <span className="min-w-0 flex-1 text-lg font-black text-[#2c2118] dark:text-white">
                  {cafe.name}
                </span>
                {onFavoriteToggle && (
                  <button
                    type="button"
                    onClick={() => onFavoriteToggle(cafe.id)}
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors ${
                      favorite
                        ? 'border-[#d66612] bg-[#d66612] text-white'
                        : 'border-[#eadfd3] bg-white/70 text-[#7d6149] hover:text-[#d66612] dark:border-white/18 dark:bg-white/12 dark:text-white/72'
                    }`}
                    aria-label={favorite ? `${cafe.name} 저장 해제` : `${cafe.name} 저장`}
                    aria-pressed={favorite}
                  >
                    <Heart size={15} fill={favorite ? 'currentColor' : 'none'} />
                  </button>
                )}
              </div>

              <p className="px-4 pt-1 text-sm leading-relaxed text-[#7d6149] dark:text-white/80">
                {cafe.shortDescription}
              </p>

              {/* 태그 */}
              <div className="flex flex-wrap gap-1.5 px-4 pt-3">
                {cafe.roastLevels.map(r => (
                  <span key={r} className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                    {ROAST_LABELS[r]}
                  </span>
                ))}
                {cafe.beanOrigins.map(o => (
                  <span key={o} className="rounded-full bg-[#f5ede5] px-2.5 py-1 text-xs font-semibold text-[#7d6149] dark:bg-white/12 dark:text-white/72">
                    {ORIGIN_LABELS[o]}
                  </span>
                ))}
                {cafe.brewMethods.map(m => (
                  <span key={m} className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    {BREW_LABELS[m]}
                  </span>
                ))}
              </div>

              {/* 발자취 전체 패널 */}
              <div className="px-3 pt-3">
                <CafeFootprintPanel cafeId={cafe.id} />
              </div>

              <div className="mx-4 mt-4 border-t border-[#eee4d8] dark:border-white/10" />

              {/* 영업정보 */}
              <div className="space-y-1.5 px-4 pt-3 text-xs text-[#7d6149] dark:text-white/80">
                <p className="truncate">{cafe.address}</p>
                <p>영업 {cafe.openHours}</p>
                <p>휴무 {cafe.closedDays.length > 0 ? cafe.closedDays.join(', ') : '정보 없음'}</p>
              </div>

              {/* 연락처 */}
              {(cafe.phone || cafe.instagramHandle) && (
                <div className="flex items-center gap-2 px-4 pt-3">
                  {cafe.phone && (
                    <a
                      href={`tel:${cafe.phone}`}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-[#eadfd3] bg-white/70 text-[#6b432a] dark:border-white/18 dark:bg-white/12 dark:text-white/80"
                      aria-label={`${cafe.name} 전화`}
                    >
                      <Phone size={14} />
                    </a>
                  )}
                  {cafe.instagramHandle && (
                    <a
                      href={`https://instagram.com/${cafe.instagramHandle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-[#eadfd3] bg-white/70 text-[#6b432a] transition-colors hover:text-[#E1306C] dark:border-white/18 dark:bg-white/12 dark:text-white/80"
                      aria-label={`${cafe.name} 인스타그램`}
                    >
                      <AtSign size={14} />
                    </a>
                  )}
                </div>
              )}

              <div className="mx-4 mt-4 border-t border-[#eee4d8] dark:border-white/10" />

              {/* 지도 검색 가로 3등분 */}
              <div
                className="grid grid-cols-3 gap-2 px-4 pt-3"
                style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
              >
                <a
                  href={naverMapUrl(cafe.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 items-center justify-center gap-1.5 rounded-xl text-xs font-black text-white transition-opacity hover:opacity-90"
                  style={{ background: '#03C75A' }}
                  aria-label="네이버 지도에서 검색"
                >
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-[9px] font-black">N</span>
                  네이버
                </a>
                <a
                  href={kakaoMapUrl(cafe.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 items-center justify-center gap-1.5 rounded-xl text-xs font-black text-[#381e1f] transition-opacity hover:opacity-90"
                  style={{ background: '#FEE500' }}
                  aria-label="카카오 지도에서 검색"
                >
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-black/10 text-[9px] font-black">K</span>
                  카카오
                </a>
                <a
                  href={googleMapUrl(cafe.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 items-center justify-center gap-1.5 rounded-xl text-xs font-black text-white transition-opacity hover:opacity-90"
                  style={{ background: '#4285F4' }}
                  aria-label="구글 지도에서 검색"
                >
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-[9px] font-black">G</span>
                  구글
                </a>
              </div>

            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
