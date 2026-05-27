import { NextRequest } from 'next/server'
import { submitReport } from '@/lib/services/admin'
import { badRequest, created } from '@/lib/response'

export async function POST(request: NextRequest) {
  try {
    const data = await submitReport(await request.json())
    return created(data)
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : 'Invalid request')
  }
}
