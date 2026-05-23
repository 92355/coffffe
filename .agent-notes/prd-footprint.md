# PRD: 사용자 발자취 (Footprint) 기능

## Problem Statement

현재 coFFFFFe-map은 카페 정보를 일방향으로 보여주는 정적인 디렉토리에 가깝다. 사용자는:

- 다른 사용자들이 어떤 카페에 관심을 갖는지 알 수 없다.
- 자신이 다녀온 카페에 가벼운 흔적을 남길 방법이 없다.
- 카페에 대한 짧은 감상을 공유하거나 다른 사용자의 의견을 볼 수 없다.
- 어느 카페가 지금 인기 있고 활발한지 시각적 단서가 없다.

운영자 입장에서도 어떤 카페가 실제로 인기 있는지, 어떤 시점에 트래픽이 몰리는지 알 수 없어 데이터 기반 개선이 어렵다.

## Solution

카페별 사용자 활동(조회 · 방문 · 한줄평 · 이모지 반응)을 가볍게 수집하고 시각화한다.

- **조회수 / 방문자수**: 바텀시트와 상세 페이지에 "오늘 n명이 둘러봤어요 · m명이 다녀왔어요" 형태로 살아있음을 표현
- **한줄평 (50자)**: 익명·로그인 무관하게 가볍게 남기되, 카페별 24시간 쿨다운과 신고/관리자 삭제로 품질 관리
- **이모지 반응 (5종)**: ☕ 맛있어요 / 🌿 분위기 좋아요 / 💻 작업하기 좋아요 / 📸 인스타 감성 / 🚾 화장실 깨끗해요 — 텍스트 입력 부담 없이 분위기를 표현
- **오늘 다녀왔어요 버튼**: 하루 1회, 취소 불가. 방문자수 신뢰도 확보

"오늘"의 기준은 KST 자정 리셋이며, 과거 데이터도 유지하여 추후 인기 카페 집계의 토대로 사용한다.

## User Stories

### 한줄평 (Reviews)

1. As a 비로그인 사용자, I want to 카페 상세에서 한줄평을 50자 이내로 작성할 수 있기, so that 가입 부담 없이 의견을 남길 수 있다.
2. As a 카카오 로그인 사용자, I want to 닉네임과 함께 한줄평을 남길 수 있기, so that 내 흔적이 프로필과 연결된다.
3. As a 사용자, I want to 한 카페에 24시간 안에 한 번만 한줄평을 작성할 수 있기, so that 도배가 발생하지 않는다.
4. As a 사용자, I want to 카페 상세에서 다른 사용자의 한줄평 목록을 최신순으로 볼 수 있기, so that 다른 사람의 경험을 빠르게 훑을 수 있다.
5. As a 사용자, I want to 한줄평 옆의 닉네임과 아바타를 볼 수 있기, so that 어떤 사람이 남겼는지 인지할 수 있다.
6. As a 사용자, I want to 한줄평이 50자 이상으로 입력되지 못하게 막아주기, so that 진짜 한줄평 콘셉트가 유지된다.
7. As a 사용자, I want to 부적절한 한줄평을 신고할 수 있기, so that 커뮤니티 품질이 유지된다.
8. As a 관리자, I want to 어드민 페이지에서 한줄평을 삭제할 수 있기, so that 신고된/부적절한 콘텐츠를 제거할 수 있다.
9. As a 관리자, I want to 신고된 한줄평 목록을 우선적으로 볼 수 있기, so that 처리 순서를 정할 수 있다.
10. As a 사용자, I want to 한줄평 작성 후 즉시 목록 최상단에 내 글이 보이기, so that 작성이 반영됐음을 확인할 수 있다.
11. As a 사용자, I want to 쿨다운 중일 때는 작성 버튼이 비활성화되고 남은 시간이 안내되기, so that 왜 작성이 안 되는지 알 수 있다.

### 오늘 다녀왔어요 (Visits)

