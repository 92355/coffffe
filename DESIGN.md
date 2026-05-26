# coFFFFFe-map 디자인 문서

> 스페셜티 카페 탐색 웹앱. Next.js App Router + Supabase + Kakao Maps.

---

## 1. 기술 스택

| 분류 | 사용 기술 |
|------|----------|
| 프레임워크 | Next.js 16.2.4 (App Router) |
| UI | React 19.2.4, TypeScript 5 |
| 스타일링 | Tailwind CSS v4 + CSS 변수 |
| 모션 | Framer Motion 12 |
| 아이콘 | lucide-react |
| 백엔드 | Supabase (PostgreSQL) + Next.js API Routes |
| 지도 | Kakao Map JavaScript SDK |
| 인증 | Kakao OAuth + Supabase 세션 |

---

## 2. 디자인 토큰 (`src/app/globals.css`)

### 라이트 모드 (`:root`)

| 변수 | 값 | 용도 |
|------|----|------|
| `--bg` | `#F6F3EC` | 페이지 배경 |
| `--surface` | `#FFFFFF` | 카드/패널 배경 |
| `--primary` | `#151412` | 가장 강한 텍스트 |
| `--brown` | `#6B432A` | 커피 브라운 (버튼, 포인트) |
| `--accent` | `#8FAE5A` | 그린 액센트 (원두, 하이라이트) |
| `--sub` | `#C08A5A` | 웜 탠 (보조 강조) |
| `--text` | `#1F1D1A` | 본문 텍스트 |
| `--muted` | `#746A60` | 보조/비활성 텍스트 |
| `--border` | `#E5DCCE` | 경계선 |
| `--brown-soft` | `#F0E5DA` | 카드 배경 소프트 |
| `--accent-soft` | `#EEF5DF` | 그린 소프트 |

### 다크 모드 (`.dark`)

| 변수 | 값 |
|------|----|
| `--background` | `#161616` |
| `--foreground` | `#EFEFEF` |
| `--text-secondary` | `#999999` |
| `--accent` | `#A0C068` |
| `--card-bg` | `#222222` |

### 카드 공통 변수

```css
--card-shadow: 0 12px 40px rgba(107, 67, 42, 0.10)
--card-border: rgba(107, 67, 42, 0.22)
--card-icon-bg: rgba(107, 67, 42, 0.10)
```

### 폰트

```css
--font-sans: var(--font-noto-sans-kr), 'Apple SD Gothic Neo', sans-serif
```

---

## 3. 애니메이션 시스템

| 클래스 | 동작 | 이징 |
|--------|------|------|
| `.card-animate` | 진입 fadeInUp (0.5s) + hover lift (-5px, scale 1.015) | `cubic-bezier(0.34, 1.4, 0.64, 1)` |
| `.card-wide-animate` | hover 전용 그림자 강화 | ease |
| `.anim-in` | 단순 fadeInUp (0.4s) | `cubic-bezier(0.34, 1.4, 0.64, 1)` |
| `.bean-card` | IntersectionObserver 진입 시 `.bean-card--visible` 토글 | ease |
| `.bean-card--visible` | opacity 0→1, translateY(28px)→0 | `cubic-bezier(0.34, 1.2, 0.64, 1)` |
| `.sc-bubble` | 스플래시 버블 위로 떠오르기 (2s, infinite) | ease-out |
| `.toast-animate` | 토스트 팝업 (0.35s) | `cubic-bezier(0.34, 1.4, 0.64, 1)` |
| `.scroll-arrow` | 히어로 스크롤 유도 화살표 (1.8s, infinite) | ease-in-out |

**모바일 bean-card 비활성 처리**:
```css
[data-mobile-active="false"] { opacity: 0.42; filter: blur(0.4px) saturate(0.82); }
```

---

## 4. 글래스모피즘 유틸

| 클래스 | blur | 용도 |
|--------|------|------|
| `.glass-panel` | 18px | 패널/시트 배경 |
| `.glass-bar` | 14px | 헤더/바 |
| `.glass-map-*` | 20px (desktop) / 10px (mobile) | 지도 오버레이 (GPU 절약) |
| `.map-shell` | — | 지도 페이지 컨테이너 (100dvh, overflow: hidden) |

