create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('new_place', 'correction')),
  cafe_id text references cafes(id) on delete set null,
  kakao_place_id text,
  name text,
  address text,
  lat float8,
  lng float8,
  image_url text,
  correction_types text[] not null default '{}',
  memo text,
  anonymous_id text not null,
  nickname text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reports_status_created_at_idx
  on reports (status, created_at desc);

create index if not exists reports_cafe_id_idx
  on reports (cafe_id)
  where cafe_id is not null;

create index if not exists reports_kakao_place_id_idx
  on reports (kakao_place_id)
  where kakao_place_id is not null;

create or replace function update_reports_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists reports_set_updated_at on reports;

create trigger reports_set_updated_at
before update on reports
for each row
execute function update_reports_updated_at();
