# coFFFFFe-map 현재 계획

> 마지막 갱신: 2026-05-20
> 상태: **랜딩페이지 1차 반영 완료 / Plan 5 Supabase SQL 적용 및 브라우저 QA 대기**

---

## 이전 계획 완료 요약

Supabase 연동 + 관리자 페이지 + 커스텀 마커 작업 전체 완료.

- [x] Supabase `cafes` 테이블 생성, 8개 카페 마이그레이션
- [x] `src/lib/supabase.ts` — server-only 클라이언트 팩토리
- [x] `src/lib/admin-auth.ts` — 쿠키/Bearer 인증
- [x] `/api/cafes` — Supabase 우선, cafes.json fallback
- [x] `/api/kakao/search` — 카카오 REST API 서버 프록시
- [x] `/api/admin/cafes` — POST/PUT/DELETE CRUD
- [x] `/admin` — 비밀번호 게이트 + 카카오 검색 + 카페 관리 UI
- [x] `KakaoMap.tsx` — CustomOverlay 커피 핀 마커 (선택 시 크기 업 + 라벨)
- [x] `MapView.tsx` — 퀵카테고리 + 검색 + 필터 통합
- [x] `Sidebar.tsx` — 퀵카테고리 칩, 모바일 슬라이드 패널

---

## 전체 기능 로드맵 (우선순위 순)

| 순위 | 기능 | 상태        |
|---|---|-----------|
| 1 | 지도 버튼 기능 구현 (확대/축소/이 지역 검색/레이어) | **완료**    |
| 2 | 익명 사용자 랜덤 한글 닉네임 | **구현 완료** |
| 3 | 플레이스 제보 (익명/회원) | **다음 계획** |
| 4 | 관리자 제보 리스트 + 카페 등록 연동 | **완료**    |
| 5 | 카페 이미지 업로드 (Supabase Storage + 관리자 UI) | **구현 완료 / SQL 적용 대기** |
| 6 | 카카오 로그인 + 즐겨찾기/리스트 저장 | 대기        |
| 7 | UI 디자인 고급화 | 대기        |
| 8 | 커피 뱃지 시스템 | 대기        |

---

## Plan 1 — 지도 버튼 기능 구현 ✅ 완료

### 목표

`MapView.tsx`에 UI만 있고 기능 없는 버튼들을 실제로 동작하게 연결한다.

### 현재 상태

| 버튼 | 현재 상태 |
|---|---|
| LocateFixed (현재위치) | ✅ `locationRequestId` 연결 완료 (데스크톱·모바일 둘 다) |
| Plus/Minus (확대/축소) | ✅ `zoomRequest`로 `KakaoMap`에 연결 완료 |
| Layers (지도 레이어) | ✅ 일반 지도 ↔ 스카이뷰 토글 연결 완료 |
| "이 지역 검색" | ✅ 현재 지도 bounds 기준 필터 연결 완료 |

### 구현 완료 요약

- `KakaoMap`에 지도 타입, 줌 요청, 지도 bounds 변경 콜백을 연결했다.
- `MapView`에서 확대/축소 버튼, 레이어 토글, 현재 지도 영역 검색 상태를 관리한다.
- 현재 지도 영역 검색은 기존 로스팅/원산지/추출/검색/퀵카테고리 결과와 AND 조건으로 적용된다.
- `kakao.d.ts`에 `getBounds`, `getLevel`, `setMapTypeId`, `LatLngBounds`, `MapTypeId` 타입을 보강했다.

### 범위

- `src/components/map/KakaoMap.tsx`
- `src/components/MapView.tsx`

### 제외 범위

- Bell(알림), UserRound(프로필) 버튼 — 로그인 기능 이후
- UI 디자인 변경 없음

### 구현 상세

#### 1. 확대/축소 버튼

`KakaoMap`에 `onZoomIn`, `onZoomOut` props 추가.

```ts
// KakaoMap props 추가
onZoomIn?: () => void
onZoomOut?: () => void
```

또는 `useImperativeHandle`로 ref 노출. props 방식이 더 단순하므로 props 사용.

내부에서 `mapRef.current.setLevel(current - 1)` / `setLevel(current + 1)`.

MapView에서 핸들러 작성 → KakaoMap에 전달.

#### 2. Layers 버튼

