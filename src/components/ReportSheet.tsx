'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Check, MapPin, Search, X } from 'lucide-react'
import type { Cafe } from '@/types/cafe'
import type { LocationPoint } from '@/types/location'
import type { ReportType } from '@/types/report'
import type { User } from '@/hooks/useUser'

interface KakaoPlace {
  kakaoPlaceId: string
  name: string
  address: string
  lat: number
  lng: number
  phone?: string
  placeUrl: string
}

interface ReportSheetProps {
  cafes: Cafe[]
  user: User | null
  initialType: ReportType
  initialCafe: Cafe | null
  initialLocation: LocationPoint | null
  onClose: () => void
  onStartMapPick: () => void
}

const CORRECTION_TYPES = ['영업시간 오류', '주소 오류', '폐업', '메뉴/원두 정보 오류', '기타']
const MIN_SEARCH_LENGTH = 2
const MAP_PICKED_NAME_PLACEHOLDER = '카페 이름을 입력해주세요'

export default function ReportSheet({
  cafes,
  user,
  initialType,
  initialCafe,
  initialLocation,
  onClose,
  onStartMapPick,
}: ReportSheetProps) {
  const [reportType, setReportType] = useState<ReportType>(initialType)
  const [query, setQuery] = useState('')
  const [places, setPlaces] = useState<KakaoPlace[]>([])
  const [selectedPlace, setSelectedPlace] = useState<KakaoPlace | null>(null)
  const [selectedCafeId, setSelectedCafeId] = useState(initialCafe?.id ?? '')
  const [manualName, setManualName] = useState('')
  const [manualAddress, setManualAddress] = useState(initialLocation ? '주소 확인 중...' : '')
  const [selectedCorrectionTypes, setSelectedCorrectionTypes] = useState<string[]>([])
  const [memo, setMemo] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [searching, setSearching] = useState(false)

  const selectedCafe = useMemo(
    () => cafes.find((cafe) => cafe.id === selectedCafeId) ?? null,
    [cafes, selectedCafeId],
  )
  const isMapPickedLocation = Boolean(initialLocation) && !selectedPlace
  const visiblePlaces = selectedPlace ? [selectedPlace] : places
  const memoPlaceholder = user
    ? `오늘은 어떤 커피의 향을 즐기셨나요? 원두, 메뉴, 분위기처럼 ${user.nickname}님이 기분 좋게 느낀 순간을 남겨주세요. 함께 만들어가는 커피맵에 소중히 담아둘게요.`
    : '오늘은 어떤 커피의 향을 즐기셨나요? 원두, 메뉴, 분위기처럼 기분 좋게 느낀 순간을 남겨주세요. 함께 만들어가는 커피맵에 소중히 담아둘게요.'

  useEffect(() => {
    if (!initialLocation) return

    let ignore = false

    async function loadAddress(location: LocationPoint) {
      const response = await fetch(`/api/kakao/geocode?lat=${location.lat}&lng=${location.lng}`)

      if (ignore) return

      if (!response.ok) {
        setManualAddress('지도에서 선택한 위치')
        return
      }

      const body = await response.json() as { address?: unknown }
      setManualAddress(typeof body.address === 'string' && body.address ? body.address : '지도에서 선택한 위치')
    }

    void loadAddress(initialLocation)

    return () => {
      ignore = true
    }
  }, [initialLocation])

  async function searchPlaces() {
    if (query.trim().length < MIN_SEARCH_LENGTH) {
      setMessage(`검색어를 ${MIN_SEARCH_LENGTH}글자 이상 입력해주세요.`)
      return
    }

    setSearching(true)
    setMessage('장소를 검색하는 중입니다.')

    const response = await fetch(`/api/kakao/search?query=${encodeURIComponent(query)}`)

    setSearching(false)

    if (!response.ok) {
      setMessage('장소 검색에 실패했습니다.')
      return
    }

    setPlaces(await response.json() as KakaoPlace[])
    setMessage('')
  }

  function toggleCorrectionType(value: string) {
    setSelectedCorrectionTypes((current) => (
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    ))
  }

  async function submitReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!user) {
      setMessage('닉네임 생성 후 다시 시도해주세요.')
      return
    }

    if (!confirmed) {
      setMessage('제보 내용 확인 체크가 필요합니다.')
      return
    }

    const payload = createPayload()
    if (!payload) return

    setSubmitting(true)
    setMessage('제보를 보내는 중입니다.')

    const response = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        anonymousId: user.type === 'anonymous' ? user.anonymousId : user.id,
        nickname: user.nickname,
      }),
    })

    setSubmitting(false)

    if (!response.ok) {
      const body = await response.json().catch(() => ({ error: '제보 저장에 실패했습니다.' })) as { error?: unknown }
      setMessage(typeof body.error === 'string' ? body.error : '제보 저장에 실패했습니다.')
      return
    }

    setMessage('제보를 보냈습니다. 확인 후 반영할게요.')
    window.setTimeout(onClose, 700)
  }

  function createPayload() {
    if (reportType === 'correction') {
      if (!selectedCafe) {
        setMessage('수정할 카페를 선택해주세요.')
        return null
      }

      if (selectedCorrectionTypes.length === 0 && !memo.trim()) {
        setMessage('수정 요청 항목이나 메모를 입력해주세요.')
        return null
      }

      return {
        type: reportType,
        cafeId: selectedCafe.id,
        name: selectedCafe.name,
        address: selectedCafe.address,
        lat: selectedCafe.lat,
        lng: selectedCafe.lng,
        correctionTypes: selectedCorrectionTypes,
        memo,
      }
    }

    const location = selectedPlace ?? (
      initialLocation
        ? {
          kakaoPlaceId: undefined,
          name: manualName,
          address: manualAddress,
          lat: initialLocation.lat,
          lng: initialLocation.lng,
        }
        : null
    )

    if (!location || !location.name.trim()) {
      setMessage('제보할 카페를 검색하거나 지도에서 위치를 선택해주세요.')
      return null
    }

    return {
      type: reportType,
      kakaoPlaceId: 'kakaoPlaceId' in location ? location.kakaoPlaceId : undefined,
      name: location.name,
      address: location.address,
      lat: location.lat,
      lng: location.lng,
      correctionTypes: [],
      memo,
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end bg-[#1f150f]/45 md:items-center md:justify-center md:px-4">
      <div className="max-h-[88dvh] w-full overflow-hidden rounded-t-3xl bg-[#fbf8f3] text-[#2c2118] shadow-[0_-18px_60px_rgba(30,18,10,0.22)] md:max-w-xl md:rounded-2xl">
        <div className="flex items-center justify-between border-b border-[#eadfd3] bg-white px-5 py-4">
          <div>
            <h2 className="text-lg font-black">카페 제보하기</h2>
            <p className="mt-1 text-xs font-bold text-[#8b7a68]">{user?.nickname ?? '익명 사용자'}로 접수됩니다.</p>
          </div>
          <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full text-[#7d6149] hover:bg-[#f4eee7]" aria-label="닫기">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submitReport} className="max-h-[calc(88dvh-73px)] overflow-y-auto px-5 py-4">
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-white p-1">
            <button
              type="button"
              onClick={() => setReportType('new_place')}
              className={`h-10 rounded-xl text-sm font-black ${reportType === 'new_place' ? 'bg-[#5a2e11] text-white' : 'text-[#5f4634]'}`}
            >
              신규 카페
            </button>
            <button
              type="button"
              onClick={() => setReportType('correction')}
              className={`h-10 rounded-xl text-sm font-black ${reportType === 'correction' ? 'bg-[#5a2e11] text-white' : 'text-[#5f4634]'}`}
            >
              정보 수정
            </button>
          </div>

          {reportType === 'new_place' ? (
            <div className="mt-4 space-y-3">
              {!isMapPickedLocation && (
                <>
                  <div className="flex gap-2">
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key !== 'Enter') return

                        event.preventDefault()
                        void searchPlaces()
                      }}
                      placeholder="카페 이름 검색"
                      className="h-11 min-w-0 flex-1 rounded-xl border border-[#d8c8b8] bg-white px-3 text-sm font-semibold outline-none focus:border-[#d66612]"
                    />
                    <button type="button" onClick={() => void searchPlaces()} disabled={searching} className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#5a2e11] text-white disabled:opacity-60">
                      <Search size={17} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={onStartMapPick}
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#d8c8b8] bg-white text-sm font-black text-[#6f3b17]"
                  >
                    <MapPin size={16} />
                    지도에서 위치 찍기
                  </button>
                </>
              )}

              {visiblePlaces.map((place) => (
                <button
                  key={place.kakaoPlaceId}
                  type="button"
                  onClick={() => setSelectedPlace(place)}
                  className={`w-full rounded-xl border p-3 text-left ${selectedPlace?.kakaoPlaceId === place.kakaoPlaceId ? 'border-2 border-[#d66612] bg-[#fff7ed] shadow-sm' : 'border-[#eadfd3] bg-white'}`}
                >
                  <span className="block text-sm font-black">{place.name}</span>
                  <span className="mt-1 block text-xs font-semibold text-[#7a6654]">{place.address}</span>
                </button>
              ))}

              {isMapPickedLocation && (
                <div className="rounded-2xl border-2 border-[#d66612] bg-[#fff7ed] p-4 shadow-sm">
                  <div className="mb-3 flex items-start gap-2">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#d66612] text-white">
                      <MapPin size={15} />
                    </span>
                    <div>
                      <p className="text-sm font-black text-[#5a2e11]">지도에서 선택한 위치</p>
                      <p className="mt-1 text-xs font-bold leading-5 text-[#8a5b35]">아래 칸에 이 장소의 카페 이름을 직접 적어주세요.</p>
                    </div>
                  </div>
                  <label className="block text-sm font-black text-[#5f4634]">
                    카페 이름 입력
                    <input
                      value={manualName}
                      onChange={(event) => setManualName(event.target.value)}
                      placeholder={MAP_PICKED_NAME_PLACEHOLDER}
                      className="mt-2 h-11 w-full rounded-xl border-2 border-[#d66612] bg-white px-3 text-sm font-bold outline-none placeholder:text-[#b09b88] focus:ring-2 focus:ring-[#f3b37d]"
                    />
                  </label>
                  <p className="mt-3 text-xs font-semibold leading-5 text-[#7a6654]">{manualAddress}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              <label className="block text-sm font-bold text-[#5f4634]">
                수정할 카페
                <select
                  value={selectedCafeId}
                  onChange={(event) => setSelectedCafeId(event.target.value)}
                  className="mt-1 h-11 w-full rounded-xl border border-[#d8c8b8] bg-white px-3 text-sm font-semibold outline-none focus:border-[#d66612]"
                >
                  <option value="">카페 선택</option>
                  {cafes.map((cafe) => (
                    <option key={cafe.id} value={cafe.id}>{cafe.name}</option>
                  ))}
                </select>
              </label>

              <div className="grid grid-cols-2 gap-2">
                {CORRECTION_TYPES.map((type) => (
                  <label key={type} className="flex min-h-10 items-center gap-2 rounded-xl border border-[#eadfd3] bg-white px-3 text-xs font-black text-[#5f4634]">
                    <input
                      type="checkbox"
                      checked={selectedCorrectionTypes.includes(type)}
                      onChange={() => toggleCorrectionType(type)}
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>
          )}

          <label className="mt-4 block text-sm font-bold text-[#5f4634]">
            메모
            <textarea
              value={memo}
              onChange={(event) => setMemo(event.target.value)}
              rows={4}
              placeholder={memoPlaceholder}
              className="mt-1 w-full rounded-xl border border-[#d8c8b8] bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-[#d66612]"
            />
          </label>

          <label className="mt-4 flex items-start gap-2 rounded-xl bg-white p-3 text-xs font-bold leading-5 text-[#6f5a47]">
            <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} className="mt-1" />
            제보 내용이 사실과 다르거나 부정확할 수 있음을 이해했고, 관리자가 확인 후 반영하는 것에 동의합니다.
          </label>

          {message && <p className="mt-3 rounded-xl bg-[#fff4ed] px-3 py-2 text-xs font-bold text-[#a64f16]">{message}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#d66612] text-sm font-black text-white disabled:cursor-wait disabled:opacity-70"
          >
            <Check size={17} />
            {submitting ? '제보 보내는 중' : '제보 제출하기'}
          </button>
        </form>
      </div>
    </div>
  )
}
