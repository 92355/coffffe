export type ReportType = 'new_place' | 'correction'
export type ReportStatus = 'pending' | 'approved' | 'rejected'

export interface CafeReport {
  id: string
  type: ReportType
  cafeId?: string
  kakaoPlaceId?: string
  name?: string
  address?: string
  lat?: number
  lng?: number
  imageUrl?: string
  correctionTypes: string[]
  memo?: string
  anonymousId: string
  userId?: string
  nickname: string
  status: ReportStatus
  createdAt: string
}