---

## 5. 라우트 구조

| 라우트 | 설명 | 렌더링 |
|--------|------|--------|
| `/` | 홈/랜딩 | Client |
| `/map` | 카카오 지도 + 카페 목록 | Client (map SSR 불가) |
| `/cafes/[id]` | 카페 상세 | Server (Supabase SSR) |
| `/cbti` | 커피 성격 테스트 | Client |
| `/beans` | 원두 탐색기 | Client |
| `/admin` | 관리자 패널 | Client (세션 인증) |
| `/api/cafes` | 카페 전체 목록 API | Server |
| `/api/beans` | 원두 목록 API | Server |
| `/api/me/*` | 인증된 사용자 API | Server |

---

## 6. 타입 시스템

### Cafe (`src/types/cafe.ts`)

```ts
interface Cafe {
  id: string
  name: string
  shortDescription: string
  fullDescription: string
  address: string
  lat: number
  lng: number
  roastLevels: RoastLevel[]
  beanOrigins: BeanOrigin[]
  brewMethods: BrewMethod[]
  qualityScore: number
  tags: string[]
  openHours: string
  closedDays: string[]
  images?: string[]
  phone?: string
  instagramHandle?: string
  kakaoPlaceId?: string
  showAroma?: boolean
  updatedAt?: string
}
```

### 열거형

```ts
type RoastLevel = 'light' | 'medium-light' | 'medium' | 'medium-dark' | 'dark'
type BrewMethod = 'espresso' | 'pour-over' | 'cold-brew' | 'aeropress' | 'siphon'
type BeanOrigin = 'ethiopia' | 'colombia' | 'kenya' | 'brazil' | 'guatemala'
               | 'indonesia' | 'panama' | 'rwanda' | 'costa-rica'

interface FilterState {
  roastLevel: RoastLevel | null
  beanOrigin: BeanOrigin | null
  brewMethod: BrewMethod | null
}
```

---

## 7. 페이지별 디자인

### 7-1. 홈 (`/`)

**구조**:
```
HomeHeader (sticky)
  ├── 로고
  ├── 사용자 아바타 / 관리자 링크
  └── 카카오 로그인 버튼 (#FEE500) / 로그아웃

HomeContent
  ├── 히어로 — 방사형 그라데이션 배경 (커피 브라운 + 그린)
  ├── 서비스 카드 (CBTI, 원두 정보)
  ├── 추천 원두 캐러셀 (4개, 스태거 애니메이션)
  └── CTA 버튼 → /map, /cafes/[id]
```

**카카오 로그인 버튼**:
- 배경: `#FEE500`, 텍스트: `#191600`
- 아이콘: 카카오 말풍선 SVG (14×14)
- 모바일: 아이콘만 / sm 이상: "카카오 로그인" 텍스트 표시

---

### 7-2. 지도 (`/map`)

**구조**:
```
MapView
├── KakaoMap (dynamic import, ssr: false)
├── MapHeader — 검색, 테마 토글, 프로필 메뉴
├── FilterBar — 로스팅/원산지/추출 방식 필터
├── 빠른 카테고리 태그 — 스페셜티, 로스터리, 디저트, 노트북, 반려동물
├── Sidebar — 카페 목록 (데스크탑 고정, 모바일 토글)
├── BottomSheet — 모바일 카페 카드 팝업
├── ReportSheet — 새 카페 제보 폼
└── SplashScreen — 첫 방문 애니메이션 (sessionStorage 플래그)
```

**주요 훅**:
| 훅 | 역할 |
|----|------|
| `useMapState()` | 지도 bounds, zoom, pick mode |
| `useMapViewUI()` | 사이드바/필터/프로필 메뉴 collapse |
| `useLocationState()` | 사용자 위치 (geolocation) |
| `useSavedCafes()` | 즐겨찾기 카페 ID (Supabase) |
| `useReportState()` | 새 카페 제보 플로우 |
| `useKakaoMap()` | Kakao 지도 인스턴스 ref |

