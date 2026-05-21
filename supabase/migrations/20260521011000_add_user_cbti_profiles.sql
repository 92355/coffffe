create table if not exists user_cbti_profiles (
  user_id uuid primary key references users(id) on delete cascade,
  cbti_type text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function update_user_cbti_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists user_cbti_profiles_set_updated_at on user_cbti_profiles;

create trigger user_cbti_profiles_set_updated_at
before update on user_cbti_profiles
for each row
execute function update_user_cbti_profiles_updated_at();
