'use client'

import { FormEvent, startTransition, useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Coffee, ImagePlus, MapPin, Pencil, Search, Trash2, XCircle } from 'lucide-react'
import type { BeanOrigin, BrewMethod, Cafe, RoastLevel } from '@/types/cafe'
import type { CafeReport, ReportStatus } from '@/types/report'

const ROAST_LEVELS: RoastLevel[] = ['light', 'medium-light', 'medium', 'medium-dark', 'dark']
const BEAN_ORIGINS: BeanOrigin[] = [
  'ethiopia',
  'colombia',
  'kenya',
  'brazil',
  'guatemala',
  'indonesia',
  'panama',
  'rwanda',
  'costa-rica',
]
const BREW_METHODS: BrewMethod[] = ['espresso', 'pour-over', 'cold-brew', 'aeropress', 'siphon']
const DEFAULT_SCORE = 4.5
const DEFAULT_LAT = 37.3084
const DEFAULT_LNG = 126.8419
const DEFAULT_REPORT_DESCRIPTION = '제보로 등록된 카페입니다.'
const DEFAULT_REPORT_OPEN_HOURS = '확인 필요'

interface KakaoPlace {
  kakaoPlaceId: string
  name: string
  address: string
  lat: number
  lng: number
  phone?: string
  placeUrl: string
}

type CafeForm = Omit<Cafe, 'qualityScore'> & {
  qualityScore: string
}

const EMPTY_FORM: CafeForm = {
  id: '',
  name: '',
  shortDescription: '',
  fullDescription: '',
  address: '',
  lat: DEFAULT_LAT,
  lng: DEFAULT_LNG,
  roastLevels: [],
  beanOrigins: [],
  brewMethods: [],
  qualityScore: String(DEFAULT_SCORE),
  tags: [],
  openHours: '',
  closedDays: [],
  images: [],
  phone: '',
  instagramHandle: '',
  kakaoPlaceId: '',
  showAroma: true,
}

function slugify(value: string, fallback: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return slug || fallback
}

function createKakaoCafeId(place: KakaoPlace): string {
  const baseSlug = slugify(place.name, 'kakao')

  return `${baseSlug}-${place.kakaoPlaceId}`
}

function createReportCafeId(report: CafeReport): string {
  const baseSlug = slugify(report.name ?? '', 'report')

  return `${baseSlug}-${report.id.slice(0, 8)}`
}

function toCsv(values: string[]): string {
  return values.join(', ')
}

