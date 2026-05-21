create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  kakao_id text not null unique,
  nickname text not null,
  profile_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists favorite_cafes (
  user_id uuid not null references users(id) on delete cascade,
  cafe_id text not null references cafes(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, cafe_id)
);

create table if not exists saved_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  name text not null,
  cafe_ids text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists favorite_cafes_user_created_at_idx
  on favorite_cafes (user_id, created_at desc);

create index if not exists saved_lists_user_created_at_idx
  on saved_lists (user_id, created_at desc);

create or replace function update_users_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists users_set_updated_at on users;

create trigger users_set_updated_at
before update on users
for each row
execute function update_users_updated_at();

create or replace function update_saved_lists_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists saved_lists_set_updated_at on saved_lists;

create trigger saved_lists_set_updated_at
before update on saved_lists
for each row
execute function update_saved_lists_updated_at();
