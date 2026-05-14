# coFFFFFe-map 현재 계획

> 마지막 갱신: 2026-05-14
> 상태: **P1 완료**

---

## 전체 로드맵

| 페이즈 | 내용 | 상태 |
|---|---|---|
| **P1** | 전체 UI 개편 + 지도 풀스크린 메인화 | 완료 |
| **P2** | Supabase 데이터 레이어 전환 | 대기 |
| **P3** | 회원관리 (인증·즐겨찾기·리뷰·방문기록) | 대기 |
| **P4** | 관리자 페이지 (CRUD·회원·리뷰 관리) | 대기 |

---

## P1 — 전체 UI 개편 + 지도 풀스크린 메인화

### 목표

벤치마킹 UI 기준으로 지도를 앱의 메인 화면으로 승격한다.
현재 홈(카드 그리드)을 제거하고, 지도 + 사이드바/바텀시트 레이아웃으로 전면 개편한다.
지도 API는 카카오 Map 유지.

### 벤치마킹 UI 기준

- 지도가 전체 화면을 차지하는 메인
- 데스크톱: 좌측 사이드바 (검색 + 필터 + 카페 리스트 + 선택 카페 상세)
- 모바일: 상단 플로팅 검색바 + 하단 바텀시트 (선택 카페 카드)
- 다크 맵 테마 + amber 액센트 (현재 브랜드 유지)
- 사이드바에 원두·CBTI 등 다른 페이지 링크 포함

### 현재 상태

- `/` → 홈 카드 그리드 (SplashScreen 포함)
- `/map` → 지도 페이지 (FilterBar + KakaoMap + CafePreviewCard)
- CafePreviewCard: 지도 하단 오버레이로 선택 카페 표시
- FilterBar: 로스팅·산지·추출 필터 칩

### 수정 예상 파일

| 파일 | 변경 내용 |
|---|---|
| `src/app/page.tsx` | 카드 그리드 제거 → 지도 풀스크린 레이아웃으로 교체 |
| `src/app/map/page.tsx` | `/`로 redirect (또는 삭제) |
| `src/components/MapView.tsx` | 사이드바(데스크톱) + 바텀시트(모바일) 레이아웃으로 개편 |
| `src/components/FilterBar.tsx` | 사이드바 내부로 이동, 스타일 조정 |
| `src/components/CafePreviewCard.tsx` | 사이드바 내부 카드(데스크톱) + 바텀시트 카드(모바일)로 분리 |
| `src/components/SplashScreen.tsx` | 유지 (홈 진입 시 그대로 표시) |
| `src/app/globals.css` | 레이아웃 관련 스타일 추가 |

### 추가할 컴포넌트

| 컴포넌트 | 역할 |
|---|---|
| `src/components/Sidebar.tsx` | 데스크톱 좌측 사이드바 (검색·필터·리스트·상세) |
| `src/components/BottomSheet.tsx` | 모바일 하단 바텀시트 (선택 카페 카드) |
| `src/components/CafeListItem.tsx` | 사이드바 카페 목록 아이템 |
| `src/components/SearchBar.tsx` | 사이드바 상단 / 모바일 플로팅 검색바 |

### 제외 범위

- 카카오 지도 API 교체 안 함
- `/beans`, `/cbti`, `/cafes/[id]` 페이지 내부 로직 수정 안 함
- 데이터(cafes.json, beans.ts) 변경 안 함
- 인증·회원 기능 추가 안 함 (P3)

### 작업 순서

1. `src/app/page.tsx`를 지도 풀스크린 레이아웃으로 교체
   - SplashScreen 유지
   - `MapView`를 직접 렌더링 (현재 /map/page.tsx와 동일)
   - verify: 홈 접속 시 지도가 전체 화면으로 표시됨

2. `src/app/map/page.tsx`를 `/`로 redirect 처리
   - `import { redirect } from 'next/navigation'; redirect('/')`
   - verify: `/map` 접속 시 `/`로 이동

3. `Sidebar.tsx` 신규 작성 (데스크톱 `md:` 이상에서만 표시)
   - 상단: 로고 + 페이지 링크 (원두, CBTI)
   - 중단: SearchBar + FilterBar
   - 하단: 카페 리스트 (CafeListItem)
   - 선택 시: 사이드바 내부에 카페 상세 표시
   - verify: 사이드바에서 카페 클릭 시 지도 마커와 연동

4. `BottomSheet.tsx` 신규 작성 (모바일 `md:` 미만에서만 표시)
   - 선택 카페 있으면 하단에서 슬라이드업
   - 없으면 숨김
   - verify: 마커 클릭 시 바텀시트 표시, 닫기 가능

