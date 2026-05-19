create table if not exists cafes (
  id text primary key,
  name text not null,
  short_description text not null,
  full_description text not null default '',
  address text not null,
  lat float8 not null,
  lng float8 not null,
  roast_levels text[] not null default '{}',
  bean_origins text[] not null default '{}',
  brew_methods text[] not null default '{}',
  quality_score float4 not null default 0,
  tags text[] not null default '{}',
  open_hours text not null default '',
  closed_days text[] not null default '{}',
  phone text,
  instagram_handle text,
  kakao_place_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists cafes_kakao_place_id_unique
  on cafes (kakao_place_id)
  where kakao_place_id is not null;

create or replace function update_cafes_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists cafes_set_updated_at on cafes;

create trigger cafes_set_updated_at
before update on cafes
for each row
execute function update_cafes_updated_at();
