# coFFFFFe-map 현재 상태

> 마지막 갱신: 2026-05-19

---

## 1. 프로젝트 개요

안산 스페셜티 카페 큐레이션 웹앱. 개인/소규모 규모.  
현재 단계: **v1.x** — Supabase 연동 완료, 관리자 페이지 완료.

브랜드 컬러: amber/brown 계열 (`#5a2e11`, `#d66612`, `#f3eee7`)

---

## 2. 기술 스택

| 항목 | 내용 |
|---|---|
| 프레임워크 | Next.js App Router (TypeScript) |
| 스타일 | Tailwind CSS + 인라인 색상 변수 (`#5a2e11` 등 하드코딩) |
| 아이콘 | lucide-react |
| 폰트 | Noto Sans KR (Google Fonts) |
| 지도 | Kakao Map JS SDK (`NEXT_PUBLIC_KAKAO_MAP_API_KEY`) |
| DB | Supabase (`cafes` 테이블, 8개 카페 마이그레이션 완료) |
| 데이터 fallback | `src/data/cafes.json` (Supabase 실패 시) |
| 배포 | Vercel |

---

## 3. 라우트 구조

| 경로 | 파일 | 특이사항 |
|---|---|---|
| `/` | `src/app/page.tsx` | Client Component. `/api/cafes` fetch → `MapView`. SplashScreen(세션당 1회) |
| `/map` | `src/app/map/page.tsx` | `/`로 redirect |
| `/cafes/[id]` | `src/app/cafes/[id]/page.tsx` | 서버 컴포넌트. `notFound()` 처리 |
| `/beans` | `src/app/beans/page.tsx` | 클라이언트. 원산지 + 향미 필터 |
| `/cbti` | `src/app/cbti/page.tsx` | 클라이언트. 커피 성향 테스트 |
| `/admin` | `src/app/admin/page.tsx` | Client Component. httpOnly 쿠키 게이트 (`AdminLayout`) |
| `/api/cafes` | `src/app/api/cafes/route.ts` | GET. Supabase 우선, 실패 시 cafes.json fallback. 필터 쿼리 지원 |
| `/api/admin/cafes` | `src/app/api/admin/cafes/route.ts` | POST/PUT/DELETE. 쿠키 또는 Bearer 토큰 인증 |
| `/api/kakao/search` | `src/app/api/kakao/search/route.ts` | 카카오 장소 검색 서버 프록시 |

---

## 4. 주요 컴포넌트

| 컴포넌트 | 역할 |
|---|---|
| `SplashScreen` | sessionStorage 기반 최초 1회 로딩 화면 |
| `ThemeToggle` | 다크/라이트 전환 (localStorage `theme` 키) |
| `MapView` | 필터·검색·퀵카테고리 상태 관리 + KakaoMap + Sidebar + BottomSheet |
| `KakaoMap` | dynamic import (ssr:false). `CustomOverlay` 커피 핀 마커. 선택 시 크기 업 + 라벨 |
| `FilterBar` | 로스팅·산지·추출 필터 칩 UI |
| `Sidebar` | 데스크톱 좌측 패널 / 모바일 bottom-sheet 슬라이드. 퀵카테고리(전체·스페셜티·로스터리·디저트·노트북·반려동물) 포함 |
| `BottomSheet` | 모바일 선택 카페 하단 패널 |
| `SearchBar` | 카페명/설명/주소/태그 검색 |
| `CafeListItem` | 사이드바 카페 목록 아이템 |
| `CafePreviewCard` | 선택 카페 상세 요약 카드 |
| `KakaoMapScript` | `<head>`에 Kakao SDK 스크립트 삽입 |

---

## 5. 라이브러리

| 파일 | 역할 |
|---|---|
| `src/lib/supabase.ts` | `createSupabaseClient()` (읽기, anon key) / `createSupabaseAdminClient()` (쓰기, service role key). `server-only` import 포함 |
| `src/lib/admin-auth.ts` | `isAuthorizedAdminRequest()` (쿠키 또는 Bearer 토큰), `isAdminSessionValue()`, `getAdminSecret()`. `server-only` import 포함 |

---

## 6. 데이터 구조

### 카페 (`src/data/cafes.json` fallback / Supabase `cafes` 테이블)

