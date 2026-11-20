-- Guardei: desafios e células, sincronizados a partir do app (local-first).
-- Rode no Supabase → SQL Editor. Pode rodar de novo sem problemas (idempotente).

-- ─── Tabelas ──────────────────────────────────────────────────────────────────

create table if not exists public.challenges (
  id                uuid primary key,
  user_id           uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name              text not null check (char_length(name) between 1 and 60),
  goal              integer not null check (goal > 0),
  type              text not null check (type in ('sequential', 'weeks52')),
  step              integer not null check (step > 0),
  start_date        date not null,
  end_date          date,
  monthly_limit     integer check (monthly_limit is null or monthly_limit > 0),
  theme             text not null,
  created_at        timestamptz not null,
  -- quando a pessoa alterou (relógio do aparelho): decide conflitos, vence o mais recente
  updated_at        timestamptz not null,
  -- desafio apagado continua aqui para a exclusão chegar a todos os aparelhos
  deleted_at        timestamptz,
  -- quando o servidor recebeu a alteração: cursor do "o que mudou desde a última vez"
  server_updated_at timestamptz not null default clock_timestamp()
);

create table if not exists public.cells (
  id                uuid primary key,
  user_id           uuid not null default auth.uid() references auth.users (id) on delete cascade,
  challenge_id      uuid not null references public.challenges (id) on delete cascade,
  value             integer not null check (value > 0),
  position          integer not null check (position >= 0),
  saved_at          timestamptz,
  stroke            jsonb,
  updated_at        timestamptz not null,
  server_updated_at timestamptz not null default clock_timestamp()
);

create index if not exists challenges_user_sync_idx on public.challenges (user_id, server_updated_at);
create index if not exists cells_user_sync_idx on public.cells (user_id, server_updated_at);
create index if not exists cells_challenge_idx on public.cells (challenge_id);

-- ─── Regras de sincronização ─────────────────────────────────────────────────

-- Marca a hora do servidor em toda gravação e impede que uma alteração antiga
-- (de um aparelho que ficou offline) sobrescreva uma mais nova.
create or replace function public.guardei_before_write()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'UPDATE' then
    if new.updated_at < old.updated_at then
      return null; -- ignora a alteração mais antiga
    end if;
    new.user_id := old.user_id; -- dono não muda
  end if;
  new.server_updated_at := clock_timestamp();
  return new;
end;
$$;

drop trigger if exists challenges_before_write on public.challenges;
create trigger challenges_before_write
  before insert or update on public.challenges
  for each row execute function public.guardei_before_write();

drop trigger if exists cells_before_write on public.cells;
create trigger cells_before_write
  before insert or update on public.cells
  for each row execute function public.guardei_before_write();

-- ─── Segurança (RLS): cada pessoa só enxerga e altera os próprios dados ─────

alter table public.challenges enable row level security;
alter table public.cells enable row level security;

drop policy if exists "challenges: dono lê" on public.challenges;
create policy "challenges: dono lê" on public.challenges
  for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists "challenges: dono cria" on public.challenges;
create policy "challenges: dono cria" on public.challenges
  for insert to authenticated with check (user_id = (select auth.uid()));

drop policy if exists "challenges: dono altera" on public.challenges;
create policy "challenges: dono altera" on public.challenges
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "cells: dono lê" on public.cells;
create policy "cells: dono lê" on public.cells
  for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists "cells: dono cria" on public.cells;
create policy "cells: dono cria" on public.cells
  for insert to authenticated with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.challenges c where c.id = challenge_id and c.user_id = (select auth.uid()))
  );

drop policy if exists "cells: dono altera" on public.cells;
create policy "cells: dono altera" on public.cells
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Sem policy de DELETE: o app nunca apaga linhas (usa deleted_at).