**필터 로직** (`src/lib/cafeFilters.ts`):
- `matchesFilters(cafe, filters)` — AND 조건 (3개 필터 동시 적용)
- `matchesSearch(cafe, query)` — 이름/설명/주소/태그 부분 일치
- `matchesCategory(cafe, category)` — 카테고리 태그 검색

---

### 7-3. 카페 상세 (`/cafes/[id]`)

**구조**:
```
카드
├── 히어로 이미지 (없으면 카페 ID 기반 결정론적 HSL 색상 플레이스홀더)
├── 이름 + 짧은 설명
├── 뱃지 — 로스팅(amber), 원산지(tan), 추출방식(blue)
├── 운영시간 / 휴무일
├── 연락처 (전화, 인스타그램)
├── 지도 이동 링크 (네이버, 카카오, 구글)
└── CafeFootprintPanel (방문 기록)
```

**플레이스홀더 색상**: `cafeThumb.ts`에서 카페 ID → HSL hue 계산 (결정론적)

**백엔드**: Server Component → Supabase `cafes` 테이블 직접 조회 → 없으면 404

---

### 7-4. CBTI (`/cbti`)

**16가지 결과**: 4개 축 조합 (2⁴)

| 축 | 선택지 |
|----|--------|
| 로스팅 | L(라이트) vs D(다크) |
| 원두 | S(싱글오리진) vs B(블렌드) |
| 추출 | E(에스프레소) vs F(필터) |
| 온도 | H(핫) vs C(콜드) |

**플로우**:
```
인트로 → 퀴즈 (10문항) → 결과 카드
```

- 문항 간 320ms 딜레이 (선택 하이라이트 후 자동 진행)
- 앞/뒤 이동 가능
- 인증 유저: 결과 자동 저장 → `PUT /api/me/cbti`

**결과 데이터 구조**:
```ts
{
  emoji: '🌸',
  name: '예가체프 에스프레소',
  desc: string,
  traits: string[],
  recommend: string,
  pairingNotes: string[],
  cafeStyle: string,
}
```

---

### 7-5. 원두 (`/beans`)

→ [원두 상세 디자인은 아래 섹션 8 참조]

---

### 7-6. 관리자 (`/admin`)

**인증**: Kakao 세션 + `ADMIN_KAKAO_IDS` 환경 변수 일치 여부

**기능**:
- 카페 CRUD
- 제보 확인/반영
- 유저 관리
- 리뷰 모더레이션

---

## 8. 원두 탐색기 상세 (`/beans`)

### Bean 타입 (`src/data/beans.ts`)

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | `string` | URL 슬러그 |
| `name` | `string` | 한국어 이름 |
| `nameEn` | `string` | 영어 이름 |
| `origin` | `string` | 원산지 국가 |
| `region` | `string` | 세부 지역 |
| `variety` | `string` | 품종 |
| `process` | `ProcessMethod` | 가공 방식 |
| `roast` | `RoastLevel` | 로스팅 단계 |
| `notes` | `string[]` | 향미 노트 |
| `body` | `string` | 바디감 |
| `acidity` | `string` | 산미 |
| `desc` | `string` | 한 줄 설명 |
| `flag` | `string` | 국기 이모지 |
| `image?` | `string` | 헤더 배경 이미지 (선택) |
| `special?` | `string` | 희귀/특이사항 (선택) |

```ts
type ProcessMethod = '워시드' | '내추럴' | '허니' | '웻헐드' | '무산소'
```

### 로스팅 색상

| 단계 | 색상 |
|------|------|
| light | `#D4A373` |
| medium-light | `#C6955A` |
| medium | `#B8834A` |
| medium-dark | `#8B5E3C` |
| dark | `#5C3317` |

### 산지 그룹

| 그룹 | 국가 |
|------|------|
| 아프리카 | 에티오피아, 케냐, 부룬디 |
| 중남미 | 파나마, 콜롬비아, 자메이카, 코스타리카, 과테말라 |
| 아시아·태평양 | 인도네시아, 미국(하와이) |
| 중동 | 예멘 |

### 데이터 소스

- 1차: Supabase `beans` 테이블 (`/api/beans`)
- fallback: `src/data/beans.ts` 정적 배열 (API 실패 시)

