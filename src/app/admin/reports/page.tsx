'use client'

import { startTransition, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, MapPin, MessageSquare, Trash2, XCircle } from 'lucide-react'
import type { CafeReport, ReportStatus } from '@/types/report'

const PREFILL_KEY = 'wonduro_admin_cafe_prefill'
const DEFAULT_LAT = 37.3084
const DEFAULT_LNG = 126.8419

function createReportCafeId(report: CafeReport): string {
  const slug = (report.name ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'report'
  return `${slug}-${report.id.slice(0, 8)}`
}

async function readApiErrorMessage(response: Response): Promise<string> {
  try {
    const body = await response.json() as { error?: unknown }
    return typeof body.error === 'string' ? body.error : `Request failed: ${response.status}`
  } catch {
    return `Request failed: ${response.status}`
  }
}

export default function ReportsAdminPage() {
  const router = useRouter()
  const [reports, setReports] = useState<CafeReport[]>([])
  const [message, setMessage] = useState('')

  const pendingCount = reports.filter(r => r.status === 'pending').length

  async function loadReports() {
    const res = await fetch('/api/admin/reports', { cache: 'no-store', credentials: 'same-origin' })
    if (!res.ok) throw new Error(await readApiErrorMessage(res))
    setReports(await res.json() as CafeReport[])
  }

  useEffect(() => {
    startTransition(() => {
      void loadReports().catch(err => {
        console.error(err)
        setMessage('제보 목록을 불러오지 못했습니다.')
      })
    })
  }, [])

  async function updateStatus(id: string, status: ReportStatus) {
    setMessage('제보 상태를 변경하는 중입니다.')
    const res = await fetch('/api/admin/reports', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ id, status }),
    })
    if (!res.ok) { setMessage(`상태 변경 실패: ${await readApiErrorMessage(res)}`); return }
    await loadReports()
    setMessage('제보 상태를 변경했습니다.')
  }

  async function deleteReport(id: string) {
    setMessage('제보를 삭제하는 중입니다.')
    const res = await fetch(`/api/admin/reports?id=${encodeURIComponent(id)}`, {
      method: 'DELETE', credentials: 'same-origin',
    })
    if (!res.ok) { setMessage(`삭제 실패: ${await readApiErrorMessage(res)}`); return }
    await loadReports()
    setMessage('삭제했습니다.')
  }

  function applyReportToForm(report: CafeReport) {
    const reportMemo = report.memo ? `제보 메모: ${report.memo}` : '제보로 등록된 카페입니다.'
    const formData = {
      id: createReportCafeId(report),
      name: report.name ?? '',
      shortDescription: '제보로 등록된 카페입니다.',
      fullDescription: reportMemo,
      address: report.address ?? '',
      lat: report.lat ?? DEFAULT_LAT,
      lng: report.lng ?? DEFAULT_LNG,
      roastLevels: [],
      beanOrigins: [],
      brewMethods: [],
      qualityScore: '4.5',
      tags: [],
      openHours: '확인 필요',
      closedDays: [],
      images: [],
      phone: '',
      instagramHandle: '',
      kakaoPlaceId: report.kakaoPlaceId ?? '',
    }
    sessionStorage.setItem(PREFILL_KEY, JSON.stringify({ reportId: report.id, formData }))
    router.push('/admin/cafes')
  }

  return (
    <div className="px-5 py-6">
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare size={20} className="text-[#5a2e11]" />
        <h1 className="text-xl font-black text-[#3f2618]">제보 관리</h1>
        {pendingCount > 0 && (
          <span className="rounded-full bg-[#f7eee5] px-3 py-1 text-xs font-black text-[#8b5a32]">
            대기 {pendingCount}
          </span>
        )}
      </div>

      {message && <p className="mb-4 text-sm font-bold text-[#8b5a32]">{message}</p>}

      <div className="max-w-2xl space-y-3">
        {reports.length === 0 && (
          <p className="rounded-md border border-dashed border-[#d8c8b8] px-3 py-6 text-sm font-bold text-[#7a6654] text-center">
            표시할 제보가 없습니다.
          </p>
        )}

        {reports.map(report => (
          <article key={report.id} className="rounded-lg border border-[#eadfd3] bg-white p-4 shadow-sm">
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
                    <MapPin size={13} />{report.address}
                  </p>
                )}
                {report.memo && <p className="mt-2 text-xs font-semibold text-[#5f4634]">{report.memo}</p>}
                {report.correctionTypes.length > 0 && (
                  <p className="mt-2 text-xs font-bold text-[#8b5a32]">수정 요청: {report.correctionTypes.join(', ')}</p>
                )}
              </div>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              <button type="button" onClick={() => void updateStatus(report.id, 'approved')}
                className="flex h-9 items-center justify-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 text-xs font-black text-[#236c3a] hover:bg-emerald-100 transition-colors">
                <CheckCircle2 size={14} />승인
              </button>
              <button type="button" onClick={() => void updateStatus(report.id, 'rejected')}
                className="flex h-9 items-center justify-center gap-1 rounded-md border border-red-200 bg-red-50 text-xs font-black text-red-700 hover:bg-red-100 transition-colors">
                <XCircle size={14} />반려
              </button>
              <button type="button" onClick={() => void updateStatus(report.id, 'pending')}
                className="flex h-9 items-center justify-center rounded-md border border-amber-200 bg-amber-50 text-xs font-black text-[#9a4f0f] hover:bg-amber-100 transition-colors">
                대기
              </button>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => applyReportToForm(report)}
                className="h-9 rounded-md bg-[#5a2e11] text-xs font-black text-white hover:bg-[#6b3715] transition-colors">
                폼 채워넣기 →
              </button>
              <button type="button" onClick={() => void deleteReport(report.id)}
                className="flex h-9 items-center justify-center gap-1 rounded-md border border-neutral-300 bg-white text-xs font-black text-neutral-700 hover:border-red-200 hover:bg-red-50 hover:text-red-700 transition-colors">
                <Trash2 size={14} />삭제
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

function ReportStatusBadge({ status }: { status: ReportStatus }) {
  const label: Record<ReportStatus, string> = { pending: '대기', approved: '승인', rejected: '반려' }
  const cls: Record<ReportStatus, string> = {
    pending: 'bg-[#fff7ed] text-[#9a4f0f]',
    approved: 'bg-[#ecfdf3] text-[#236c3a]',
    rejected: 'bg-[#fef2f2] text-red-700',
  }
  return <span className={`rounded-full px-2 py-1 text-[11px] font-black ${cls[status]}`}>{label[status]}</span>
}
