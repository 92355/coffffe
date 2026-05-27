'use client'

import { type FormEvent, useState } from 'react'
import { ImagePlus, MapPin, Search } from 'lucide-react'
import type { BeanOrigin, BrewMethod, RoastLevel } from '@/types/cafe'
import { ROAST_LABELS, ORIGIN_LABELS, BREW_LABELS } from '@/types/cafe'
import TagInput from '@/components/admin/TagInput'

export const ROAST_LEVELS: RoastLevel[] = ['light', 'medium-light', 'medium', 'medium-dark', 'dark']
export const BEAN_ORIGINS: BeanOrigin[] = [
  'ethiopia', 'colombia', 'kenya', 'brazil', 'guatemala',
  'indonesia', 'panama', 'rwanda', 'costa-rica',
]
export const BREW_METHODS: BrewMethod[] = ['espresso', 'pour-over', 'cold-brew', 'aeropress', 'siphon']

const DEFAULT_LAT = 37.3084
const DEFAULT_LNG = 126.8419

export interface KakaoPlace {
  kakaoPlaceId: string
  name: string
  address: string
  lat: number
  lng: number
  phone?: string
  placeUrl: string
}

export type CafeForm = {
  id: string; name: string; shortDescription: string; fullDescription: string
  address: string; lat: number; lng: number
  roastLevels: RoastLevel[]; beanOrigins: BeanOrigin[]; brewMethods: BrewMethod[]
  tags: string[]; openHours: string; closedDays: string[]
  images: string[]; phone: string; instagramHandle: string; kakaoPlaceId: string
}

export const EMPTY_CAFE_FORM: CafeForm = {
  id: '', name: '', shortDescription: '', fullDescription: '',
  address: '', lat: DEFAULT_LAT, lng: DEFAULT_LNG,
  roastLevels: [], beanOrigins: [], brewMethods: [],
  tags: [], openHours: '', closedDays: [],
  images: [], phone: '', instagramHandle: '', kakaoPlaceId: '',
}

function slugify(value: string, fallback: string): string {
  const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  return slug || fallback
}

export function createKakaoCafeId(place: KakaoPlace): string {
  return `${slugify(place.name, 'kakao')}-${place.kakaoPlaceId}`
}

export function toCafePayload(form: CafeForm) {
  return {
    ...form,
    qualityScore: 0,
    images: form.images ?? [],
    phone: form.phone || undefined,
    instagramHandle: form.instagramHandle || undefined,
    kakaoPlaceId: form.kakaoPlaceId || undefined,
  }
}

// ── Kakao Search ───────────────────────────────────────────────────────────

interface KakaoSearchProps {
  onApply: (place: KakaoPlace) => void
}