카카오맵 지도 타입 토글 (일반 ↔ 스카이뷰).

```ts
// MapView 상태 추가
const [mapType, setMapType] = useState<'normal' | 'skyview'>('normal')
```

KakaoMap에 `mapType` prop 전달 → 내부에서 `map.setMapTypeId(kakao.maps.MapTypeId.SKYVIEW)`.

#### 3. "이 지역 검색" 버튼

지도 이동 감지 → 버튼 활성화 → 클릭 시 현재 지도 bounds 내 카페만 표시.

흐름:
```
카카오맵 'dragend'/'zoom_changed' 이벤트
→ onMapBoundsChange(bounds) 콜백 → MapView 상태 업데이트
→ "이 지역 검색" 버튼 활성화 (시각적 강조)
→ 버튼 클릭 → filteredCafes를 bounds 내 카페로 추가 필터링
→ 버튼 비활성화 (검색 완료 상태)
```

MapView에 `boundsFilter: kakao.maps.LatLngBounds | null` 상태 추가.
bounds 필터는 기존 `roastLevel`, `beanOrigin`, `brewMethod` 필터와 AND 조건으로 적용.

### 수정 예상 파일

- `src/components/map/KakaoMap.tsx` — props 추가, 이벤트 리스너, 지도 레벨/타입 조작
- `src/components/MapView.tsx` — 핸들러 및 상태 추가, KakaoMap props 연결

### 검증

- [x] 확대/축소 버튼 클릭 시 지도 레벨 변경 로직 연결
- [x] Layers 버튼 클릭 시 스카이뷰 ↔ 일반 전환 로직 연결
- [x] 지도 드래그/줌 후 "이 지역 검색" 버튼 활성화 로직 연결
- [x] "이 지역 검색" 클릭 시 현재 화면 내 카페만 마커/목록에 표시되도록 필터 연결
- [x] 기존 필터·검색·퀵카테고리와 AND 조건으로 적용
- [ ] 모바일 375px 기준 overflow 없음 확인

자동 검증:

```bash
npx.cmd tsc --noEmit
npm.cmd run lint
npm.cmd run build
```

결과: 모두 통과.

---

## Plan 2 — 익명 사용자 랜덤 한글 닉네임

### 구현 완료 요약

- `src/lib/nickname.ts`에 형용사 20개, 커피명사 16개, 동물명 20개 기반 닉네임 생성 유틸을 추가했다.
- `src/lib/animalAvatar.ts`에 동물명 → 이모지 아바타 매핑을 분리했다. 추후 SVG 파일로 교체할 때 이 파일만 바꾸면 된다.
- `src/hooks/useUser.ts`에 `useSyncExternalStore` 기반 익명 사용자 훅을 추가했다.
- `coffffe_user` localStorage 값이 없으면 익명 사용자를 생성해 저장하고, 저장 값이 유효하면 재사용한다.
- `MapView` 우상단 프로필 버튼에 익명 사용자 아바타를 표시하고, hover/title로 전체 닉네임을 확인할 수 있게 연결했다.
- 프로필 버튼 클릭 시 직사각형 드롭다운 메뉴가 열리며 내 아이디, 제보내역, 내 리뷰내역, 카카오 로그인하기 버튼을 표시한다.
- 드롭다운 닉네임 아래에 임시 닉네임 안내 문구를 추가하고, 닉네임 옆 새로고침 버튼으로 익명 닉네임을 다시 생성할 수 있게 했다.

### 목표

앱 최초 방문 시 랜덤 한글 닉네임을 자동 부여하고 localStorage에 저장한다.
이후 카카오 로그인 연동 시 마이그레이션 가능한 구조로 설계한다.

### 범위

- `src/lib/nickname.ts` — 닉네임 생성 유틸
- `src/hooks/useUser.ts` — 사용자 상태 훅 (익명/로그인 통합 인터페이스)
- `src/components/MapView.tsx` — 프로필 버튼에 닉네임 표시

### 제외 범위

- 카카오 로그인 구현 (이후 Plan에서)
- Supabase 사용자 테이블 생성 (로그인 기능 시 함께)
- 닉네임 변경 UI

### 구현 상세

#### 1. 닉네임 생성 (`src/lib/nickname.ts`)

**형용사 × 커피명사 × 동물** 3단어 조합. 20 × 16 × 20 = **6,400가지**.

