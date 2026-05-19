'use client'

import { FormEvent, startTransition, useEffect, useMemo, useState } from 'react'
import { Coffee, MapPin, Pencil, Search, Trash2 } from 'lucide-react'
import type { BeanOrigin, BrewMethod, Cafe, RoastLevel } from '@/types/cafe'

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
  phone: '',
  instagramHandle: '',
  kakaoPlaceId: '',
}

function slugify(value: string, fallback: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return slug || fallback
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
    phone: form.phone || undefined,
    instagramHandle: form.instagramHandle || undefined,
    kakaoPlaceId: form.kakaoPlaceId || undefined,
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
  const [form, setForm] = useState<CafeForm>(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [kakaoQuery, setKakaoQuery] = useState('')
  const [places, setPlaces] = useState<KakaoPlace[]>([])
  const [message, setMessage] = useState('')

  const sortedCafes = useMemo(
    () => [...cafes].sort((a, b) => b.qualityScore - a.qualityScore),
    [cafes],
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
      void loadCafes().catch((error) => {
        console.error(error)
        setMessage('카페 목록을 불러오지 못했습니다.')
      })
    })
  }, [])

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
      id: current.id || slugify(place.name, `kakao-${place.kakaoPlaceId}`),
      name: place.name,
      address: place.address,
      lat: place.lat,
      lng: place.lng,
      phone: place.phone ?? '',
      kakaoPlaceId: place.kakaoPlaceId,
    }))
  }

  function editCafe(cafe: Cafe) {
    setEditingId(cafe.id)
    setForm({
      ...cafe,
      qualityScore: String(cafe.qualityScore),
      phone: cafe.phone ?? '',
      instagramHandle: cafe.instagramHandle ?? '',
      kakaoPlaceId: cafe.kakaoPlaceId ?? '',
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
    setForm(EMPTY_FORM)
    setEditingId(null)
    setMessage('저장했습니다.')
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

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
          <CafeFormPanel
            form={form}
            editingId={editingId}
            onFormChange={setForm}
            onSubmit={saveCafe}
            onCancel={() => {
              setEditingId(null)
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
  return (
    <form onSubmit={onSubmit} className="rounded-lg border border-[#eadfd3] bg-white p-4 shadow-sm">
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
