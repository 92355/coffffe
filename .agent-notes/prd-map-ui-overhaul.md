# PRD: /map UI 전면 개선 — 글래스 디자인 시스템 + Framer Motion + 커피향 파티클

## Problem Statement

현재 `/map` 화면은 다음 문제를 갖고 있다.

1. **데스크톱 사용성 저하** — 최근 사이드바를 제거하고 탑바+바텀시트 구조로 전환했는데, 카페 목록을 보려면 매번 "목록 보기" 버튼을 눌러야 한다. 카카오지도·네이버지도·구글지도가 모두 사용하는 좌측 패널 패턴이 사용성 면에서 검증됐다.

2. **레퍼런스 사이트와 비슷한 비주얼** — 기존 흰 패널 + 둥근 카드 구조가 디자인 참고 사이트와 너무 유사하다. 브랜드 차별화가 없다.

3. **색상 시스템 미확립** — 하드코딩된 hex 값들(`#5a2e11`, `#d66612` 등)이 컴포넌트 곳곳에 산재해 일관성이 없고 변경이 어렵다.

4. **애니메이션 부재** — 현재 CSS transition 수준의 애니메이션만 있고, 카드 등장·필터 패널 토글·BottomSheet 진입이 정적으로 느껴진다.

5. **커피향 파티클 존재감 부족** — 마커 위 aroma-puff가 너무 작고 단순한 원형 점이라 육안으로 인지하기 어렵다.

---

## Solution

원두로 브랜드 아이덴티티(스페셜티 커피 큐레이션)에 맞는 독자적인 디자인 시스템을 수립하고, 지도 페이지의 UX를 개선한다.

- **새 CSS 변수 시스템** + 글래스모피즘 유틸 클래스(`glass-panel`, `glass-bar`)를 `globals.css`에 정의해 모든 플로팅 UI에 일관된 반투명 질감을 부여한다.
- **데스크톱 좌측 글래스 사이드바** (360px) + 접기/펼치기(60px 아이콘 바)로 복원한다.
- **사이드바 헤더 간소화** — 로고+검색 1행, Map/CBTI 탭 제거, 카테고리 → 필터 → 카페 목록 순서로 재구성.
- **Framer Motion** 으로 카드 stagger·필터 패널 height·BottomSheet spring을 교체한다.
- **커피향 파티클** 을 S자 곡선 증기 형태로 강화한다.

---

## User Stories

1. 데스크톱 사용자로서, 페이지를 열자마자 지도 왼쪽에 카페 목록이 보이길 원한다. 별도 버튼 없이 바로 탐색할 수 있어서.
2. 데스크톱 사용자로서, 지도를 최대한 넓게 보고 싶을 때 사이드바를 접어 60px 아이콘 바로 축소할 수 있길 원한다.
3. 데스크톱 사용자로서, 접힌 사이드바에서 버튼 하나로 다시 펼칠 수 있길 원한다.
4. 모바일 사용자로서, "목록 보기" 버튼을 눌렀을 때 카페 목록 시트가 자연스러운 spring 애니메이션으로 올라오길 원한다.
5. 모바일 사용자로서, 마커를 탭하면 하단 카드가 튀어오르는 느낌의 애니메이션으로 나타나길 원한다.
6. 사용자로서, 필터 버튼을 눌렀을 때 카테고리·필터 패널이 부드럽게 펼쳐지고 닫히길 원한다.
7. 사용자로서, 검색어나 필터를 바꿀 때 카페 카드 목록이 순차적으로 등장하는 애니메이션을 보며 결과 변화를 인지할 수 있길 원한다.
8. 사용자로서, 사이드바가 지도와 완전히 분리된 불투명 흰 패널이 아니라, 지도가 배경으로 약간 비쳐보이는 글래스 질감이길 원한다.
9. 사용자로서, 브랜드 컬러로 올리브 그린(`#8FAE5A`)이 포인트로 사용되어 다른 커피 지도 사이트와 시각적으로 차별화되길 원한다.
10. 사용자로서, 사이드바에서 Map/CBTI 탭을 볼 필요 없다. 지도 페이지에서 CBTI 링크가 노출되는 게 불필요하다.
11. 사용자로서, 사이드바 헤더에서 로고를 보고 바로 검색창에 접근할 수 있길 원한다. 스크롤 없이.
12. 사용자로서, 카카오 지도 마커 위에서 커피 향이 피어오르는 것 같은 S자 곡선 증기 애니메이션을 보고 싶다.
13. 사용자로서, 선택된 마커의 커피향 파티클이 올리브 그린 색으로 강조되어 선택 상태를 더 명확하게 느끼길 원한다.
14. 사용자로서, 모바일 탑바(로고·검색·필터·프로필)도 글래스 효과로 지도 위에 자연스럽게 떠있길 원한다.
15. 사용자로서, 필터 드롭다운 패널도 글래스 효과로 탑바 아래에 부드럽게 이어지길 원한다.

