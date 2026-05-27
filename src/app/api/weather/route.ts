import { NextRequest, NextResponse } from 'next/server'

interface OpenMeteoResponse {
  current?: {
    temperature_2m?: number
    weather_code?: number
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const latitude = Number(searchParams.get('lat'))
  const longitude = Number(searchParams.get('lng'))

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return NextResponse.json({ error: 'Invalid location.' }, { status: 400 })
  }

  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: 'temperature_2m,weather_code',
    timezone: 'auto',
  })

  try {
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`, {
      next: { revalidate: 300 },
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to load weather.' }, { status: 502 })
    }

    const data = await response.json() as OpenMeteoResponse
    const temperature = data.current?.temperature_2m
    const weatherCode = data.current?.weather_code

    if (typeof temperature !== 'number' || typeof weatherCode !== 'number') {
      return NextResponse.json({ error: 'Invalid weather response.' }, { status: 502 })
    }

    return NextResponse.json({ temperature, weatherCode })
  } catch (error) {
    console.warn('Failed to fetch weather. / 날씨 조회 실패.', error)
    return NextResponse.json({ error: 'Failed to load weather.' }, { status: 502 })
  }
}
