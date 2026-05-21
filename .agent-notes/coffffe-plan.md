# coFFFFFe-map 현재 계획

> 마지막 갱신: 2026-05-21

---

## v0.3.2 작업 계획

### 우선순위

| 순서 | Plan | 내용 |
|---|---|---|
| A | UI 고급화 | 랜딩 + 지도 화면 + 공통 컴포넌트 전반 개선 |
| B | 코드 정리 | cafes.json 삭제, 버튼 중복 제거, 뒤로가기 수정 |
| C | 즐겨찾기 병합 | 카카오 로그인 시 익명 localStorage → Supabase 자동 이전 |
| D | 제보 사진 업로드 | Supabase Storage reports 버킷 + ReportSheet 업로드 UI |
| E | saved_lists UI | 사용자 지정 카페 리스트 생성/관리 |

---

### Plan A — UI 고급화 (최우선)

> 상태: **계획 확정 / 구현 대기**

#### 목표

- `/` 랜딩 제거 → 히어로 + 지도 미리보기 + 콘텐츠 혼합 새 메인 페이지로 교체
- Framer Motion 추가 → 파티클, 카드 진입, 마커 향 애니메이션
- 브랜드 컬러 임팩트 강화, 전반적 완성도 향상

---

#### A-1. 패키지 추가

```bash
npm install framer-motion
```

---

#### A-2. 새 메인 페이지 (`/`)

기존 `src/app/page.tsx` 전면 교체.

**섹션 구성:**

```
[Hero]
  - 풀 화면 높이 (100dvh)
  - 배경: 짙은 브라운 그라디언트 (#1a0a00 → #3d1f00)
  - 원두 파티클 Framer Motion으로 위에서 아래로 잔잔히 낙하
  - 메인 카피 + "지도 열기" CTA 버튼
  - 스크롤 다운 인디케이터

[지도 미리보기]
  - 실제 Kakao 지도 embed 또는 스크린샷 이미지 + 오버레이
  - "지도에서 카페 찾기" 버튼 → /map

[추천 카페]
  - /api/cafes에서 qualityScore 상위 3~4개
  - Framer Motion: 스크롤 진입 시 아래에서 위로 fade-in
  - 카드: 이미지, 이름, 태그, 짧은 설명

[원두 섹션]
  - beans.ts에서 featured 또는 랜덤 3개
  - 심플한 가로 스크롤 카드

[CBTI CTA]
  - "내 커피 성향은?" 진입 배너

[Footer]
  - 미니멀. 브랜드명 + 링크
```

---

#### A-3. 원두 파티클 애니메이션

Hero 섹션 배경에 원두 이미지(또는 ☕ 이모지/SVG) 파티클 10~15개 랜덤 낙하.

```tsx
// 각 파티클: 랜덤 x 위치, 랜덤 duration(8~20s), 랜덤 delay, 랜덤 크기/투명도
// Framer Motion animate: y: ['-10%', '110%'], opacity: [0, 0.6, 0]
// repeat: Infinity, ease: 'linear'
```

파티클 에셋: `public/image/bean-particle.svg` (작은 원두 실루엣) 또는 CSS 원형으로 대체.

---

#### A-4. 커피 마커 향 애니메이션 (`/map`)

카카오맵 `CustomOverlay` 마커 위에 CSS 애니메이션으로 향 피어오르는 효과.

```css
/* 마커 위 3개 동그라미가 위로 올라가며 opacity 0으로 사라짐 */
@keyframes coffeeAroma {
  0%   { transform: translateY(0) scale(1);   opacity: 0.5; }
  100% { transform: translateY(-18px) scale(1.4); opacity: 0; }
}

.aroma-puff {
  animation: coffeeAroma 1.8s ease-out infinite;
}
.aroma-puff:nth-child(2) { animation-delay: 0.6s; }
.aroma-puff:nth-child(3) { animation-delay: 1.2s; }
```

