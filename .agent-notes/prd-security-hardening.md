# PRD: 보안 개선 — 관리자 인증·세션·공개 API 남용 방지

## Problem Statement

현재 coFFFFFe-map은 개인/소규모 서비스로 운영되지만, 배포 URL이 공개되어 있어 공격자가 직접 API와 관리자 경로를 탐색할 수 있다.

코드 점검 결과, 가장 위험한 정보는 서버 환경 변수와 관리자 권한이다. 특히 관리자 인증은 단일 공유 비밀번호 기반이고, 관리자 세션 쿠키에 비밀번호 값이 그대로 들어간다. 사용자 세션 서명 키도 별도 설정이 없으면 관리자 비밀값을 fallback으로 사용한다. 이 구조에서는 `ADMIN_SECRET` 하나가 노출되었을 때 관리자 API 접근과 사용자 세션 위조 위험이 함께 커진다.

또한 공개 쓰기 API와 Kakao API 프록시는 rate limit이 없어 스팸 작성, DB 저장소 소모, 외부 API 쿼터 소진의 대상이 될 수 있다. 익명 리뷰 수정/삭제 권한은 클라이언트가 보내는 `x-anonymous-id`에 의존하므로, 익명 사용자의 작성자 권한을 강하게 보장하기 어렵다.

## Solution

보안 개선의 목표는 "서비스를 크게 갈아엎지 않고, 현재 구조에서 실제 위험도가 높은 경로를 먼저 줄이는 것"이다.

1. 관리자 인증을 원문 비밀번호 쿠키 방식에서 서명된 관리자 세션 방식으로 변경한다.
2. 사용자 세션 서명 키를 관리자 비밀값과 분리하고, fallback을 제거한다.
3. 공개 POST API와 외부 API 프록시에 최소한의 rate limit을 추가한다.
4. Supabase RLS와 정책 적용 상태를 점검하고, 필요한 마이그레이션을 추가한다.
5. 익명 작성물 수정/삭제 권한을 `anonymousId` 단독 의존에서 작성 시 발급되는 소유 토큰 방식으로 보강한다.
6. 업로드 API의 MIME/type 검증을 강화하고, 관리자 전용 경로의 응답 캐시와 에러 노출을 정리한다.

## User Stories

