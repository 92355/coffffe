# 작업 계획 — 어드민 레이아웃 리팩터링 + 원두 관리 (Supabase)

> 마지막 갱신: 2026-05-22

---

## 1. 요구사항 요약

- 어드민 페이지 레이아웃을 좌측 사이드바 + 라우트 기반으로 전면 리팩터링
- 원두 데이터를 `beans.ts` 정적 파일 → Supabase `beans` 테이블로 이전
- 원두 CRUD 관리 UI 추가 (`/admin/beans`)
- 기존 beans.ts 데이터는 SQL migration으로 초기값 삽입

---

## 2. 결정된 사항

| 항목 | 결정 |
|---|---|
| 원두 저장소 | Supabase `beans` 테이블 (기존 beans.ts 마이그레이션 포함) |
| 관리자 기능 | CRUD 전부 (생성·수정·삭제) |
| 어드민 네비 | 좌측 사이드바 (데스크톱) + 모바일 드롭다운 |
| 라우트 구조 | 별도 URL — 아래 표 참조 |
| 대시보드 | 숫자 카드 4개 (카페 수·원두 수·미처리 제보 수·회원 수) |
| 기존 데이터 | SQL INSERT migration으로 초기값 포함 |

### 라우트 구조

| 경로 | 내용 |
|---|---|
| `/admin` | 대시보드 (숫자 카드) |
| `/admin/cafes` | 카페 관리 (기존 `/admin` 카페 섹션 이동) |
| `/admin/beans` | 원두 관리 (신규) |
| `/admin/reports` | 제보 관리 (기존 `/admin` 제보 섹션 이동) |
| `/admin/members` | 회원 관리 (1차: 목록만) |
| `/admin/stats` | 통계 (1차: stub) |

---

## 3. 수정·생성 예상 파일

| 파일 | 변경 |
|---|---|
| `supabase/migrations/20260522000000_create_beans_table.sql` | 신규 — beans 테이블 + 기존 데이터 INSERT |
| `src/app/api/beans/route.ts` | 신규 — GET (public, Supabase beans 조회) |
| `src/app/api/admin/beans/route.ts` | 신규 — POST·PUT·DELETE (인증 필요) |
| `src/app/admin/layout.tsx` | 대규모 — 사이드바 nav + 모바일 드롭다운으로 교체 |
| `src/app/admin/page.tsx` | 대규모 — 대시보드로 교체 (카운트 카드) |
| `src/app/admin/cafes/page.tsx` | 신규 — 기존 admin/page.tsx 카페 섹션 이동 |
| `src/app/admin/reports/page.tsx` | 신규 — 기존 admin/page.tsx 제보 섹션 이동 |
| `src/app/admin/beans/page.tsx` | 신규 — 원두 CRUD UI |
| `src/app/admin/members/page.tsx` | 신규 — 회원 목록 (users 테이블 조회) |
| `src/app/admin/stats/page.tsx` | 신규 — stub 페이지 |
| `src/app/beans/page.tsx` | 소규모 — static import 제거 → `/api/beans` fetch |
| `src/app/api/admin/members/route.ts` | 신규 — GET (users 테이블 조회) |

---

## 4. Supabase beans 테이블 스키마

```sql
create table beans (
  id          text primary key,         -- slug (예: 'panama-geisha')
  name        text not null,
  name_en     text not null,
  origin      text not null,
  region      text not null,
  variety     text not null,
  process     text not null,
  roast       text not null,            -- 'light' | 'medium' | 'medium-dark' | 'dark'
  notes       text[] not null default '{}',
  body        text not null,
  acidity     text not null,
  description text not null,
  flag        text not null,
  special     text,
  created_at  timestamptz default now()
);
```

`/api/beans/route.ts`에서 snake_case → camelCase 변환 (`toBean()` 함수).

---

## 5. 작업 순서

### Step 1 — Supabase migration
- [ ] `20260522000000_create_beans_table.sql` 작성
  - beans 테이블 생성
  - 기존 beans.ts 데이터 전체 INSERT
  - RLS: anon select 허용, authenticated insert/update/delete (또는 service role only)

### Step 2 — Public API
- [ ] `src/app/api/beans/route.ts` — GET, Supabase 조회, toBean() 변환
  - query param: `origin`, `roast`, `notes` 지원 (옵션)
  - Supabase 실패 시 beans.ts fallback (cafes 패턴 동일)

### Step 3 — Admin API
- [ ] `src/app/api/admin/beans/route.ts` — POST·PUT·DELETE, isAuthorizedAdminRequest() 인증
- [ ] `src/app/api/admin/members/route.ts` — GET, users 테이블 조회

### Step 4 — Admin layout 리팩터링
- [ ] `src/app/admin/layout.tsx` 교체
  - 좌측 사이드바: 로고 + 네비 링크 6개 (아이콘 + 텍스트)
  - 모바일: 상단 드롭다운 메뉴
  - 인증 게이트 유지 (기존 AdminLayout 로직 이전)
  - 현재 페이지 active 표시 (`usePathname`)

### Step 5 — 대시보드
- [ ] `src/app/admin/page.tsx` 교체
  - 카운트 카드 4개: 카페·원두·미처리 제보·회원
  - 각 카드 클릭 → 해당 관리 페이지 이동

### Step 6 — 카페/제보 페이지 분리
- [ ] `src/app/admin/cafes/page.tsx` — 기존 admin/page.tsx 카페 섹션 그대로 이동
- [ ] `src/app/admin/reports/page.tsx` — 기존 admin/page.tsx 제보 섹션 그대로 이동
- [ ] 기존 `src/app/admin/page.tsx` → 대시보드로 교체

### Step 7 — 원두 관리 페이지
- [ ] `src/app/admin/beans/page.tsx`
  - 원두 목록 (테이블 형태)
  - 추가/수정 폼 (id·name·nameEn·origin·region·variety·process·roast·notes·body·acidity·desc·flag·special)
  - 삭제 확인 모달

### Step 8 — 회원·통계 stub
- [ ] `src/app/admin/members/page.tsx` — users 테이블 목록 (닉네임·동물·카카오 여부·가입일)
- [ ] `src/app/admin/stats/page.tsx` — "준비 중" stub

### Step 9 — /beans 페이지 연결
- [ ] `src/app/beans/page.tsx` — `BEANS` static import 제거 → `/api/beans` fetch
  - 로딩 상태 추가
  - fallback: 빈 배열

---

## 6. 성공 기준

- `/admin/*` 모든 라우트가 사이드바 네비와 함께 렌더됨
- `/admin` 대시보드에 카운트 카드 4개 표시
- `/admin/beans` 에서 원두 추가·수정·삭제 가능
- `/beans` 페이지가 Supabase 데이터 기반으로 렌더됨 (기존 UI 동일)
- `npx tsc --noEmit` 통과
- `npm run build` 통과

---

## 7. 수정하지 않을 범위

- 기존 카페 관리 로직 — 그대로 이동만 함 (수정 없음)
- 기존 제보 관리 로직 — 그대로 이동만 함 (수정 없음)
- `/map`, `/cbti` 등 다른 페이지
- Supabase cafes 테이블 스키마
- `src/data/beans.ts` — fallback용으로 유지 (삭제 안 함)