5. `SearchBar.tsx` 신규 작성
   - 카페명 텍스트 검색 → 필터 결과에 반영
   - verify: 검색어 입력 시 카페 리스트 + 마커 필터링

6. `MapView.tsx` 개편
   - 사이드바 + 지도 + 바텀시트를 조합하는 루트 컴포넌트로 재구성
   - selectedCafe 상태를 사이드바·바텀시트와 공유
   - verify: 지도 마커 클릭 → 사이드바(데스크톱)/바텀시트(모바일) 연동

7. `globals.css` 레이아웃 스타일 정리
   - 사이드바 너비, 바텀시트 높이, 전환 애니메이션
   - verify: 375px 모바일 / 1280px 데스크톱 모두 overflow 없음

### 성공 기준

- [x] `/` 접속 시 지도가 전체 화면으로 표시
- [x] 데스크톱(md 이상): 좌측 사이드바 + 지도
- [x] 모바일(md 미만): 지도 풀스크린 + 하단 바텀시트
- [x] 카페 마커 클릭 → 사이드바/바텀시트에 카페 정보 표시
- [x] 검색어 입력 → 카페 리스트 + 마커 필터링
- [x] `/beans`, `/cbti` 링크 접근 가능
- [x] 다크/라이트 모드 정상
- [ ] 모바일 375px overflow 없음

### 검증 명령어

```bash
npx tsc --noEmit
npm run lint
npm run build
```

---

## P2 — Supabase 데이터 레이어 전환

> P1 완료 후 진행

### 목표

정적 파일(cafes.json, beans.ts) → Supabase DB로 전환.
P3·P4의 회원·관리자 기능을 위한 데이터 레이어 기반 구축.

### DB 스키마 (예정)

```sql
cafes       -- 현재 cafes.json 구조 그대로
beans       -- 현재 beans.ts 구조 그대로
users       -- Supabase Auth 연동 프로필
reviews     -- cafe_id, user_id, score, body, created_at
favorites   -- cafe_id, user_id
visits      -- cafe_id, user_id, visited_at
```

### 수정 예상 파일

- `src/app/api/cafes/route.ts` → Supabase 조회로 교체
- `src/app/api/beans/route.ts` 신규 → Supabase 조회
- `src/data/cafes.json` → Supabase 시드 후 제거 또는 fallback 유지
- `src/data/beans.ts` → Supabase 시드 후 제거 또는 fallback 유지
- `.env.local` → `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 추가

### 환경 변수 (추가 필요)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   ← 서버에서만 사용, 클라이언트 노출 금지
```

---

## P3 — 회원관리

> P2 완료 후 진행

### 목표

Supabase Auth 기반 회원 인증 + 즐겨찾기·방문기록·리뷰 기능.

### 기능 목록

- 이메일/소셜(Google) 로그인·회원가입
- 즐겨찾기: 카페 상세 또는 사이드바에서 저장
- 방문 기록: 카페 방문 체크인
- 리뷰/평점: 카페 상세 페이지에서 작성

### 수정 예상 파일

- `src/middleware.ts` 신규 — 인증 필요 라우트 보호
- `src/app/login/page.tsx` 신규
- `src/app/mypage/page.tsx` 신규 (즐겨찾기·방문기록 조회)
- `src/components/Sidebar.tsx` — 로그인 상태에 따라 UI 분기

---

## P4 — 관리자 페이지

> P2·P3 완료 후 진행

### 목표

`/admin` 라우트에서 카페·원두 데이터 CRUD, 회원 목록 조회, 리뷰 관리.

### 기능 목록

- 카페 추가·수정·삭제
- 원두 추가·수정·삭제
- 회원 목록 조회·권한 변경
- 리뷰 승인·삭제

### 수정 예상 파일

- `src/app/admin/page.tsx` 신규
- `src/app/admin/cafes/page.tsx` 신규
- `src/app/admin/beans/page.tsx` 신규
- `src/app/admin/users/page.tsx` 신규
- `src/app/admin/reviews/page.tsx` 신규
- `src/middleware.ts` — admin 역할 체크 추가

---

## 최근 완료 작업 요약

| 날짜 | 작업 | 결과 |
|---|---|---|
| 2026-05-14 | coffffe-status.md / coffffe-plan.md 초기 작성 | 완료 |
| 2026-05-14 | CBTI 결과 유형 상세화 (recommend, pairingNotes, cafeStyle) | 완료 |
| 2026-05-14 | P1 전체 UI 개편 + 지도 풀스크린 메인화 | 완료 |
