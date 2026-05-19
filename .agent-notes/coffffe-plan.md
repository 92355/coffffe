# coFFFFFe-map 현재 계획

> 마지막 갱신: 2026-05-19
> 상태: **Codex 실행 준비 완료**

---

## 목표

1. 카페 데이터를 `cafes.json` 정적 파일 → Supabase DB로 이전
2. 관리자 페이지에서 카카오 장소 검색으로 카페 추가/수정
3. 지도 마커를 커스텀 오버레이로 교체

---

## 제외 범위

- Kakao Map JS SDK 교체
- `/beans`, `/cbti` 내부 로직 변경
- 일반 사용자 인증 (관리자만)
- 리뷰, 즐겨찾기 기능

---

## 아키텍처 변경 요약

```
[이전]  cafes.json (정적) → page.tsx → MapView
[이후]  Supabase (cafes 테이블) → /api/cafes → MapView
                                             ↑
                  관리자 페이지 → Kakao 장소 검색 API (서버 프록시)
                               → Supabase CRUD
```

---

## 신규 환경 변수

| 키 | 용도 | 노출 |
|---|---|---|
| `SUPABASE_URL` | Supabase 프로젝트 URL | 서버 전용 |
| `SUPABASE_ANON_KEY` | Supabase 익명 키 (읽기) | 서버 전용 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase 서비스 롤 키 (쓰기) | 서버 전용, 절대 클라이언트 노출 금지 |
| `KAKAO_REST_API_KEY` | 카카오 장소 검색 REST API | 서버 전용 |
| `ADMIN_SECRET` | 관리자 페이지 접근 비밀번호 | 서버 전용 |

---

## Supabase 테이블 설계

```sql
-- cafes 테이블 (기존 Cafe 인터페이스 기준)
create table cafes (
  id            text primary key,          -- slug (예: "drift-coffee")
  name          text not null,
  short_description text not null,
  full_description  text not null default '',
  address       text not null,
  lat           float8 not null,
  lng           float8 not null,
  roast_levels  text[] not null default '{}',
  bean_origins  text[] not null default '{}',
  brew_methods  text[] not null default '{}',
  quality_score float4 not null default 0,
  tags          text[] not null default '{}',
  open_hours    text not null default '',
  closed_days   text[] not null default '{}',
  phone         text,
  instagram_handle text,
  kakao_place_id   text,                   -- 카카오 장소 ID (중복 방지용)
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);
```

---

## 수정/추가 파일 목록

### 신규 파일

| 파일 | 역할 |
|---|---|
| `src/lib/supabase.ts` | Supabase 클라이언트 초기화 (server/service role) |
| `src/app/api/kakao/search/route.ts` | 카카오 장소 검색 서버 프록시 |
| `src/app/api/admin/cafes/route.ts` | 카페 CRUD API (POST/PUT/DELETE, ADMIN_SECRET 검증) |
| `src/app/admin/page.tsx` | 관리자 메인 페이지 |
| `src/app/admin/layout.tsx` | 관리자 레이아웃 + 비밀번호 게이트 |

### 수정 파일

| 파일 | 변경 내용 |
|---|---|
| `src/app/api/cafes/route.ts` | cafes.json → Supabase 조회로 교체 |
| `src/app/page.tsx` | 정적 import 제거, API 호출로 교체 |
| `src/components/map/KakaoMap.tsx` | 기본 마커 → 커스텀 오버레이 |
| `src/types/cafe.ts` | `kakaoPlaceId?: string` 필드 추가 |

### 삭제 고려

| 파일 | 비고 |
|---|---|
| `src/data/cafes.json` | Supabase 이전 완료 후 삭제 (마이그레이션 스크립트 먼저) |

---

## 관리자 페이지 기능

```
/admin
├── 인증 게이트 (ADMIN_SECRET 비밀번호 입력)
├── 카페 목록 (현재 등록된 카페, 수정/삭제 버튼)
└── 카페 추가
    ├── [카카오 장소 검색 입력]
    ├── 검색 결과 리스트 (이름·주소·좌표 자동 입력)
    └── 추가 정보 입력 폼
        ├── 로스팅 레벨 (다중 선택)
        ├── 원두 산지 (다중 선택)
        ├── 추출 방식 (다중 선택)
        ├── 태그 (텍스트 입력)
        ├── 영업시간 / 휴무일
        ├── 퀄리티 스코어
        └── 인스타그램 핸들
```

---

## 커스텀 마커 설계

```
[기본 마커]
  원형 배경 (amber/brown) + 커피컵 SVG 아이콘
  크기: 40×40px

[선택된 마커]
  크기 업 (52×52px) + 진한 amber + 하단 카페명 라벨 (말풍선형)
  애니메이션: scale-up 트랜지션
```

구현 방식: `kakao.maps.CustomOverlay` + 인라인 HTML 문자열

---

## 작업 순서

### Phase 1 — 인프라

- [x] Supabase 프로젝트 생성 및 cafes 테이블 생성
- [x] 기존 cafes.json 데이터 Supabase로 마이그레이션 (`npm run migrate:cafes`로 8개 카페 업서트 완료)
- [x] `src/lib/supabase.ts` 작성
- [ ] 환경 변수 `.env.local` 및 Vercel 대시보드에 추가 (`.env.local` 존재 확인, Vercel 대시보드는 로컬에서 확인 불가)

### Phase 2 — API 교체

