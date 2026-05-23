export function cafeHue(cafeId: string): number {
  let hash = 0
  for (let i = 0; i < cafeId.length; i++) {
    hash = (hash * 31 + cafeId.charCodeAt(i)) >>> 0
  }
  return hash % 360
}
