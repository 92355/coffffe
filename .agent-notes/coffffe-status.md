# coFFFFFe-map 현재 상태

> 마지막 갱신: 2026-05-20

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
| `/` | `src/app/page.tsx` | 랜딩페이지. 지도/CBTI/원두 CTA 제공 |
| `/map` | `src/app/map/page.tsx` | Client Component. `/api/cafes` fetch → `MapView`. SplashScreen(세션당 1회) |
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

## 10. Git 현황 (2026-05-20 기준)

| 커밋 | 내용 |
|---|---|
| `688eb3d` | 랜딩페이지 추가 및 로고 변경 |
| `737ef00` | 랜딩페이지 추가, 지도 라우트 `/map` 이동 |
| `073a7eb` | favicon 추가 |
| `c2847d5` | 사용자 프로필 및 제보 관리자 흐름 추가 |
| `c945639` | 수파베이스 연결 (supabase 연동, admin 페이지, 커스텀 마커 전체) |
| `e9141d3` | UIUX 개선 (Sidebar 퀵카테고리, FilterBar, MapView, CafeListItem 개선) |
| `f211987` | docs: update map UI plan |
| `7713115` | feat: make map the main screen |

브랜치: `main`

---

## 11. 알려진 상태 / 미완 사항

- `cafes.json` fallback 유지 중. Supabase 안정적이면 추후 삭제 가능.
- MapView 하단 "목록 보기" 버튼이 `md:hidden`/`md:flex` 두 개로 중복 렌더링됨 (로직은 동일).
- `/cafes/[id]` 뒤로가기 → `/map` 이동.
- 지도 우중단 +/-/LocateFixed/Layers 버튼은 동작 연결 완료. Bell 버튼은 UI만 있음.
- Profile 버튼은 익명 사용자 랜덤 한글 닉네임의 동물 아바타를 표시하고, hover/title로 전체 닉네임을 노출함.
- Profile 버튼 클릭 시 우측 상단에 직사각형 드롭다운 메뉴를 표시함. 메뉴 항목은 내 아이디, 제보내역, 내 리뷰내역, 카카오 로그인하기.
- Profile 드롭다운은 임시 닉네임 안내 문구와 닉네임 재생성 새로고침 버튼을 포함함.
- 익명 사용자 정보는 `coffffe_user` localStorage 키에 저장됨. 카카오 로그인 연동 전까지는 클라이언트 전용 상태.
- 지도 상단 "이 지역 검색" 버튼은 현재 지도 bounds 기반 필터로 동작 연결 완료.
- Sidebar 하단 "내 주변 카페 더보기" 버튼은 `/beans`로 이동 (의미상 약간 어색).
- 관리자 페이지 `POST /api/admin/cafes` 호출 시 `Authorization` 헤더 없이 쿠키만 사용.
- 카페 데이터는 목 데이터 (실제 영업 정보 미검증).
- MapView/Sidebar는 CSS 변수 미사용 — 다크모드 미지원.
- v2.0 후보: 검색/필터 고도화, 다크모드 확장.

---

## 2026-05-20 �߰� ����

- ���� ���� ��� ������ ��ư�� ����ũ��� ����� ��� ǥ���Ѵ�.
- �˸� ��ư�� ����ó�� ����ũ�鿡���� ǥ���Ѵ�.
- ����� ������ ��Ӵٿ��� ȭ�� ������ ��ġ�� �ʵ��� `100vw - 2rem`�� �ִ� `20rem` �� ������ �Բ� ����Ѵ�.

---

## 2026-05-20 추가 상태: 제보 기능

- Plan 4 관리자 제보 리스트 + 카페 등록 연동은 완료되어 `main`에 푸시됐다.
- 마지막 푸시 커밋: `c2847d5 feat: add user profile and report admin flow`.
- Supabase `reports` 테이블은 `supabase/migrations/20260520000000_create_reports.sql` 기준으로 생성 완료됐다.
- 관리자 API:
  - `GET /api/admin/reports`: 관리자 제보 목록 조회
  - `PATCH /api/admin/reports`: 제보 상태 변경
- 사용자 제보 API:
  - `POST /api/reports`: 익명 사용자 제보 저장
  - `GET /api/kakao/geocode`: 지도 좌표를 Kakao 주소로 변환
- 사용자 제보 UI는 `src/components/ReportSheet.tsx`에 구현됐다.
- 진입점:
  - 프로필 드롭다운 `제보하기`
  - 프로필 드롭다운 `정보수정`
  - 검색 결과 0건일 때 `새 카페 제보하기`
- 신규 카페 제보는 카카오 장소 검색 선택 또는 지도 위치 찍기를 지원한다.
- 정보 수정 제보는 기존 카페 선택, 수정 유형 체크박스, 메모 입력을 지원한다.
- `coffffe_user` localStorage 구조에 `anonymousId`가 추가됐다. 기존 사용자는 닉네임/동물은 유지하고 `anonymousId`만 보강된다.
- 사진 업로드는 아직 미구현이다. Supabase Storage `reports` 버킷과 업로드 정책 설계 후 별도 작업이 필요하다.
- 자동 검증 결과: `npx.cmd tsc --noEmit`, `npm.cmd run lint`, `npm.cmd run build` 모두 통과.
- 남은 확인: 브라우저에서 실제 제보 제출 후 Supabase `reports` row 생성 여부와 관리자 화면 노출 여부 수동 QA.

---

## 2026-05-20 추가 상태: 랜딩페이지 / 지도 라우트 전환

- `/`는 랜딩페이지로 변경됐다.
- 기존 지도 메인 화면은 `/map`으로 이동했다.
- `src/app/map/page.tsx`가 `/api/cafes`를 fetch하고 `MapView`를 렌더링한다.
- 랜딩페이지 CTA는 `/map`, `/cbti`, `/beans`로 연결된다.
- `Sidebar`의 지도 탭과 카페 상세의 "지도로 돌아가기" 링크는 `/map`으로 변경됐다.
- 자동 검증 결과: `npx.cmd tsc --noEmit`, `npm.cmd run lint`, `npm.cmd run build` 모두 통과.
- 개발 서버에서 `/`, `/map` 200 응답 확인 완료.
- 최신 확인 커밋: `688eb3d 랜딩페이지 추가 ㅁ및 로고 변경`.
