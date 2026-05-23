## Parent

prd-footprint.md

## What to build

발자취 기능을 위한 Supabase 테이블 4종 + 신고 1종 스키마를 설계하고 마이그레이션 SQL을 작성한다. 실제 적용은 사용자가 Supabase 콘솔에서 수동으로 실행한다.

대상 테이블:
- `cafe_reviews` (한줄평, 50자 제한)
- `cafe_review_reports` (한줄평 신고, 중복 방지)
- `cafe_visits` (오늘 다녀왔어요, 날짜+anonymousId 복합 키)
- `cafe_reactions` (이모지 토글)
- `cafe_view_daily` (일별 조회수 카운터)

PRD의 "스키마 (Supabase)" 섹션을 그대로 따른다.

## Acceptance criteria

- [ ] `.agent-notes/footprint-schema.sql`에 5개 테이블 CREATE 문 + 필요한 인덱스가 포함된다.
- [ ] `text` 컬럼은 50자 CHECK 제약을 포함한다.
- [ ] `cafe_visits`는 `(cafe_id, anonymous_id, visit_date)` PK로 하루 1회를 DB 레벨에서 강제한다.
- [ ] `cafe_reactions`는 `(cafe_id, anonymous_id, emoji)` PK로 동일 이모지 중복을 차단한다.
- [ ] `cafe_review_reports`는 `(review_id, reporter_anonymous_id)` PK로 중복 신고를 차단한다.
- [ ] `cafe_view_daily`는 일별 카운터로 upsert + atomic increment 가능한 구조다.
- [ ] SQL 파일에 한국어 주석으로 각 테이블의 역할을 설명한다.

## Blocked by

None - can start immediately