### UI 구조

```
Header (sticky)
Origin 필터 칩 (가로 스크롤)
향미 필터 패널
  ├── 향미 검색 input
  ├── 향미 칩 (빈도순, 기본 14개)
  └── "N개 더 보기" 토글
결과 수 ("N종의 원두")
Bean 카드 목록
  ├── 모바일: 가로 스냅 스크롤 (1열)
  └── sm 이상: 2열 그리드
dot indicator (모바일 전용, range input 조작)
```

### Bean 카드 구조

```
┌────────────────────────────┐
│ 히어로 (ROAST_COLOR 그라데이션)│
│   원산지                    │
│   원두 이름 (대형)           │
│   [로스팅 배지]              │
│   ┌──────────┬──────────┐  │
│   │ 바디      │ 산미     │  │
│   └──────────┴──────────┘  │
├────────────────────────────┤
│ 설명 (한 줄)                │
│ 지역 / 품종 / 가공 메타 행   │
│ 향미 태그                   │
│ [특이사항 배지] (있을 때만)  │
└────────────────────────────┘
```

---

## 9. 데이터 흐름

### Supabase 테이블

| 테이블 | 용도 |
|--------|------|
| `cafes` | 카페 데이터 (이미지 포함) |
| `beans` | 원두 데이터 |
| `users` | 인증 + 프로필 (동물 아바타, CBTI 결과) |
| `favorite_cafes` | 즐겨찾기 |
| `cafe_footprints` | 방문 기록 |
| `reports` | 카페 제보 |

### API Routes

| 엔드포인트 | 설명 |
|-----------|------|
| `GET /api/cafes` | 전체 카페 (5분 `unstable_cache`) |
| `GET /api/beans` | 전체 원두 (Supabase fallback 정적) |
| `PUT /api/me/cbti` | CBTI 결과 저장 |
| `POST /api/cafes/[id]/footprint` | 방문 체크인 |
| `POST /api/admin/cafes` | 카페 생성 (관리자) |
| `PUT /api/admin/cafes` | 카페 수정 (관리자, `revalidateTag('cafes')`) |
| `DELETE /api/admin/cafes` | 카페 삭제 (관리자, `revalidateTag('cafes')`) |

---

## 10. 인증 & 권한

| 기능 | 비로그인 | 로그인 |
|------|---------|--------|
| 지도/카페 탐색 | ✓ | ✓ |
| CBTI 퀴즈 | ✓ | ✓ (결과 저장) |
| 즐겨찾기 | ✗ | ✓ |
| 카페 제보 | ✓ (검토 후 반영) | ✓ |
| 방문 기록 | ✗ | ✓ |
| 관리자 패널 | ✗ | ✓ (`ADMIN_KAKAO_IDS` 일치 시) |

---

## 11. 반응형 UX

| 항목 | 모바일 | 데스크탑 (sm 이상) |
|------|-------|-----------------|
| 카페 목록 | BottomSheet | 사이드바 고정 |
| Bean 카드 | 가로 스냅 스크롤 (1열) | 2열 그리드 |
| 지도 blur | 10px (GPU 절약) | 20px |
| 헤더 로그인 버튼 | 아이콘만 | 아이콘 + 텍스트 |
| 사이드바 | 기본 숨김, 토글 | 기본 표시 |

---

## 12. 미구현 영역

| 기능 | 상태 |
|------|------|
| `/beans/[id]` 상세 페이지 | 미구현 |
| 원두 즐겨찾기 | 미구현 |
| 원두 관리자 CRUD | 미구현 (`/api/admin/beans` 없음) |
| 로스팅/가공 방식 필터 (원두) | 미구현 |
| 로그인 후 익명 즐겨찾기 → Supabase 병합 | 미구현 |
| Bell(알림) 버튼 | UI만, 기능 없음 |
| MapView 다크모드 | 하드코딩 색상 다수, 전체 교체 필요 |
| 커피 뱃지 시스템 | 미설계 |
| 제보 사진 업로드 | 미설계 |
| 사용자 카페 리스트 (`saved_lists`) | DB 스키마만, UI/API 없음 |
