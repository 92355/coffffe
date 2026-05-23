## Parent

prd-footprint.md

## What to build

발자취 기능의 deep module 4종을 작성하고 단위 테스트로 검증한다.

대상 모듈:
1. `src/lib/kstDate.ts` — KST 기준 오늘 날짜 문자열(`YYYY-MM-DD`) 반환. 임의 Date 입력도 받는 순수 함수.
2. `src/lib/footprintRateLimit.ts` — `(lastCreatedAt, windowHours, nowDate)` → `{ allowed, retryAfterSeconds }`. DB 비의존 순수 로직.
3. `src/lib/footprintEmojis.ts` — 5종 이모지 메타데이터(key/glyph/label) 단일 정의. UI/서버 공통.
4. `src/lib/sessionViewCache.ts` — 모듈 스코프 `Set<string>` 캐시. `has/add/reset`.

기존 테스트 컨벤션(`src/lib/*.test.ts`)을 따른다.

## Acceptance criteria

- [ ] `kstDate.test.ts`: UTC와 KST 경계, 자정 직전/직후 케이스 통과.
- [ ] `footprintRateLimit.test.ts`: 첫 작성 허용 / 윈도우 내 차단 / 윈도우 경과 후 허용 / `retryAfterSeconds`가 양의 정수 케이스 통과.
- [ ] `footprintEmojis.test.ts`: 5종 키(coffee/vibe/work/insta/toilet) 모두 정의되고 중복 없음.
- [ ] `sessionViewCache.test.ts`: add/has/reset 동작 검증, 테스트 간 격리.
- [ ] 모든 모듈에서 `any` 미사용, 명시적 타입.
- [ ] `npx tsc --noEmit`, `npm run lint`, `npm test -- --run` 통과.

## Blocked by

None - can start immediately
