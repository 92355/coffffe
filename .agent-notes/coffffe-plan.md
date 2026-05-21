# 작업 계획 — /map UI 전면 개선 + Framer Motion + 커피향 파티클

> 마지막 갱신: 2026-05-21

---

## 1. 요구사항 요약

- 데스크톱 좌측 사이드바 복원 (접기/펼치기 360px ↔ 60px)
- 새 디자인 시스템 적용 (사용자 정의 CSS 변수 + 글래스모피즘)
- 사이드바 헤더 구조 변경 (로고+검색 1행, Map/CBTI 탭 제거)
- Framer Motion: 카드 stagger + 필터 패널 height + BottomSheet 슬라이드
- 커피향 파티클 강화 (S자 곡선 연기)
- 다크모드는 이번 범위 제외 — 라이트모드만

---

## 2. 결정된 사항

| 항목 | 결정 |
|---|---|
| 레이아웃 | 좌측 고정 사이드바 (카카오/네이버/구글 동일 패턴) |
| 사이드바 비주얼 | 글래스모피즘 배경 (기존 흰 카드에서 탈피) |
| 사이드바 헤더 | 로고+검색 1행, 탭 제거, 카테고리→필터→리스트 |
| 사이드바 너비 | 360px ↔ 60px 접기/펼치기 (Framer Motion width 애니메이션) |
| 글래스 적용 범위 | 사이드바 + 모바일 탑바 + 필터 드롭다운 전부 |
| Framer Motion | 카드 stagger + 필터 패널 AnimatePresence + BottomSheet spring |
| 커피향 파티클 | S자 곡선 oscillation 강화 |
| 다크모드 | 범위 제외 |

---

## 3. 새 CSS 변수 (사용자 정의)

```css
:root {
  --bg: #F6F3EC;
  --surface: #FFFFFF;

  --primary: #151412;
  --brown: #6B432A;
  --accent: #8FAE5A;
  --sub: #C08A5A;

  --text: #1F1D1A;
  --muted: #746A60;
  --border: #E5DCCE;

  --brown-soft: #F0E5DA;
  --accent-soft: #EEF5DF;
  --sub-soft: #F5E7D8;
  --primary-soft: #E9E7E3;
}
```

글래스 유틸 클래스 2종:
- `.glass-panel` — 사이드바 패널 (bg rgba(246,243,236,0.88) + blur(18px))
- `.glass-bar` — 모바일 탑바 + 필터 드롭다운 (bg rgba(255,255,255,0.82) + blur(14px))

---

## 4. 수정 예상 파일

| 파일 | 변경 규모 |
|---|---|
| `src/app/globals.css` | CSS 변수 교체 + glass 유틸 추가 + aroma-puff 강화 |
| `src/components/Sidebar.tsx` | 대규모 — 헤더 구조 + 글래스 + FM stagger + 접기 |
| `src/components/MapView.tsx` | 중간 — sidebarCollapsed 상태 + 필터 패널 FM + 색상 |
| `src/components/BottomSheet.tsx` | 소규모 — CSS transition → FM AnimatePresence + spring |

---

## 5. 작업 순서

### Step 1 — globals.css
- [ ] `:root` 변수 교체
- [ ] `.glass-panel`, `.glass-bar` 유틸 클래스 추가
- [ ] `aroma-puff` S자 곡선 강화 (translateX oscillation 추가, 형태 elongated로)
  - verify: /map 열어 마커 파티클 확인

### Step 2 — BottomSheet.tsx
- [ ] CSS `transition-transform` 제거
- [ ] `AnimatePresence` + `motion.div` spring 슬라이드 (damping 28, stiffness 280)
  - verify: 카페 마커 클릭 → spring 슬라이드

### Step 3 — MapView.tsx
- [ ] `sidebarCollapsed` state 추가
- [ ] Sidebar에 `collapsed` + `onCollapsedChange` prop 전달
- [ ] 필터 패널 `AnimatePresence` + height 0→auto 애니메이션
- [ ] 새 CSS 변수로 탑바·버튼 색상 업데이트
  - verify: 필터 패널 height 애니메이션

### Step 4 — Sidebar.tsx
- [ ] `collapsed`, `onCollapsedChange` prop 추가
- [ ] 데스크톱: `motion.div` width `360 ↔ 60` 애니메이션
- [ ] 접힌 상태: 로고 아이콘 + 펼치기 버튼만
- [ ] 헤더: 로고+검색 1행, Map/CBTI 탭 제거
- [ ] `.glass-panel` 배경 적용
- [ ] 카드 리스트 stagger (staggerChildren 0.04, hidden→show variants)
  - key: `cafes.map(c=>c.id).join(',')` → 필터 변경 시 재애니메이션
  - verify: 필터 바꿀 때 카드 순차 등장

---

## 6. 성공 기준

- `/map` 데스크톱: 360px 글래스 사이드바, 접기 → 60px 축소
- `/map` 모바일: 탑바 glass 효과, 목록 바텀시트 spring
- 필터 패널: height 애니메이션
- 카드 리스트: 필터 변경 시 stagger 진입
- 마커 커피향: S자 흔들리며 올라감
- `npx tsc --noEmit` 통과
- `npm run build` 통과

---

## 7. 수정하지 않을 범위

- `CafeListItem.tsx` — 카드 내부 구조 없음 (Sidebar에서 motion.div로 감쌈)
- `FilterBar.tsx` — 내부 변경 없음
- `KakaoMap.tsx` — JS 변경 없음 (CSS만)
- 다크모드 변수
- `/home`, `/beans`, `/cbti` 등 다른 페이지
