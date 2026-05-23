# PRD: 아키텍처 정리 — 필터링 통합·썸네일 해시 통일·Kakao Map 초기화 훅화

## Problem Statement

아키텍처 리뷰(2026-05-22)에서 도출된 3가지 중복·불일치 문제가 남아있다.

1. **필터링 로직 중복** — 카페 필터 술어(roastLevel·beanOrigin·brewMethod)가 서버(API 라우트)와 클라이언트(MapView) 양쪽에 각각 구현되어 있다. 새 필터 조건을 추가하거나 기존 조건을 수정할 때 두 곳을 동시에 수정해야 하고, 한 곳만 고치면 서버·클라이언트 결과가 달라지는 조용한 버그가 생긴다.

2. **썸네일 해시 알고리즘 불일치** — 카페 목록 카드(CafeListItem)와 그 외 UI(cafeThumb 유틸)가 카페 색상을 결정하는 해시를 서로 다른 알고리즘으로 계산한다. 같은 카페가 목록에서는 한 색상, 다른 화면에서는 다른 색상으로 보이는 시각적 불일치가 발생한다.

3. **Kakao Map 초기화 패턴 산재** — SDK 스크립트 로드 완료 신호로 사용하는 커스텀 이벤트 이름(`'kakaoMapReady'`)이 두 컴포넌트에 문자열 리터럴로 중복 하드코딩되어 있다. 이벤트 이름을 바꾸거나 초기화 타이밍을 변경하려면 두 파일을 동시에 수정해야 하며, 오타 하나로 지도가 통째로 초기화되지 않는 버그가 생길 수 있다.

---

## Solution

각 문제에 대해 단일 진실 소스를 만든다.

- **필터링**: `src/lib/cafeFilters.ts` 모듈에 `matchesFilters(cafe, filters)` 순수 함수를 추출한다. API 라우트와 MapView 모두 이 함수를 import해 사용한다. MapView 전용 searchQuery·activeQuickCategory 술어는 `matchesSearch(cafe, query)`, `matchesCategory(cafe, category)` 형태로 같은 모듈에 추가한다.

- **썸네일 해시**: `cafeThumb.ts`에 `cafeHue(cafeId: string): number` 함수를 추가(또는 기존 함수를 ID 기반으로 교체)한다. CafeListItem은 인라인 해시를 제거하고 이 함수를 import한다.

- **Kakao Map 초기화**: `src/hooks/useKakaoMap.ts` 훅을 신규 생성해 "스크립트 로드 대기 → `kakao.maps.load()` 호출 → 지도 인스턴스 반환" 흐름을 캡슐화한다. 이벤트 이름 상수는 훅 내부에만 존재한다.

---

## User Stories

1. 개발자로서, roastLevel 필터 조건을 수정할 때 파일 하나만 고치면 API 응답과 지도 화면 양쪽에 동시에 반영되길 원한다.
2. 개발자로서, 새 필터 조건(예: 좌석 수, 영업시간)을 추가할 때 어느 파일을 수정해야 하는지 즉시 알 수 있길 원한다.
3. 개발자로서, 필터 함수를 브라우저나 서버 환경 없이 순수 입출력으로 단위 테스트할 수 있길 원한다.
4. 개발자로서, API 라우트와 클라이언트 필터가 항상 동일한 로직을 실행한다는 보장을 코드 구조에서 얻길 원한다.
5. 사용자로서, 카페 목록과 지도·상세 화면 어디서나 같은 카페가 동일한 색상으로 표시되길 원한다.
6. 개발자로서, 카페 대표 색상(hue) 계산 방식을 바꿀 때 파일 하나만 수정하면 모든 UI에 반영되길 원한다.
7. 개발자로서, Kakao Maps SDK 스크립트 로드 완료 이벤트 이름이 코드 어디에 있는지 찾기 위해 두 파일을 뒤지지 않아도 되길 원한다.
8. 개발자로서, Kakao Map 초기화 타이밍 로직을 수정할 때 컴포넌트가 아닌 훅 하나만 읽으면 전체 흐름을 파악할 수 있길 원한다.
9. 개발자로서, 이벤트 이름 문자열 오타로 지도가 초기화되지 않는 버그가 구조적으로 불가능하길 원한다.
10. 개발자로서, KakaoMap 컴포넌트가 지도 DOM 렌더링에만 집중하고 SDK 로드 타이밍 걱정을 훅에 위임할 수 있길 원한다.

---

## Implementation Decisions

### 모듈 1: `src/lib/cafeFilters.ts` (신규)

카페 필터링의 단일 진실 소스. 순수 함수만 포함해 서버·클라이언트 양쪽에서 import 가능하다.

- `matchesFilters(cafe, filters)` — roastLevel·beanOrigin·brewMethod 3가지 필터 술어. `FilterState` 타입을 파라미터로 받는다.
- `matchesSearch(cafe, query)` — 카페 이름·주소에 대한 대소문자 무시 부분 일치 검색. 현재 MapView 인라인 로직을 추출.
- `matchesCategory(cafe, category)` — quickCategory 문자열 일치. 현재 MapView 인라인 로직을 추출.

