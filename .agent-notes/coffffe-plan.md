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

지도 풀스크린 + 하단 카루셀 구조로 전면 개편.
크림/오프화이트 라이트 톤으로 coFFFFFe-map만의 감성 확립.
사이드바 없이 모바일·데스크톱 동일 UX 유지.
카카오 Map API 유지.

### UI 방향 확정

```
┌─────────────────────────────┐
│  🔍 검색바  [필터] [원두][CBTI]│  ← 상단 플로팅 헤더
│                             │
│         카카오 지도          │
│      📍   📍    📍          │  ← 로스팅 레벨별 마커 색상
│                             │
├─────────────────────────────┤
│  ┌──────┐ ┌──────┐ ┌──────┐│
│  │카페A │▶│카페B │ │카페C ││  ← 수평 스크롤 카루셀
│  └──────┘ └──────┘ └──────┘│
└─────────────────────────────┘
        카드 탭 → 위로 확장 (상세)
        카루셀 스크롤 → 지도 카메라 이동
```

**컬러 시스템 (크림 라이트 톤)**

| 역할 | 값 |
|---|---|
| 배경 | `#F8F4EE` (크림/오프화이트) |
| 카드 배경 | `#FFFFFF` |
| 카드 보더 | `#EDE8E0` |
| 텍스트 주색 | `#1C1917` |
| 텍스트 보조 | `#78716C` |
| 액센트 | `#C58B5C` (기존 amber 유지) |

**마커 색상 — 로스팅 레벨 기준**

| 로스팅 | 색상 |
|---|---|
| light | `#F5E6C8` (밝은 크림) |
| medium-light | `#E8C99A` (연한 amber) |
| medium | `#C58B5C` (amber, 브랜드 액센트) |
| medium-dark | `#8B5E3C` (브라운) |
| dark | `#3D2314` (다크 브라운) |

카페에 roastLevels가 여러 개면 첫 번째 값으로 대표색 결정.

### 현재 상태

- `/` → 홈 카드 그리드 (SplashScreen 포함)
- `/map` → 지도 페이지 (FilterBar + KakaoMap + CafePreviewCard)
- CafePreviewCard: 지도 하단 오버레이로 선택 카페 표시
- FilterBar: 로스팅·산지·추출 필터 칩
- 전체 테마: 다크/라이트 CSS 변수 기반

### 수정 예상 파일

| 파일 | 변경 내용 |
|---|---|
| `src/app/page.tsx` | 카드 그리드 제거 → 지도 풀스크린 + 카루셀 레이아웃 |
| `src/app/map/page.tsx` | `/`로 redirect |
| `src/components/MapView.tsx` | 카루셀 + 플로팅 헤더 조합 루트 컴포넌트로 개편 |
| `src/components/map/KakaoMap.tsx` | 마커 색상을 roastLevel 기준으로 변경 |
| `src/components/FilterBar.tsx` | 플로팅 헤더 내 필터로 이동, 스타일 조정 |
| `src/components/CafePreviewCard.tsx` | 제거 또는 카루셀 확장 카드로 흡수 |
| `src/components/SplashScreen.tsx` | 크림 톤으로 스타일 조정 |
| `src/app/globals.css` | CSS 변수 크림 톤으로 교체, 카루셀·애니메이션 추가 |

### 추가할 컴포넌트

| 컴포넌트 | 역할 |
|---|---|
| `src/components/CafeCarousel.tsx` | 하단 수평 카루셀. 스크롤 → 지도 카메라 이동 |
| `src/components/CafeCarouselCard.tsx` | 카루셀 개별 카드. 탭 시 확장 상세 표시 |
| `src/components/FloatingHeader.tsx` | 지도 위 플로팅 검색바 + 필터 + 네비 링크 |

### 제외 범위

- 카카오 지도 API 교체 안 함
- `/beans`, `/cbti`, `/cafes/[id]` 페이지 내부 로직 수정 안 함
- 데이터(cafes.json, beans.ts) 변경 안 함
- 인증·회원 기능 추가 안 함 (P3)
- 기분 온보딩(아이디어 3)은 나중에 이벤트성으로 별도 추가

### 작업 순서

1. `globals.css` CSS 변수 크림 톤으로 교체
   - `--background: #F8F4EE`, `--card-bg: #FFFFFF` 등 라이트 변수 재정의
   - 다크모드 유지 여부 결정 (일단 라이트 전용으로 단순화 권장)
   - verify: 전체 페이지 배경이 크림 톤으로 변경

