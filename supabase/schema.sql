create extension if not exists pgcrypto;

create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  category_id text unique,
  title text not null check (length(trim(title)) > 0),
  description text not null,
  icon text not null default '📝',
  duration_minutes integer not null check (duration_minutes between 1 and 180),
  questions jsonb not null check (jsonb_typeof(questions) = 'array' and jsonb_array_length(questions) > 0),
  created_at timestamptz not null default now()
);

alter table public.quizzes add column if not exists category_id text;
create unique index if not exists quizzes_category_id_unique on public.quizzes(category_id);

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid references public.quizzes(id) on delete set null,
  category_id text not null,
  category_name text not null,
  category_icon text not null default '🎯',
  student_name text,
  score integer not null check (score >= 0),
  total_questions integer not null check (total_questions > 0),
  percentage integer not null check (percentage between 0 and 100),
  time_spent_seconds integer not null check (time_spent_seconds >= 0),
  answers jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.quizzes enable row level security;
alter table public.quiz_attempts enable row level security;

drop policy if exists "Public can read quizzes" on public.quizzes;
create policy "Public can read quizzes" on public.quizzes
  for select to anon, authenticated using (true);
drop policy if exists "Public can create quizzes" on public.quizzes;
drop policy if exists "Public can seed built-in quizzes" on public.quizzes;
create policy "Public can seed built-in quizzes" on public.quizzes
  for insert to anon with check (category_id in ('java', 'python', 'react', 'gk', 'cs'));
drop policy if exists "Teachers can create quizzes" on public.quizzes;
create policy "Teachers can create quizzes" on public.quizzes
  for insert to authenticated
  with check ((select auth.jwt()) ->> 'email' = 'teacher@quizmaster.local');
drop policy if exists "Teachers can update quizzes" on public.quizzes;
create policy "Teachers can update quizzes" on public.quizzes
  for update to authenticated
  using ((select auth.jwt()) ->> 'email' = 'teacher@quizmaster.local')
  with check ((select auth.jwt()) ->> 'email' = 'teacher@quizmaster.local');
drop policy if exists "Teachers can delete quizzes" on public.quizzes;
create policy "Teachers can delete quizzes" on public.quizzes
  for delete to authenticated
  using ((select auth.jwt()) ->> 'email' = 'teacher@quizmaster.local');

drop policy if exists "Public can read quiz attempts" on public.quiz_attempts;
create policy "Public can read quiz attempts" on public.quiz_attempts
  for select to anon, authenticated using (true);
drop policy if exists "Public can create quiz attempts" on public.quiz_attempts;
create policy "Public can create quiz attempts" on public.quiz_attempts
  for insert to anon, authenticated with check (true);
drop policy if exists "Public can update student names" on public.quiz_attempts;
create policy "Public can update student names" on public.quiz_attempts
  for update to anon, authenticated
  using (student_name is null) with check (student_name is not null);

revoke all on public.quizzes from anon, authenticated;
grant select, insert on public.quizzes to anon;
grant select, insert, update, delete on public.quizzes to authenticated;
grant select, insert, update on public.quiz_attempts to anon, authenticated;
grant usage on schema public to anon, authenticated;
