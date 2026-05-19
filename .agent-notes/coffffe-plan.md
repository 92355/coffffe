# coFFFFFe-map 현재 계획

> 마지막 갱신: 2026-05-19
> 상태: **진행 중**

---

## 목표

첨부 이미지 기준으로 메인 지도 UI를 왼쪽 고정 사이드바와 오른쪽 풀스크린 지도 구조로 정리한다.

## 범위

- `/` 메인 지도 화면 UI 개편
- 데스크톱: 좌측 패널, 검색, 탭, 빠른 카테고리, 드롭다운형 필터, 추천 카페 리스트
- 모바일: 지도 우선 화면과 목록 보기 드로어
- Kakao 지도 마커를 커피 핀 스타일 커스텀 오버레이로 변경
- 지도 위 플로팅 컨트롤 추가

## 제외 범위

- Kakao Map API 교체
- 정적 카페/원두 데이터 구조 변경
- `/beans`, `/cbti`, `/cafes/[id]` 내부 로직 변경
- 인증, 리뷰, 관리자 기능 추가

## 수정 예상 파일

- `src/components/MapView.tsx`
- `src/components/Sidebar.tsx`
- `src/components/SearchBar.tsx`
- `src/components/FilterBar.tsx`
- `src/components/CafeListItem.tsx`
- `src/components/map/KakaoMap.tsx`
- `src/app/globals.css`
- `.agent-notes/coffffe-status.md`

## 작업 순서

- [x] 현재 코드와 Next.js 16 문서 확인
- [ ] 좌측 사이드바를 첨부 이미지형 패널로 개편
- [ ] 검색, 탭, 필터, 카테고리 칩 스타일 변경
- [ ] 카페 리스트 아이템을 이미지형 카드 스타일로 변경
- [ ] 지도 마커와 지도 플로팅 컨트롤 변경
- [ ] 모바일 목록 보기 드로어 적용
- [ ] 검증 명령 실행
- [ ] 상태 문서 갱신

## 검증 방법

```bash
npx tsc --noEmit
npm run lint
npm run build
```
