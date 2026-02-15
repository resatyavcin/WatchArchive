-- WatchArchive Supabase migration
-- Supabase Dashboard > SQL Editor'da çalıştırın veya: supabase db push

create table if not exists watched_items (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  tmdb_id integer not null,
  title text not null,
  type text not null check (type in ('movie', 'tv')),
  poster_path text,
  release_year text,
  watched_at timestamptz not null default now(),
  rating numeric,
  notes text,
  is_favorite boolean default false,
  episode_ratings jsonb default '{}',
  runtime integer,
  watching_status text check (watching_status in ('watching', 'completed', 'dropped')),
  watched_progress_seconds integer,
  watched_episodes jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, tmdb_id, type)
);

create table if not exists watchlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  tmdb_id integer not null,
  title text not null,
  type text not null check (type in ('movie', 'tv')),
  poster_path text,
  release_year text,
  added_at timestamptz not null default now(),
  created_at timestamptz default now(),
  unique(user_id, tmdb_id, type)
);

create index idx_watched_user on watched_items(user_id);
create index idx_watched_watched_at on watched_items(user_id, watched_at desc);
create index idx_watchlist_user on watchlist_items(user_id);

-- RLS: Kullanıcı sadece kendi verisine erişebilir (anon key ile client tarafında kullanılıyorsa)
alter table watched_items enable row level security;
alter table watchlist_items enable row level security;

-- Service role RLS bypass eder, API route'larda session.user_id ile filtre yapacağız