```ts
// 형용사 20개
const ADJECTIVES = [
  '따뜻한', '진한', '부드러운', '향긋한', '달콤한',
  '신선한', '깊은', '맑은', '차가운', '시원한',
  '쌉쌀한', '묵직한', '가벼운', '산뜻한', '고소한',
  '풍부한', '은은한', '강렬한', '섬세한', '포근한',
]

// 커피명사 16개
const COFFEE_NOUNS = [
  '라떼', '에스프레소', '콜드브루', '아메리카노',
  '카푸치노', '핸드드립', '플랫화이트', '마키아토',
  '모카', '바닐라라떼', '고구마라떼', '오트라떼',
  '더치커피', '리스트레토', '룽고', '돌체라떼',
]

// 동물 20개
const ANIMALS = [
  '고양이', '강아지', '토끼', '곰', '판다',
  '수달', '너구리', '여우', '고슴도치', '햄스터',
  '부엉이', '펭귄', '카피바라', '알파카', '미어캣',
  '비버', '다람쥐', '코알라', '나무늘보', '하마',
]

export function generateNickname(): string
// → "차가운 고구마라떼 하마"
```

#### 2. 동물 아바타 매핑 (`src/lib/animalAvatar.ts`)

SVG를 나중에 교체할 수 있도록 매핑 레이어를 분리한다.

```ts
// 현재: 이모지 폴백
// 나중에: SVG 파일로 교체 (src/assets/animals/하마.svg 등)

export const ANIMAL_EMOJI: Record<string, string> = {
  '고양이': '🐱', '강아지': '🐶', '토끼': '🐰', '곰': '🐻', '판다': '🐼',
  '수달': '🦦', '너구리': '🦝', '여우': '🦊', '고슴도치': '🦔', '햄스터': '🐹',
  '부엉이': '🦉', '펭귄': '🐧', '카피바라': '🦫', '알파카': '🦙', '미어캣': '🦡',
  '비버': '🦫', '다람쥐': '🐿️', '코알라': '🐨', '나무늘보': '🦥', '하마': '🦛',
}

// SVG 추가 시 이 함수만 교체하면 됨
export function getAnimalAvatar(animal: string): string {
  // 추후: SVG import 또는 /animals/하마.svg 경로 반환
  return ANIMAL_EMOJI[animal] ?? '☕'
}
```

SVG 파일 위치 예약: `src/assets/animals/{동물명}.svg`

#### 3. 사용자 훅 (`src/hooks/useUser.ts`)

```ts
interface AnonymousUser {
  type: 'anonymous'
  nickname: string      // "차가운 고구마라떼 하마"
  animal: string        // "하마" — 아바타 표시용
}

// 추후 확장
// interface AuthenticatedUser { type: 'authenticated'; id: string; nickname: string; animal: string; ... }

export type User = AnonymousUser // | AuthenticatedUser (로그인 기능 후 추가)

export function useUser(): User
```

localStorage 키: `coffffe_user`

최초 접근 시 닉네임 생성 → 저장. 이후 접근 시 저장된 값 사용.

#### 4. MapView 프로필 버튼 연결

```tsx
// 현재
<span className="flex h-8 w-8 ..."><UserRound size={16} /></span>

// 변경 후 — 동물 이모지 (SVG 교체 전)
<span className="flex h-8 w-8 text-lg ...">🦛</span>
```

tooltip 또는 hover 시 전체 닉네임 표시.

### 수정 예상 파일

- `src/lib/nickname.ts` — 신규 생성 (닉네임 생성 로직)
- `src/lib/animalAvatar.ts` — 신규 생성 (동물→이모지/SVG 매핑)
- `src/hooks/useUser.ts` — 신규 생성 (사용자 상태 훅)
- `src/components/MapView.tsx` — useUser 훅 사용, 프로필 버튼 아바타 연결

### 검증

- [x] 최초 방문 시 랜덤 닉네임 자동 생성 로직 구현
- [x] 새로고침 후 동일 닉네임 유지 로직 구현 (localStorage)
- [x] 프로필 버튼에 동물 이모지 표시 로직 구현
- [x] hover 시 전체 닉네임 표시 로직 구현 (`title`)
- [x] 드롭다운에서 닉네임 새로고침 버튼 클릭 시 새 조합 생성 로직 구현
- [ ] 다른 브라우저/시크릿 탭에서 다른 닉네임 생성 확인

