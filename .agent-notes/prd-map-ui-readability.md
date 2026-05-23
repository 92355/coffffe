# PRD: Map UI 가독성 개선 — 불투명도·폰트·대비

## Problem Statement

지도 화면(Map UI)의 오버레이 요소들이 과도하게 반투명하여 배경 지도와 구분이 어렵고, 텍스트 대비가 낮아 가독성이 떨어진다. 특히 모바일 환경에서 상단 검색바, 필터 패널, 줌 버튼, 바텀시트 등이 지도 위에 떠 있을 때 내용을 읽기 힘들다. 또한 현재 고딕 폰트(Noto Sans KR)는 스페셜티 카페 큐레이션 서비스의 감성에 비해 개성이 부족하다.

## Solution

지도 페이지의 모든 글래스 오버레이 요소의 배경 불투명도를 68% → 92~95%로 상향하고, 한글 명조 계열 무료 폰트(Nanum Myeongjo)를 지도 페이지에 적용하며, 연한 텍스트의 명도 대비를 개선하여 전반적인 가독성을 높인다.

## User Stories

1. 사용자로서, 지도 위 상단 검색바가 충분히 불투명하여 검색어를 쉽게 읽을 수 있기를 원한다.
2. 사용자로서, 필터 패널이 열렸을 때 배경 지도에 묻히지 않고 명확하게 구분되기를 원한다.
3. 사용자로서, 줌·레이어·위치 버튼이 지도 위에서 뚜렷이 보여 빠르게 탭할 수 있기를 원한다.
4. 모바일 사용자로서, 바텀시트(카페 카드)가 불투명하게 표시되어 카페 정보를 햇빛 아래서도 읽을 수 있기를 원한다.
5. 사용자로서, "이 지역 검색" 버튼이 배경 지도와 분리되어 존재감이 뚜렷하기를 원한다.
6. 사용자로서, 프로필 드롭다운 메뉴가 불투명하게 표시되어 내 정보를 읽기 편하기를 원한다.
7. 사용자로서, 지도 페이지의 폰트가 명조체로 바뀌어 스페셜티 커피 큐레이션 서비스다운 감성을 느낄 수 있기를 원한다.
8. 사용자로서, placeholder 텍스트와 보조 텍스트가 충분히 진하여 내용을 놓치지 않기를 원한다.
9. 사용자로서, 다크 모드에서도 낮은 투명도(`white/52`, `white/58`)의 텍스트가 읽기 어렵지 않기를 원한다.
10. 사용자로서, 카페 발견 배지(BreadBadge)가 충분히 불투명하여 카페 수가 잘 보이기를 원한다.

## Implementation Decisions

### 1. 불투명도 상향 전략

- `MapView.tsx` 내 inline style의 `color-mix(in srgb, var(--background) 68%, ...)` 패턴을 `92~95%`로 일괄 상향
- `globals.css`의 `.glass-map-bar`, `.glass-map-btn`, `.glass-map-sheet` 클래스에 불투명 배경 fallback 추가
- `glass-panel`(현 88%), `glass-bar`(현 82%)도 map 컨텍스트에서는 92% 이상으로 맞춤
- 모바일 backdrop-filter blur 값은 유지 (GPU 비용 규칙 기존 주석 보존)

### 2. 폰트 교체 (지도 페이지 한정)

- `layout.tsx`에서 `Nanum_Myeongjo` Google Fonts 로드 추가 (CSS variable로 노출)
- 전체 앱 기본 폰트는 Noto Sans KR 유지
- `map/page.tsx` 또는 `MapView.tsx` 루트 div에 `font-[var(--font-nanum-myeongjo)]` 클래스 적용하여 스코프 한정
- `globals.css` `@theme` 블록은 건드리지 않음

### 3. 텍스트 대비 개선 (contrast only)

- 대상: `white/52` → `white/72`, `white/58` → `white/78`, `white/62` → `white/80`
- placeholder 색 `#b8aa9b` → `#7a6a5e` 수준으로 진하게
- 보조 텍스트 `#8a6042` 계열 → `#6b4c2a` 수준으로 진하게
- 굵기(`font-black` vs `font-semibold`) 조정은 Out of Scope

### 4. 수정 대상 파일

- `src/app/layout.tsx` — 폰트 로드
- `src/app/globals.css` — glass-map-* 배경값
- `src/components/MapView.tsx` — inline style + 텍스트 대비
- `src/components/BottomSheet.tsx` — 대비 확인 후 필요 시
- `src/components/Sidebar.tsx` — 대비 확인 후 필요 시

## Testing Decisions

- 자동화 테스트 대상 없음 (순수 시각적 변경)
- 검증 기준:
  - `npx tsc --noEmit` 통과
  - `npm run lint` 통과
  - `npm run build` 통과
  - 개발 서버(`npm run dev`)에서 지도 페이지 직접 확인
    - 라이트/다크 모드 각각 확인
    - 모바일 뷰포트(375px) 확인
    - 검색바, 필터 패널, 줌 버튼, 바텀시트 가시성 확인

## Out of Scope

- 홈, 카페 상세, 빈스, CBTI 등 지도 외 페이지 변경
- `font-black` 남용 정리 등 폰트 굵기 계층 재설계
- 다크 모드 팔레트 전면 업데이트
- 반응형 레이아웃 구조 변경
- 새 컴포넌트 추가

## Further Notes

- Nanum Myeongjo는 Google Fonts에서 무료 제공 (`weight: ['400', '700']`)
- 불투명도 92~95% 적용 시 `backdrop-filter blur` 효과가 시각적으로 덜 드러남 — 이는 의도된 결과
- 추후 전체 앱 폰트 교체 여부는 별도 PRD로 결정
