<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# coFFFFFe-map Agent Guide

> 목적: coFFFFFe-map 작업 시 지켜야 할 최소 고정 규칙.
> 계획 관리는 `to-prd`, `to-issues` skills와 이슈 단위 작업을 우선한다.

---

## 1. 작업 기준

- 사용자가 지정한 PRD, issue, 계획서, 또는 명시 요구사항을 기준으로 작업한다.
- 파일이 지정되지 않은 경우 현재 코드와 사용자 요청을 기준으로 최소 범위만 수정한다.
- `.agent-notes/` 문서는 사용자가 지정했거나 과거 맥락이 꼭 필요할 때만 읽는다.
- `to-prd` skill은 요구사항을 PRD로 정리할 때 사용한다.
- `to-issues` skill은 PRD나 계획을 구현 가능한 issue로 나눌 때 사용한다.
- 계획서나 issue에 없는 대규모 변경은 사용자 확인 없이 진행하지 않는다.
- 작업 후 수정 파일, 구현 요약, 검증 결과를 정리한다.

---

## 2. 작업 원칙

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

## 3. Git / Push 규칙

- 사용자가 `푸쉬해줘`라고 요청하면 Codex가 직접 `git add`, `git commit`, `git push`까지 진행한다.
- 커밋 메시지는 이번 작업 내용을 기준으로 Codex가 1~3줄로 짧게 작성한다.
- 커밋 전 `git status --short`로 의도하지 않은 파일이 없는지 확인한다.
- `.env`, `.env.local`, secret, key, `node_modules`, `.next`, `.vercel`, 로그 파일은 커밋하지 않는다.
- push 실패 시 실패 원인과 로그 요약을 보고한다.

---

## 4. 고정 기술 기준

- 안산 스페셜티 카페와 원두 정보를 탐색하는 개인/소규모 웹앱
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

## 5. 검증 명령어

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

---

## 6. 작업 완료 보고

- 수정 파일, 구현 내용, 검증 결과, 남은 작업만 간결하게 보고한다.
- 검증을 생략한 경우 이유를 명확히 남긴다.

---

## 7. 문서 관리 규칙

- 새 계획 문서는 사용자가 요청했거나 `to-prd`, `to-issues` 흐름에 필요할 때만 만든다.
- 오래된 `.agent-notes/coffffe-plan.md`, `.agent-notes/coffffe-status.md`는 필수 작업 문서로 취급하지 않는다.
- 사용자가 "내가 해야하는일 md파일 작성해줘" 또는 유사하게 요청하면 `.agent-notes/user-works.md`에 사용자가 직접 처리해야 할 작업만 한국어로 정리한다.
- `AGENTS.md`는 300줄 이하로 유지한다.

---

## 8. 배포 전 확인

- 배포 전에는 `.agent-notes/deploy-checklist.md`를 확인한다.
- 실패한 검증이 있으면 배포하지 않는다.
- secret, 생성물, 의도하지 않은 파일이 커밋에 포함되지 않았는지 확인한다.
- Production 배포 전 Preview에서 핵심 라우트를 수동 QA한다.