2. `src/app/map/page.tsx` → `/` redirect 처리
   - verify: `/map` 접속 시 `/`로 이동

3. `FloatingHeader.tsx` 신규 작성
   - 지도 위 절대 위치, 검색바 + 필터 칩 + 원두·CBTI 링크
   - verify: 지도 위에 떠 있고 검색·필터 동작

4. `CafeCarouselCard.tsx` 신규 작성
   - 기본: 카페명, 한줄 설명, 로스팅 레벨 뱃지, 마커 색상 도트
   - 탭(확장): 영업시간, 추출방식, 인스타 링크, 상세 페이지 이동 버튼
   - verify: 탭 시 카드 높이 확장 애니메이션

5. `CafeCarousel.tsx` 신규 작성
   - 수평 스크롤 카루셀, snap scroll 적용
   - 포커스된 카드 → `onCafeFocus(cafe)` 콜백으로 지도 카메라 이동
   - verify: 카루셀 스크롤 시 지도 중심 이동

6. `KakaoMap.tsx` 마커 색상 변경
   - roastLevel → 색상 매핑 함수 추가
   - 커스텀 마커 이미지 또는 오버레이로 색상 원형 마커 렌더링
   - verify: 로스팅별로 마커 색상 다르게 표시

7. `MapView.tsx` 개편
   - FloatingHeader + KakaoMap + CafeCarousel 조합
   - `selectedCafe`, `focusedCafe`, `filters`, `searchQuery` 상태 관리
   - verify: 마커 클릭 → 카루셀 해당 카드로 스크롤 / 카루셀 스크롤 → 지도 이동

8. `src/app/page.tsx` 교체
   - SplashScreen 유지 + MapView 렌더링
   - verify: 홈 접속 시 크림 톤 지도 풀스크린 + 하단 카루셀 표시

### 성공 기준

- [ ] `/` 접속 시 크림 톤 지도 풀스크린 표시
- [ ] 하단 카루셀 수평 스크롤 → 지도 카메라 이동
- [ ] 카루셀 카드 탭 → 확장 상세 표시
- [ ] 마커 색상이 로스팅 레벨별로 다름
- [ ] 지도 마커 클릭 → 카루셀 해당 카드로 포커스
- [ ] 플로팅 검색바 + 필터 동작
- [ ] `/beans`, `/cbti` 링크 접근 가능
- [ ] 모바일 375px / 데스크톱 1280px overflow 없음

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

## 추후 업데이트 예정

### P5-A — 카페 위치 카카오맵에서 가져오기

> P4(관리자 페이지) 완료 후 진행

관리자가 카페를 추가할 때 주소를 직접 입력하는 대신, 카카오맵 장소 검색 API로 카페명을 검색 → 위치(lat, lng)·주소를 자동 입력.

- 카카오 로컬 API (`/v2/local/search/keyword`) 사용
- 관리자 카페 추가 폼에 장소 검색 UI 추가
- 검색 결과 선택 시 lat, lng, address 자동 채움
- 환경 변수 추가: `KAKAO_REST_API_KEY` (서버 전용, 클라이언트 노출 금지)

---

### P5-B — 사용자 카페 위치 제보 + 관리자 승인 플로우

> P3(회원관리) + P5-A 완료 후 진행

**플로우:**
```
사용자 제보 → 제보 테이블 저장 → 관리자 알림
→ 관리자 검토 → 승인(카페 등록) / 반려(사유 전달)
```

**기능 목록:**
- 사용자: 지도에서 위치 핀 찍기 + 카페명·설명 입력 → 제보 제출
- 관리자 페이지: 제보 목록 조회, 카카오맵 연동으로 위치 확인
- 관리자 승인 시 cafes 테이블에 자동 등록
- 관리자 반려 시 사용자에게 반려 사유 표시 (마이페이지)

**추가 DB 테이블:**
```sql
cafe_reports  -- user_id, name, address, lat, lng, description, status('pending'|'approved'|'rejected'), reject_reason, created_at
```

---

## 최근 완료 작업 요약

| 날짜 | 작업 | 결과 |
|---|---|---|
| 2026-05-14 | coffffe-status.md / coffffe-plan.md 초기 작성 | 완료 |
| 2026-05-14 | CBTI 결과 유형 상세화 (recommend, pairingNotes, cafeStyle) | 완료 |
| 2026-05-14 | P1 전체 UI 개편 + 지도 풀스크린 메인화 | 완료 |
