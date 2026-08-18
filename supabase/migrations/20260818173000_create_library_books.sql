create table public.library_books (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  google_id text not null check (char_length(google_id) between 1 and 64),
  title text not null check (char_length(title) between 1 and 500),
  authors text[] not null default '{}',
  description text not null default '' check (char_length(description) <= 20000),
  published_year text check (published_year is null or published_year ~ '^[0-9]{4}$'),
  cover_url text check (cover_url is null or char_length(cover_url) <= 2048),
  page_count integer check (page_count is null or page_count > 0),
  categories text[] not null default '{}',
  status text not null default 'want-to-read' check (status in ('want-to-read', 'reading', 'finished')),
  added_at timestamptz not null default now(),
  unique (user_id, google_id)
);

create index library_books_user_status_added_idx
  on public.library_books (user_id, status, added_at desc);

alter table public.library_books enable row level security;
revoke all on table public.library_books from anon;
grant select, insert, update, delete on table public.library_books to authenticated;

create policy "Users can read their own library" on public.library_books
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can add to their own library" on public.library_books
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can update their own library" on public.library_books
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "Users can remove from their own library" on public.library_books
  for delete to authenticated using ((select auth.uid()) = user_id);
