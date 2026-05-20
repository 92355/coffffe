import { NextRequest, NextResponse } from 'next/server'
import { isAuthorizedAdminRequest } from '@/lib/admin-auth'
import { createSupabaseAdminClient } from '@/lib/supabase'
import type { CafeReport, ReportStatus, ReportType } from '@/types/report'

interface DatabaseReport {
  id: string
  type: ReportType
  cafe_id: string | null
  kakao_place_id: string | null
  name: string | null
  address: string | null
  lat: number | null
  lng: number | null
  image_url: string | null
  correction_types: string[] | null
  memo: string | null
  anonymous_id: string
  nickname: string
  status: ReportStatus
  created_at: string
}

const REPORT_STATUSES: ReportStatus[] = ['pending', 'approved', 'rejected']

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message

  if (isRecord(error)) {
    const errorParts = ['message', 'details', 'hint', 'code']
      .map((key) => error[key])
      .filter((value): value is string => typeof value === 'string' && value.length > 0)

    if (errorParts.length > 0) return errorParts.join(' / ')
  }

  return 'Invalid request'
}

function badRequest(error: unknown) {
  return NextResponse.json({ error: toErrorMessage(error) }, { status: 400 })
}

function toReport(databaseReport: DatabaseReport): CafeReport {
  return {
    id: databaseReport.id,
    type: databaseReport.type,
    cafeId: databaseReport.cafe_id ?? undefined,
    kakaoPlaceId: databaseReport.kakao_place_id ?? undefined,
    name: databaseReport.name ?? undefined,
    address: databaseReport.address ?? undefined,
    lat: databaseReport.lat ?? undefined,
    lng: databaseReport.lng ?? undefined,
    imageUrl: databaseReport.image_url ?? undefined,
    correctionTypes: databaseReport.correction_types ?? [],
    memo: databaseReport.memo ?? undefined,
    anonymousId: databaseReport.anonymous_id,
    nickname: databaseReport.nickname,
    status: databaseReport.status,
    createdAt: databaseReport.created_at,
  }
}

function readReportStatus(value: unknown): ReportStatus {
  if (typeof value !== 'string' || !REPORT_STATUSES.includes(value as ReportStatus)) {
    throw new Error('"status" must be pending, approved, or rejected')
  }

  return value as ReportStatus
}

function readReportId(value: unknown): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error('"id" must be a non-empty string')
  }

  return value
}

export async function GET(request: NextRequest) {
  if (!isAuthorizedAdminRequest(request)) return unauthorized()

  try {
    const { data, error } = await createSupabaseAdminClient()
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json((data as DatabaseReport[]).map(toReport), {
      headers: {
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    return badRequest(error)
  }
}

export async function PATCH(request: NextRequest) {
  if (!isAuthorizedAdminRequest(request)) return unauthorized()

  try {
    const body = await request.json()

    if (!isRecord(body)) {
      throw new Error('Request body must be an object')
    }

    const id = readReportId(body.id)
    const status = readReportStatus(body.status)
    const { data, error } = await createSupabaseAdminClient()
      .from('reports')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(toReport(data as DatabaseReport))
  } catch (error) {
    return badRequest(error)
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAuthorizedAdminRequest(request)) return unauthorized()

  const id = request.nextUrl.searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: '"id" query parameter is required' }, { status: 400 })
  }

  const { error } = await createSupabaseAdminClient()
    .from('reports')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}