12. As a 사용자, I want to 카페 상세에서 "오늘 다녀왔어요" 버튼을 누를 수 있기, so that 실제 방문 기록을 남길 수 있다.
13. As a 사용자, I want to 하루에 같은 카페에 한 번만 다녀왔어요를 누를 수 있기, so that 숫자가 부풀려지지 않는다.
14. As a 사용자, I want to 다녀왔어요를 누른 뒤 버튼이 "오늘 다녀왔어요 ✓" 상태로 바뀌고 비활성화되기, so that 중복 클릭이 막힌다.
15. As a 사용자, I want to 바텀시트와 상세 페이지에서 "오늘 n명 다녀왔어요" 숫자를 볼 수 있기, so that 카페가 지금 활발한지 가늠할 수 있다.
16. As a 사용자, I want to 자정이 지나면 다시 다녀왔어요를 누를 수 있기 (날짜가 바뀌었으므로), so that 자주 가는 카페에 매일 흔적을 남길 수 있다.

### 이모지 반응 (Reactions)

17. As a 사용자, I want to 5종 이모지(☕🌿💻📸🚾) 중에서 여러 개를 골라 반응할 수 있기, so that 카페의 다양한 측면을 표현할 수 있다.
18. As a 사용자, I want to 이미 누른 반응을 다시 누르면 취소되기 (토글), so that 잘못 누른 반응을 되돌릴 수 있다.
19. As a 사용자, I want to 바텀시트와 상세 페이지에서 각 이모지에 몇 명이 반응했는지 볼 수 있기, so that 카페의 특징을 한눈에 파악할 수 있다.
20. As a 사용자, I want to 내가 어떤 반응을 눌렀는지 시각적으로 표시되기, so that 내 반응 상태를 알 수 있다.
21. As a 비로그인 사용자, I want to 반응도 익명으로 누를 수 있기, so that 가입 부담 없이 참여할 수 있다.

### 조회수 (Views)

22. As a 사용자, I want to 카페 바텀시트가 열리면 자동으로 조회수가 1 카운트되기, so that 다른 사용자에게 이 카페가 둘러보는 중임을 보여준다.
23. As a 사용자, I want to 같은 세션 안에서 같은 카페를 여러 번 열어도 조회수가 한 번만 올라가기, so that 새로고침으로 숫자가 튀지 않는다.
24. As a 사용자, I want to 바텀시트와 상세 페이지에서 "오늘 n명 봤어요" 숫자를 볼 수 있기, so that 인기도를 가늠할 수 있다.

### 어드민

25. As a 관리자, I want to 어드민 사이드바에 "한줄평 관리" 항목이 추가되기, so that 콘텐츠 관리에 빠르게 접근할 수 있다.
26. As a 관리자, I want to 카페별로 묶인 한줄평 목록을 볼 수 있기, so that 어느 카페에 문제가 있는지 파악할 수 있다.
27. As a 관리자, I want to 한줄평 옆의 신고 횟수를 볼 수 있기, so that 우선순위를 정할 수 있다.
28. As a 관리자, I want to 한줄평을 한 번 클릭으로 삭제할 수 있기, so that 빠르게 대응할 수 있다.

### 데이터 무결성

29. As a 시스템, I want to 같은 IP에서 같은 카페에 24시간 안에 한줄평이 두 번 들어오면 거부하기, so that localStorage 우회 도배가 차단된다.
30. As a 시스템, I want to 익명 사용자의 anonymousId가 변경되어도 IP로 쿨다운이 유지되기, so that 신원 조작이 어려워진다.
31. As a 시스템, I want to 모든 "오늘" 기준이 KST 자정으로 통일되기, so that 시간대 혼란이 없다.

## Implementation Decisions

### 모듈 구조

**Server-side (deep modules — 격리 테스트 가능)**

- **`lib/kstDate.ts`** — KST 기준 오늘 날짜 문자열(`YYYY-MM-DD`) 반환, 임의 Date 입력도 받는 순수 함수 모음. 모든 "오늘" 판단의 단일 진실원.
- **`lib/footprintRateLimit.ts`** — `(cafeId, ip, anonymousId, windowHours)` → `{ allowed: boolean, retryAfterSeconds: number }`. 쿨다운 판정 로직만 담당. DB는 외부에서 주입.
- **`lib/clientIdentity.ts`** — Next 요청에서 IP(`x-forwarded-for` 첫 값) 및 anonymousId 헤더(`x-anonymous-id`) 추출. 누락 시 정책(IP는 fallback, anonymousId는 401-like 정책 미사용 — 그냥 본인 식별만 못 함).

