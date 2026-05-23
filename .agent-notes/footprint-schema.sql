-- ============================================================
-- Footprint feature schema
-- 발자취 기능: 한줄평 / 다녀왔어요 / 이모지 반응 / 조회수 집계
--
-- 적용: Supabase SQL Editor에서 본 파일 전체를 실행한다.
-- "오늘"의 기준은 모두 KST (Asia/Seoul) 자정 리셋 — 서버 코드에서
-- KST 날짜 문자열(YYYY-MM-DD)을 계산해 visit_date / view_date 컬럼에 저장한다.
-- ============================================================


-- ------------------------------------------------------------
-- 1) cafe_reviews
-- 한줄평. 50자 이내. 익명(author_anonymous_id) 또는 로그인(author_user_id) 모두 가능.
-- ------------------------------------------------------------
create table if not exists cafe_reviews (
  id uuid primary key default gen_random_uuid(),
  cafe_id text not null,
  -- 로그인 사용자 ID (선택). 익명만 작성한 경우 null. / Logged-in author id, optional.
  author_user_id uuid null,
  -- 익명 식별자 (항상 채움). localStorage 기반. / Anonymous id, always set.
  author_anonymous_id text not null,
  -- 표시용 닉네임/animal 스냅샷 (작성 시점의 값을 그대로 저장). / Display snapshot.
  author_nickname text not null,
  author_animal text not null,
  -- 쿨다운 검증용 IP. 표시 X. / Rate-limit IP, never shown to users.
  ip text not null default '',
  -- 본문. 50자 제한은 DB 레벨에서도 강제. / Body text, 50-char hard limit.
  text text not null check (char_length(text) > 0 and char_length(text) <= 50),
  -- 신고 누적 수. cafe_review_reports 트리거로 갱신하거나 서버에서 직접 update.
  report_count int not null default 0,
  created_at timestamptz not null default now()
);

-- 카페별 한줄평 목록(최신순) 조회 인덱스
create index if not exists cafe_reviews_cafe_idx
  on cafe_reviews (cafe_id, created_at desc);

-- IP 기준 쿨다운 검증용 인덱스
create index if not exists cafe_reviews_ip_idx
  on cafe_reviews (cafe_id, ip, created_at desc);

-- anonymous_id 기준 쿨다운(localStorage 본 사용자) 검증용 인덱스
create index if not exists cafe_reviews_anon_idx
  on cafe_reviews (cafe_id, author_anonymous_id, created_at desc);


-- ------------------------------------------------------------
-- 2) cafe_review_reports
-- 한줄평 신고. 동일 신고자(anonymous_id) 중복 신고 차단. / Duplicate-report guard.
-- ------------------------------------------------------------
create table if not exists cafe_review_reports (
  review_id uuid not null references cafe_reviews(id) on delete cascade,
  reporter_anonymous_id text not null,
  created_at timestamptz not null default now(),
  primary key (review_id, reporter_anonymous_id)
);


-- ------------------------------------------------------------
-- 3) cafe_visits
-- "오늘 다녀왔어요". 카페별 + 익명ID + 날짜(KST) 복합 PK로 하루 1회 강제.
-- 취소 불가 정책이므로 DELETE는 어드민 정리용에만 사용.
-- ------------------------------------------------------------
create table if not exists cafe_visits (
  cafe_id text not null,
  anonymous_id text not null,
  -- KST 기준 YYYY-MM-DD. 서버에서 계산해 저장. / KST calendar date string.
  visit_date date not null,
  created_at timestamptz not null default now(),
  primary key (cafe_id, anonymous_id, visit_date)
);

-- 카페별 오늘 방문자수 집계 인덱스
create index if not exists cafe_visits_today_idx
  on cafe_visits (cafe_id, visit_date);


-- ------------------------------------------------------------
-- 4) cafe_reactions
-- 이모지 반응. (카페, 익명ID, emoji) PK로 동일 반응 중복 차단.
-- 토글 동작: insert 시 추가, 같은 키가 있으면 delete (서버 로직에서 처리).
-- emoji 값은 footprintEmojis 정의 5종에 한정. / Limited to 5 keys from footprintEmojis.
-- ------------------------------------------------------------
create table if not exists cafe_reactions (
  cafe_id text not null,
  anonymous_id text not null,
  emoji text not null check (emoji in ('coffee', 'vibe', 'work', 'insta', 'toilet')),
  created_at timestamptz not null default now(),
  primary key (cafe_id, anonymous_id, emoji)
);

-- 카페별 이모지 카운트 집계 인덱스
create index if not exists cafe_reactions_summary_idx
  on cafe_reactions (cafe_id, emoji);


-- ------------------------------------------------------------
-- 5) cafe_view_daily
-- 일별 조회수 카운터. 매 조회마다 row를 만들지 않고 (cafe_id, view_date) upsert + count +1.
-- 동시성 안전을 위해 increment_cafe_view RPC를 사용 권장. / Use RPC for concurrent-safe atomic increment.
-- ------------------------------------------------------------
create table if not exists cafe_view_daily (
  cafe_id text not null,
  view_date date not null,
  count int not null default 0,
  primary key (cafe_id, view_date)
);


-- ------------------------------------------------------------
-- 6) RPC: increment_cafe_view (atomic upsert + count +1)
-- 서버에서 호출. 동시 요청에도 카운트 누락 없이 +1 보장.
-- ------------------------------------------------------------
create or replace function increment_cafe_view(p_cafe_id text, p_view_date date)
returns int
language plpgsql
as $$
declare
  v_count int;
begin
  insert into cafe_view_daily (cafe_id, view_date, count)
  values (p_cafe_id, p_view_date, 1)
  on conflict (cafe_id, view_date)
  do update set count = cafe_view_daily.count + 1
  returning count into v_count;

  return v_count;
end;
$$;


-- ------------------------------------------------------------
-- 7) RPC: increment_review_report_count
-- 신고 insert 성공 시 cafe_reviews.report_count +1. 중복 신고는 PK 충돌로 무시되며
-- 서버는 이 RPC를 호출하지 않는다.
-- ------------------------------------------------------------
create or replace function increment_review_report_count(p_review_id uuid)
returns void
language plpgsql
as $$
begin
  update cafe_reviews
    set report_count = report_count + 1
    where id = p_review_id;
end;
$$;
