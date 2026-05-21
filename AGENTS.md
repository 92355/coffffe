<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# coFFFFFe-map Agent Guide

> 목적: Claude가 계획을 작성하고, Codex가 그 계획을 실행할 때 사용하는 최소 공통 규칙.
> 이 파일은 길게 확장하지 않는다. 상세 상태와 실행 계획은 `.agent-notes/`를 본다.

---

## 1. 문서 역할

| 파일 | 역할 |
|---|---|
| `AGENTS.md` | 고정 작업 규칙. Claude / Codex 공통 기준 |
| `.agent-notes/coffffe-status.md` | 현재 프로젝트 상태. 코드 구조, 도메인, 데이터 구조, 미커밋 현황 |
| `.agent-notes/coffffe-plan.md` | 현재 실행할 단일 계획. Claude가 작성하고 Codex가 실행 |
| `.agent-notes/coffffe-archive.md` | 완료된 계획 / 과거 참고 기록 |

---

## 2. 반드시 먼저 읽을 문서

작업 시작 전 아래 순서로 읽는다.

```txt
1. AGENTS.md
2. .agent-notes/coffffe-status.md
3. .agent-notes/coffffe-plan.md
```

`.agent-notes/` 문서가 없으면 없다고 보고하고, 실제 코드와 사용자 요구사항을 기준으로 진행한다.
`coffffe-archive.md`는 과거 맥락이 필요할 때만 읽는다.

---

## 3. 역할 분리

### Claude

- 코드 수정 전에 계획을 작성한다.
- 새 active 계획 파일을 만들지 않는다.
- 항상 `.agent-notes/coffffe-plan.md`만 갱신한다.
- 계획에는 목표, 범위, 제외 범위, 수정 예상 파일, 작업 순서, 검증 방법을 포함한다.
- 코드 구현은 사용자가 명시하지 않으면 하지 않는다.

### Codex

- `AGENTS.md`, `coffffe-status.md`, `coffffe-plan.md`를 읽고 실행한다.
- 계획에 없는 대규모 리팩터링을 하지 않는다.
- 작업 후 수정 파일, 구현 요약, 검증 결과를 정리한다.
- 가능하면 `coffffe-plan.md` 체크리스트를 갱신한다.
- 현재 상태가 바뀌면 `coffffe-status.md`도 갱신한다.

---

## 4. 작업 원칙

- 기존 UI/UX를 임의로 갈아엎지 않는다.
- 한 번에 하나의 작업 단위만 처리한다.
- 작업 전 관련 파일을 먼저 확인한다.
- 타입, 파일 구조, 데이터 구조를 추측하지 않는다.
- 실제 코드와 문서가 다르면 실제 코드를 우선한다.
- `any` 사용을 피한다.
- `.env`, secret, key 파일은 출력하지 않는다.
- Kakao Map API key 등 외부 서비스 키를 클라이언트 코드에 하드코딩하지 않는다.
- frontend-only 데이터 기능을 망가뜨리지 않는다.

---

## 5. Git / Push 규칙

- 사용자가 `푸쉬해줘`라고 요청하면 Codex가 직접 `git add`, `git commit`, `git push`까지 진행한다.
- 커밋 메시지는 이번 작업 내용을 기준으로 Codex가 1~3줄로 짧게 작성한다.
- 커밋 전 `git status --short`로 의도하지 않은 파일이 없는지 확인한다.
- `.env`, `.env.local`, secret, key, `node_modules`, `.next`, `.vercel`, 로그 파일은 커밋하지 않는다.
- push 실패 시 실패 원인과 로그 요약을 보고한다.

---

## 6. coFFFFFe-map 현재 방향

coFFFFFe-map은 안산 스페셜티 카페와 원두 정보를 탐색하는 개인/소규모 웹앱이다.

현재 핵심 방향:

```txt
v1.x: frontend-first MVP + 정적 데이터
v1.x 주요 화면: 홈, 지도, 카페 상세, 원두, 커피 CBTI
v2.0 후보: 데이터 관리 방식 개선, 검색/필터 고도화, 배포 안정화
```

---

## 7. 고정 기술 기준

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- lucide-react 아이콘
- 정적 카페 데이터: `src/data/cafes.json`
- 정적 원두 데이터: `src/data/beans.ts`
- 카페 도메인 타입: `src/types/cafe.ts`
- Kakao 지도 관련 타입: `src/types/kakao.d.ts`
- 주요 라우트:
  - `/`
  - `/map`
  - `/cafes/[id]`
  - `/beans`
  - `/cbti`
  - `/api/cafes`