자동 검증:

```bash
npx.cmd tsc --noEmit
npm.cmd run lint
npm.cmd run build
```

결과: 모두 통과.

---

## Plan 3 — 플레이스 제보

### 목표

익명/회원 사용자가 새 카페 또는 기존 카페 정보 수정을 관리자에게 제보할 수 있게 한다.

### 진입 루트

| 루트 | 설명 |
|---|---|
| 검색 결과 없음 | Sidebar 검색 결과 0건 시 "이 카페 제보하기" 유도 문구 |
| 플로팅 버튼 | 지도 우하단 "제보하기" 버튼 → 바텀시트 [장소 검색] / [지도에서 위치 찍기] 탭 |

롱프레스 방식은 지도 드래그와 충돌 위험 → 보류.

### 제보 타입

| 타입 | 설명 |
|---|---|
| `new_place` | 신규 장소 (카카오 검색 or 직접 위치 선택) |
| `correction` | 기존 카페 정보 수정 요청 (`cafe_id` 연결) |

### 위치 직접 선택 흐름

```
플로팅 버튼 → "지도에서 위치 찍기" 탭 선택
→ 지도 탭 모드 진입 (핀 찍기 안내 표시)
→ 유저가 지도 탭 → 좌표 캡처
→ /api/kakao/geocode 서버 프록시로 역지오코딩
→ 주소 자동 표시 → 제보 폼으로 진행
```

`/api/kakao/geocode` 신규 추가 필요. 카카오 로컬 API `coord2address` 사용.

### 사용자 식별

`useUser` anonymousId 필드 추가 (UUID v4, `crypto.randomUUID()`).

```ts
// coffffe_user localStorage 구조 변경
{
  anonymousId: "uuid-1234",  // 변경 안 됨 — 제보 연결 키
  nickname: "차가운 하마",
  animal: "하마"
}
```

보안 문제 없음 — UUID는 공개 식별자, 서버에서 익명 ID로만 사용.

### 수정 요청 항목 (correction 타입)

체크박스 + 자유 텍스트 혼합.

체크박스 항목:
- 영업시간 오류
- 주소 오류
- 폐업
- 메뉴/원두 정보 오류
- 기타

자유 텍스트: 추가 메모 (선택)

### 사진

- 대표사진 1장, 최대 5MB
- Supabase Storage `reports` 버킷에 업로드
- 이미지 먼저 업로드 → URL → reports 테이블 저장
- 업로드 시 체크박스: "이 사진의 저작권을 보유하거나 사용 허가를 받았습니다" (필수)

### Supabase `reports` 테이블 스키마

```sql
id            uuid        PK, default gen_random_uuid()
type          text        'new_place' | 'correction'
cafe_id       text        nullable — correction 시 기존 카페 연결
kakao_place_id text       nullable — 카카오 장소 검색으로 제보 시
name          text        nullable
address       text        nullable
lat           float8      nullable
lng           float8      nullable
image_url     text        nullable
correction_types text[]   nullable — 체크박스 항목 배열
memo          text        nullable
anonymous_id  text        NOT NULL — 제보자 UUID
nickname      text        NOT NULL — 제보 당시 닉네임 (스냅샷)
status        text        'pending' | 'approved' | 'rejected', default 'pending'
created_at    timestamptz default now()
```

### API

| 엔드포인트 | 메서드 | 설명 |
|---|---|---|
| `/api/reports` | POST | 제보 등록 (인증 불필요, rate limit 고려) |
| `/api/kakao/geocode` | GET | 좌표→주소 역지오코딩 서버 프록시 |

이미지 업로드는 Supabase Storage SDK 클라이언트에서 직접 처리 (서명된 업로드 URL 방식).

### 범위

- `src/components/ReportSheet.tsx` — 제보 바텀시트 (신규)
- `src/components/MapView.tsx` — 플로팅 제보 버튼 추가, 지도 탭 모드
- `src/components/Sidebar.tsx` — 검색 결과 없음 유도 문구
- `src/hooks/useUser.ts` — anonymousId 필드 추가
- `src/app/api/reports/route.ts` — POST 제보 등록 (신규)
- `src/app/api/kakao/geocode/route.ts` — 역지오코딩 프록시 (신규)

