# coFFFFFe-map 현재 계획

> 마지막 갱신: 2026-05-19
> 상태: **완료 — 다음 작업 대기**

---

## 이전 계획 완료 요약

Supabase 연동 + 관리자 페이지 + 커스텀 마커 작업 전체 완료.

- [x] Supabase `cafes` 테이블 생성, 8개 카페 마이그레이션
- [x] `src/lib/supabase.ts` — server-only 클라이언트 팩토리
- [x] `src/lib/admin-auth.ts` — 쿠키/Bearer 인증
- [x] `/api/cafes` — Supabase 우선, cafes.json fallback
- [x] `/api/kakao/search` — 카카오 REST API 서버 프록시
- [x] `/api/admin/cafes` — POST/PUT/DELETE CRUD
- [x] `/admin` — 비밀번호 게이트 + 카카오 검색 + 카페 관리 UI
- [x] `KakaoMap.tsx` — CustomOverlay 커피 핀 마커 (선택 시 크기 업 + 라벨)
- [x] `MapView.tsx` — 퀵카테고리 + 검색 + 필터 통합
- [x] `Sidebar.tsx` — 퀵카테고리 칩, 모바일 슬라이드 패널

---

## 현재 열려 있는 작업

없음. 다음 작업을 사용자가 지정할 때까지 대기.

---

## 알려진 개선 후보 (우선순위 미정)

| 항목 | 위험도 | 비고 |
|---|---|---|
| `cafes.json` 삭제 | 낮 | Supabase 안정 확인 후 진행. fallback 코드도 함께 제거 |
| MapView 다크모드 확장 | 중 | CSS 변수 미사용 구간 전체 수정 필요 |
| 지도 버튼 기능 구현 (확대/축소/현재위치/레이어) | 낮 | UI만 존재, Kakao Map API 연동 필요 |
| "이 지역 검색" 버튼 기능 | 중 | 지도 이동 후 재검색 UX |
| 목록 버튼 중복 제거 (`md:hidden`/`md:flex` 두 개) | 낮 | 단순 코드 정리 |
| Vercel 환경 변수 등록 확인 | 높 | 배포 전 필수. 로컬에서 확인 불가 |
| `/cafes/[id]` 뒤로가기 UX 개선 | 낮 | 현재 `/`로 이동 |

---

## 배포 전 필수 확인

1. Vercel 대시보드에 환경 변수 6개 모두 등록 확인
2. Kakao Developers에 Vercel 도메인 등록 확인
3. Preview 배포에서 지도 로딩 + 마커 + 관리자 페이지 동작 확인

```bash
npx tsc --noEmit
npm run lint
npm run build
```


!! 추가사항 

익명의 회원 -> 어드민에게 카페 추가 요청 -> 어드민 페이지에서 확인 검수
카카오 회원가입 

