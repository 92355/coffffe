## Parent

#28

## What to build

지도 SDK를 전역 레이아웃에서 제거하고, 지도 화면 또는 지도 컴포넌트가 필요한 시점에만 로드되게 만든다. 홈 화면처럼 지도 기능을 쓰지 않는 페이지는 Kakao 지도 SDK 네트워크/초기화 비용을 내지 않아야 한다.

## Acceptance criteria

- [ ] 홈 화면 진입 시 Kakao 지도 SDK 스크립트가 로드되지 않는다.
- [ ] 지도 화면 진입 시 Kakao 지도 SDK가 정상 로드되고 기존 지도 기능이 동작한다.
- [ ] 지도 SDK 로드 완료 이벤트와 지도 초기화 흐름이 깨지지 않는다.
- [ ] `npx tsc --noEmit`, `npm run lint`, `npm run build`를 실행하고 결과를 남긴다.

## Blocked by

None - can start immediately
