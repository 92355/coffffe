## Parent

prd-footprint.md

## What to build

카페 상세 페이지 `/cafes/[id]`를 신설하고 발자취 풀 패널을 호스팅한다. 현재 이 라우트는 존재하지 않는다.

대상:
1. `src/app/cafes/[id]/page.tsx` — 카페 기본 정보(이름/이미지/주소/태그/연락처/지도 검색 버튼)를 풀 사이즈로 표시 + `CafeFootprintPanel` 배치. 정적 카페 데이터는 `src/data/cafes.json` 또는 `/api/cafes`에서 로딩. 카페가 없으면 `notFound()`.
2. 신규 컴포넌트 `src/components/CafeFootprintPanel.tsx` — 다음 UI를 묶음:
   - `VisitTodayButton` (다녀왔어요 버튼)
   - `ReactionRow` (5개 이모지 토글 그리드)
   - `ReviewForm` (50자 textarea + 글자수 카운터 + 쿨다운 안내)
   - `ReviewList` (최신순, 닉네임/아바타/시간/신고)
3. 신규 컴포넌트:
   - `src/components/VisitTodayButton.tsx`
   - `src/components/ReactionRow.tsx`
   - `src/components/ReviewForm.tsx`
   - `src/components/ReviewList.tsx`
4. 바텀시트의 카페명 또는 별도 "자세히 보기" 버튼을 `/cafes/[id]`로 링크.

## Acceptance criteria

- [ ] `/cafes/[id]` 진입 시 카페 기본 정보 + 발자취 패널이 표시된다.
- [ ] 다녀왔어요 누른 후 버튼이 "✓ 오늘 다녀왔어요"로 바뀌고 비활성화된다.
- [ ] 반응 이모지 클릭 시 즉시 활성/비활성 토글 + 카운트 갱신.
- [ ] 한줄평 입력 시 글자수 카운터가 실시간 표시 (50자 초과 입력 차단).
- [ ] 한줄평 제출 후 즉시 목록 최상단에 본인 글이 표시 (optimistic).
- [ ] 쿨다운 중에는 입력창과 제출 버튼이 비활성화 + "n분 후 다시 작성 가능" 안내.
- [ ] 한줄평 카드에 신고 버튼이 있고, 신고 시 토스트/안내 표시.
- [ ] 닉네임/아바타는 한줄평 작성자 정보 기반으로 표시 (animal 아바타 활용).
- [ ] 다크모드 일관성.
- [ ] 바텀시트에서 상세 페이지로 진입 가능한 동선이 존재.
- [ ] `npx tsc --noEmit`, `npm run lint`, `npm run build` 통과.

## Blocked by

#40 (client hooks), #41 (bottomsheet summary로 useViewTracker 패턴 확립)
