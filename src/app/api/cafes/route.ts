import { NextRequest, NextResponse } from 'next/server'
import cafes from '@/data/cafes.json'
import type { Cafe, RoastLevel, BeanOrigin, BrewMethod } from '@/types/cafe'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const roast = searchParams.get('roast') as RoastLevel | null
  const origin = searchParams.get('origin') as BeanOrigin | null
  const method = searchParams.get('method') as BrewMethod | null

  let result = cafes as Cafe[]

  if (roast) result = result.filter(c => c.roastLevels.includes(roast))
  if (origin) result = result.filter(c => c.beanOrigins.includes(origin))
  if (method) result = result.filter(c => c.brewMethods.includes(method))

  return NextResponse.json(result)
}
