# 배포 체크리스트

배포 전에는 아래 항목을 확인한다.

## 1. 기본 검증

```bash
git status --short
npx tsc --noEmit
npm run lint
npm run build
```

- 실패한 명령이 있으면 배포하지 않는다.
- 실패 로그를 요약하고 원인 수정 후 다시 실행한다.
- `npm run build` 통과만으로 실제 기능 검증이 끝난 것으로 보지 않는다.

## 2. Git 상태

- 의도하지 않은 파일이 포함되지 않았는지 확인한다.
- `.env`, `.env.local`, secret, key 파일은 절대 커밋하지 않는다.
- `node_modules`, `.next`, `.vercel`, 로그 파일은 커밋하지 않는다.
- `.claude/worktrees`, 생성된 빌드 산출물이 포함되지 않았는지 확인한다.
- 배포 전 커밋 단위를 작게 유지한다.

## 3. 환경 변수 / Secret

- 브라우저에 노출되어도 되는 값만 `NEXT_PUBLIC_` prefix를 사용한다.
- 서버 전용 키는 Client Component에서 사용하지 않는다.
- 아래 값은 출력하지 않는다.

```txt
KAKAO_REST_API_KEY
KAKAO_JAVASCRIPT_KEY
NEXT_PUBLIC_KAKAO_MAP_KEY
OPENAI_API_KEY
SUPABASE_SERVICE_ROLE_KEY
```

- 코드에서 secret이 노출되지 않았는지 확인한다.

```bash
git grep "SERVICE_ROLE"
git grep "OPENAI_API_KEY"
git grep "sk-"
```

## 4. 데이터 / 도메인

- `cafes.json` 변경 시 `Cafe` 타입과 실제 필드가 맞는지 확인한다.
- `beans.ts` 변경 시 원산지, 로스팅, 향미 필터가 깨지지 않는지 확인한다.
- 카페 `id` 변경은 `/cafes/[id]` 링크 영향도를 확인한다.
- 좌표 변경은 `/map`에서 마커 위치를 확인한다.
- 정적 데이터 추가 시 중복 id를 만들지 않는다.

## 5. 수동 QA

최소 아래 경로는 직접 확인한다.

```txt
/
/map
/cafes/[id]
/beans
/cbti
```

확인 항목:

- 새로고침 후 현재 라우트가 유지되는지
- 홈 카드 이동이 정상인지
- 지도 로딩과 마커 선택이 정상인지
- 지도 필터가 정상인지
- 카페 상세 링크가 정상인지
- 원두 필터 / 검색이 정상인지
- CBTI 테스트 진행, 뒤로가기, 결과, 재시작이 정상인지
- 다크 / 라이트 모드가 정상인지
- 모바일 375px 기준으로 overflow가 없는지

## 6. 외부 API / 비용 제한

외부 API 또는 AI Route Handler를 추가할 때는 다음을 지킨다.

- API 호출은 필요한 경우에만 서버에서 수행한다.
- 입력 길이 제한을 둔다.
- 실패 시 사용자에게 안전한 에러 메시지를 반환한다.
- 외부 API 장애 시 fallback UI를 제공한다.
- 클라이언트에 secret을 노출하지 않는다.

## 7. 배포 환경

Vercel 배포 시 확인한다.

- Production / Preview / Development 환경 변수를 구분한다.
- Kakao Developers 도메인 등록 상태를 확인한다.
- Preview 배포에서 먼저 수동 QA를 수행한다.
- Production 배포 후 핵심 라우트와 지도 로딩을 다시 확인한다.

## 8. 롤백 기준

아래 문제가 있으면 즉시 롤백하거나 배포를 중단한다.

- 주요 라우트 런타임 에러 발생
- 지도 로딩 불가
- 카페 상세 접근 불가
- 데이터 생성물 또는 secret이 커밋에 포함됨
- 모바일에서 핵심 기능 사용 불가

배포는 “일단 올리기”보다 “문제 발생 시 되돌릴 수 있게 올리기”를 우선한다.
