## Parent

#28

## What to build

홈 화면의 모바일 체감 성능을 개선하기 위해 무한 애니메이션, 큰 blur, 큰 shadow, 복잡한 배경 효과를 모바일에서 줄인다. 기존 브랜드 분위기는 유지하되, 모바일 스크롤과 첫 화면 표시가 더 가벼워져야 한다.

## Acceptance criteria

- [ ] 홈 화면 모바일에서 지속 실행되는 배경 애니메이션 비용이 줄어든다.
- [ ] 홈 화면 모바일에서 고비용 blur/backdrop/shadow 효과가 축소된다.
- [ ] 데스크톱 홈 화면의 주요 시각 방향은 크게 훼손되지 않는다.
- [ ] 홈 주요 링크와 프로필 관련 동작은 기존처럼 유지된다.
- [ ] 모바일 viewport에서 홈 화면 스크롤과 첫 화면 표시를 수동 QA하고 결과를 남긴다.
- [ ] `npx tsc --noEmit`, `npm run lint`, `npm run build`를 실행하고 결과를 남긴다.

## Blocked by

#30
