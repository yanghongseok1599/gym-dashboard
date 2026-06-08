create table if not exists public.employee_profiles (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade unique,
  full_name text not null,
  phone text,
  position text,
  role text not null default 'employee' check (role in ('admin', 'employee')),
  is_active boolean not null default true,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.employee_profiles enable row level security;

create or replace function public.current_employee_role(target_store_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.employee_profiles
  where user_id = auth.uid()
    and store_id = target_store_id
    and is_active = true
  limit 1
$$;

create or replace function public.handle_new_employee_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  default_store_id uuid := '00000000-0000-4000-8000-000000000001';
  active_profile_count integer;
begin
  select count(*)
  into active_profile_count
  from public.employee_profiles
  where store_id = default_store_id;

  insert into public.employee_profiles (
    store_id,
    user_id,
    full_name,
    phone,
    position,
    role
  ) values (
    default_store_id,
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(new.email, '@', 1), '직원'),
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    nullif(new.raw_user_meta_data ->> 'position', ''),
    case when active_profile_count = 0 then 'admin' else 'employee' end
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_employee_user();

drop policy if exists "employee_profiles_select" on public.employee_profiles;
drop policy if exists "employee_profiles_update_self" on public.employee_profiles;
drop policy if exists "employee_profiles_update_admin" on public.employee_profiles;

create policy "employee_profiles_select"
on public.employee_profiles for select
to authenticated
using (
  user_id = auth.uid()
  or public.current_employee_role(store_id) = 'admin'
);

create policy "employee_profiles_update_self"
on public.employee_profiles for update
to authenticated
using (user_id = auth.uid() and is_active = true)
with check (user_id = auth.uid());

create policy "employee_profiles_update_admin"
on public.employee_profiles for update
to authenticated
using (public.current_employee_role(store_id) = 'admin')
with check (public.current_employee_role(store_id) = 'admin');

drop policy if exists "internal_mvp_stores_select" on public.stores;
drop policy if exists "internal_mvp_staff_all" on public.staff_members;
drop policy if exists "internal_mvp_reports_all" on public.competitor_reports;
drop policy if exists "internal_mvp_tasks_all" on public.weekly_tasks;
drop policy if exists "internal_mvp_sales_all" on public.sales_uploads;

create policy "stores_authenticated_select"
on public.stores for select
to authenticated
using (true);

create policy "staff_authenticated_all"
on public.staff_members for all
to authenticated
using (true)
with check (true);

create policy "reports_authenticated_all"
on public.competitor_reports for all
to authenticated
using (true)
with check (true);

create policy "tasks_authenticated_all"
on public.weekly_tasks for all
to authenticated
using (true)
with check (true);

create policy "sales_authenticated_all"
on public.sales_uploads for all
to authenticated
using (true)
with check (true);
