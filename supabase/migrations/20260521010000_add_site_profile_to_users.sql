alter table users
  add column if not exists site_nickname text,
  add column if not exists site_animal text;

update users
set
  site_nickname = coalesce(site_nickname, nickname),
  site_animal = coalesce(site_animal, '고양이')
where site_nickname is null
   or site_animal is null;

alter table users
  alter column site_nickname set not null,
  alter column site_animal set not null;