**Server-side (shallow — Supabase wrappers)**

- **`lib/cafeFootprint.ts`** — Supabase admin client로 footprint 테이블들을 조작하는 모든 쿼리 함수. `recordView`, `recordVisit`, `toggleReaction`, `insertReview`, `listReviews`, `deleteReview`, `getFootprintSummary`(views/visits/reactions counts) 등.

**API routes**

- `POST /api/cafes/[id]/views` — 조회수 +1 (idempotency는 클라이언트 책임)
- `GET  /api/cafes/[id]/footprint` — 바텀시트/상세용 통합 요약 (오늘 views/visits, reactions 카운트 + 내가 누른 반응 + 내가 다녀왔는지)
- `POST /api/cafes/[id]/visits` — 다녀왔어요 마킹. 중복이면 멱등 응답.
- `POST /api/cafes/[id]/reactions` — `{ emoji }` 받아 토글. 응답에 새 카운트 + 내 상태.
- `GET  /api/cafes/[id]/reviews` — 한줄평 목록 (최신순, 페이지네이션은 v1에선 단순 limit 50).
- `POST /api/cafes/[id]/reviews` — `{ text }` 받아 작성. 쿨다운 검증 후 거부 시 `429 + retryAfterSeconds`.
- `POST /api/cafes/[id]/reviews/[reviewId]/report` — 신고 (신고자 IP/anonymousId 저장, 중복 신고 무시).
- `GET  /api/admin/reviews` — 어드민용 전체 한줄평 목록 (신고 많은 순).
- `DELETE /api/admin/reviews/[reviewId]` — 한줄평 삭제.

**Client-side**

- **`hooks/useCafeFootprint.ts`** — cafeId 주면 footprint summary 가져오고 액션(visit/react/review)을 노출. SWR 패턴(자체 캐시 + revalidate).
- **`hooks/useViewTracker.ts`** — cafeId 받으면 마운트 시 1회 `/views` POST. 세션 메모리 `Set<cafeId>`로 중복 차단.
- **`lib/sessionViewCache.ts`** — 모듈 스코프 `Set<string>`. 페이지 새로고침까지 유지. 순수 모듈 → 테스트 쉬움.
- **`lib/footprintEmojis.ts`** — 5종 이모지 메타데이터 (key, glyph, label, ariaLabel)를 한 곳에 정의. UI와 서버 검증에서 공통 사용.

**UI 컴포넌트**

- **`components/CafeFootprintStats.tsx`** — 바텀시트용 한 줄짜리 요약 (오늘 조회 n · 방문 m · 반응 이모지 카운트). 컴팩트.
- **`components/CafeFootprintPanel.tsx`** — 상세 페이지용 풀 패널. 다녀왔어요 버튼, 반응 그리드, 한줄평 입력, 한줄평 목록을 묶음.
- **`components/ReviewForm.tsx`** — 50자 textarea + 글자수 카운터 + 제출. 쿨다운 시 비활성화 + 남은 시간 표시.
- **`components/ReviewList.tsx`** — 한줄평 카드 리스트. 각 카드에 닉네임/아바타/시간/신고 버튼.
- **`components/ReactionRow.tsx`** — 5개 이모지 버튼 가로 배치 + 카운트 표시 + 활성/비활성 상태.
- **`components/VisitTodayButton.tsx`** — "오늘 다녀왔어요" 버튼. 누른 상태/안 누른 상태 두 모드.

**상세 페이지 신설**

현재 `/cafes/[id]` 라우트는 존재하지 않음. 본 PRD에서 신설하여 footprint 풀 UI의 호스트가 된다. 기본 정보(이름/주소/이미지/태그/연락처)는 BottomSheet과 동일하되 풀 사이즈로 보여주고, 하단에 `CafeFootprintPanel` 배치.

**어드민 페이지**

`/admin/reviews` 신설. 기존 `AdminShell`의 사이드바에 항목 추가. 카드 형태로 한줄평 + 신고 수 + 카페명 + 삭제 버튼.

### 스키마 (Supabase)

