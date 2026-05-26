# 원두 페이지 디자인 문서

> 라우트: `/beans` · 컴포넌트: `src/app/beans/page.tsx` · 데이터: `src/data/beans.ts`

---

## 1. 데이터 모델

### Bean 타입 (`src/data/beans.ts`)

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | `string` | URL 슬러그 형태 (예: `panama-geisha`) |
| `name` | `string` | 한국어 이름 |
| `nameEn` | `string` | 영어 이름 |
| `origin` | `string` | 원산지 국가 (예: `파나마`) |
| `region` | `string` | 세부 지역 (예: `보케테 (Boquete)`) |
| `variety` | `string` | 품종 (예: `게이샤 (Gesha)`) |
| `process` | `ProcessMethod` | 가공 방식 |
| `roast` | `RoastLevel` | 로스팅 단계 |
| `notes` | `string[]` | 향미 노트 목록 |
| `body` | `string` | 바디감 설명 |
| `acidity` | `string` | 산미 설명 |
| `desc` | `string` | 한 줄 설명 |
| `flag` | `string` | 국기 이모지 |
| `image?` | `string` | 헤더 배경 이미지 URL (선택) |
| `special?` | `string` | 희귀/고가 등 특이사항 (선택) |

### 가공 방식 (`ProcessMethod`)

`워시드` | `내추럴` | `허니` | `웻헐드` | `무산소`

### 로스팅 단계 (`RoastLevel`)

`light` | `medium-light` | `medium` | `medium-dark` | `dark`

각 단계별 색상 (`ROAST_COLOR`):

| 단계 | 색상 |
|------|------|
| light | `#D4A373` |
| medium-light | `#C6955A` |
| medium | `#B8834A` |
| medium-dark | `#8B5E3C` |
| dark | `#5C3317` |

### 산지 그룹 (`ORIGINS` / `ORIGIN_MAP`)

| 그룹 | 포함 국가 |
|------|----------|
| 아프리카 | 에티오피아, 케냐, 부룬디 |
| 중남미 | 파나마, 콜롬비아, 자메이카, 코스타리카, 과테말라 |
| 아시아·태평양 | 인도네시아, 미국(하와이) |
| 중동 | 예멘 |

---

## 2. 데이터 소스

- **1차**: Supabase `beans` 테이블 (`/api/beans` GET)
- **2차 fallback**: `src/data/beans.ts` 정적 배열 (API 실패 시 자동 사용)
- 페이지 진입 시 `useEffect`로 API 호출 → 성공하면 상태 덮어씀

### Supabase `beans` 테이블 컬럼

| DB 컬럼 | Bean 필드 |
|---------|----------|
| `id` | `id` |
| `name` | `name` |
| `name_en` | `nameEn` |
| `origin` | `origin` |
| `region` | `region` |
| `variety` | `variety` |
| `process` | `process` |
| `roast` | `roast` |
| `notes` | `notes` |
| `body` | `body` |
| `acidity` | `acidity` |
| `description` | `desc` |
| `flag` | `flag` |
| `special` | `special` |

---

## 3. UI 구조

```
/beans
├── Header (sticky)
│   ├── ← 뒤로가기 (/)
│   ├── "원두 알아보기"
│   └── ThemeToggle
│
├── Origin 필터 칩 (가로 스크롤)
│   └── 전체 / 아프리카 / 중남미 / 아시아·태평양 / 중동
│
├── 향미 필터 패널
│   ├── 향미 검색 input
│   ├── 초기화 버튼 (선택 시 노출)
│   ├── 향미 칩 목록 (빈도순 정렬, 기본 14개 노출)
│   └── "태그 N개 더 보기" 토글
│
├── 결과 수 표시 ("N종의 원두 · 향미 M개 선택")
│
└── Bean 카드 목록
    ├── 모바일: 가로 스냅 스크롤 (1열)
    ├── sm 이상: 2열 그리드
    └── 하단 dot indicator (모바일 전용, range input으로 조작)
```

---

## 4. Bean 카드 구조

```
┌─────────────────────────────┐
│  히어로 영역 (로스팅 색상)     │
│  ┌──────────────────────┐   │
│  │ 원산지                │   │
│  │ 원두 이름 (대형)       │   │
│  │ [로스팅 단계 배지]     │   │
│  │ ┌────────┬─────────┐ │   │
│  │ │ 바디   │ 산미     │ │   │
│  │ └────────┴─────────┘ │   │
│  └──────────────────────┘   │
│                             │
│  본문 영역                   │
│  ┌──────────────────────┐   │
│  │ 설명 (한 줄)          │   │
│  └──────────────────────┘   │
│  지역 / 품종 / 가공 메타 행   │
│  ┌──────────────────────┐   │
│  │ 향미 태그 목록        │   │
│  └──────────────────────┘   │
│  [특이사항 배지] (있을 때만) │
└─────────────────────────────┘
```

- 히어로 배경: `ROAST_COLOR[bean.roast]` 그라데이션
- `bean.image` 있으면 배경 이미지 위에 그라데이션 오버레이
- 카드 진입 애니메이션: `IntersectionObserver` → `.bean-card--visible` 클래스 토글

---

## 5. 필터 로직

### 산지 필터
`ORIGIN_MAP[bean.origin] === activeOrigin` (또는 `전체`)

### 향미 필터
- 칩 선택: `bean.notes.some(n => activeNotes.has(n))` (OR 조건)
- 검색: `bean.notes.some(n => n.toLowerCase().includes(query))`
- 칩 선택 + 검색 동시 적용 가능

### 향미 칩 정렬
전체 원두에서 노트 등장 빈도 내림차순 정렬

---

## 6. 모바일 인터랙션

- 카드 가로 스냅 스크롤 (`snap-x snap-mandatory`)
- `handleCardScroll`: 스크롤 중 가장 가까운 카드 인덱스 계산 → dot indicator 업데이트
- dot indicator: `range input` 겹쳐 터치 조작 가능
- 필터 변경 시 목록 맨 앞으로 자동 스크롤

---

## 7. 비주얼 시스템

| 요소 | 값 |
|------|-----|
| 카드 배경 | `bg-white/[0.88]` + `backdrop-blur-2xl` |
| 카드 그림자 | `0_18px_48px_rgba(107,67,42,0.12)` |
| 카드 border-radius | `1.65rem` |
| 활성 필터 칩 색 | `var(--accent)` |
| 비활성 필터 칩 | `bg-white/60` + `border-white/70` |
| 다크모드 칩 | `dark:bg-white/15` + `dark:border-white/30` |
| special 배지 아이콘 | `<Sparkles>` (lucide-react) |

---

## 8. 미구현 / 확장 가능 영역

| 기능 | 상태 | 비고 |
|------|------|------|
| `bean.image` 헤더 배경 | 코드 있음, 데이터 없음 | Supabase `beans` 테이블에 `image` 컬럼 추가 필요 |
| 원두 상세 페이지 (`/beans/[id]`) | 미구현 | 카드 클릭 시 이동 라우트 없음 |
| 원두 즐겨찾기 | 미구현 | 카페 즐겨찾기와 별도 설계 필요 |
| 원두 관리자 CRUD | 미구현 | `/admin`에 원두 편집 UI 없음 |
| 로스팅 단계 필터 | 미구현 | `medium-light`, `medium-dark` 데이터엔 있으나 필터 UI 없음 |
| 가공 방식 필터 | 미구현 | 향미 필터와 동일 방식으로 추가 가능 |
