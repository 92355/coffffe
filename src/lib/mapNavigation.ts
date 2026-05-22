export function naverMapUrl(name: string): string {
  return `https://map.naver.com/v5/search/${encodeURIComponent(name)}`
}

export function kakaoMapUrl(name: string): string {
  return `https://map.kakao.com/?q=${encodeURIComponent(name)}`
}

export function googleMapUrl(name: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`
}