```sql
-- 한줄평
create table cafe_reviews (
  id uuid primary key default gen_random_uuid(),
  cafe_id text not null,
  author_user_id uuid null,           -- 로그인 사용자
  author_anonymous_id text null,      -- 익명 사용자
  author_nickname text not null,
  author_animal text not null,
  ip text not null,
  text text not null check (char_length(text) <= 50),
  report_count int not null default 0,
  created_at timestamptz not null default now()
);
create index cafe_reviews_cafe_idx on cafe_reviews(cafe_id, created_at desc);
create index cafe_reviews_rate_idx on cafe_reviews(cafe_id, ip, created_at desc);

-- 한줄평 신고 (중복 신고 방지)
create table cafe_review_reports (
  review_id uuid not null references cafe_reviews(id) on delete cascade,
  reporter_anonymous_id text not null,
  created_at timestamptz not null default now(),
  primary key (review_id, reporter_anonymous_id)
);

-- 다녀왔어요 (날짜별 1회)
create table cafe_visits (
  cafe_id text not null,
  anonymous_id text not null,
  visit_date date not null,             -- KST 기준 날짜 문자열
  created_at timestamptz not null default now(),
  primary key (cafe_id, anonymous_id, visit_date)
);
create index cafe_visits_today_idx on cafe_visits(cafe_id, visit_date);

-- 이모지 반응 (토글 가능)
create table cafe_reactions (
  cafe_id text not null,
  anonymous_id text not null,
  emoji text not null,                  -- 'coffee' | 'vibe' | 'work' | 'insta' | 'toilet'
  created_at timestamptz not null default now(),
  primary key (cafe_id, anonymous_id, emoji)
);
create index cafe_reactions_summary_idx on cafe_reactions(cafe_id, emoji);

-- 조회수 집계 (날짜별 카운터)
create table cafe_view_daily (
  cafe_id text not null,
  view_date date not null,
  count int not null default 0,
  primary key (cafe_id, view_date)
);
```

설계 노트:
- `cafe_id`는 `cafes.id`를 참조하지만 정적 JSON 카페와 어드민 등록 카페가 섞이므로 FK는 걸지 않는다.
- 익명 사용자는 `anonymous_id`(localStorage UUID)로 식별. IP는 쿨다운 검증에만 사용하고 표시는 하지 않는다.
- 조회수는 인서트 로우 폭증을 막기 위해 `cafe_view_daily` 카운터 upsert 방식(원자적 +1).

### API 계약

**`GET /api/cafes/[id]/footprint`** — 요청 헤더에 `x-anonymous-id`. 응답:
```ts
{
  views: { today: number },
  visits: { today: number, didIVisit: boolean },
  reactions: { emoji: string; count: number; mine: boolean }[],  // 5종 모두 반환 (0 카운트 포함)
}
```

**`POST /api/cafes/[id]/reviews`** — 본문 `{ text: string }`. 쿨다운 시 `429 { error, retryAfterSeconds }`. 성공 시 `201 { review }`.

**`POST /api/cafes/[id]/reactions`** — 본문 `{ emoji: string }`. 응답 `{ emoji, count, mine }`.

### 식별 정책

- 익명 사용자 식별: `x-anonymous-id` 헤더 (클라이언트 fetch wrapper에서 자동 첨부)
- 로그인 사용자: 기존 `getUserSession()` 사용. 한줄평 작성자가 로그인 상태면 `author_user_id` 채움. 익명이어도 anonymousId는 항상 채움 (중복/쿨다운 키).
- IP: `x-forwarded-for` 첫 값. 없으면 빈 문자열로 저장하고 쿨다운 검증은 우회 (Next.js 로컬 dev 호환).

### 클라이언트 식별 헬퍼

`lib/anonymousId.ts` (클라이언트) 신설 — 기존 `useUser`의 anonymousId를 fetch 헤더에 자동 첨부하는 `fetchWithIdentity` wrapper. 모든 footprint API 호출은 이 wrapper로 통일.

### 시각적 결정

- 바텀시트 요약: 한 줄, 작은 폰트. "오늘 ☕ 12 · 🌿 8 · 💻 5 · 📸 3 · 🚾 2 · 다녀옴 7" 정도 컴팩트한 인라인 표시.
- 상세 페이지 풀 패널: 다녀왔어요 버튼이 가장 위(시각적 무게 큼), 그 아래 반응 5개 그리드, 그 아래 한줄평 입력 + 목록.
- 새로 작성한 한줄평은 optimistic update로 즉시 목록 상단 표시.

