'use client'

import { type FormEvent, startTransition, useEffect, useMemo, useState } from 'react'
import { Coffee, Pencil, Trash2 } from 'lucide-react'
import type { Cafe } from '@/types/cafe'
import {
  type CafeForm,
  type KakaoPlace,
  EMPTY_CAFE_FORM,
  createKakaoCafeId,
  toCafePayload,
  CafeFormSection,
  KakaoSearch,
} from '@/components/admin/CafeFormPanel'

const PREFILL_KEY = 'wonduro_admin_cafe_prefill'

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
  const [form, setForm] = useState<CafeForm>(EMPTY_CAFE_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [activeReportId, setActiveReportId] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  // created_at 기준 정렬은 API가 담당 — 클라이언트에서 추가 정렬 없음
  const cafeList = useMemo(() => cafes, [cafes])

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
    setMessage('저장 중...')
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
    setForm(EMPTY_CAFE_FORM)
    setEditingId(null)
    setActiveReportId(null)
    setMessage(activeReportId ? '카페 저장 + 제보 승인 완료' : '저장했습니다.')
  }

  function editCafe(cafe: Cafe) {
    setEditingId(cafe.id)
    setActiveReportId(null)
    setForm({
      id: cafe.id, name: cafe.name,
      shortDescription: cafe.shortDescription, fullDescription: cafe.fullDescription,
      address: cafe.address, lat: cafe.lat, lng: cafe.lng,
      roastLevels: cafe.roastLevels, beanOrigins: cafe.beanOrigins, brewMethods: cafe.brewMethods,
      tags: cafe.tags, openHours: cafe.openHours, closedDays: cafe.closedDays,
      images: cafe.images ?? [], phone: cafe.phone ?? '',
      instagramHandle: cafe.instagramHandle ?? '', kakaoPlaceId: cafe.kakaoPlaceId ?? '',
    })
  }

  function resetForm() {
    setEditingId(null)
    setActiveReportId(null)
    setForm(EMPTY_CAFE_FORM)
  }

  async function deleteCafe(id: string) {
    setMessage('삭제 중...')
    const res = await fetch(`/api/admin/cafes?id=${encodeURIComponent(id)}`, {
      method: 'DELETE', credentials: 'same-origin',
    })
    if (!res.ok) { setMessage(`삭제 실패: ${await readApiErrorMessage(res)}`); return }
    await loadCafes()
    setMessage('삭제했습니다.')
  }

  return (
    <div className="px-5 py-6">
      <div className="flex items-center gap-2 mb-6">
        <Coffee size={20} className="text-[#5a2e11]" />
        <h1 className="text-xl font-black text-[#3f2618]">카페 관리</h1>
      </div>

      <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
        {/* 카카오 검색 */}
        <section className="rounded-lg border border-[#eadfd3] bg-white p-4 shadow-sm">
          <KakaoSearch onApply={applyPlace} />
        </section>

        {/* 폼 + 목록 */}
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="rounded-lg border border-[#eadfd3] bg-white p-4 shadow-sm">
            <CafeFormSection
              form={form}
              editingId={editingId}
              onFormChange={setForm}
              onSubmit={saveCafe}
              onCancel={resetForm}
              message={message}
            />
          </div>

          <div className="rounded-lg border border-[#eadfd3] bg-white p-4 shadow-sm">
            <h2 className="text-base font-black text-[#3f2618] mb-4">등록된 카페 ({cafeList.length})</h2>
            <div className="space-y-2">
              {cafeList.map(cafe => (
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