export function KakaoSearch({ onApply }: KakaoSearchProps) {
  const [query, setQuery] = useState('')
  const [places, setPlaces] = useState<KakaoPlace[]>([])
  const [message, setMessage] = useState('')

  async function search(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMessage('검색 중...')
    const res = await fetch(`/api/kakao/search?query=${encodeURIComponent(query)}`)
    if (!res.ok) { setMessage('카카오 장소 검색 실패'); return }
    setPlaces(await res.json() as KakaoPlace[])
    setMessage('')
  }

  return (
    <div>
      <h3 className="text-sm font-black text-[#3f2618] mb-2">카카오 장소 검색</h3>
      {message && <p className="mb-2 text-xs font-bold text-[#8b5a32]">{message}</p>}
      <form onSubmit={search} className="flex gap-2">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="카페 검색"
          className="h-10 min-w-0 flex-1 rounded-md border border-[#d8c8b8] px-3 text-sm font-semibold outline-none focus:border-[#d66612]"
        />
        <button type="submit" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#5a2e11] text-white">
          <Search size={17} />
        </button>
      </form>
      <div className="mt-3 space-y-1.5">
        {places.map(place => (
          <button
            key={place.kakaoPlaceId}
            type="button"
            onClick={() => onApply(place)}
            className="w-full rounded-md border border-[#eadfd3] p-2.5 text-left hover:border-[#d66612]"
          >
            <span className="block text-sm font-black">{place.name}</span>
            <span className="mt-0.5 flex items-start gap-1 text-xs font-semibold text-[#7a6654]">
              <MapPin size={12} className="mt-0.5 shrink-0" />{place.address}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Cafe Form ──────────────────────────────────────────────────────────────

interface CafeFormProps {
  form: CafeForm
  editingId: string | null
  onFormChange: (form: CafeForm) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onCancel: () => void
  message?: string
  submitLabel?: string
}

export function CafeFormSection({ form, editingId, onFormChange, onSubmit, onCancel, message, submitLabel }: CafeFormProps) {
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageMessage, setImageMessage] = useState('')
  const imageUrl = form.images?.[0] ?? ''

  function applyImageUrl(value: string) {
    const nextUrl = value.trim()
    onFormChange({ ...form, images: nextUrl ? [nextUrl] : [] })
    setImageMessage(nextUrl ? '대표 이미지 링크 반영됨' : '이미지 비움')
  }

  async function uploadCafeImage(file: File) {
    if (!form.id.trim()) { setImageMessage('카페 ID를 먼저 입력해주세요'); return }
    setUploadingImage(true)
    setImageMessage('업로드 중...')
    const body = new FormData()
    body.append('file', file)
    body.append('cafeId', form.id)
    const res = await fetch('/api/admin/cafe-images', { method: 'POST', credentials: 'same-origin', body })
    setUploadingImage(false)
    if (!res.ok) {
      const err = await res.json() as { error?: unknown }
      setImageMessage(`업로드 실패: ${typeof err.error === 'string' ? err.error : res.status}`)
      return
    }
    const result = await res.json() as { url?: unknown }
    if (typeof result.url !== 'string') { setImageMessage('URL을 받지 못했습니다'); return }
    onFormChange({ ...form, images: [result.url] })
    setImageMessage('이미지 업로드 완료')
  }

  return (
    <form onSubmit={onSubmit} className="min-w-0">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="text-base font-black text-[#3f2618]">{editingId ? '카페 수정' : '카페 추가'}</h3>
        {editingId && (
          <button type="button" onClick={onCancel} className="rounded-md border border-[#eadfd3] px-3 py-1.5 text-xs font-black">취소</button>
        )}
      </div>

      {message && <p className="mb-3 text-sm font-bold text-[#8b5a32]">{message}</p>}

      <div className="grid gap-3 md:grid-cols-2">
        <FInput label="ID" value={form.id} onChange={id => onFormChange({ ...form, id })} />
        <FInput label="이름" value={form.name} onChange={name => onFormChange({ ...form, name })} />
        <FInput label="주소" value={form.address} onChange={address => onFormChange({ ...form, address })} />
        <FInput label="전화번호" value={form.phone} onChange={phone => onFormChange({ ...form, phone })} />
        <FInput label="영업시간" value={form.openHours} onChange={openHours => onFormChange({ ...form, openHours })} />
        <FInput label="인스타그램" value={form.instagramHandle} onChange={instagramHandle => onFormChange({ ...form, instagramHandle })} />
        <FInput label="카카오 장소 ID" value={form.kakaoPlaceId} onChange={kakaoPlaceId => onFormChange({ ...form, kakaoPlaceId })} />
      </div>

      <FTextArea label="짧은 설명" value={form.shortDescription} onChange={shortDescription => onFormChange({ ...form, shortDescription })} />
      <FTextArea label="상세 설명" value={form.fullDescription} onChange={fullDescription => onFormChange({ ...form, fullDescription })} />

      {/* 대표 이미지 */}
      <fieldset className="mt-4 min-w-0 rounded-lg border border-[#eadfd3] bg-[#fffaf5] p-3">
        <legend className="px-1 text-sm font-black text-[#5f4634]">대표 이미지</legend>
        {imageUrl ? (
          <div className="mt-2 overflow-hidden rounded-md border border-[#eadfd3] bg-white">
            <div className="h-44 w-full bg-[#5a2e11] bg-cover bg-center" style={{ backgroundImage: `url(${imageUrl})` }} />
            <div className="flex items-center justify-between gap-2 px-3 py-2">
              <p className="min-w-0 flex-1 break-all text-xs font-semibold text-[#7a6654]">{imageUrl}</p>
              <button type="button" onClick={() => onFormChange({ ...form, images: [] })} className="shrink-0 rounded-md border border-red-200 px-2 py-1 text-xs font-black text-red-700 hover:bg-red-50">제거</button>
            </div>
          </div>
        ) : (
          <p className="mt-2 rounded-md border border-dashed border-[#d8c8b8] bg-white px-3 py-4 text-sm font-bold text-[#7a6654]">대표 이미지 없음</p>
        )}
        <label className="mt-3 block text-sm font-bold text-[#5f4634]">
          이미지 링크
          <input value={imageUrl} onChange={e => applyImageUrl(e.target.value)} placeholder="https://..." className="mt-1 h-10 w-full rounded-md border border-[#d8c8b8] px-3 text-sm font-semibold outline-none focus:border-[#d66612]" />
        </label>
        <label className="mt-3 flex h-11 cursor-pointer items-center justify-center gap-2 rounded-md bg-[#5a2e11] text-sm font-black text-white">
          <ImagePlus size={16} />
          {uploadingImage ? '업로드 중' : '이미지 업로드'}
          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={uploadingImage} onChange={e => { const f = e.target.files?.[0]; e.target.value = ''; if (f) void uploadCafeImage(f) }} className="sr-only" />
        </label>
        {imageMessage && <p className="mt-2 text-xs font-bold text-[#8b5a32]">{imageMessage}</p>}
      </fieldset>

      <CheckboxGroup label="로스팅" values={ROAST_LEVELS} selected={form.roastLevels} getLabel={v => ROAST_LABELS[v]} onChange={roastLevels => onFormChange({ ...form, roastLevels })} />
      <CheckboxGroup label="원두 산지" values={BEAN_ORIGINS} selected={form.beanOrigins} getLabel={v => ORIGIN_LABELS[v]} onChange={beanOrigins => onFormChange({ ...form, beanOrigins })} />
      <CheckboxGroup label="추출 방식" values={BREW_METHODS} selected={form.brewMethods} getLabel={v => BREW_LABELS[v]} onChange={brewMethods => onFormChange({ ...form, brewMethods })} />

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <TagInput label="태그" values={form.tags} onChange={tags => onFormChange({ ...form, tags })} placeholder="태그 입력 후 Enter" />
        <TagInput label="휴무일" values={form.closedDays} onChange={closedDays => onFormChange({ ...form, closedDays })} placeholder="휴무일 입력 후 Enter" />
      </div>

      <div className="mt-5 flex gap-2">
        <button type="submit" className="flex-1 h-11 rounded-md bg-[#d66612] text-sm font-black text-white">
          {submitLabel ?? '저장'}
        </button>
        {!editingId && (
          <button type="button" onClick={onCancel} className="rounded-md border border-[#eadfd3] px-4 text-sm font-black text-[#5f4634]">초기화</button>
        )}
      </div>
    </form>
  )
}

// ── Primitives ─────────────────────────────────────────────────────────────

interface FInputProps { label: string; value: string; onChange: (v: string) => void; disabled?: boolean }
export function FInput({ label, value, onChange, disabled }: FInputProps) {
  return (
    <label className="block text-sm font-bold text-[#5f4634]">
      {label}
      <input value={value} onChange={e => onChange(e.target.value)} disabled={disabled} className="mt-1 h-10 w-full rounded-md border border-[#d8c8b8] px-3 text-sm font-semibold outline-none focus:border-[#d66612] disabled:bg-[#f7f4f0] disabled:opacity-60" />
    </label>
  )
}

interface FTextAreaProps { label: string; value: string; onChange: (v: string) => void }
export function FTextArea({ label, value, onChange }: FTextAreaProps) {
  return (
    <label className="mt-3 block text-sm font-bold text-[#5f4634]">
      {label}
      <textarea value={value} onChange={e => onChange(e.target.value)} rows={3} className="mt-1 w-full rounded-md border border-[#d8c8b8] px-3 py-2 text-sm font-semibold outline-none focus:border-[#d66612]" />
    </label>
  )
}

interface CheckboxGroupProps<T extends string> {
  label: string; values: T[]; selected: T[]
  getLabel?: (v: T) => string
  onChange: (v: T[]) => void
}
export function CheckboxGroup<T extends string>({ label, values, selected, getLabel, onChange }: CheckboxGroupProps<T>) {
  return (
    <fieldset className="mt-4">
      <legend className="text-sm font-black text-[#5f4634]">{label}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {values.map(value => {
          const checked = selected.includes(value)
          return (
            <label key={value} className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-black transition-colors ${checked ? 'border-[#d66612] bg-[#fff3e8] text-[#5a2e11]' : 'border-[#eadfd3] text-[#7a6654] hover:border-[#d8c8b8]'}`}>
              <input type="checkbox" checked={checked} onChange={() => onChange(checked ? selected.filter(i => i !== value) : [...selected, value])} className="sr-only" />
              {getLabel ? getLabel(value) : value}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