```ts
interface Cafe {
  id: string           // slug (예: "drift-coffee")
  name: string
  shortDescription: string
  fullDescription: string
  address: string
  lat: number
  lng: number
  roastLevels: RoastLevel[]   // 'light' | 'medium-light' | 'medium' | 'medium-dark' | 'dark'
  beanOrigins: BeanOrigin[]   // 'ethiopia' | 'colombia' | 'kenya' | ...
  brewMethods: BrewMethod[]   // 'espresso' | 'pour-over' | 'cold-brew' | 'aeropress' | 'siphon'
  qualityScore: number
  tags: string[]
  openHours: string
  closedDays: string[]
  phone?: string
  instagramHandle?: string
  kakaoPlaceId?: string        // 2026-05-19 추가
}
```

Supabase 컬럼: snake_case. `/api/cafes/route.ts`의 `toCafe()` 함수로 camelCase 변환.

현재 카페 수: **8곳** (Supabase 마이그레이션 완료)

### 원두 (`src/data/beans.ts`)

필드: `id`, `name`, `nameEn`, `flag`, `origin`, `region`, `variety`, `process`, `roast`, `body`, `acidity`, `notes: string[]`, `desc`, `special?`

---

## 7. CBTI 구조

- Axis: `L/D` (로스팅), `S/B` (원두 성향), `E/F` (추출), `H/C` (온도)
- 문항 수: 10개
- Phase: `intro` → `quiz` → `result`
- 결과 유형: 2^4 = 16가지 조합

---

## 8. 테마 시스템

- `layout.tsx` 인라인 스크립트로 FOUC 방지
- CSS 변수: `--background`, `--foreground`, `--card-bg`, `--card-border`, `--card-ring`, `--card-icon-bg`, `--accent`, `--text-secondary`
- dark 클래스는 `<html>` 에 적용
- 주의: MapView/Sidebar/KakaoMap은 CSS 변수 대신 색상 하드코딩 (`#5a2e11` 등). 다크모드 미적용.

---

## 9. 환경 변수

| 키 | 용도 | 노출 |
|---|---|---|
| `NEXT_PUBLIC_KAKAO_MAP_API_KEY` | 카카오 지도 JS SDK | 브라우저 허용 |
| `SUPABASE_URL` | Supabase 프로젝트 URL | 서버 전용 |
| `SUPABASE_ANON_KEY` | Supabase 익명 키 (읽기) | 서버 전용 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 서비스 롤 키 (쓰기) | 서버 전용 |
| `KAKAO_REST_API_KEY` | 카카오 장소 검색 REST API | 서버 전용 |
| `ADMIN_SECRET` | 관리자 페이지 비밀번호 | 서버 전용 |

---

## 10. Git 현황 (2026-05-19 기준)

| 커밋 | 내용 |
|---|---|
| `c945639` | 수파베이스 연결 (supabase 연동, admin 페이지, 커스텀 마커 전체) |
| `e9141d3` | UIUX 개선 (Sidebar 퀵카테고리, FilterBar, MapView, CafeListItem 개선) |
| `f211987` | docs: update map UI plan |
| `7713115` | feat: make map the main screen |

브랜치: `main`

---

## 11. 알려진 상태 / 미완 사항

- `cafes.json` fallback 유지 중. Supabase 안정적이면 추후 삭제 가능.
- MapView 하단 "목록 보기" 버튼이 `md:hidden`/`md:flex` 두 개로 중복 렌더링됨 (로직은 동일).
- `/cafes/[id]` 뒤로가기 → `/` 이동.
- 지도 우상단 Bell/Profile 버튼, 우중단 +/-/LocateFixed/Layers 버튼은 UI만 있고 기능 없음.
- 지도 상단 "이 지역 검색" 버튼도 UI만.
- Sidebar 하단 "내 주변 카페 더보기" 버튼은 `/beans`로 이동 (의미상 약간 어색).
- 관리자 페이지 `POST /api/admin/cafes` 호출 시 `Authorization` 헤더 없이 쿠키만 사용.
- 카페 데이터는 목 데이터 (실제 영업 정보 미검증).
- MapView/Sidebar는 CSS 변수 미사용 — 다크모드 미지원.
- v2.0 후보: 검색/필터 고도화, 지도 버튼 기능 구현, 다크모드 확장.
