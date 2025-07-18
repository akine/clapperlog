-- Supabase schema for ClapperLog
create table if not exists public.shooting_dates (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  date date not null,
  title text
);

create table if not exists public.scenes (
  id uuid default gen_random_uuid() primary key,
  shooting_date_id uuid references shooting_dates(id),
  name text
);

create table if not exists public.records (
  id uuid default gen_random_uuid() primary key,
  shooting_date_id uuid references shooting_dates(id),
  scene_id uuid references scenes(id),
  start_time text,
  end_time text,
  duration text,
  setup_duration text,
  notes text
);

create index if not exists idx_dates_user on public.shooting_dates(user_id);
create index if not exists idx_records_date on public.records(shooting_date_id);