선택된 마커는 아로마 속도 빠르게 + 크기 업.

---

#### A-5. 컬러/타이포그래피 정리

현재 밋밋한 이유: amber가 옅고 배경과 대비 약함.

| 항목 | 현재 | 변경 |
|---|---|---|
| 히어로 배경 | 없음 | `#1a0a00` 짙은 에스프레소 |
| 브랜드 포인트 | `#d66612` | `#e8720a` (채도 올림) |
| 카드 배경 | 흰색 flat | 흰색 + `shadow-md` + `hover:shadow-xl` + 트랜지션 |
| 버튼 primary | amber flat | amber + hover 어둡게 + active scale(0.97) |
| 태그 | 단색 | 카테고리별 색상 (스페셜티: amber, 로스터리: brown, 디저트: rose) |
| 타이포 헤딩 | 기본 | `font-bold tracking-tight` 강화 |

---

#### A-6. 카드 진입 애니메이션 (추천 카페 섹션)

```tsx
// Framer Motion whileInView
<motion.div
  initial={{ opacity: 0, y: 32 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, delay: index * 0.1 }}
  viewport={{ once: true }}
>
```

---

#### 수정 예상 파일

- `src/app/page.tsx` — 전면 교체 (새 메인)
- `src/app/globals.css` — 아로마 CSS 애니메이션 추가
- `src/components/map/KakaoMap.tsx` — 마커 아로마 HTML 추가
- `src/app/map/page.tsx` — 필요 시 경미한 수정
- `public/image/bean-particle.svg` — 신규 (파티클 에셋)
- `package.json` — framer-motion 추가

#### 제외 범위

- 다크모드 MapView 확장 (별도 Plan)
- `/beans`, `/cbti`, `/cafes/[id]` 페이지 스타일 변경 (A 이후 판단)

#### 검증

```bash
npx tsc --noEmit
npm run lint
npm run build
```

- 모바일 375px Hero overflow 없음
- 파티클 애니메이션 60fps 유지 (will-change: transform 적용)
- 지도 마커 아로마 선택/비선택 상태 모두 확인

---

### Plan B — 코드 정리

> 상태: **계획 중** / 작업량 작음. Plan A 이후 또는 병행 가능.

#### 작업 목록

- [ ] `cafes.json` fallback 제거 — `src/app/api/cafes/route.ts`에서 fallback 분기 삭제, `src/data/cafes.json` 파일 삭제 (Supabase 안정 확인 후)
- [ ] Sidebar 목록 버튼 중복 제거 — `md:hidden` / `md:flex` 두 개로 나뉜 "목록 보기" 버튼을 하나로 통합
- [ ] `/cafes/[id]` 뒤로가기 `/map`으로 변경 — 현재 `/`로 이동하는 링크를 `/map`으로 수정

#### 수정 예상 파일

- `src/app/api/cafes/route.ts`
- `src/data/cafes.json` (삭제)
- `src/components/MapView.tsx`
- `src/app/cafes/[id]/page.tsx`

---

### Plan C — 즐겨찾기 병합

> 상태: **계획 중**

#### 목표

카카오 로그인 완료 시 기존 익명 사용자의 `coffffe_saved_cafes` localStorage 값을 Supabase `favorite_cafes`로 자동 이전한다.

#### 흐름

```
카카오 로그인 완료 → syncAuthenticatedUser() 실행
→ localStorage coffffe_saved_cafes 읽기
→ 값 있으면 POST /api/me/favorites/merge
→ Supabase favorite_cafes에 upsert
→ localStorage coffffe_saved_cafes 삭제
```

#### 수정 예상 파일

- `src/hooks/useUser.ts` — 병합 로직 추가
- `src/app/api/me/favorites/route.ts` — merge 엔드포인트 추가 또는 기존 확장

---

### Plan D — 제보 사진 업로드

> 상태: **계획 중** / Supabase Storage 설계 선행 필요

#### 목표