function fromCsv(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function toCafePayload(form: CafeForm): Cafe {
  return {
    ...form,
    qualityScore: Number.parseFloat(form.qualityScore),
    images: form.images ?? [],
    phone: form.phone || undefined,
    instagramHandle: form.instagramHandle || undefined,
    kakaoPlaceId: form.kakaoPlaceId || undefined,
    showAroma: form.showAroma ?? true,
  }
}

async function readApiErrorMessage(response: Response): Promise<string> {
  const fallbackMessage = `Request failed: ${response.status}`

  try {
    const body = await response.json() as { error?: unknown }

    return typeof body.error === 'string' ? body.error : fallbackMessage
  } catch {
    return fallbackMessage
  }
}

export default function AdminPage() {
  const [cafes, setCafes] = useState<Cafe[]>([])
  const [reports, setReports] = useState<CafeReport[]>([])
  const [form, setForm] = useState<CafeForm>(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [activeReportId, setActiveReportId] = useState<string | null>(null)
  const [kakaoQuery, setKakaoQuery] = useState('')
  const [places, setPlaces] = useState<KakaoPlace[]>([])
  const [message, setMessage] = useState('')

  const sortedCafes = useMemo(
    () => [...cafes].sort((a, b) => b.qualityScore - a.qualityScore),
    [cafes],
  )
  const pendingReports = useMemo(
    () => reports.filter((report) => report.status === 'pending'),
    [reports],
  )

  async function loadCafes() {
    const response = await fetch('/api/admin/cafes', {
      cache: 'no-store',
      credentials: 'same-origin',
    })

    if (!response.ok) {
      const errorMessage = await readApiErrorMessage(response)
      throw new Error(`Failed to load cafes: ${errorMessage}`)
    }

    setCafes(await response.json() as Cafe[])
  }

  useEffect(() => {
    startTransition(() => {
      void loadReports().catch((error) => {
        console.error(error)
        setMessage('제보 목록을 불러오지 못했습니다.')
      })
      void loadCafes().catch((error) => {
        console.error(error)
        setMessage('카페 목록을 불러오지 못했습니다.')
      })
    })
  }, [])

  async function loadReports() {
    const response = await fetch('/api/admin/reports', {
      cache: 'no-store',
      credentials: 'same-origin',
    })

    if (!response.ok) {
      const errorMessage = await readApiErrorMessage(response)
      throw new Error(`Failed to load reports: ${errorMessage}`)
    }

    setReports(await response.json() as CafeReport[])
  }

  async function searchKakaoPlaces(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('카카오 장소를 검색하는 중입니다.')

    const response = await fetch(`/api/kakao/search?query=${encodeURIComponent(kakaoQuery)}`)

    if (!response.ok) {
      setMessage('카카오 장소 검색에 실패했습니다.')
      return
    }

    setPlaces(await response.json() as KakaoPlace[])
    setMessage('')
  }

  function applyPlace(place: KakaoPlace) {
    setForm((current) => ({
      ...current,
      id: editingId ? current.id : createKakaoCafeId(place),
      name: place.name,
      address: place.address,
      lat: place.lat,
      lng: place.lng,
      phone: place.phone ?? '',
      kakaoPlaceId: place.kakaoPlaceId,
    }))
  }

  function applyReport(report: CafeReport) {
    const reportName = report.name ?? ''
    const reportMemo = report.memo ? `제보 메모: ${report.memo}` : DEFAULT_REPORT_DESCRIPTION

    setEditingId(null)
    setActiveReportId(report.id)
    setForm({
      ...EMPTY_FORM,
      id: createReportCafeId(report),
      name: reportName,
      shortDescription: DEFAULT_REPORT_DESCRIPTION,
      fullDescription: reportMemo,
      address: report.address ?? '',
      lat: report.lat ?? DEFAULT_LAT,
      lng: report.lng ?? DEFAULT_LNG,
      openHours: DEFAULT_REPORT_OPEN_HOURS,
      kakaoPlaceId: report.kakaoPlaceId ?? '',
    })
    setMessage('제보 내용을 카페 등록 폼에 채웠습니다.')
  }

  async function updateReportStatus(id: string, status: ReportStatus) {
    setMessage('제보 상태를 변경하는 중입니다.')

    const response = await fetch('/api/admin/reports', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ id, status }),
    })

    if (!response.ok) {
      const errorMessage = await readApiErrorMessage(response)
      setMessage(`제보 상태 변경 실패: ${errorMessage}`)
      return
    }

    await loadReports()
    setMessage('제보 상태를 변경했습니다.')
  }

  async function deleteReport(id: string) {
    setMessage('제보를 삭제하는 중입니다.')

    const response = await fetch(`/api/admin/reports?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
      credentials: 'same-origin',
    })

    if (!response.ok) {
      const errorMessage = await readApiErrorMessage(response)
      setMessage(`제보 삭제 실패: ${errorMessage}`)
      return
    }

    if (activeReportId === id) {
      setActiveReportId(null)
    }

    await loadReports()
    setMessage('제보를 삭제했습니다.')
  }

  function editCafe(cafe: Cafe) {
    setEditingId(cafe.id)
    setActiveReportId(null)
    setForm({
      ...cafe,
      qualityScore: String(cafe.qualityScore),
      images: cafe.images ?? [],
      phone: cafe.phone ?? '',
      instagramHandle: cafe.instagramHandle ?? '',
      kakaoPlaceId: cafe.kakaoPlaceId ?? '',
      showAroma: cafe.showAroma ?? true,
    })
  }

  async function saveCafe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('카페 정보를 저장하는 중입니다.')

    const response = await fetch('/api/admin/cafes', {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(toCafePayload(form)),
    })

    if (!response.ok) {
      const errorMessage = await readApiErrorMessage(response)
      setMessage(`저장 실패: ${errorMessage}`)
      return
    }

    await loadCafes()
    if (activeReportId) {
      await updateReportStatus(activeReportId, 'approved')
    }
    setForm(EMPTY_FORM)
    setEditingId(null)
    setActiveReportId(null)
    setMessage(activeReportId ? '카페를 저장하고 제보를 승인 처리했습니다.' : '저장했습니다.')
  }

  async function deleteCafe(id: string) {
    setMessage('카페를 삭제하는 중입니다.')

    const response = await fetch(`/api/admin/cafes?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
      credentials: 'same-origin',
    })

    if (!response.ok) {
      const errorMessage = await readApiErrorMessage(response)
      setMessage(`삭제 실패: ${errorMessage}`)
      return
    }

    await loadCafes()
    setMessage('삭제했습니다.')
  }

  return (
    <main className="min-h-dvh bg-[#f3eee7] px-5 py-6 text-[#2c2118]">
      <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
        <section className="rounded-lg border border-[#eadfd3] bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <Coffee size={20} />
            <h1 className="text-xl font-black">카페 관리</h1>
          </div>
          {message && <p className="mt-3 text-sm font-bold text-[#8b5a32]">{message}</p>}

          <form onSubmit={searchKakaoPlaces} className="mt-5 flex gap-2">
            <input
              value={kakaoQuery}
              onChange={(event) => setKakaoQuery(event.target.value)}
              placeholder="안산 카페 검색"
              className="h-10 min-w-0 flex-1 rounded-md border border-[#d8c8b8] px-3 text-sm font-semibold outline-none focus:border-[#d66612]"
            />
            <button type="submit" className="flex h-10 w-10 items-center justify-center rounded-md bg-[#5a2e11] text-white">
              <Search size={17} />
            </button>
          </form>

          <div className="mt-4 space-y-2">
            {places.map((place) => (
              <button
                key={place.kakaoPlaceId}
                type="button"
                onClick={() => applyPlace(place)}
                className="w-full rounded-md border border-[#eadfd3] p-3 text-left hover:border-[#d66612]"
              >
                <span className="block text-sm font-black">{place.name}</span>
                <span className="mt-1 flex items-start gap-1 text-xs font-semibold text-[#7a6654]">
                  <MapPin size={13} />
                  {place.address}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-[#eadfd3] bg-white p-4 shadow-sm lg:col-start-1">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-black">제보 리스트</h2>
            <span className="rounded-full bg-[#f7eee5] px-3 py-1 text-xs font-black text-[#8b5a32]">
              대기 {pendingReports.length}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {reports.length === 0 && (
              <p className="rounded-md border border-dashed border-[#d8c8b8] px-3 py-4 text-sm font-bold text-[#7a6654]">
                표시할 제보가 없습니다.
              </p>
            )}

            {reports.map((report) => (
              <article key={report.id} className="rounded-md border border-[#eadfd3] p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-sm font-black">{report.name ?? '이름 없음'}</h3>
                      <ReportStatusBadge status={report.status} />
                    </div>
                    <p className="mt-1 text-xs font-semibold text-[#7a6654]">
                      {report.type === 'new_place' ? '신규 장소' : '정보 수정'} · {report.nickname}
                    </p>
                    {report.address && (
                      <p className="mt-2 flex items-start gap-1 text-xs font-semibold text-[#7a6654]">
                        <MapPin size={13} />
                        {report.address}
                      </p>
                    )}
                    {report.memo && <p className="mt-2 text-xs font-semibold text-[#5f4634]">{report.memo}</p>}
                    {report.correctionTypes.length > 0 && (
                      <p className="mt-2 text-xs font-bold text-[#8b5a32]">
                        수정 요청: {report.correctionTypes.join(', ')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => void updateReportStatus(report.id, 'approved')}
                    className="flex h-9 items-center justify-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 text-xs font-black text-[#236c3a] transition-all duration-150 hover:-translate-y-0.5 hover:bg-emerald-100 hover:shadow-sm active:translate-y-0 active:scale-95"
                  >
                    <CheckCircle2 size={14} />
                    승인
                  </button>
                  <button
                    type="button"
                    onClick={() => void updateReportStatus(report.id, 'rejected')}
                    className="flex h-9 items-center justify-center gap-1 rounded-md border border-red-200 bg-red-50 text-xs font-black text-red-700 transition-all duration-150 hover:-translate-y-0.5 hover:bg-red-100 hover:shadow-sm active:translate-y-0 active:scale-95"
                  >
                    <XCircle size={14} />
                    반려
                  </button>
                  <button
                    type="button"
                    onClick={() => void updateReportStatus(report.id, 'pending')}
                    className="flex h-9 items-center justify-center rounded-md border border-amber-200 bg-amber-50 text-xs font-black text-[#9a4f0f] transition-all duration-150 hover:-translate-y-0.5 hover:bg-amber-100 hover:shadow-sm active:translate-y-0 active:scale-95"
                  >
                    대기
                  </button>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => applyReport(report)}
                    className="h-9 rounded-md bg-[#5a2e11] text-xs font-black text-white shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:bg-[#6b3715] hover:shadow-md active:translate-y-0 active:scale-95"
                  >
                    폼 채워넣기
                  </button>
                  <button
                    type="button"
                    onClick={() => void deleteReport(report.id)}
                    className="flex h-9 items-center justify-center gap-1 rounded-md border border-neutral-300 bg-white text-xs font-black text-neutral-700 transition-all duration-150 hover:-translate-y-0.5 hover:border-red-200 hover:bg-red-50 hover:text-red-700 hover:shadow-sm active:translate-y-0 active:scale-95"
                  >
                    <Trash2 size={14} />
                    삭제
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-5 lg:col-start-2 lg:row-span-2 lg:row-start-1 xl:grid-cols-[minmax(0,1fr)_420px]">
          <CafeFormPanel
            form={form}
            editingId={editingId}
            onFormChange={setForm}
            onSubmit={saveCafe}
            onCancel={() => {
              setEditingId(null)
              setActiveReportId(null)
              setForm(EMPTY_FORM)
            }}
          />

          <div className="rounded-lg border border-[#eadfd3] bg-white p-4 shadow-sm">
            <h2 className="text-lg font-black">등록된 카페</h2>
            <div className="mt-4 space-y-2">
              {sortedCafes.map((cafe) => (
                <article key={cafe.id} className="rounded-md border border-[#eadfd3] p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-black">{cafe.name}</h3>
                      <p className="mt-1 truncate text-xs font-semibold text-[#7a6654]">{cafe.address}</p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button type="button" onClick={() => editCafe(cafe)} className="rounded-md p-2 text-[#5a2e11] hover:bg-[#f7eee5]">
                        <Pencil size={15} />
                      </button>
                      <button type="button" onClick={() => deleteCafe(cafe.id)} className="rounded-md p-2 text-red-700 hover:bg-red-50">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

interface CafeFormPanelProps {
  form: CafeForm
  editingId: string | null
  onFormChange: (form: CafeForm) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onCancel: () => void
}

function CafeFormPanel({ form, editingId, onFormChange, onSubmit, onCancel }: CafeFormPanelProps) {
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageMessage, setImageMessage] = useState('')
  const imageUrl = form.images?.[0] ?? ''

  function applyImageUrl(value: string) {
    const nextUrl = value.trim()

    onFormChange({ ...form, images: nextUrl ? [nextUrl] : [] })
    setImageMessage(nextUrl ? '대표 이미지 링크를 반영했습니다.' : '대표 이미지 링크를 비웠습니다.')
  }

  async function uploadCafeImage(file: File) {
    if (!form.id.trim()) {
      setImageMessage('이미지 업로드 전 카페 ID를 먼저 입력해주세요.')
      return
    }

    setUploadingImage(true)
    setImageMessage('이미지를 업로드하는 중입니다.')

    const body = new FormData()
    body.append('file', file)
    body.append('cafeId', form.id)

    const response = await fetch('/api/admin/cafe-images', {
      method: 'POST',
      credentials: 'same-origin',
      body,
    })

    setUploadingImage(false)

    if (!response.ok) {
      const errorMessage = await readApiErrorMessage(response)
      setImageMessage(`이미지 업로드 실패: ${errorMessage}`)
      return
    }

    const result = await response.json() as { url?: unknown }

    if (typeof result.url !== 'string') {
      setImageMessage('이미지 URL을 받지 못했습니다.')
      return
    }

    onFormChange({ ...form, images: [result.url] })
    setImageMessage('대표 이미지를 업로드했습니다.')
  }

  return (
    <form onSubmit={onSubmit} className="min-w-0 rounded-lg border border-[#eadfd3] bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-black">{editingId ? '카페 수정' : '카페 추가'}</h2>
        {editingId && (
          <button type="button" onClick={onCancel} className="rounded-md border border-[#eadfd3] px-3 py-2 text-xs font-black">
            취소
          </button>
        )}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <TextInput label="ID" value={form.id} onChange={(id) => onFormChange({ ...form, id })} />
        <TextInput label="이름" value={form.name} onChange={(name) => onFormChange({ ...form, name })} />
        <TextInput label="주소" value={form.address} onChange={(address) => onFormChange({ ...form, address })} />
        <TextInput label="전화번호" value={form.phone ?? ''} onChange={(phone) => onFormChange({ ...form, phone })} />
        <TextInput label="위도" value={String(form.lat)} onChange={(lat) => onFormChange({ ...form, lat: Number.parseFloat(lat) || DEFAULT_LAT })} />
        <TextInput label="경도" value={String(form.lng)} onChange={(lng) => onFormChange({ ...form, lng: Number.parseFloat(lng) || DEFAULT_LNG })} />
        <TextInput label="영업시간" value={form.openHours} onChange={(openHours) => onFormChange({ ...form, openHours })} />
        <TextInput label="인스타그램" value={form.instagramHandle ?? ''} onChange={(instagramHandle) => onFormChange({ ...form, instagramHandle })} />
        <TextInput label="카카오 장소 ID" value={form.kakaoPlaceId ?? ''} onChange={(kakaoPlaceId) => onFormChange({ ...form, kakaoPlaceId })} />
        <TextInput label="점수" value={form.qualityScore} onChange={(qualityScore) => onFormChange({ ...form, qualityScore })} />
      </div>

      <TextArea label="짧은 설명" value={form.shortDescription} onChange={(shortDescription) => onFormChange({ ...form, shortDescription })} />
      <TextArea label="상세 설명" value={form.fullDescription} onChange={(fullDescription) => onFormChange({ ...form, fullDescription })} />

      <label className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-[#eadfd3] bg-[#fffaf5] px-3 py-3 text-sm font-bold text-[#5f4634]">
        <span>
          <span className="block font-black">지도 마커 김 모션</span>
          <span className="mt-0.5 block text-xs font-semibold text-[#8b7a68]">
            이 카페 마커 위에 커피 김을 표시합니다.
          </span>
        </span>
        <input
          type="checkbox"
          checked={form.showAroma ?? true}
          onChange={(event) => onFormChange({ ...form, showAroma: event.target.checked })}
          className="h-5 w-5 accent-[#d66612]"
        />
      </label>

      <fieldset className="mt-4 min-w-0 rounded-lg border border-[#eadfd3] bg-[#fffaf5] p-3">
        <legend className="px-1 text-sm font-black text-[#5f4634]">대표 이미지</legend>
        {imageUrl ? (
          <div className="mt-2 min-w-0 overflow-hidden rounded-md border border-[#eadfd3] bg-white">
            <div
              aria-label={`${form.name || '카페'} 대표 이미지`}
              className="h-44 w-full bg-[#5a2e11] bg-cover bg-center"
              style={{ backgroundImage: `url(${imageUrl})` }}
            />
            <div className="flex min-w-0 items-center justify-between gap-2 px-3 py-2">
              <p className="min-w-0 flex-1 break-all text-xs font-semibold leading-5 text-[#7a6654]">{imageUrl}</p>
              <button
                type="button"
                onClick={() => onFormChange({ ...form, images: [] })}
                className="shrink-0 rounded-md border border-red-200 px-2 py-1 text-xs font-black text-red-700 hover:bg-red-50"
              >
                제거
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-2 rounded-md border border-dashed border-[#d8c8b8] bg-white px-3 py-4 text-sm font-bold text-[#7a6654]">
            아직 등록된 대표 이미지가 없습니다.
          </p>
        )}

        <label className="mt-3 block text-sm font-bold text-[#5f4634]">
          이미지 링크 / 카카오맵 이미지 주소
          <input
            value={imageUrl}
            onChange={(event) => applyImageUrl(event.target.value)}
            placeholder="https://... 이미지 주소를 붙여넣기"
            className="mt-1 h-10 w-full min-w-0 rounded-md border border-[#d8c8b8] bg-white px-3 text-sm font-semibold outline-none focus:border-[#d66612]"
          />
        </label>
        <p className="mt-1 text-xs font-semibold leading-5 text-[#8b7a68]">
          카카오맵 장소 페이지 주소가 아니라, 브라우저에서 복사한 실제 이미지 주소를 넣어야 미리보기가 표시됩니다.
        </p>

        <label className="mt-3 flex h-11 cursor-pointer items-center justify-center gap-2 rounded-md bg-[#5a2e11] text-sm font-black text-white opacity-100">
          <ImagePlus size={16} />
          {uploadingImage ? '업로드 중' : '이미지 업로드'}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            disabled={uploadingImage}
            onChange={(event) => {
              const file = event.target.files?.[0]
              event.target.value = ''
              if (!file) return
              void uploadCafeImage(file)
            }}
            className="sr-only"
          />
        </label>
        {imageMessage && <p className="mt-2 text-xs font-bold text-[#8b5a32]">{imageMessage}</p>}
      </fieldset>

      <CheckboxGroup label="로스팅" values={ROAST_LEVELS} selected={form.roastLevels} onChange={(roastLevels) => onFormChange({ ...form, roastLevels })} />
      <CheckboxGroup label="원두 산지" values={BEAN_ORIGINS} selected={form.beanOrigins} onChange={(beanOrigins) => onFormChange({ ...form, beanOrigins })} />
      <CheckboxGroup label="추출 방식" values={BREW_METHODS} selected={form.brewMethods} onChange={(brewMethods) => onFormChange({ ...form, brewMethods })} />

      <TextInput label="태그 (, 구분)" value={toCsv(form.tags)} onChange={(value) => onFormChange({ ...form, tags: fromCsv(value) })} />
      <TextInput label="휴무일 (, 구분)" value={toCsv(form.closedDays)} onChange={(value) => onFormChange({ ...form, closedDays: fromCsv(value) })} />

      <button type="submit" className="mt-5 h-11 w-full rounded-md bg-[#d66612] text-sm font-black text-white">
        저장
      </button>
    </form>
  )
}

function ReportStatusBadge({ status }: { status: ReportStatus }) {
  const label: Record<ReportStatus, string> = {
    pending: '대기',
    approved: '승인',
    rejected: '반려',
  }
  const className: Record<ReportStatus, string> = {
    pending: 'bg-[#fff7ed] text-[#9a4f0f]',
    approved: 'bg-[#ecfdf3] text-[#236c3a]',
    rejected: 'bg-[#fef2f2] text-red-700',
  }

  return (
    <span className={`rounded-full px-2 py-1 text-[11px] font-black ${className[status]}`}>
      {label[status]}
    </span>
  )
}

interface TextInputProps {
  label: string
  value: string
  onChange: (value: string) => void
}

function TextInput({ label, value, onChange }: TextInputProps) {
  return (
    <label className="block text-sm font-bold text-[#5f4634]">
      {label}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-10 w-full rounded-md border border-[#d8c8b8] px-3 text-sm font-semibold outline-none focus:border-[#d66612]"
      />
    </label>
  )
}

function TextArea({ label, value, onChange }: TextInputProps) {
  return (
    <label className="mt-3 block text-sm font-bold text-[#5f4634]">
      {label}
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        className="mt-1 w-full rounded-md border border-[#d8c8b8] px-3 py-2 text-sm font-semibold outline-none focus:border-[#d66612]"
      />
    </label>
  )
}

interface CheckboxGroupProps<T extends string> {
  label: string
  values: T[]
  selected: T[]
  onChange: (values: T[]) => void
}

function CheckboxGroup<T extends string>({ label, values, selected, onChange }: CheckboxGroupProps<T>) {
  return (
    <fieldset className="mt-4">
      <legend className="text-sm font-black text-[#5f4634]">{label}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {values.map((value) => {
          const checked = selected.includes(value)
          return (
            <label key={value} className="flex items-center gap-2 rounded-full border border-[#eadfd3] px-3 py-2 text-xs font-black">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onChange(checked ? selected.filter((item) => item !== value) : [...selected, value])}
              />
              {value}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
