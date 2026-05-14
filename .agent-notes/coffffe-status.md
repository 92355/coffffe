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
| `/` | `src/app/page.tsx` | 홈. SplashScreen(세션당 1회), 카드 그리드 |
| `/map` | `src/app/map/page.tsx` | 서버 컴포넌트. `MapView` 렌더링 |
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
| `CafePreviewCard` | 지도에서 마커 클릭 시 하단에 뜨는 카페 미리보기 |
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
- `/cafes/[id]` 뒤로가기: `/`(홈) 이동 (지도로 돌아가기 텍스트지만 실제로는 홈 링크)
- 카페 데이터는 목 데이터 (실제 영업 정보 미검증)
- 검색 기능 없음 (지도 필터는 있음)
- v2.0 후보: 데이터 관리 방식 개선, 검색/필터 고도화, 배포 안정화