`ReportSheet.tsx`에 사진 첨부 기능을 추가한다.

#### 제약

- 대표사진 1장, 최대 5MB
- 저작권 동의 체크박스 필수
- Supabase Storage `reports` 버킷 + 업로드 정책 생성 필요 (SQL)

#### 흐름

```
파일 선택 → 5MB 초과 시 에러
→ 저작권 체크박스 미체크 시 제출 불가
→ 제출 클릭 → 이미지 먼저 Storage 업로드 → URL 획득
→ reports row에 image_url 저장
```

#### 수정 예상 파일

- `supabase/migrations/20260521010000_add_reports_storage.sql` (신규)
- `src/components/ReportSheet.tsx`
- `src/app/api/reports/route.ts` (image_url 수신 처리)

---

### Plan E — saved_lists UI

> 상태: **계획 중** / 설계 필요

#### 목표

사용자가 카페를 커스텀 리스트에 묶어 저장할 수 있다.

#### 현재 상태

- Supabase `saved_lists` 테이블 스키마만 존재
- UI/API 전혀 없음
- 카카오 로그인 사용자 전용

#### 설계 필요 항목 (구현 전 결정)

- 리스트 진입점: 프로필 드롭다운? 별도 `/lists` 라우트?
- 카페를 리스트에 추가하는 UX: 하트 옆 "저장" 버튼? 드롭다운 선택?
- 리스트 공개/비공개 여부

---

## 완료 요약 (코드 구현 기준)

| Plan | 내용 | 상태 |
|---|---|---|
| 1 | 지도 버튼 기능 (확대/축소/레이어/이 지역 검색/현재위치) | ✅ 완료 |
| 2 | 익명 사용자 랜덤 한글 닉네임 + 드롭다운 | ✅ 완료 |
| 3 | 플레이스 제보 (신규/수정, 카카오 검색, 지도 위치 찍기) | ✅ 코드 완료 |
| 4 | 관리자 제보 리스트 + 카페 등록 연동 | ✅ 완료 |
| 5 | 카페 이미지 업로드 (관리자 UI + Storage API) | ✅ 코드 완료 |
| 6 | 카카오 로그인 + 즐겨찾기 저장 | ✅ 코드 완료 |
| 7 | 프로필 수정 (아바타/닉네임 선택) + 관리자 버튼 노출 조건 | ✅ 코드 완료 |
| 8 | 동물 프로필 .webp 이미지 + 카카오 로그인 시 익명 동물 유지 | ✅ 코드 완료 |
| - | 랜딩페이지 (`/`) + 지도 `/map` 분리 | ✅ 완료 |

---

## 사용자가 직접 처리해야 할 외부 작업

코드는 구현됐지만 아래 외부 작업이 없으면 동작하지 않는다.

### Supabase SQL Editor에서 순서대로 실행

```sql
-- 1. 카페 이미지 컬럼 + Storage 버킷
supabase/migrations/20260520010000_add_cafe_images.sql

-- 2. 카카오 로그인 users / favorite_cafes / saved_lists 테이블
supabase/migrations/20260521000000_add_kakao_users_and_favorites.sql
```

### Kakao Developers 설정

- [x] `reports` 테이블 생성 완료 (이전에 적용됨)
- [ ㅇ] Redirect URI 등록: `https://{your-domain}/api/auth/kakao/callback`
- [ㅇ ] Preview URL도 등록 (Vercel preview 도메인)

### Vercel 환경 변수 등록 확인

| 키 | 필수 |
|---|---|
| `NEXT_PUBLIC_KAKAO_MAP_API_KEY` | ✅ |
| `SUPABASE_URL` | ✅ |
| `SUPABASE_ANON_KEY` | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ |
| `KAKAO_REST_API_KEY` | ✅ |
| `ADMIN_SECRET` | ✅ |
| `KAKAO_SESSION_SECRET` | ✅ (없으면 `ADMIN_SECRET` fallback) |
| `ADMIN_KAKAO_IDS` | ✅ |
| `KAKAO_CLIENT_SECRET` | ✅ |
| `KAKAO_REDIRECT_URI` | ✅ |

