## Parent

#28

## What to build

지도 화면의 모바일 체감 성능을 개선하기 위해 지도 위에 겹치는 글래스 효과, backdrop-filter, 큰 shadow 비용을 줄인다. 지도 조작과 바텀시트 사용이 더 부드러워져야 하며, 데스크톱 지도 UI는 기존 방향을 유지한다.

## Acceptance criteria

- [ ] 모바일 지도 화면에서 주요 overlay의 blur/backdrop-filter 비용이 축소된다.
- [ ] 모바일 바텀시트, 상단 검색바, 지도 컨트롤의 사용성이 유지된다.
- [ ] 데스크톱 사이드바와 지도 UI의 주요 시각 방향은 크게 훼손되지 않는다.
- [ ] 지도 마커 선택 후 표시되는 상세 UI가 기존처럼 동작한다.
- [ ] 모바일 viewport에서 지도 드래그, 줌, 바텀시트 열고 닫기를 수동 QA하고 결과를 남긴다.
- [ ] `npx tsc --noEmit`, `npm run lint`, `npm run build`를 실행하고 결과를 남긴다.

## Blocked by

#33