### 제외 범위

- 관리자 제보 리스트 UI → Plan 4
- 로그인 사용자 제보 → Plan 5 이후
- 제보 상태 알림 → 미래 기능

### 검증

- [ ] 플로팅 버튼 → 제보 바텀시트 열림
- [ ] 카카오 검색으로 장소 선택 → 정보 자동 채워짐
- [ ] 지도 탭 모드 → 좌표 캡처 → 주소 자동 변환
- [ ] correction 타입 시 체크박스 + 메모 입력
- [ ] 사진 업로드 5MB 초과 시 에러
- [ ] 저작권 체크박스 미체크 시 제출 불가
- [ ] 제보 Supabase reports 테이블 저장 확인
- [ ] anonymousId로 제보자 식별 확인

---

## 알려진 개선 후보 (우선순위 미정)

| 항목 | 위험도 | 비고 |
|---|---|---|
| `cafes.json` 삭제 | 낮 | Supabase 안정 확인 후 진행. fallback 코드도 함께 제거 |
| MapView 다크모드 확장 | 중 | CSS 변수 미사용 구간 전체 수정 필요 |
| Vercel 환경 변수 등록 확인 | 높 | 배포 전 필수. 로컬에서 확인 불가 |
| `/cafes/[id]` 뒤로가기 UX 개선 | 낮 | 현재 `/`로 이동 |
| 목록 버튼 중복 제거 (`md:hidden`/`md:flex` 두 개) | 낮 | 단순 코드 정리 |

---

## 배포 전 필수 확인

1. Vercel 대시보드에 환경 변수 6개 모두 등록 확인
2. Kakao Developers에 Vercel 도메인 등록 확인
3. Preview 배포에서 지도 로딩 + 마커 + 관리자 페이지 동작 확인

```bash
npx tsc --noEmit
npm run lint
npm run build
```

---

## 미래 기능 메모

- 익명 사용자 → 관리자에게 플레이스 제보 (사진 업로드 포함, 이용약관 체크박스 필수)
- 관리자 제보 리스트 확인 + 카페 등록 연동
- 카카오 로그인 + 즐겨찾기/리스트 저장
- 카페 이미지: Supabase Storage + 관리자 업로드 UI (상업적 사용 예정 → 스크래핑 배제)
- 커피 뱃지 시스템 (회원 기반 + 데이터 축적 후)

---

## 2026-05-20 �߰� �ݿ�

- [x] ����Ͽ����� ���� ���� ��� ������ ��ư ǥ��
- [x] ����Ͽ����� �˸� ��ư�� ����� ������ ��ư�� ����
- [x] ����� ��Ӵٿ� ���� viewport �ȿ� �µ��� ����

---

## 2026-05-20 Plan 3/4 진행 반영

### Plan 4 관리자 제보 리스트 + 카페 등록 연동

상태: 완료 및 원격 푸시 완료

- `/api/admin/reports` GET/PATCH 추가
- 관리자 화면 `/admin`에 제보 리스트 추가
- 제보 상태 `pending`, `approved`, `rejected` 조회/변경 연결
- 제보 카드에서 카페 등록 폼 자동 채우기 연결
- 제보 기반 카페 저장 후 해당 제보 자동 승인 처리
- `reports` 테이블 생성 migration 추가
- Supabase SQL Editor에서 `reports` 테이블 생성 완료 확인
- 커밋/푸시: `c2847d5 feat: add user profile and report admin flow`

### Plan 3 플레이스 제보

상태: 기본 제보 저장 흐름 구현 완료, 브라우저 수동 QA 대기