---

## 브라우저 수동 QA 체크리스트

코드는 완료됐으나 브라우저에서 아직 확인 안 된 항목.

### Plan 3 — 제보

- [✅ ] 신규 카페 제보 제출 → Supabase `reports` row 생성 확인
- [ ] 정보 수정 제보 제출 → 관리자 화면에서 보이는지 확인
- [✅ ] 지도 위치 찍기 후 주소 자동 변환 동작 확인
- [✅ ] 카카오 검색 결과에서 선택 시 선택 카드만 남는지 확인

### Plan 5 — 카페 이미지 업로드 (SQL 적용 후)

- [✅ ] `/admin`에서 대표 이미지 업로드 + 미리보기 + 저장 확인
- [x ] 이미지 URL 직접 입력 시 미리보기와 저장 정상 확인
- [x ] `/map` 마커·리스트 썸네일에 이미지 반영 확인
- [✅ ] 새로고침 후 이미지 유지 확인

### Plan 6 — 카카오 로그인 (SQL + Kakao 설정 후)

- [ ✅] 카카오 로그인 콜백, 세션 유지, 로그아웃 확인
- [ ] 로그인 사용자 즐겨찾기 저장/삭제 → Supabase `favorite_cafes` 반영 확인
- [ ] 익명 사용자 즐겨찾기 → localStorage 저장 확인

### Plan 7/8 — 프로필 수정 + 동물 이미지

- [✅ ] `내 정보 수정` 시트에서 동물 .webp 이미지 정상 표시
- [ ] 익명 상태에서 카카오 로그인 후 기존 동물 유지 확인
- [✅ ] 재로그인 시 서버 동물 변경되지 않는지 확인
- [✅ ] 🔄 버튼으로 동물 변경 후 즉시 반영 확인

### 기본 라우트 QA

- [ ] 모바일 375px 랜딩페이지 overflow 없음 확인
- [ ] `/map` 카카오 지도 SDK + 마커 정상 렌더링 확인

---

## 미구현 기능 (다음 계획 대상)

### 제보 사진 업로드

- Supabase Storage `reports` 버킷 + 정책 설계 필요
- 현재 `ReportSheet.tsx`에 사진 업로드 UI 없음
- 구현 시 포함할 것:
  - 대표사진 1장, 최대 5MB
  - 저작권 동의 체크박스 (필수)
  - 업로드 → URL → `reports.image_url` 저장

### 사용자 지정 카페 리스트 (saved_lists)

- Supabase `saved_lists` DB 스키마만 존재
- UI/API 미구현: 리스트 생성/수정/삭제, 카페 추가/제거

### Bell 버튼 (알림)

- 지도 우중단 Bell 버튼은 UI만 있고 동작 연결 없음
- 알림 기능 자체가 미설계 상태

### MapView 다크모드

- `MapView` / `Sidebar` / `KakaoMap`은 CSS 변수 미사용, 색상 하드코딩
- 다크모드 확장 시 해당 파일 전체 수정 필요

### UI 디자인 고급화

- 미설계. 우선순위 미정.

### 커피 뱃지 시스템

- 회원 기반 + 데이터 축적 후 설계. 현재 진행 불가.

---

## 알려진 개선 후보 (우선순위 미정)

| 항목 | 위험도 | 비고 |
|---|---|---|
| `cafes.json` 삭제 | 낮 | Supabase 안정 확인 후. fallback 코드도 함께 제거 |
| Sidebar 목록 버튼 중복 제거 (`md:hidden`/`md:flex` 두 개) | 낮 | 단순 코드 정리 |
| `/cafes/[id]` 뒤로가기 `/map`으로 변경 | 낮 | 현재 `/`로 이동 |
