## Parent

prd-footprint.md

## What to build

바텀시트(`BottomSheet.tsx`)에 발자취 요약(조회수 · 방문자수 · 반응 이모지 카운트)을 한 줄로 표시한다.

대상:
1. 신규 컴포넌트 `src/components/CafeFootprintStats.tsx` — cafeId 받아 [[useCafeFootprint]] 활용, 컴팩트한 인라인 표시:
   `오늘 👀 12 · 다녀옴 7 · ☕ 5 · 🌿 3 · 💻 2 · 📸 1 · 🚾 1`
2. `BottomSheet.tsx`에 `CafeFootprintStats` 삽입 — 영업정보 위 또는 태그 아래 적당한 위치.
3. `BottomSheet.tsx` 마운트 시 [[useViewTracker]] 호출.

## Acceptance criteria

- [ ] 바텀시트 열릴 때마다 view가 트래킹된다 (세션 내 같은 카페 중복 제외).
- [ ] 다크모드 색상이 기존 바텀시트와 일관됨.
- [ ] 로딩 중에는 placeholder(빈 줄 또는 회색 스켈레톤)로 레이아웃 점프 방지.
- [ ] 모바일 좁은 화면에서 한 줄에 표시되도록 디자인 (작은 폰트 + 가운데 점 구분자).
- [ ] 카운트가 0인 이모지도 동일하게 표시 (참여 유도).
- [ ] `npx tsc --noEmit`, `npm run lint`, `npm run build` 통과.

## Blocked by

#40 (client hooks)
