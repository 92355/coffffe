## Parent

prd-footprint.md

## What to build

발자취 기능 클라이언트 측 훅과 fetch wrapper를 작성한다.

대상:
1. `src/lib/fetchWithIdentity.ts` — anonymousId(localStorage)를 자동으로 `x-anonymous-id` 헤더에 첨부하는 fetch wrapper. 기존 `useUser`의 storage 키를 그대로 사용.
2. `src/hooks/useCafeFootprint.ts` — `cafeId` 받아:
   - 초기 로드 시 `/footprint` 요청
   - `markVisit()`, `toggleReaction(emojiKey)`, `submitReview(text)`, `reportReview(reviewId)` 액션 노출
   - 액션 후 summary 갱신 (optimistic 또는 refetch)
   - 쿨다운 에러 처리 (`retryAfterSeconds` 상태로 보존)
3. `src/hooks/useViewTracker.ts` — cafeId 받아 마운트 시 [[sessionViewCache]]에 없으면 `/views` POST + 추가. 있으면 noop.

## Acceptance criteria

- [ ] `fetchWithIdentity`는 anonymousId가 없으면 헤더 미첨부 (요청은 진행).
- [ ] `useCafeFootprint`는 cafeId 변경 시 자동 재로드.
- [ ] `useViewTracker`는 React Strict Mode 더블 렌더에서도 1회만 POST.
- [ ] 한줄평 제출 성공 시 optimistic으로 목록 상단에 즉시 표시.
- [ ] 쿨다운 시 `retryAfterSeconds`가 노출되어 UI에서 사용 가능.
- [ ] 모든 hook이 cleanup에서 abort 처리.
- [ ] `npx tsc --noEmit`, `npm run lint` 통과.

## Blocked by

#39 (API routes)