---

## 8. 검증 명령어

가능하면 작업 후 아래 순서로 실행한다.

```bash
npx tsc --noEmit
npm run lint
npm run build
```

개발 서버 확인이 필요한 경우:

```bash
npm run dev
```

실패한 명령이 있으면 성공한 것처럼 말하지 말고 실패 원인과 로그 요약을 남긴다.
`npm run lint`가 `.claude/worktrees/**` 또는 생성물 때문에 실패하면 해당 경로를 명시한다.

---

## 9. 작업 완료 보고 형식

작업 완료 후 아래 형식으로 보고한다.

````md
## 수정 파일

- `src/...`

## 구현 내용

- ...

## 검증

```bash
npx tsc --noEmit
npm run lint
npm run build
```

결과:
- tsc: 통과 / 실패
- lint: 통과 / 실패
- build: 통과 / 실패

## 남은 작업

- ...
````

---

## 10. 문서 관리 규칙

- 새 active 계획 파일을 만들지 않는다.
- 현재 계획은 항상 `.agent-notes/coffffe-plan.md`에만 둔다.
- 완료된 계획은 필요한 요약만 `.agent-notes/coffffe-archive.md`로 옮긴다.
- 현재 상태 변경은 `.agent-notes/coffffe-status.md`에 반영한다.
- 사용자가 "내가 해야하는일 md파일 작성해줘" 또는 유사하게 요청하면 `.agent-notes/user-works.md`에 사용자가 직접 처리해야 할 작업만 한국어로 정리한다.
- `AGENTS.md`는 300줄 이하로 유지한다.

---

## 11. 배포 전 확인 단계

배포 전에는 아래 항목을 반드시 확인한다.

### 11.1 기본 검증

```bash
git status --short
npx tsc --noEmit
npm run lint
npm run build
```

- 실패한 명령이 있으면 배포하지 않는다.
- 실패 로그를 요약하고 원인 수정 후 다시 실행한다.
- `npm run build` 통과만으로 실제 기능 검증이 끝난 것으로 보지 않는다.

### 11.2 Git 상태

- 의도하지 않은 파일이 포함되지 않았는지 확인한다.
- `.env`, `.env.local`, secret, key 파일은 절대 커밋하지 않는다.
- `node_modules`, `.next`, `.vercel`, 로그 파일은 커밋하지 않는다.
- `.claude/worktrees`, 생성된 빌드 산출물이 포함되지 않았는지 확인한다.
- 배포 전 커밋 단위를 작게 유지한다.

### 11.3 환경 변수 / Secret

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

### 11.4 데이터 / 도메인

- `cafes.json` 변경 시 `Cafe` 타입과 실제 필드가 맞는지 확인한다.
- `beans.ts` 변경 시 원산지, 로스팅, 향미 필터가 깨지지 않는지 확인한다.
- 카페 `id` 변경은 `/cafes/[id]` 링크 영향도를 확인한다.
- 좌표 변경은 `/map`에서 마커 위치를 확인한다.
- 정적 데이터 추가 시 중복 id를 만들지 않는다.

### 11.5 수동 QA

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

### 11.6 외부 API / 비용 제한

외부 API 또는 AI Route Handler를 추가할 때는 다음을 지킨다.

- API 호출은 필요한 경우에만 서버에서 수행한다.
- 입력 길이 제한을 둔다.
- 실패 시 사용자에게 안전한 에러 메시지를 반환한다.
- 외부 API 장애 시 fallback UI를 제공한다.
- 클라이언트에 secret을 노출하지 않는다.

### 11.7 배포 환경

Vercel 배포 시 확인한다.

- Production / Preview / Development 환경 변수를 구분한다.
- Kakao Developers 도메인 등록 상태를 확인한다.
- Preview 배포에서 먼저 수동 QA를 수행한다.
- Production 배포 후 핵심 라우트와 지도 로딩을 다시 확인한다.

### 11.8 롤백 기준

아래 문제가 있으면 즉시 롤백하거나 배포를 중단한다.

- 주요 라우트 런타임 에러 발생
- 지도 로딩 불가
- 카페 상세 접근 불가
- 데이터 생성물 또는 secret이 커밋에 포함됨
- 모바일에서 핵심 기능 사용 불가

배포는 “일단 올리기”보다 “문제 발생 시 되돌릴 수 있게 올리기”를 우선한다.
