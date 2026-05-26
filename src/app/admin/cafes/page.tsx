'use client'

import { FormEvent, startTransition, useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Coffee, ImagePlus, MapPin, Pencil, Search, Trash2 } from 'lucide-react'
import type { BeanOrigin, BrewMethod, Cafe, RoastLevel } from '@/types/cafe'

const ROAST_LEVELS: RoastLevel[] = ['light', 'medium-light', 'medium', 'medium-dark', 'dark']
const BEAN_ORIGINS: BeanOrigin[] = [
  'ethiopia', 'colombia', 'kenya', 'brazil', 'guatemala',
  'indonesia', 'panama', 'rwanda', 'costa-rica',
]
const BREW_METHODS: BrewMethod[] = ['espresso', 'pour-over', 'cold-brew', 'aeropress', 'siphon']
const DEFAULT_SCORE = 4.5
const DEFAULT_LAT = 37.3084
const DEFAULT_LNG = 126.8419

const PREFILL_KEY = 'wonduro_admin_cafe_prefill'

interface KakaoPlace {
  kakaoPlaceId: string
  name: string
  address: string
  lat: number
  lng: number
  phone?: string
  placeUrl: string
}

type CafeForm = Omit<Cafe, 'qualityScore'> & { qualityScore: string }

const EMPTY_FORM: CafeForm = {
  id: '', name: '', shortDescription: '', fullDescription: '',
  address: '', lat: DEFAULT_LAT, lng: DEFAULT_LNG,
  roastLevels: [], beanOrigins: [], brewMethods: [],
  qualityScore: String(DEFAULT_SCORE), tags: [], openHours: '',
  closedDays: [], images: [], phone: '', instagramHandle: '',
  kakaoPlaceId: '',
}

function slugify(value: string, fallback: string): string {
  const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  return slug || fallback
}

function createKakaoCafeId(place: KakaoPlace): string {
  return `${slugify(place.name, 'kakao')}-${place.kakaoPlaceId}`
}

function toCsv(values: string[]): string { return values.join(', ') }
function fromCsv(value: string): string[] {
  return value.split(',').map(item => item.trim()).filter(Boolean)
}

function toCafePayload(form: CafeForm): Cafe {
  return {
    ...form,
    qualityScore: Number.parseFloat(form.qualityScore),
    images: form.images ?? [],
    phone: form.phone || undefined,
    instagramHandle: form.instagramHandle || undefined,
    kakaoPlaceId: form.kakaoPlaceId || undefined,
  }
}

async function readApiErrorMessage(response: Response): Promise<string> {
  try {
    const body = await response.json() as { error?: unknown }
    return typeof body.error === 'string' ? body.error : `Request failed: ${response.status}`
  } catch {
    return `Request failed: ${response.status}`
  }
}

