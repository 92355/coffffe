import { getUserSession } from '@/lib/user-auth'
import { getMyReports } from '@/lib/repositories/admin'
import { unauthorized, ok, serverError } from '@/lib/response'

export async function GET() {
  const session = await getUserSession()
  if (!session) return unauthorized()

  try {
    const reports = await getMyReports(session.userId)
    return ok({ reports })
  } catch (error) {
    return serverError(error instanceof Error ? error.message : 'Failed to load reports')
  }
}