1. As a 서비스 운영자, I want to 관리자 비밀번호가 쿠키에 원문으로 저장되지 않기, so that 쿠키가 노출되어도 관리자 비밀번호 자체가 유출되지 않는다.
2. As a 서비스 운영자, I want to 관리자 세션이 서명된 토큰으로 검증되기, so that 사용자가 임의로 관리자 쿠키를 만들 수 없다.
3. As a 서비스 운영자, I want to 관리자 세션에 만료 시간이 포함되기, so that 오래된 세션이 계속 재사용되지 않는다.
4. As a 서비스 운영자, I want to 관리자 로그인 실패가 과도하게 반복되면 제한되기, so that 비밀번호 대입 공격이 어려워진다.
5. As a 서비스 운영자, I want to 관리자 API가 쿠키 세션 기준으로만 보호되거나 명확한 내부 토큰 기준으로 분리되기, so that `Authorization: Bearer`로 공유 비밀번호를 재사용하는 위험을 줄인다.
6. As a 서비스 운영자, I want to 관리자 인증 실패 응답이 상세 정보를 노출하지 않기, so that 공격자가 설정 여부와 인증 방식을 추론하기 어렵다.
7. As a 서비스 운영자, I want to `KAKAO_SESSION_SECRET`이 필수 환경 변수로 검증되기, so that 사용자 세션과 관리자 비밀값이 결합되지 않는다.
8. As a 서비스 운영자, I want to 사용자 세션 서명 키가 관리자 비밀번호와 다르기, so that 하나의 비밀값 노출이 전체 권한 상승으로 이어지지 않는다.
9. As a 로그인 사용자, I want to 내 세션이 서버에서 안전하게 검증되기, so that 다른 사용자가 내 계정으로 가장하기 어렵다.
10. As a 로그인 사용자, I want to 로그아웃 시 세션 쿠키가 명확히 만료되기, so that 공용 기기에서 세션이 남지 않는다.
11. As a 서비스 운영자, I want to 공개 신고 API가 짧은 시간에 반복 호출되지 않기, so that DB에 스팸 신고가 쌓이지 않는다.
12. As a 서비스 운영자, I want to 리뷰 작성 API가 IP와 사용자 식별자 기준으로 제한되기, so that localStorage 조작으로 도배하기 어렵다.
13. As a 서비스 운영자, I want to 반응/방문/조회 API가 과도한 반복 호출을 제한하기, so that 카운트 데이터가 쉽게 오염되지 않는다.
14. As a 서비스 운영자, I want to Kakao 검색 API 프록시가 호출량 제한을 가지기, so that 공격자가 Kakao API 쿼터를 소진시키기 어렵다.
15. As a 서비스 운영자, I want to Kakao 역지오코딩 API도 호출량 제한을 가지기, so that 위치 API가 남용되지 않는다.
16. As a 서비스 운영자, I want to 공개 API의 입력 길이와 배열 크기가 일관되게 제한되기, so that 큰 payload로 서버 비용을 늘리기 어렵다.
17. As a 사용자, I want to 정상적인 리뷰/신고/검색 사용은 막히지 않기, so that 보안 개선 후에도 서비스 사용성이 유지된다.
18. As a 익명 사용자, I want to 내가 작성한 한줄평만 수정/삭제할 수 있기, so that 다른 사람이 내 글을 조작하기 어렵다.
19. As a 익명 사용자, I want to 작성 권한 증명이 브라우저에 안전하게 저장되기, so that 페이지 새로고침 후에도 내 글을 관리할 수 있다.
20. As a 서비스 운영자, I want to 익명 작성물 소유 토큰이 DB에는 해시 형태로 저장되기, so that DB 일부가 노출되어도 토큰 원문이 바로 악용되지 않는다.
21. As a 서비스 운영자, I want to Supabase 테이블별 RLS 상태를 확인하기, so that `anon` 키만으로 민감 데이터가 읽히지 않는다.
22. As a 서비스 운영자, I want to 공개 읽기 데이터와 관리자/회원 데이터의 정책을 분리하기, so that 카페/원두 정보는 공개하되 회원 정보는 보호된다.
23. As a 서비스 운영자, I want to `users`, `favorite_cafes`, `user_cbti_profiles`, `reports`, `cafe_reviews`의 접근 정책을 명확히 하기, so that 실수로 개인정보성 데이터가 공개되지 않는다.
24. As a 서비스 운영자, I want to Supabase service role key가 서버 전용 코드에서만 사용되기, so that 클라이언트 번들에 노출되지 않는다.
25. As a 서비스 운영자, I want to 클라이언트에 노출되는 환경 변수와 서버 전용 환경 변수를 구분하기, so that API key 노출 범위를 이해하고 관리할 수 있다.
26. As a 서비스 운영자, I want to 이미지 업로드 API가 실제 파일 타입과 크기를 검증하기, so that 잘못된 파일이 public storage에 올라가지 않는다.
27. As a 서비스 운영자, I want to 업로드 파일명이 예측 가능하거나 충돌하기 쉬운 방식이 아니기, so that 기존 파일 덮어쓰기와 URL 추측 위험이 줄어든다.
28. As a 서비스 운영자, I want to 관리자 회원 아바타 업로드도 허용 MIME만 받기, so that 이미지가 아닌 파일 업로드 위험이 줄어든다.
29. As a 서비스 운영자, I want to 관리자 API 응답에 `no-store`가 적용되기, so that 민감 목록이 캐시에 남지 않는다.
30. As a 서비스 운영자, I want to 서버 에러 응답이 내부 DB 오류를 그대로 노출하지 않기, so that 공격자가 테이블 구조와 정책을 추론하기 어렵다.
31. As a 개발자, I want to 보안 관련 로직이 작은 모듈로 분리되기, so that 단위 테스트로 검증할 수 있다.
32. As a 개발자, I want to rate limit 로직이 API 라우트와 분리되기, so that 정책을 쉽게 테스트하고 재사용할 수 있다.
33. As a 개발자, I want to 세션 토큰 생성/검증 로직이 독립적으로 테스트되기, so that 인증 변경으로 회귀가 생기지 않는다.
34. As a 개발자, I want to RLS 점검 결과가 문서화되기, so that 배포 전 확인 항목으로 남길 수 있다.
35. As a 서비스 운영자, I want to 배포 전 보안 체크리스트가 업데이트되기, so that 같은 위험을 반복해서 놓치지 않는다.

## Implementation Decisions

