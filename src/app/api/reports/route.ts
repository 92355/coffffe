import { NextRequest } from 'next/server'
import { submitReport } from '@/lib/services/admin'
import { getUserSession } from '@/lib/user-auth'
import { badRequest, created } from '@/lib/response'

export async function POST(request: NextRequest) {
  try {
    const session = await getUserSession()
    const data = await submitReport(await request.json(), session?.userId ?? null)
    return created(data)
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : 'Invalid request')
  }
}
