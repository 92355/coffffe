interface NavTarget {
  lat: number
  lng: number
  name: string
}

export function naverMapUrl({ lat, lng, name }: NavTarget): string {
  return `https://map.naver.com/v5/directions/-/-/${lng},${lat},${encodeURIComponent(name)}/transit`
}

export function kakaoMapUrl({ lat, lng, name }: NavTarget): string {
  return `https://map.kakao.com/link/to/${encodeURIComponent(name)},${lat},${lng}`
}

export function googleMapUrl({ lat, lng }: NavTarget): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
}