export default function CafesAdminPage() {
  const [cafes, setCafes] = useState<Cafe[]>([])
  const [form, setForm] = useState<CafeForm>(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [activeReportId, setActiveReportId] = useState<string | null>(null)
  const [kakaoQuery, setKakaoQuery] = useState('')
  const [places, setPlaces] = useState<KakaoPlace[]>([])
  const [message, setMessage] = useState('')

  const sortedCafes = useMemo(() => [...cafes].sort((a, b) => b.qualityScore - a.qualityScore), [cafes])

  async function loadCafes() {
    const res = await fetch('/api/admin/cafes', { cache: 'no-store', credentials: 'same-origin' })
    if (!res.ok) throw new Error(await readApiErrorMessage(res))
    setCafes(await res.json() as Cafe[])
  }

  useEffect(() => {
    startTransition(() => {
      void loadCafes().catch(err => {
        console.error(err)
        setMessage('카페 목록을 불러오지 못했습니다.')
      })
    })

    // 제보 페이지에서 전달한 prefill 데이터 적용
    try {
      const raw = sessionStorage.getItem(PREFILL_KEY)
      if (raw) {
        const { reportId, formData } = JSON.parse(raw) as { reportId: string; formData: CafeForm }
        sessionStorage.removeItem(PREFILL_KEY)
        queueMicrotask(() => {
          setForm(formData)
          setEditingId(null)
          setActiveReportId(reportId)
          setMessage('제보 내용을 카페 등록 폼에 채웠습니다.')
        })
      }
    } catch { /* ignore */ }
  }, [])

  async function searchKakaoPlaces(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('카카오 장소를 검색하는 중입니다.')
    const res = await fetch(`/api/kakao/search?query=${encodeURIComponent(kakaoQuery)}`)
    if (!res.ok) { setMessage('카카오 장소 검색에 실패했습니다.'); return }
    setPlaces(await res.json() as KakaoPlace[])
    setMessage('')
  }

  function applyPlace(place: KakaoPlace) {
    setForm(f => ({
      ...f,
      id: editingId ? f.id : createKakaoCafeId(place),
      name: place.name, address: place.address,
      lat: place.lat, lng: place.lng,
      phone: place.phone ?? '', kakaoPlaceId: place.kakaoPlaceId,
    }))
  }

  async function saveCafe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('카페 정보를 저장하는 중입니다.')
    const res = await fetch('/api/admin/cafes', {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(toCafePayload(form)),
    })
    if (!res.ok) { setMessage(`저장 실패: ${await readApiErrorMessage(res)}`); return }
    await loadCafes()
    if (activeReportId) {
      await fetch('/api/admin/reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ id: activeReportId, status: 'approved' }),
      })
    }
    setForm(EMPTY_FORM)
    setEditingId(null)
    setActiveReportId(null)
    setMessage(activeReportId ? '카페를 저장하고 제보를 승인 처리했습니다.' : '저장했습니다.')
  }

  async function deleteCafe(id: string) {
    setMessage('카페를 삭제하는 중입니다.')
    const res = await fetch(`/api/admin/cafes?id=${encodeURIComponent(id)}`, {
      method: 'DELETE', credentials: 'same-origin',
    })
    if (!res.ok) { setMessage(`삭제 실패: ${await readApiErrorMessage(res)}`); return }
    await loadCafes()
    setMessage('삭제했습니다.')
  }

  function editCafe(cafe: Cafe) {
    setEditingId(cafe.id)
    setActiveReportId(null)
    setForm({
      ...cafe,
      qualityScore: String(cafe.qualityScore),
      images: cafe.images ?? [], phone: cafe.phone ?? '',
      instagramHandle: cafe.instagramHandle ?? '',
      kakaoPlaceId: cafe.kakaoPlaceId ?? '',
    })
  }

  return (
    <div className="px-5 py-6">
      <div className="flex items-center gap-2 mb-6">
        <Coffee size={20} className="text-[#5a2e11]" />
        <h1 className="text-xl font-black text-[#3f2618]">카페 관리</h1>
      </div>

      <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
        {/* Kakao search */}
        <section className="rounded-lg border border-[#eadfd3] bg-white p-4 shadow-sm">
          <h2 className="text-base font-black text-[#3f2618] mb-3">카카오 장소 검색</h2>
          {message && <p className="mb-3 text-sm font-bold text-[#8b5a32]">{message}</p>}
          <form onSubmit={searchKakaoPlaces} className="flex gap-2">
            <input
              value={kakaoQuery}
              onChange={e => setKakaoQuery(e.target.value)}
              placeholder="카페 검색"
              className="h-10 min-w-0 flex-1 rounded-md border border-[#d8c8b8] px-3 text-sm font-semibold outline-none focus:border-[#d66612]"
            />
            <button type="submit" className="flex h-10 w-10 items-center justify-center rounded-md bg-[#5a2e11] text-white">
              <Search size={17} />
            </button>
          </form>
          <div className="mt-4 space-y-2">
            {places.map(place => (
              <button
                key={place.kakaoPlaceId}
                type="button"
                onClick={() => applyPlace(place)}
                className="w-full rounded-md border border-[#eadfd3] p-3 text-left hover:border-[#d66612]"
              >
                <span className="block text-sm font-black">{place.name}</span>
                <span className="mt-1 flex items-start gap-1 text-xs font-semibold text-[#7a6654]">
                  <MapPin size={13} />{place.address}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Cafe form + list */}
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
          <CafeFormPanel
            form={form} editingId={editingId} onFormChange={setForm} onSubmit={saveCafe}
            onCancel={() => { setEditingId(null); setActiveReportId(null); setForm(EMPTY_FORM) }}
          />

          <div className="rounded-lg border border-[#eadfd3] bg-white p-4 shadow-sm">
            <h2 className="text-base font-black text-[#3f2618] mb-4">등록된 카페 ({sortedCafes.length})</h2>
            <div className="space-y-2">
              {sortedCafes.map(cafe => (
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
                      <button type="button" onClick={() => void deleteCafe(cafe.id)} className="rounded-md p-2 text-red-700 hover:bg-red-50">
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
    </div>
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
    if (!form.id.trim()) { setImageMessage('이미지 업로드 전 카페 ID를 먼저 입력해주세요.'); return }
    setUploadingImage(true)
    setImageMessage('이미지를 업로드하는 중입니다.')
    const body = new FormData()
    body.append('file', file)
    body.append('cafeId', form.id)
    const res = await fetch('/api/admin/cafe-images', { method: 'POST', credentials: 'same-origin', body })
    setUploadingImage(false)
    if (!res.ok) {
      const err = await res.json() as { error?: unknown }
      setImageMessage(`이미지 업로드 실패: ${typeof err.error === 'string' ? err.error : res.status}`)
      return
    }
    const result = await res.json() as { url?: unknown }
    if (typeof result.url !== 'string') { setImageMessage('이미지 URL을 받지 못했습니다.'); return }
    onFormChange({ ...form, images: [result.url] })
    setImageMessage('대표 이미지를 업로드했습니다.')
  }

  return (
    <form onSubmit={onSubmit} className="min-w-0 rounded-lg border border-[#eadfd3] bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-black">{editingId ? '카페 수정' : '카페 추가'}</h2>
        {editingId && (
          <button type="button" onClick={onCancel} className="rounded-md border border-[#eadfd3] px-3 py-2 text-xs font-black">취소</button>
        )}
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <TextInput label="ID" value={form.id} onChange={id => onFormChange({ ...form, id })} />
        <TextInput label="이름" value={form.name} onChange={name => onFormChange({ ...form, name })} />
        <TextInput label="주소" value={form.address} onChange={address => onFormChange({ ...form, address })} />
        <TextInput label="전화번호" value={form.phone ?? ''} onChange={phone => onFormChange({ ...form, phone })} />
        <TextInput label="위도" value={String(form.lat)} onChange={lat => onFormChange({ ...form, lat: Number.parseFloat(lat) || DEFAULT_LAT })} />
        <TextInput label="경도" value={String(form.lng)} onChange={lng => onFormChange({ ...form, lng: Number.parseFloat(lng) || DEFAULT_LNG })} />
        <TextInput label="영업시간" value={form.openHours} onChange={openHours => onFormChange({ ...form, openHours })} />
        <TextInput label="인스타그램" value={form.instagramHandle ?? ''} onChange={instagramHandle => onFormChange({ ...form, instagramHandle })} />
        <TextInput label="카카오 장소 ID" value={form.kakaoPlaceId ?? ''} onChange={kakaoPlaceId => onFormChange({ ...form, kakaoPlaceId })} />
        <TextInput label="점수" value={form.qualityScore} onChange={qualityScore => onFormChange({ ...form, qualityScore })} />
      </div>
      <TextArea label="짧은 설명" value={form.shortDescription} onChange={shortDescription => onFormChange({ ...form, shortDescription })} />
      <TextArea label="상세 설명" value={form.fullDescription} onChange={fullDescription => onFormChange({ ...form, fullDescription })} />
      <fieldset className="mt-4 min-w-0 rounded-lg border border-[#eadfd3] bg-[#fffaf5] p-3">
        <legend className="px-1 text-sm font-black text-[#5f4634]">대표 이미지</legend>
        {imageUrl ? (
          <div className="mt-2 min-w-0 overflow-hidden rounded-md border border-[#eadfd3] bg-white">
            <div aria-label={`${form.name || '카페'} 대표 이미지`} className="h-44 w-full bg-[#5a2e11] bg-cover bg-center" style={{ backgroundImage: `url(${imageUrl})` }} />
            <div className="flex min-w-0 items-center justify-between gap-2 px-3 py-2">
              <p className="min-w-0 flex-1 break-all text-xs font-semibold leading-5 text-[#7a6654]">{imageUrl}</p>
              <button type="button" onClick={() => onFormChange({ ...form, images: [] })} className="shrink-0 rounded-md border border-red-200 px-2 py-1 text-xs font-black text-red-700 hover:bg-red-50">제거</button>
            </div>
          </div>
        ) : (
          <p className="mt-2 rounded-md border border-dashed border-[#d8c8b8] bg-white px-3 py-4 text-sm font-bold text-[#7a6654]">아직 등록된 대표 이미지가 없습니다.</p>
        )}
        <label className="mt-3 block text-sm font-bold text-[#5f4634]">
          이미지 링크
          <input value={imageUrl} onChange={e => applyImageUrl(e.target.value)} placeholder="https://... 이미지 주소" className="mt-1 h-10 w-full min-w-0 rounded-md border border-[#d8c8b8] bg-white px-3 text-sm font-semibold outline-none focus:border-[#d66612]" />
        </label>
        <label className="mt-3 flex h-11 cursor-pointer items-center justify-center gap-2 rounded-md bg-[#5a2e11] text-sm font-black text-white">
          <ImagePlus size={16} />
          {uploadingImage ? '업로드 중' : '이미지 업로드'}
          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={uploadingImage} onChange={e => { const f = e.target.files?.[0]; e.target.value = ''; if (f) void uploadCafeImage(f) }} className="sr-only" />
        </label>
        {imageMessage && <p className="mt-2 text-xs font-bold text-[#8b5a32]">{imageMessage}</p>}
      </fieldset>
      <CheckboxGroup label="로스팅" values={ROAST_LEVELS} selected={form.roastLevels} onChange={roastLevels => onFormChange({ ...form, roastLevels })} />
      <CheckboxGroup label="원두 산지" values={BEAN_ORIGINS} selected={form.beanOrigins} onChange={beanOrigins => onFormChange({ ...form, beanOrigins })} />
      <CheckboxGroup label="추출 방식" values={BREW_METHODS} selected={form.brewMethods} onChange={brewMethods => onFormChange({ ...form, brewMethods })} />
      <TextInput label="태그 (, 구분)" value={toCsv(form.tags)} onChange={value => onFormChange({ ...form, tags: fromCsv(value) })} />
      <TextInput label="휴무일 (, 구분)" value={toCsv(form.closedDays)} onChange={value => onFormChange({ ...form, closedDays: fromCsv(value) })} />
      <button type="submit" className="mt-5 h-11 w-full rounded-md bg-[#d66612] text-sm font-black text-white">저장</button>
    </form>
  )
}

interface TextInputProps { label: string; value: string; onChange: (v: string) => void }
function TextInput({ label, value, onChange }: TextInputProps) {
  return (
    <label className="block text-sm font-bold text-[#5f4634]">
      {label}
      <input value={value} onChange={e => onChange(e.target.value)} className="mt-1 h-10 w-full rounded-md border border-[#d8c8b8] px-3 text-sm font-semibold outline-none focus:border-[#d66612]" />
    </label>
  )
}

function TextArea({ label, value, onChange }: TextInputProps) {
  return (
    <label className="mt-3 block text-sm font-bold text-[#5f4634]">
      {label}
      <textarea value={value} onChange={e => onChange(e.target.value)} rows={3} className="mt-1 w-full rounded-md border border-[#d8c8b8] px-3 py-2 text-sm font-semibold outline-none focus:border-[#d66612]" />
    </label>
  )
}

interface CheckboxGroupProps<T extends string> { label: string; values: T[]; selected: T[]; onChange: (v: T[]) => void }
function CheckboxGroup<T extends string>({ label, values, selected, onChange }: CheckboxGroupProps<T>) {
  return (
    <fieldset className="mt-4">
      <legend className="text-sm font-black text-[#5f4634]">{label}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {values.map(value => {
          const checked = selected.includes(value)
          return (
            <label key={value} className="flex items-center gap-2 rounded-full border border-[#eadfd3] px-3 py-2 text-xs font-black">
              <input type="checkbox" checked={checked} onChange={() => onChange(checked ? selected.filter(i => i !== value) : [...selected, value])} />
              {value}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

function CheckCircle2Icon() { return <CheckCircle2 size={14} /> }
void CheckCircle2Icon
