## Parent

prd-footprint.md

## What to build

어드민에서 한줄평을 관리(목록 조회 + 삭제)할 수 있는 페이지를 추가한다.

대상:
1. `src/app/admin/reviews/page.tsx` — 신규 어드민 페이지. 한줄평 목록을 신고 많은 순(또는 최신순 토글)으로 표시. 각 카드에:
   - 카페명 (cafeId 기반 lookup)
   - 작성자 닉네임/animal
   - 본문 텍스트
   - 작성 시각
   - 신고 횟수 (있으면 강조)
   - 삭제 버튼
2. `src/components/AdminShell.tsx` 사이드바에 "한줄평" 메뉴 항목 추가.
3. 기존 `GET /api/admin/reviews`, `DELETE /api/admin/reviews/[reviewId]` 라우트 활용 (#39에서 구현).

## Acceptance criteria

- [ ] 어드민 사이드바에 "한줄평" 메뉴 노출 + 활성 상태 표시.
- [ ] 페이지 진입 시 한줄평 목록이 로드됨.
- [ ] 신고 횟수가 1 이상이면 카드에 시각적 강조(배지 또는 색).
- [ ] 삭제 버튼 클릭 시 확인 다이얼로그 후 삭제 + 목록 갱신.
- [ ] 비로그인/비관리자는 접근 차단 (기존 어드민 가드 패턴).
- [ ] 빈 상태(한줄평 없음) UI 처리.
- [ ] `npx tsc --noEmit`, `npm run lint`, `npm run build` 통과.

## Blocked by

#39 (API routes)