API 라우트는 `matchesFilters`만 사용하고, MapView는 세 함수를 조합해 사용한다.

`FilterState` 타입은 기존 타입을 재사용한다. 새로 정의하지 않는다.

### 모듈 2: `src/lib/cafeThumb.ts` (수정)

기존 `cafeNameToHue(name)` 함수는 카페 이름 기반이다. CafeListItem은 cafe.id 기반으로 다른 알고리즘을 사용한다. 통일 방향:

- `cafeHue(cafeId: string): number` 함수를 추가한다. 알고리즘은 기존 `cafeNameToHue`의 롤링 해시(`×31 >>> 0 % 360`)를 그대로 사용하되 입력을 `cafeId`로 변경한다.
- `cafeNameToHue`는 다른 곳에서 사용 중이면 유지하고, 미사용이면 제거한다.
- CafeListItem의 인라인 해시를 제거하고 `cafeHue(cafe.id)`를 import해 사용한다.

### 모듈 3: `src/hooks/useKakaoMap.ts` (신규)

Kakao Maps SDK 초기화 흐름을 캡슐화하는 훅.

- 시그니처: `useKakaoMap(containerRef: RefObject<HTMLDivElement | null>): kakao.maps.Map | null`
- 내부 동작:
  1. `window.kakao?.maps`가 이미 로드됐으면 즉시 `kakao.maps.load()` 호출.
  2. 아직 미로드면 `'kakaoMapReady'` 이벤트를 `{ once: true }`로 리스닝 후 콜백에서 초기화.
  3. 초기화 완료 시 지도 인스턴스를 state에 저장하고 반환.
- 이벤트 이름 `'kakaoMapReady'`는 훅 파일 내부 상수로만 존재한다. 외부에 노출하지 않는다.
- KakaoMap 컴포넌트는 직접 `useEffect`로 이벤트를 리스닝하는 대신 이 훅을 호출해 지도 인스턴스를 받는다.
- 지도 생성 옵션(center, level)은 훅 파라미터로 받을지 KakaoMap 내부에서 지도 인스턴스 수신 후 설정할지 구현 시 판단한다. 현재 KakaoMap의 초기화 로직에 이벤트 리스너(click, dragend, zoom_changed) 등록이 포함되어 있으므로, 훅은 지도 인스턴스 제공에만 집중하고 이벤트 등록은 KakaoMap에 남긴다.

---

## Testing Decisions

**좋은 테스트의 기준:** 구현 세부사항(함수 내부 분기, 변수명)이 아닌 외부 관찰 가능한 동작만 검증한다. 입력과 출력의 관계를 테스트한다.

### 테스트 대상

**`src/lib/cafeFilters.ts`** — 이 프로젝트에서 가장 테스트하기 쉬운 순수 함수 모듈이다.
- `matchesFilters`: roastLevel 필터 매칭·미매칭, null 필터 시 전체 통과, 복합 필터 AND 조건
- `matchesSearch`: 대소문자 무시 부분 일치, 빈 쿼리 시 전체 통과
- `matchesCategory`: 카테고리 일치·불일치, null 시 전체 통과

**`src/lib/cafeThumb.ts`** — 순수 함수. 동일한 cafeId가 항상 동일한 hue를 반환하는지, 결과가 0–359 범위인지 검증.

**`src/hooks/useKakaoMap.ts`** — DOM과 window 이벤트에 의존하므로 단위 테스트보다 수동 QA가 현실적이다. 테스트 작성 대상에서 제외.

**선례:** `src/lib/env.test.ts`, `src/hooks/useLocationState.test.ts` 패턴을 따른다.

---

## Out of Scope

- FilterState 타입 변경 또는 새 필터 조건 추가
- KakaoMapScript 컴포넌트 제거 또는 스크립트 로드 방식 변경
- 카페 썸네일 색상 팔레트 자체 변경
- useKakaoMap 훅을 이용한 지도 인스턴스 기반 기능 추가
- MapView 컴포넌트의 그 외 리팩토링
- `/beans`, `/cbti`, 다른 페이지 영향 범위

---

## Further Notes

- `cafeFilters.ts`는 `'server-only'` import가 필요 없다 — 클라이언트에서도 사용하기 때문. 서버/클라이언트 공용 유틸 위치(`src/lib/`)에 두는 것이 맞다.
- `useKakaoMap` 훅 도입 후 KakaoMap 컴포넌트의 초기화 useEffect가 단순화된다. 단, KakaoMap 내부 상태(mapRef, 이벤트 핸들러)가 많으므로 훅 추출 범위는 "SDK 로드 대기 + 지도 인스턴스 생성"에만 한정하고 나머지는 KakaoMap에 남긴다.
- 3개 작업은 서로 독립적이므로 병렬로 진행할 수 있다.
