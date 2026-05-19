# coFFFFFe-map 현재 상태

> 마지막 갱신: 2026-05-14

---

## 1. 프로젝트 개요

안산 스페셜티 카페 큐레이션 웹앱. 개인/소규모 규모.  
현재 단계: **v1.x frontend-first MVP** — 정적 데이터 기반.

브랜드 컬러: `--accent` = amber 계열 (`#C58B5C` 유추)

---

## 2. 기술 스택

| 항목 | 내용 |
|---|---|
| 프레임워크 | Next.js App Router (TypeScript) |
| 스타일 | Tailwind CSS + CSS 변수 (`var(--foreground)` 등) |
| 아이콘 | lucide-react |
| 폰트 | Noto Sans KR (Google Fonts) |
| 지도 | Kakao Map JS SDK (`NEXT_PUBLIC_KAKAO_MAP_API_KEY`) |
| 데이터 | 정적 파일 (cafes.json, beans.ts) |
| 배포 | Vercel (추정, vercel remote 등록 확인됨) |

---

## 3. 라우트 구조

| 경로 | 파일 | 특이사항 |
|---|---|---|
| `/` | `src/app/page.tsx` | 지도 풀스크린 메인. SplashScreen(세션당 1회), `MapView` 렌더링 |
| `/map` | `src/app/map/page.tsx` | `/`로 redirect |
| `/cafes/[id]` | `src/app/cafes/[id]/page.tsx` | 서버 컴포넌트. `notFound()` 처리 |
| `/beans` | `src/app/beans/page.tsx` | 클라이언트. 원산지 + 향미 필터 |
| `/cbti` | `src/app/cbti/page.tsx` | 클라이언트. 커피 성향 테스트 |
| `/api/cafes` | `src/app/api/cafes/route.ts` | cafes.json 반환 API |

---

## 4. 주요 컴포넌트

| 컴포넌트 | 역할 |
|---|---|
| `SplashScreen` | sessionStorage 기반 최초 1회 로딩 화면 |
| `ThemeToggle` | 다크/라이트 전환 (localStorage `theme` 키) |
| `MapView` | 필터 상태 관리 + KakaoMap + CafePreviewCard 조합 |
| `KakaoMap` | dynamic import (ssr:false), 지도 렌더링 + 마커 |
| `FilterBar` | 로스팅·산지·추출 필터 칩 UI |
| `Sidebar` | 데스크톱 좌측 패널. 검색·필터·리스트·상세 표시 |
| `BottomSheet` | 모바일 선택 카페 하단 패널 |
| `SearchBar` | 카페명/설명/주소/태그 검색 |
| `CafeListItem` | 사이드바 카페 목록 아이템 |
| `CafePreviewCard` | 선택 카페 상세 요약 카드 |
| `KakaoMapScript` | `<head>`에 Kakao SDK 스크립트 삽입 |

---

## 5. 데이터 구조

### 카페 (`src/data/cafes.json`, `src/types/cafe.ts`)

```ts
interface Cafe {
  id: string           // slug 형태 (예: "drift-coffee")
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
}
```

현재 카페 수: **7곳** (안산 단원구·상록구)

### 원두 (`src/data/beans.ts`)

필드: `id`, `name`, `nameEn`, `flag`, `origin`, `region`, `variety`, `process`, `roast`, `body`, `acidity`, `notes: string[]`, `desc`, `special?`

---

## 6. CBTI 구조

- Axis: `L/D` (로스팅), `S/B` (원두 성향), `E/F` (추출), `H/C` (온도)
- 문항 수: 10개
- Phase: `intro` → `quiz` → `result`
- 결과 유형: 2^4 = 16가지 조합 (예: LSEH, DBFC 등)

---

## 7. 테마 시스템

- layout.tsx 인라인 스크립트로 FOUC 방지
- CSS 변수: `--background`, `--foreground`, `--card-bg`, `--card-border`, `--card-ring`, `--card-icon-bg`, `--accent`, `--text-secondary`
- dark 클래스는 `<html>` 에 적용

---

## 8. 환경 변수

| 키 | 용도 |
|---|---|
| `NEXT_PUBLIC_KAKAO_MAP_API_KEY` | 카카오 지도 JS SDK (브라우저 노출 허용) |

---

## 9. Git 현황 (2026-05-14 기준)

| 커밋 | 내용 |
|---|---|
| `209c5fc` | docs: update agent guide |
| `53fe48c` | chore: remove claude worktrees from git |
| `403a00f` | remote add |
| `19d26f0` | style:background |
| `62bc9d5` | feat:로딩페이지 |

브랜치: `main` / 워킹 트리: clean

---

## 10. 알려진 상태 / 미완 사항

- `출시 예정` 카드: placeholder, 기능 없음 (클릭 시 토스트만 표시)
- `/cafes/[id]` 뒤로가기: `/` 이동
- 카페 데이터는 목 데이터 (실제 영업 정보 미검증)
- 지도 메인 검색은 카페명·설명·주소·태그 기준
- v2.0 후보: 데이터 관리 방식 개선, 검색/필터 고도화, 배포 안정화

---

## 11. 2026-05-19 Phase 1 진행 상태

- `@supabase/supabase-js` 설치 완료.
- `src/lib/supabase.ts` 서버 전용 Supabase 클라이언트 추가.
- `supabase/migrations/20260519000000_create_cafes.sql` 테이블 생성 SQL 추가.
- `scripts/migrate-cafes-to-supabase.mjs` 마이그레이션 스크립트 추가.
- `.env.local.example`에 필요한 환경 변수 키 목록 추가.
- 현재 `.env.local`은 없음. 실제 Supabase 마이그레이션 실행과 Vercel 환경 변수 등록은 남음.
- `/api/cafes`는 Supabase 조회 우선, 실패 시 기존 `cafes.json` fallback 사용.
- `/api/kakao/search` 서버 프록시 추가. `KAKAO_REST_API_KEY`는 서버에서만 사용.
- `/admin` 비밀번호 게이트, 카페 CRUD API, 카카오 검색 기반 관리 UI 추가.
- `KakaoMap.tsx` 기본 마커를 `CustomOverlay` 커피 핀으로 교체.
- `cafes.json`은 실제 DB 이관 실행 전이라 유지.
- `.env.local` 존재 확인 완료.
- `npm run migrate:cafes` 재실행 성공. 8개 카페를 Supabase에 업서트 완료.
- `cafes.json`은 `/api/cafes` fallback으로 아직 유지.