- `src/components/ReportSheet.tsx` 신규 추가
- `/api/reports` POST 추가: 사용자 제보를 Supabase `reports` 테이블에 저장
- `/api/kakao/geocode` GET 추가: 지도 좌표를 주소로 변환
- 프로필 드롭다운에서 `제보하기`, `정보수정` 진입 연결
- 검색 결과 0건 화면에서 `새 카페 제보하기` 진입 연결
- 신규 카페 제보: 카카오 장소 검색 선택 또는 지도 위치 찍기 지원
- 정보 수정 제보: 기존 카페 선택, 수정 유형 체크박스, 메모 입력 지원
- `useUser`에 `anonymousId` 추가. 기존 localStorage 사용자는 닉네임 유지 후 ID만 보강
- `KakaoMap` 지도 배경 클릭 좌표 콜백 추가
- 지도에서 위치 찍기 후 제보 바텀시트 복귀 시 카페 이름 검색 UI를 숨기고, 선택된 지도 위치 카드만 강조 표시
- 지도 선택 위치의 카페 이름 입력칸을 빈 값, 강조 테두리, 안내 문구로 변경
- 카카오 장소 검색 결과에서 카페 선택 시 선택된 카페 카드만 남기도록 UI 정리
- 제보 메모 placeholder를 커피 경험과 원두/메뉴 정보를 자연스럽게 남기도록 감성 문구로 변경

검증:

```bash
npx.cmd tsc --noEmit
npm.cmd run lint
npm.cmd run build
```

결과: 모두 통과.

남은 작업:

- `/`에서 신규 카페 제보 제출 후 Supabase `reports` row 생성 확인
- 기존 카페 정보 수정 제보 제출 후 관리자 화면에서 보이는지 확인
- 지도 위치 찍기 후 주소 자동 변환 동작 확인
- 지도 위치 찍기 후 검색 UI가 숨겨지고 카페 이름 입력이 명확하게 보이는지 브라우저 확인
- 카카오 검색 결과에서 선택한 카페만 남는지 브라우저 확인
- 사진 업로드는 Supabase Storage 버킷/정책 설계 후 별도 Plan에서 진행

---

## Plan 5 — 카페 이미지 업로드

상태: 구현 완료, Supabase SQL 직접 적용 및 브라우저 QA 대기

### 구현 내용

- `cafes.images text[]` 컬럼 추가 SQL 작성
- Supabase Storage `cafe-images` public 버킷 생성 SQL 작성
- 관리자 전용 이미지 업로드 API `/api/admin/cafe-images` 추가
- 업로드 API에서 관리자 인증, 이미지 MIME 타입, 5MB 제한 검증
- `/api/admin/cafes` POST/PUT/GET에 `images` 배열 저장/조회 연결
- `/api/cafes` GET에 `images` 배열 조회 연결
- `/admin` 카페 추가/수정 폼에 대표 이미지 업로드, 미리보기, 제거 UI 추가
- `/admin` 대표 이미지 영역 오버플로우 방지 처리
- 이미지 업로드 외에 이미지 URL 또는 카카오맵에서 복사한 실제 이미지 주소로 대표 이미지 지정 가능
- 대표 이미지는 `images[0]`에 저장하며 기존 지도 마커와 카페 리스트 썸네일에 자동 반영

### 수정 파일

- `supabase/migrations/20260520010000_add_cafe_images.sql`
- `src/app/api/admin/cafe-images/route.ts`
- `src/app/api/admin/cafes/route.ts`
- `src/app/api/cafes/route.ts`
- `src/app/admin/page.tsx`

### Supabase 직접 적용 필요

Supabase SQL Editor에서 아래 파일 내용을 직접 실행해야 한다.

```txt
supabase/migrations/20260520010000_add_cafe_images.sql
```

### 검증

```bash
npx.cmd tsc --noEmit
npm.cmd run lint
npm.cmd run build
```

결과: 모두 통과.

### 남은 작업

- Supabase SQL Editor에서 `20260520010000_add_cafe_images.sql` 실행
- `/admin`에서 카페 ID 입력 후 대표 이미지 업로드 확인
- `/admin`에서 이미지 URL 직접 입력 시 미리보기와 저장이 정상인지 확인
- 긴 이미지 URL이 대표 이미지 카드 밖으로 넘치지 않는지 확인
- 저장 후 `/map` 지도 마커와 카페 리스트 썸네일에 이미지가 반영되는지 확인
- 새로고침 후 이미지가 유지되는지 확인

---

## 2026-05-20 랜딩페이지 1차 반영

상태: 구현 및 1차 커밋 완료

### 변경 파일

- `src/app/page.tsx`
- `src/app/map/page.tsx`
- `src/components/Sidebar.tsx`
- `src/app/cafes/[id]/page.tsx`

### 구현 내용

