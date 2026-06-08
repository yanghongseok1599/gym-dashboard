alter table public.employee_profiles
  add column if not exists approval_status text not null default 'pending'
    check (approval_status in ('pending', 'approved', 'rejected')),
  add column if not exists approved_at timestamptz,
  add column if not exists approved_by uuid references auth.users(id) on delete set null;

alter table public.weekly_tasks
  add column if not exists assignee_profile_id uuid references public.employee_profiles(id) on delete set null;

update public.employee_profiles
set
  approval_status = 'approved',
  approved_at = coalesce(approved_at, now()),
  is_active = true,
  updated_at = now()
where role = 'admin'
   or is_active = true;

create index if not exists employee_profiles_store_approval_idx
on public.employee_profiles(store_id, approval_status, is_active);

create index if not exists weekly_tasks_assignee_status_idx
on public.weekly_tasks(assignee_profile_id, status, due_date);

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
    and approval_status = 'approved'
  limit 1
$$;

create or replace function public.current_employee_profile_id(target_store_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id
  from public.employee_profiles
  where user_id = auth.uid()
    and store_id = target_store_id
    and is_active = true
    and approval_status = 'approved'
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
  active_admin_count integer;
  next_role text;
  next_is_active boolean;
  next_approval_status text;
begin
  select count(*)
  into active_admin_count
  from public.employee_profiles
  where store_id = default_store_id
    and role = 'admin'
    and is_active = true
    and approval_status = 'approved';

  if active_admin_count = 0 then
    next_role := 'admin';
    next_is_active := true;
    next_approval_status := 'approved';
  else
    next_role := 'employee';
    next_is_active := false;
    next_approval_status := 'pending';
  end if;

  insert into public.employee_profiles (
    store_id,
    user_id,
    full_name,
    phone,
    position,
    role,
    is_active,
    approval_status,
    approved_at
  ) values (
    default_store_id,
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(new.email, '@', 1), '직원'),
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    nullif(new.raw_user_meta_data ->> 'position', ''),
    next_role,
    next_is_active,
    next_approval_status,
    case when next_approval_status = 'approved' then now() else null end
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create or replace function public.update_my_employee_profile(
  full_name_arg text,
  phone_arg text,
  position_arg text
)
returns public.employee_profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_profile public.employee_profiles;
begin
  update public.employee_profiles
  set
    full_name = nullif(trim(full_name_arg), ''),
    phone = nullif(trim(phone_arg), ''),
    position = nullif(trim(position_arg), ''),
    updated_at = now()
  where user_id = auth.uid()
  returning * into updated_profile;

  if updated_profile.id is null then
    raise exception 'employee profile not found';
  end if;

  return updated_profile;
end;
$$;

create or replace function public.update_my_task_status(
  task_id_arg uuid,
  status_arg text,
  completion_note_arg text
)
returns public.weekly_tasks
language plpgsql
security definer
set search_path = public
as $$
declare
  current_profile_id uuid;
  updated_task public.weekly_tasks;
begin
  if status_arg not in ('todo', 'in_progress', 'done', 'blocked') then
    raise exception 'unsupported task status';
  end if;

  select public.current_employee_profile_id(store_id)
  into current_profile_id
  from public.weekly_tasks
  where id = task_id_arg;

  if current_profile_id is null then
    raise exception 'approved employee profile not found';
  end if;

  update public.weekly_tasks
  set
    status = status_arg,
    completion_note = nullif(trim(completion_note_arg), ''),
    updated_at = now()
  where id = task_id_arg
    and assignee_profile_id = current_profile_id
  returning * into updated_task;

  if updated_task.id is null then
    raise exception 'task not found or not assigned to current employee';
  end if;

  return updated_task;
end;
$$;

grant execute on function public.update_my_employee_profile(text, text, text) to authenticated;
grant execute on function public.update_my_task_status(uuid, text, text) to authenticated;

drop policy if exists "employee_profiles_select" on public.employee_profiles;
drop policy if exists "employee_profiles_update_self" on public.employee_profiles;
drop policy if exists "employee_profiles_update_admin" on public.employee_profiles;

create policy "employee_profiles_select_self_or_admin"
on public.employee_profiles for select
to authenticated
using (
  user_id = auth.uid()
  or public.current_employee_role(store_id) = 'admin'
);

create policy "employee_profiles_update_admin"
on public.employee_profiles for update
to authenticated
using (public.current_employee_role(store_id) = 'admin')
with check (public.current_employee_role(store_id) = 'admin');

drop policy if exists "stores_authenticated_select" on public.stores;
create policy "stores_approved_employee_select"
on public.stores for select
to authenticated
using (public.current_employee_role(id) in ('admin', 'employee'));

drop policy if exists "staff_authenticated_all" on public.staff_members;
create policy "staff_approved_employee_select"
on public.staff_members for select
to authenticated
using (public.current_employee_role(store_id) in ('admin', 'employee'));

create policy "staff_admin_all"
on public.staff_members for all
to authenticated
using (public.current_employee_role(store_id) = 'admin')
with check (public.current_employee_role(store_id) = 'admin');

drop policy if exists "reports_authenticated_all" on public.competitor_reports;
create policy "reports_approved_employee_select"
on public.competitor_reports for select
to authenticated
using (public.current_employee_role(store_id) in ('admin', 'employee'));

create policy "reports_admin_all"
on public.competitor_reports for all
to authenticated
using (public.current_employee_role(store_id) = 'admin')
with check (public.current_employee_role(store_id) = 'admin');

drop policy if exists "sales_authenticated_all" on public.sales_uploads;
create policy "sales_approved_employee_select"
on public.sales_uploads for select
to authenticated
using (public.current_employee_role(store_id) in ('admin', 'employee'));

create policy "sales_admin_all"
on public.sales_uploads for all
to authenticated
using (public.current_employee_role(store_id) = 'admin')
with check (public.current_employee_role(store_id) = 'admin');

drop policy if exists "tasks_authenticated_all" on public.weekly_tasks;
create policy "tasks_admin_all"
on public.weekly_tasks for all
to authenticated
using (public.current_employee_role(store_id) = 'admin')
with check (public.current_employee_role(store_id) = 'admin');

create policy "tasks_assignee_select"
on public.weekly_tasks for select
to authenticated
using (
  assignee_profile_id = public.current_employee_profile_id(store_id)
  or public.current_employee_role(store_id) = 'admin'
);