- 관리자 세션은 원문 `ADMIN_SECRET` 값을 쿠키에 넣지 않는다.
- 관리자 로그인 성공 시 별도 서명 토큰을 발급하고, 토큰 payload에는 만료 시간과 용도 값을 포함한다.
- 관리자 세션 서명 키는 `ADMIN_SECRET` 자체를 직접 저장하지 않고 HMAC 서명에만 사용한다.
- 사용자 세션 서명 키는 `KAKAO_SESSION_SECRET`을 필수로 사용한다.
- `KAKAO_SESSION_SECRET`이 없을 때 `ADMIN_SECRET`으로 fallback하는 동작은 제거한다.
- 관리자 API 인증은 기존 `isAuthorizedAdminRequest` 호출부를 유지하되, 내부 구현을 서명 세션 검증 방식으로 변경한다.
- 공유 Bearer 토큰 인증은 제거하거나, 필요한 경우 별도 서버 내부용 환경 변수로 분리한다. 일반 관리자 브라우저 세션과 같은 비밀값을 쓰지 않는다.
- 로그인 실패 rate limit은 IP와 시도 대상 기준으로 적용한다.
- 공개 쓰기 API rate limit은 IP, 로그인 사용자 ID, 익명 ID를 함께 고려한다.
- rate limit 저장소는 현재 프로젝트 규모에서는 DB 기반 또는 메모리 기반 중 하나로 시작할 수 있다. Vercel 서버리스 환경에서는 메모리 기반이 인스턴스 간 일관성을 보장하지 않으므로, 운영 정확도가 필요한 경로는 DB 기반을 우선한다.
- Kakao API 프록시는 `query`, `lat`, `lng` 검증을 유지하면서 호출량 제한을 추가한다.
- 익명 리뷰 작성 시 서버가 소유 토큰을 발급한다.
- 익명 리뷰 수정/삭제 시 `anonymousId`와 소유 토큰을 함께 검증한다.
- DB에는 소유 토큰 원문을 저장하지 않고 해시만 저장한다.
- 기존 익명 리뷰는 소유 토큰이 없으므로, 마이그레이션 후 기존 글의 수정/삭제 정책은 제한적으로 유지하거나 읽기 전용 처리한다.
- Supabase RLS는 테이블별로 공개 읽기, 로그인 사용자 본인 데이터, 관리자 서버 접근을 분리해 점검한다.
- service role key는 계속 서버 전용 클라이언트에서만 사용한다.
- 공개 이미지 버킷은 읽기 공개를 유지하되, 쓰기는 서버 관리자 API를 통해서만 가능하도록 정책을 확인한다.
- 관리자 API와 회원 목록, 신고 목록, 리뷰 관리 응답은 `Cache-Control: no-store`를 적용한다.
- 클라이언트에 표시할 에러 메시지와 서버 로그 메시지를 분리한다.
- `.gitignore`에 남아 있는 conflict marker는 보안 작업 전 별도 정리 대상으로 둔다.

## Testing Decisions

- 테스트는 내부 구현 세부보다 외부 행동을 검증한다.
- 세션 테스트는 "올바른 토큰은 통과, 변조된 payload/signature는 거부, 만료된 토큰은 거부"를 검증한다.
- 관리자 인증 테스트는 "비로그인 요청은 401, 유효 세션 요청은 통과, 원문 비밀번호 쿠키는 통과하지 않음"을 검증한다.
- 사용자 세션 테스트는 `KAKAO_SESSION_SECRET`이 없으면 명확히 실패하는지 검증한다.
- rate limit 테스트는 같은 IP/익명 ID의 반복 호출이 제한되고, 윈도우가 지나면 다시 허용되는지 검증한다.
- 익명 리뷰 소유권 테스트는 토큰 없는 수정/삭제, 다른 토큰 수정/삭제, 올바른 토큰 수정/삭제를 검증한다.
- Kakao 프록시 테스트는 짧은 query, 잘못된 좌표, 제한 초과 요청의 응답을 검증한다.
- 업로드 API 테스트는 허용 MIME, 비허용 MIME, 크기 초과를 검증한다.
- 기존 테스트 선례는 `src/lib/*test.ts`, `src/hooks/*test.ts`의 순수 함수 테스트 스타일을 따른다.
- API route 통합 테스트가 없다면 우선 인증/세션/rate limit 같은 순수 모듈을 단위 테스트하고, 라우트 테스트는 최소 범위로 추가한다.

## Out of Scope

- OAuth 제공자를 Kakao 외 다른 제공자로 확장하는 작업
- 완전한 WAF, 봇 탐지, CAPTCHA 도입
- 관리자 계정 다중화와 역할 기반 권한 관리
- Supabase Auth로 전체 인증 체계를 이전하는 작업
- 모든 API를 로그인 필수로 변경하는 작업
- 기존 UI/UX 전면 개편
- 대규모 DB 스키마 재설계
- 보안 전문 침투 테스트 수행

## Further Notes

- 이번 PRD의 1순위는 `ADMIN_SECRET` 원문 쿠키 제거와 세션 비밀값 분리다.
- 2순위는 공개 POST/API 프록시 rate limit이다.
- 3순위는 Supabase RLS 실제 적용 상태 확인이다.
- 이슈 트래커 게시와 `ready-for-agent` 라벨 적용은 현재 제공된 정보만으로는 알 수 없음. 로컬 문서로 먼저 작성했다.
- 이후 `to-issues` skill로 독립 구현 가능한 이슈로 나누는 것이 좋다.
