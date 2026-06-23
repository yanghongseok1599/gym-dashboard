create table if not exists public.strategy_experiments (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  week_start date not null,
  strategy_name text not null,
  owner_name text,
  target_count integer not null default 0 check (target_count >= 0),
  action_count integer not null default 0 check (action_count >= 0),
  booking_count integer not null default 0 check (booking_count >= 0),
  sales_count integer not null default 0 check (sales_count >= 0),
  renewal_count integer not null default 0 check (renewal_count >= 0),
  baseline_revenue numeric not null default 0 check (baseline_revenue >= 0),
  result_revenue numeric not null default 0 check (result_revenue >= 0),
  cost numeric not null default 0 check (cost >= 0),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists strategy_experiments_store_week_idx
on public.strategy_experiments(store_id, week_start desc);

alter table public.strategy_experiments enable row level security;

drop policy if exists "strategy_experiments_approved_employee_select" on public.strategy_experiments;
create policy "strategy_experiments_approved_employee_select"
on public.strategy_experiments for select
to authenticated
using (public.current_employee_role(store_id) in ('admin', 'employee'));

drop policy if exists "strategy_experiments_admin_all" on public.strategy_experiments;
create policy "strategy_experiments_admin_all"
on public.strategy_experiments for all
to authenticated
using (public.current_employee_role(store_id) = 'admin')
with check (public.current_employee_role(store_id) = 'admin');