---

## Implementation Decisions

### 1. CSS 변수 시스템 (globals.css) — 완료
새 팔레트를 `:root`에 정의한다. 기존 컴포넌트와의 하위 호환을 위해 `--background`, `--foreground`, `--card-bg` 등 기존 변수명은 새 변수를 alias로 가리키도록 유지한다.

핵심 변수:
- `--accent: #8FAE5A` (올리브 그린 — 브랜드 차별화 포인트)
- `--brown: #6B432A` (주 브라운)
- `--bg: #F6F3EC`, `--surface: #FFFFFF`, `--border: #E5DCCE`

### 2. 글래스 유틸 클래스 (globals.css) — 완료
- `.glass-panel` — 사이드바 패널. `background: rgba(246,243,236,0.88)`, `backdrop-filter: blur(18px)`
- `.glass-bar` — 모바일 탑바·필터 드롭다운. `background: rgba(255,255,255,0.82)`, `backdrop-filter: blur(14px)`

두 클래스를 Tailwind 인라인 대신 CSS 유틸로 뽑는 이유: `backdrop-filter`와 `-webkit-backdrop-filter`를 쌍으로 관리해야 하고, 사파리 호환성 때문에 단일 지점 수정이 필요하다.

### 3. 커피향 파티클 강화 (globals.css + KakaoMap.tsx DOM) — 완료
기존 원형 4px 점에서 elongated 물방울(width 2–3px, height 7–9px, border-radius 40% 40% 50% 50%)로 변경. `coffeeAromaS` 키프레임에 `translateX` ±2px oscillation을 추가해 S자 곡선 표현. 선택된 마커의 파티클은 `--accent` 올리브 그린으로 강조.

`KakaoMap.tsx`의 `createMarkerContent` DOM 생성 코드는 변경 없음 — CSS 클래스명(`.aroma-puff`, `.aroma-puff--selected`)이 그대로 사용되므로 CSS만 교체로 충분하다.

### 4. BottomSheet — Framer Motion spring으로 교체
현재 `pointer-events-none fixed inset-x-0 bottom-0 z-30`에 CSS `transition-transform duration-300 ease-out`를 사용한다.

이를 `AnimatePresence` + `motion.div`로 교체한다. 이유: CSS transition은 마운트/언마운트 exit 애니메이션이 없다. Framer Motion의 `AnimatePresence`를 쓰면 카드가 스크린 밖으로 사라질 때도 애니메이션이 재생된다.

```
initial:  { y: '100%' }
animate:  { y: 0 }
exit:     { y: '100%' }
transition: { type: 'spring', damping: 28, stiffness: 280 }
```

`cafe` prop을 `AnimatePresence`의 `key`로 사용해 카페 변경 시 재진입 애니메이션을 트리거한다.

### 5. MapView — sidebarCollapsed 상태 + 필터 패널 FM
- `sidebarCollapsed: boolean` state를 `MapView`에 추가한다.
- `Sidebar`에 `collapsed` + `onCollapsedChange` prop으로 전달한다.
- 기존 `filterPanelOpen` 영역의 `{filterPanelOpen && <div>}` 패턴을 `AnimatePresence` + `motion.div`로 교체한다.
  - `initial/exit: { opacity: 0, height: 0 }`, `animate: { opacity: 1, height: 'auto' }`, `overflow: hidden`