- `/`를 랜딩페이지로 변경했다.
- 기존 지도 화면은 `/map`으로 이동했다.
- `/map`에서 기존처럼 `/api/cafes`를 fetch하고 `MapView`를 렌더링한다.
- 랜딩페이지에 지도, CBTI, 원두 페이지 CTA를 추가했다.
- 지도 사이드바의 지도 탭 링크와 카페 상세의 "지도로 돌아가기" 링크를 `/map`으로 변경했다.

### 확인 결과

```bash
npx.cmd tsc --noEmit
npm.cmd run lint
npm.cmd run build
```

결과: 모두 통과.

- 개발 서버에서 `/`, `/map` 200 응답 확인 완료.
- 1차 커밋: `737ef00 feat: add landing page and move map route`
- 최신 확인 커밋: `688eb3d 랜딩페이지 추가 ㅁ및 로고 변경`

### 남은 TODO

- 브라우저에서 모바일 375px 기준 랜딩페이지 overflow 여부 확인
- `/map`에서 카카오 지도 SDK와 마커 렌더링 수동 확인
- Plan 5 Supabase SQL 적용 및 이미지 업로드 브라우저 QA 진행

---

## 2026-05-21 Plan 6 카카오 로그인 + 즐겨찾기/리스트 저장

상태: 구현 완료, Supabase SQL 직접 적용 및 브라우저 OAuth QA 대기

### 구현 내용

- 카카오 OAuth 시작/콜백 Route Handler 추가: `/api/auth/kakao/start`, `/api/auth/kakao/callback`, `/api/auth/me`, `/api/auth/logout`
- httpOnly HMAC 세션 쿠키 `coffffe_session` 추가
- Supabase `users`, `favorite_cafes`, `saved_lists` migration 추가
- `useUser`가 익명 사용자와 카카오 로그인 사용자를 함께 다루도록 확장
- `useSavedCafes` 추가
  - 익명 사용자는 `localStorage` 기반 저장
  - 카카오 로그인 사용자는 `/api/me/favorites` 기반 Supabase 저장
- 지도 카페 리스트와 모바일 상세 카드에 하트 저장 버튼 추가
- 프로필 드롭다운에 저장한 카페 목록, 로그인/로그아웃 상태 표시 추가
- 제보 작성자 ID는 익명 사용자면 `anonymousId`, 카카오 사용자면 `user.id` 사용

### 수정 파일

- `src/lib/user-auth.ts`
- `src/app/api/auth/kakao/start/route.ts`
- `src/app/api/auth/kakao/callback/route.ts`
- `src/app/api/auth/me/route.ts`
- `src/app/api/auth/logout/route.ts`
- `src/app/api/me/favorites/route.ts`
- `src/hooks/useUser.ts`
- `src/hooks/useSavedCafes.ts`
- `src/components/MapView.tsx`
- `src/components/Sidebar.tsx`
- `src/components/CafeListItem.tsx`
- `src/components/CafePreviewCard.tsx`
- `src/components/BottomSheet.tsx`
- `src/components/ReportSheet.tsx`
- `supabase/migrations/20260521000000_add_kakao_users_and_favorites.sql`

### 환경 변수

필요:

```txt
KAKAO_REST_API_KEY
KAKAO_SESSION_SECRET 또는 ADMIN_SECRET
```

선택:

```txt
KAKAO_CLIENT_SECRET
KAKAO_REDIRECT_URI
```

### Supabase 직접 적용 필요

Supabase SQL Editor에서 아래 migration 실행 필요.

```txt
supabase/migrations/20260521000000_add_kakao_users_and_favorites.sql
```

### 검증

```bash
npx.cmd tsc --noEmit
npm.cmd run lint
npm.cmd run build
```

결과:

- tsc: 통과
- lint: 통과
- build: 통과

참고:

- `npm.cmd run build` 후 PowerShell oh-my-posh init 경고가 출력됐지만, Next.js build exit code는 0으로 통과

### 남은 작업

- Supabase SQL Editor에서 Plan 6 migration 적용
- Kakao Developers Redirect URI 등록 확인
- 브라우저에서 카카오 로그인 콜백, 세션 유지, 로그아웃 확인
- 로그인 사용자 즐겨찾기 저장/삭제가 Supabase `favorite_cafes`에 반영되는지 확인
- `saved_lists`는 DB 스키마만 준비. 사용자 지정 리스트 UI/API는 후속 작업