- [x] `src/app/api/cafes/route.ts` → Supabase 조회
- [x] `src/app/page.tsx` → 정적 import 제거
- [x] `src/app/api/kakao/search/route.ts` → 카카오 REST API 프록시

### Phase 3 — 관리자 페이지

- [x] `src/app/admin/layout.tsx` → 비밀번호 게이트
- [x] `src/app/api/admin/cafes/route.ts` → CRUD 엔드포인트
- [x] `src/app/admin/page.tsx` → 카카오 검색 + 카페 추가/수정/삭제 UI

### Phase 4 — 커스텀 마커

- [x] `KakaoMap.tsx` → CustomOverlay 교체
- [x] 선택/비선택 상태 스타일 구현

### Phase 5 — 정리

- [x] `npx tsc --noEmit` 통과
- [x] `npm run lint` 통과
- [x] `npm run build` 통과
- [ ] cafes.json 삭제 여부 확인 후 처리 (Supabase 이관 완료, 코드 fallback 유지 중이라 삭제 보류)
- [x] `coffffe-status.md` 갱신

---

## 예상 위험도

| 항목 | 위험도 | 비고 |
|---|---|---|
| Supabase 연결 실패 시 지도 빈 화면 | 중 | API route에서 fallback 에러 처리 필요 |
| KAKAO_REST_API_KEY 클라이언트 노출 | 높 | 반드시 서버 프록시 경유 |
| ADMIN_SECRET 노출 | 높 | .env.local 전용, 커밋 금지 |
| cafes.json 삭제 후 롤백 어려움 | 중 | 마이그레이션 확인 후 삭제 |
| CustomOverlay HTML 인젝션 | 중 | 카페 이름 등 사용자 입력값 이스케이프 필요 |

---

## 검증 방법

```bash
npx tsc --noEmit
npm run lint
npm run build
```

수동 확인:
- `/` 지도 로딩 + 마커 표시
- 마커 클릭 → 사이드바 선택 + 커스텀 스타일
- `/admin` 비밀번호 게이트 작동
- 카카오 장소 검색 → 결과 표시
- 카페 추가 → Supabase 저장 → 지도에 반영

---

## Codex 실행 전 전제 조건

아래 항목은 사용자가 이미 완료했다. 코드 작성 전 `.env.local` 존재 여부만 확인하면 된다.

1. Supabase 프로젝트 생성 완료
2. Kakao Developers REST API 키 발급 완료
3. 관리자 인증 방식: **단순 비밀번호(ADMIN_SECRET)** 확정
4. `cafes.json` 삭제: Phase 5에서 사용자 확인 후 진행

---

## 기술 세부 사항 (Codex용)

### 패키지 설치 필요

```bash
npm install @supabase/supabase-js
```

### Supabase 클라이언트 (`src/lib/supabase.ts`)

```ts
// 서버 전용 — 클라이언트 컴포넌트에서 import 금지
import { createClient } from '@supabase/supabase-js'

// 읽기용 (anon key)
export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)

// 쓰기용 (service role key) — admin API route에서만 사용
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
```

### DB → TS 필드 매핑

Supabase 컬럼(snake_case) → Cafe 타입(camelCase) 변환 필요.
`/api/cafes/route.ts`에서 select 후 변환 함수 사용.

```
short_description  → shortDescription
full_description   → fullDescription
roast_levels       → roastLevels
bean_origins       → beanOrigins
brew_methods       → brewMethods
quality_score      → qualityScore
open_hours         → openHours
closed_days        → closedDays
instagram_handle   → instagramHandle
kakao_place_id     → kakaoPlaceId
```

### 카카오 장소 검색 API

```
GET https://dapi.kakao.com/v2/local/search/keyword.json
Authorization: KakaoAK {KAKAO_REST_API_KEY}

Query params:
  query   : 검색어 (예: "안산 카페")
  size    : 15 (최대 15)
  category_group_code: CE7  (카페 카테고리)

응답 필드 (documents 배열):
  id           → kakaoPlaceId
  place_name   → name
  address_name → address
  x            → lng (경도, float)
  y            → lat (위도, float)
  phone        → phone
  place_url    → 카카오맵 링크 (저장 불필요)
```

서버 프록시 `src/app/api/kakao/search/route.ts` 에서만 호출.
클라이언트에서 직접 호출 금지.

### 관리자 인증 방식

`src/app/admin/layout.tsx` — Cookie 기반 세션:
1. 비밀번호 입력 폼 (서버 액션 또는 POST `/api/admin/auth`)
2. 입력값 === `process.env.ADMIN_SECRET` 이면 `httpOnly` 쿠키 `admin_session` 설정 (값: ADMIN_SECRET)
3. layout에서 쿠키 확인 → 없으면 로그인 폼 렌더링
4. 관리자 API route에서도 쿠키 또는 `Authorization: Bearer {ADMIN_SECRET}` 헤더로 재검증

### CustomOverlay HTML 이스케이프

카페 이름 등 외부 입력값을 `innerHTML` 삽입 시 반드시 이스케이프:

```ts
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
```

### Supabase 프로젝트 정보

- 프로젝트명: **coffeeMap**
- URL/키는 Supabase 대시보드 → Settings → API 에서 확인

### `.env.local` 필요 키 목록

```
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
KAKAO_REST_API_KEY=
ADMIN_SECRET=
NEXT_PUBLIC_KAKAO_MAP_API_KEY=   ← 기존 유지
```
