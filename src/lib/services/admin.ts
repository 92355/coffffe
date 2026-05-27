import 'server-only'

import type { ReportStatus } from '@/types/report'
import { parseCafePayload } from '@/lib/validation/cafe'
import { parseBeanPayload } from '@/lib/validation/bean'
import {
  listCafes,
  upsertCafe,
  updateCafe,
  deleteCafe,
  cafeToDbWrite,
} from '@/lib/repositories/cafe'
import {
  listMembers,
  updateMember,
  deleteMember,
  listReports,
  updateReportStatus,
  deleteReport,
  insertBean,
  updateBean,
  deleteBean,
  uploadCafeImage,
  uploadAvatar,
  insertReport,
  type MemberUpdate,
} from '@/lib/repositories/admin'
import { listAllReviewsForAdmin, deleteReview } from '@/lib/cafeFootprint'
import type { Cafe } from '@/types/cafe'
import type { CafeReport } from '@/types/report'

export { type MemberRow } from '@/lib/repositories/admin'

// ── Cafes ──────────────────────────────────────────────────────────────────

export async function adminListCafes(): Promise<Cafe[]> {
  return listCafes()
}

export async function adminSaveCafe(body: unknown): Promise<Cafe> {
  const payload = parseCafePayload(body)
  return upsertCafe(cafeToDbWrite(payload))
}

export async function adminUpdateCafe(body: unknown): Promise<Cafe> {
  const payload = parseCafePayload(body)
  return updateCafe(cafeToDbWrite(payload))
}

export async function adminDeleteCafe(id: string): Promise<void> {
  return deleteCafe(id)
}

// ── Members ────────────────────────────────────────────────────────────────

export { listMembers, updateMember, deleteMember }
export type { MemberUpdate }

// ── Reports ────────────────────────────────────────────────────────────────

export async function adminListReports(): Promise<CafeReport[]> {
  return listReports()
}

export async function adminUpdateReportStatus(id: string, status: ReportStatus): Promise<CafeReport> {
  return updateReportStatus(id, status)
}

export async function adminDeleteReport(id: string): Promise<void> {
  return deleteReport(id)
}

// ── Reviews ────────────────────────────────────────────────────────────────

export { listAllReviewsForAdmin, deleteReview as adminDeleteReview }

// ── Beans ──────────────────────────────────────────────────────────────────

export async function adminInsertBean(body: unknown): Promise<void> {
  const p = parseBeanPayload(body)
  return insertBean({
    id: p.id,
    name: p.name,
    name_en: p.nameEn,
    origin: p.origin,
    region: p.region,
    variety: p.variety,
    process: p.process,
    roast: p.roast,
    notes: p.notes,
    body: p.body,
    acidity: p.acidity,
    description: p.desc,
    flag: p.flag,
    special: p.special,
  })
}

export async function adminUpdateBean(body: unknown): Promise<void> {
  const p = parseBeanPayload(body)
  return updateBean(p.id, {
    name: p.name,
    name_en: p.nameEn,
    origin: p.origin,
    region: p.region,
    variety: p.variety,
    process: p.process,
    roast: p.roast,
    notes: p.notes,
    body: p.body,
    acidity: p.acidity,
    description: p.desc,
    flag: p.flag,
    special: p.special,
  })
}

export { deleteBean as adminDeleteBean }

// ── Storage ────────────────────────────────────────────────────────────────

export { uploadCafeImage, uploadAvatar }

// ── User-facing report insert ──────────────────────────────────────────────

import { parseReportPayload } from '@/lib/validation/report'

export async function submitReport(body: unknown, userId: string | null = null): Promise<{ id: string }> {
  const p = parseReportPayload(body)
  return insertReport({
    type: p.type,
    cafe_id: p.cafeId ?? null,
    kakao_place_id: p.kakaoPlaceId ?? null,
    name: p.name ?? null,
    address: p.address ?? null,
    lat: p.lat ?? null,
    lng: p.lng ?? null,
    image_url: p.imageUrl ?? null,
    correction_types: p.correctionTypes,
    memo: p.memo ?? null,
    anonymous_id: p.anonymousId,
    user_id: userId,
    nickname: p.nickname,
  })
}
