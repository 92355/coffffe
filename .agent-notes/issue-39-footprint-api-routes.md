## Parent

prd-footprint.md

## What to build

발자취 기능 API 라우트 일체를 Next.js App Router 컨벤션으로 작성한다.

대상 라우트:
- `POST /api/cafes/[id]/views`
- `GET  /api/cafes/[id]/footprint`
- `POST /api/cafes/[id]/visits`
- `POST /api/cafes/[id]/reactions`
- `GET  /api/cafes/[id]/reviews`
- `POST /api/cafes/[id]/reviews`
- `POST /api/cafes/[id]/reviews/[reviewId]/report`
- `GET  /api/admin/reviews`
- `DELETE /api/admin/reviews/[reviewId]`

PRD의 "API 계약" 섹션을 따른다.

## Acceptance criteria

- [ ] 모든 라우트가 `extractClientIdentity`로 IP/anonymousId를 추출한다.
- [ ] 한줄평 작성 시 쿨다운 위반은 `429 { error, retryAfterSeconds }` 응답.
- [ ] 한줄평 본문이 빈 문자열이거나 50자 초과면 `400`.
- [ ] 반응 이모지 키가 [[footprintEmojis]]의 5종 중 하나가 아니면 `400`.
- [ ] 어드민 라우트는 기존 `lib/admin-auth.ts` 패턴으로 보호.
- [ ] 로그인 사용자가 작성한 한줄평은 `author_user_id` + 현재 siteNickname/animal로 저장.
- [ ] 익명 사용자는 `author_anonymous_id` + 클라이언트 닉네임/animal(요청 본문 또는 헤더)로 저장.
- [ ] 모든 응답이 JSON, `any` 미사용.
- [ ] `npx tsc --noEmit`, `npm run lint`, `npm run build` 통과.

## Blocked by

#38 (server queries)