## Testing Decisions

테스트는 **외부 행동(public API · 컴포넌트 출력)만** 검증한다. 내부 상태나 함수 호출 횟수 등 구현 디테일은 검증하지 않는다.

### 단위 테스트 대상 (deep modules)

1. **`lib/kstDate.ts`** — 자정 직전/직후, UTC와 KST 경계, 다양한 입력 시각에 대한 날짜 문자열 정확성. (선례: `src/lib/env.test.ts`, `src/lib/cafeFilters.test.ts`)

2. **`lib/footprintRateLimit.ts`** — Mock DB 입출력 주어졌을 때 `allowed`/`retryAfterSeconds` 정확성. 케이스: 첫 작성 허용 / 23시간 59분 후 차단 / 24시간 1초 후 허용 / 다른 카페는 영향 없음 / 다른 IP·anonymousId는 영향 없음.

3. **`lib/sessionViewCache.ts`** — `has`/`add`/`size`/`reset` 동작. (테스트 후 모듈 스코프 상태 초기화 필요)

4. **`lib/footprintEmojis.ts`** — 정의된 5종이 정확히 노출되는지, 키가 유효 범위인지 검증.

### 통합/컴포넌트 테스트는 v1 스코프 밖

API route 통합 테스트와 컴포넌트 렌더링 테스트는 추가 작업량 대비 ROI가 낮으므로 v1에서는 작성하지 않는다. 위 4개 deep module만 자동화 테스트로 보호하고, 나머지는 수동 QA(`.agent-notes/deploy-checklist.md` 흐름)로 검증한다.

### 검증 명령

각 이슈 완료 시 다음을 통과해야 한다.
```bash
npx tsc --noEmit
npm run lint
npm test -- --run        # 신규 단위 테스트 포함
npm run build
```

## Out of Scope

- **한줄평 페이지네이션 / 무한 스크롤** — v1은 최신 50개만 노출. 카페별 한줄평이 50개를 넘기 전까지는 충분.
- **한줄평 좋아요 / 답글** — 콘텐츠 깊이 늘리는 기능은 v2.
- **별점** — 사용자가 명시적으로 제외.
- **사용자별 활동 히스토리 페이지** — "내가 다녀온 카페 목록", "내가 쓴 한줄평 목록" UI는 별도 PRD.
- **주간/월간 인기 카페 랭킹 UI** — 데이터는 쌓이지만 노출 UI는 v2.
- **푸시 알림 / 이메일 알림** — 신고 처리, 댓글 등 알림 미포함.
- **이미지 첨부 한줄평** — 텍스트만.
- **욕설/혐오 표현 자동 필터링** — v1은 사용자 신고 + 어드민 수동 삭제로 운영. 자동 모더레이션은 v2.
- **다국어 한줄평** — 한국어 UI 기준만.
- **CSV 익스포트** — 어드민 다운로드 없음.

## Further Notes

- **마이그레이션**: Supabase 마이그레이션 파일을 `supabase/migrations/`에 추가하는 관례가 있다면 따르고, 없으면 `.agent-notes/footprint-schema.sql`에 SQL을 보관하여 수동 적용. 어드민이 직접 Supabase 콘솔에서 실행하는 게 현재 운영 방식인지 확인 필요.
- **익명 사용자 anonymousId 마이그레이션**: 기존 익명 사용자도 localStorage에 anonymousId가 이미 있음 (`useUser.ts` 확인 완료). 별도 마이그레이션 불필요.
- **상세 페이지 SEO**: `/cafes/[id]`는 정적 카페 데이터 기준으로 SSG 가능. footprint 부분만 클라이언트에서 로딩. 단, 본 PRD 스코프에서는 동적 SSR로 빠르게 만들고 최적화는 추후.
- **다크 모드**: 기존 BottomSheet과 일관된 다크 모드 색 대응 필요.
- **데이터 보존**: 한줄평/방문/반응은 영구 보관. 조회수도 `cafe_view_daily`로 날짜별 보관(향후 트렌드 분석 활용).
- **레이트 리밋 우회 한계**: VPN/모바일 IP 전환으로 우회는 가능하나, 일반 사용자 도배는 충분히 차단됨. 100% 차단은 v1 목표가 아님.
