alter table cafes
  add column if not exists show_aroma boolean not null default true;
