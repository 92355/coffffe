# 작업 계획 — 마커 클릭 BottomSheet 상세 정보 + 길찾기 버튼

> 마지막 갱신: 2026-05-22
> 이전 계획(어드민 리팩터링)은 coffffe-archive.md 참조

---

## 1. 요구사항 요약

마커 클릭 시 열리는 BottomSheet(+Sidebar) 카드에:
- 네이버지도 / 카카오맵 / 구글맵 길찾기 바로가기 추가
- 전화번호, 인스타그램 링크 추가 (데이터 있을 때만)

---

## 2. 결정된 사항

| 항목 | 결정 |
|---|---|
| 목적지 방식 | 좌표 기반 (`cafe.lat` / `cafe.lng`) |
| 버튼 위치 | "자세히 보기" 위 별도 행 |
| 추가 정보 | 전화번호 + 인스타그램 (조건부) |
| 버튼 스타일 | 이니셜 뱃지 아이콘만 (N/K/G) |
| 브랜드 색 | 네이버 #03C75A(초록), 카카오 #FEE500(노랑/검정 텍스트), 구글 #4285F4(파랑) |
| 적용 범위 | BottomSheet + Sidebar 둘 다 (`CafePreviewCard` 수정으로 자동 적용) |
| 이미지 | BottomSheet에 추가 안 함 — 상세 페이지(/cafes/[id])에서 |

---

## 3. 길찾기 URL 형식

```
네이버: https://map.naver.com/v5/directions/-/-/${cafe.lng},${cafe.lat},${encodedName}/transit
카카오: https://map.kakao.com/link/to/${encodedName},${cafe.lat},${cafe.lng}
구글:   https://www.google.com/maps/dir/?api=1&destination=${cafe.lat},${cafe.lng}
```

---

## 4. 수정 파일

| 파일 | 변경 내용 |
|---|---|
| `src/components/CafePreviewCard.tsx` | 길찾기 행 + 전화/인스타 추가 |

---

## 5. 구현 상세

### CafePreviewCard 변경

현재 하단 구조:
```
[점수 ●●●●○]              [자세히 보기]
```

변경 후:
```
[전화 아이콘] [인스타 아이콘]    (phone/instagram 있을 때만)
[N] [K] [G]                     (길찾기 뱃지 3개)
[점수 ●●●●○]              [자세히 보기]
```

### 길찾기 뱃지 스타일
- 원형 또는 pill 버튼
- 텍스트: "N" / "K" / "G" (폰트 bold)
- 배경: 브랜드 색
- `target="_blank" rel="noopener noreferrer"`

### 전화 / 인스타
- Phone: `<a href="tel:${cafe.phone}">` + Phone 아이콘 (lucide)
- Instagram: `<a href="https://instagram.com/${cafe.instagramHandle}" target="_blank">` + Instagram 아이콘 (lucide)
- 둘 다 없으면 해당 행 렌더 안 함

---

## 6. 작업 순서

- [ ] `CafePreviewCard.tsx` 수정
  - phone/instagramHandle 조건부 행 추가
  - 길찾기 뱃지 행 추가 (항상 표시, lat/lng 항상 존재)
  - "자세히 보기" 행 유지

---

## 7. 성공 기준

- BottomSheet에서 마커 클릭 후 N/K/G 뱃지 탭 → 각 지도 앱 길찾기 열림
- Sidebar(데스크탑)에서도 동일하게 작동
- phone 없는 카페: 전화 아이콘 미표시
- instagramHandle 없는 카페: 인스타 아이콘 미표시
- `npx tsc --noEmit` 통과

---

## 8. 수정하지 않을 범위

- `BottomSheet.tsx` — 변경 없음 (CafePreviewCard만 수정)
- `MapView.tsx` — 변경 없음
- `/cafes/[id]` 상세 페이지 — 변경 없음
- 기존 필터/검색 로직
