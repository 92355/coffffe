import { NextRequest } from 'next/server'
import { isAuthorizedAdminRequest } from '@/lib/admin-auth'
import { adminListReports, adminUpdateReportStatus, adminDeleteReport } from '@/lib/services/admin'
import { unauthorized, badRequest, ok, noStore, parseErrorMessage } from '@/lib/response'
import type { ReportStatus } from '@/types/report'

const REPORT_STATUSES: ReportStatus[] = ['pending', 'approved', 'rejected']

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export async function GET(request: NextRequest) {
  if (!isAuthorizedAdminRequest(request)) return unauthorized()

  try {
    const reports = await adminListReports()
    return noStore(reports)
  } catch (error) {
    return badRequest(parseErrorMessage(error))
  }
}

export async function PATCH(request: NextRequest) {
  if (!isAuthorizedAdminRequest(request)) return unauthorized()

  try {
    const body = await request.json()
    if (!isRecord(body)) throw new Error('Request body must be an object')

    const id = typeof body.id === 'string' && body.id.length > 0 ? body.id : null
    if (!id) throw new Error('"id" must be a non-empty string')

    const status = typeof body.status === 'string' && REPORT_STATUSES.includes(body.status as ReportStatus)
      ? body.status as ReportStatus
      : null
    if (!status) throw new Error('"status" must be pending, approved, or rejected')

    const report = await adminUpdateReportStatus(id, status)
    return ok(report)
  } catch (error) {
    return badRequest(parseErrorMessage(error))
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAuthorizedAdminRequest(request)) return unauthorized()

  const id = request.nextUrl.searchParams.get('id')
  if (!id) return badRequest('"id" query parameter is required')

  try {
    await adminDeleteReport(id)
    return ok({ ok: true })
  } catch (error) {
    return badRequest(parseErrorMessage(error))
  }
}
