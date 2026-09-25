-- Decoding HCM Normalization Calculator
-- Run this whole script in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.normalization_shifts (
  id text primary key,
  date_label text not null,
  shift_label text not null,
  tq numeric(10,4) not null,
  sq numeric(10,4) not null,
  easy boolean not null default false,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

insert into public.normalization_shifts (id,date_label,shift_label,tq,sq,easy,active,sort_order)
values
('2026-09-02-1','2 Sep','1st Shift',89.35,78.95,false,true,1),
('2026-09-02-2','2 Sep','2nd Shift',86,76.54,false,true,2),
('2026-09-02-3','2 Sep','3rd Shift',91.6,86.87,true,true,3),
('2026-09-03-1','3 Sep','1st Shift',89.4,78.85,false,true,4),
('2026-09-18-1','18 Sep','1st Shift',89.6,77.55,false,true,5),
('2026-09-18-2','18 Sep','2nd Shift',89,86.68,false,true,6)
on conflict (id) do update set
  date_label=excluded.date_label,
  shift_label=excluded.shift_label,
  tq=excluded.tq,
  sq=excluded.sq,
  easy=excluded.easy,
  active=excluded.active,
  sort_order=excluded.sort_order;

create table if not exists public.calculation_logs (
  id uuid primary key default gen_random_uuid(),
  raw_marks numeric(10,2) not null,
  method1_results jsonb not null,
  method2_results jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.normalization_shifts enable row level security;
alter table public.calculation_logs enable row level security;

drop policy if exists "Public can read active shifts" on public.normalization_shifts;
create policy "Public can read active shifts"
on public.normalization_shifts for select
to anon, authenticated
using (active = true);

drop policy if exists "Public can log calculations" on public.calculation_logs;
create policy "Public can log calculations"
on public.calculation_logs for insert
to anon, authenticated
with check (raw_marks >= 0 and raw_marks <= 200);

-- No public update/delete policy is intentionally created.
-- Change shift values from Supabase SQL Editor or add a protected admin UI later.
