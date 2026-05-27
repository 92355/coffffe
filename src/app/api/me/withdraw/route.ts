import { NextRequest, NextResponse } from 'next/server'
import { getUserSession, USER_SESSION_COOKIE } from '@/lib/user-auth'
import { badRequest, serverError, unauthorized } from '@/lib/response'
import {
  deleteCbtiProfileByUser,
  deleteFavoritesByUser,
  deleteUserProfile,
} from '@/lib/repositories/user'
import { anonymizeReviewsByUser, deleteReviewsByUser } from '@/lib/repositories/footprint'
import { anonymizeReportsByUser } from '@/lib/repositories/admin'

type WithdrawalContentAction = 'delete' | 'anonymize'

interface WithdrawalPayload {
  reviewsAction: WithdrawalContentAction
  confirmText: string
}

const CONFIRM_TEXT = '탈퇴'

export async function POST(request: NextRequest) {
  const session = await getUserSession()
  if (!session) return unauthorized()

  let payload: WithdrawalPayload
  try {
    payload = readPayload(await request.json())
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : 'Invalid withdrawal payload')
  }

  try {
    if (payload.reviewsAction === 'delete') {
      await deleteReviewsByUser(session.userId)
    } else {
      await anonymizeReviewsByUser(session.userId)
    }

    await anonymizeReportsByUser(session.userId)

    await deleteFavoritesByUser(session.userId)
    await deleteCbtiProfileByUser(session.userId)
    await deleteUserProfile(session.userId)

    const response = NextResponse.json({ ok: true })
    response.cookies.set(USER_SESSION_COOKIE, '', {
      httpOnly: true,
      sameSite: 'lax',
      secure: request.nextUrl.protocol === 'https:',
      maxAge: 0,
      path: '/',
    })

    return response
  } catch (error) {
    return serverError(error instanceof Error ? error.message : 'Failed to withdraw account')
  }
}

function readPayload(value: unknown): WithdrawalPayload {
  if (!isRecord(value)) throw new Error('Payload must be an object')

  const reviewsAction = readAction(value.reviewsAction, 'reviewsAction')
  const confirmText = typeof value.confirmText === 'string' ? value.confirmText.trim() : ''

  if (confirmText !== CONFIRM_TEXT) {
    throw new Error('탈퇴 확인 문구가 일치하지 않습니다.')
  }

  return { reviewsAction, confirmText }
}

function readAction(value: unknown, fieldName: string): WithdrawalContentAction {
  if (value === 'delete' || value === 'anonymize') return value

  throw new Error(`"${fieldName}" must be "delete" or "anonymize"`)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
