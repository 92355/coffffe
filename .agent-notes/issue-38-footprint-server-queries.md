## Parent

prd-footprint.md

## What to build

Supabase admin client를 감싸는 footprint 쿼리 모듈과 클라이언트 식별 헬퍼를 작성한다.

대상 파일:
1. `src/lib/cafeFootprint.ts` — 다음 함수를 export:
   - `recordView(cafeId, todayKst)` — `cafe_view_daily` upsert + atomic increment
   - `recordVisit(cafeId, anonymousId, todayKst)` — `cafe_visits` insert (멱등)
   - `toggleReaction(cafeId, anonymousId, emojiKey)` → `{ count, mine }`
   - `insertReview({ cafeId, text, authorUserId?, anonymousId, nickname, animal, ip })` — 쿨다운 검증 후 insert
   - `listReviews(cafeId, limit)` — 최신순
   - `deleteReview(reviewId)` — 어드민용
   - `getFootprintSummary(cafeId, anonymousId, todayKst)` → PRD의 GET /footprint 응답 형태
   - `reportReview(reviewId, reporterAnonymousId)` — 중복 신고 무시
2. `src/lib/clientIdentity.ts` — `extractClientIdentity(request)` → `{ ip, anonymousId }`. `x-forwarded-for` 첫 값과 `x-anonymous-id` 헤더 추출.

## Acceptance criteria

- [ ] 모든 함수가 `createSupabaseAdminClient()`를 사용한다 (RLS 우회).
- [ ] `recordView`는 동일 (cafeId, date)에 대해 row 폭증 없이 카운터 +1만 수행한다.
- [ ] `insertReview`는 [[footprintRateLimit]]을 사용해 카페별 24시간 쿨다운을 검증하고, 차단 시 명시적인 에러 객체를 throw한다 (`{ code: 'COOLDOWN', retryAfterSeconds }`).
- [ ] `toggleReaction`은 같은 이모지를 다시 호출하면 삭제하고 `mine: false` + 갱신된 count 반환.
- [ ] `getFootprintSummary`는 5종 이모지를 모두 반환한다 (0 카운트 포함).
- [ ] `clientIdentity` 헬퍼는 `x-forwarded-for`가 콤마 구분이면 첫 값만 사용한다.
- [ ] 모든 함수에 명시적 반환 타입.
- [ ] `npx tsc --noEmit`, `npm run lint` 통과.

## Blocked by

#36 (스키마), #37 (core libs)