### 6. Sidebar — 대규모 재설계
**레이아웃:**
- 데스크톱: `motion.div`로 감싼 고정 패널. `animate={{ width: collapsed ? 60 : 360 }}`, spring 트랜지션.
- 모바일: 기존 바텀시트 동작 유지 (변경 없음).
- 접힌 상태(60px): 로고 아이콘 + 펼치기 버튼만 표시. 목록·검색·필터 숨김.

**헤더 구조 변경:**
- 제거: Map/CBTI 탭 네비게이션 (`<nav>` 블록 전체)
- 변경: 로고 + 인라인 검색 입력을 한 행에 배치
- 유지: 닫기 버튼(모바일), ThemeToggle

**배경:**
- `aside` 클래스에 `.glass-panel` 적용. 기존 `bg-[#fbf8f3]` 제거.

**카드 리스트 stagger:**
```tsx
// 카드 컨테이너에 variants 적용
const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.25 } },
}
// key={cafes.map(c => c.id).join(',')} 로 필터 변경 시 재애니메이션
```

각 `CafeListItem`은 `motion.div`로 감싸되, `CafeListItem` 자체는 수정하지 않는다.

### 7. 다크모드
이번 범위 제외. 기존 `.dark` 블록은 유지하되 신규 변수에 대한 다크 오버라이드는 추후 작업.

### 8. 수정 파일 범위
- `src/app/globals.css` ✅ 완료
- `src/components/BottomSheet.tsx`
- `src/components/MapView.tsx`
- `src/components/Sidebar.tsx`

수정하지 않는 파일: `CafeListItem.tsx`, `FilterBar.tsx`, `KakaoMap.tsx`, `/home`, `/beans`, `/cbti` 관련 파일.

---

## Testing Decisions

이 프로젝트에는 현재 자동화 테스트가 없다. UI 상호작용 중심이므로 수동 QA가 주 검증 방법이다.

**좋은 테스트 기준:**
- 구현 세부사항(클래스명, 애니메이션 duration)이 아닌 사용자 관찰 가능한 동작을 확인한다.
- 필터 변경 후 카드 목록이 업데이트되는지, BottomSheet가 열리고 닫히는지 등.

**자동 검증:**
- `npx tsc --noEmit` — 타입 오류 없음
- `npm run lint` — ESLint 통과 (기존 경고 1건 제외)
- `npm run build` — 빌드 성공

**수동 QA 체크리스트:**
- 데스크톱(≥1280px): 사이드바 글래스 패널 표시, 접기 → 60px 축소, 펼치기 복원
- 모바일(375px): 탑바 glass, "목록 보기" → 바텀시트 spring 슬라이드
- 카페 마커 클릭 → BottomSheet spring 진입 / 지도 배경 클릭 → spring exit
- 필터 토글 → height 애니메이션 (열기/닫기)
- 필터 변경 → 카드 리스트 stagger 재등장
- 마커 위 aroma-puff S자 oscillation 육안 확인
- 선택된 마커 파티클이 올리브 그린으로 변경되는지 확인

---

## Out of Scope

- 다크모드 변수 업데이트 — 별도 작업
- `CafeListItem` 카드 디자인 변경
- `/home`, `/beans`, `/cbti` 등 다른 페이지 시각 변경
- Framer Motion 페이지 전환 애니메이션
- 접힌 사이드바에서 카테고리 아이콘 퀵 접근
- 사이드바 collapse 상태를 localStorage에 영구 저장

---

## Further Notes

- `--accent: #8FAE5A` 올리브 그린이 기존 오렌지 브라운 위주 팔레트에서 가장 눈에 띄는 차별화 포인트다. `/map` 이외의 페이지(`/home`, `/beans`)에서 `var(--accent)`를 사용하는 곳도 자동으로 올리브 그린으로 변경된다 (하위 호환 별칭 덕분).
- Framer Motion `^12.39.0`이 이미 설치되어 있다. 추가 의존성 설치 불필요.
- `KakaoMap.tsx`의 마커 DOM 생성은 React 렌더링 사이클 밖에서 일어나므로 Framer Motion 적용 범위 밖이다. 마커 애니메이션은 CSS로만 처리한다.
- 사이드바의 모바일 바텀시트 동작(backdrop + slide-up 60dvh)은 이번 작업에서 건드리지 않는다.
