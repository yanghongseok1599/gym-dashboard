create extension if not exists pgcrypto;

create table if not exists public.stores (
  id uuid primary key default gen_random_uuid(),
  brand_name text not null,
  industry text not null,
  region text not null,
  manager_name text,
  phone text,
  email text,
  homepage_url text,
  naver_place_url text,
  naver_blog_url text,
  instagram_url text,
  google_business_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.staff_members (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  name text not null,
  role text,
  personality text,
  working_hours text,
  strengths text,
  weekly_goal text,
  assignment_note text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.employee_profiles (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade unique,
  full_name text not null,
  phone text,
  position text,
  role text not null default 'employee' check (role in ('admin', 'employee')),
  is_active boolean not null default false,
  approval_status text not null default 'pending' check (approval_status in ('pending', 'approved', 'rejected')),
  approved_at timestamptz,
  approved_by uuid references auth.users(id) on delete set null,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.competitor_reports (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  week_start date not null,
  title text not null,
  codex_report text not null,
  competitor_findings jsonb not null default '[]'::jsonb,
  risks jsonb not null default '[]'::jsonb,
  opportunities jsonb not null default '[]'::jsonb,
  recommended_strategy jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.weekly_tasks (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  report_id uuid references public.competitor_reports(id) on delete set null,
  staff_id uuid references public.staff_members(id) on delete set null,
  assignee_profile_id uuid references public.employee_profiles(id) on delete set null,
  title text not null,
  description text not null,
  priority text not null default 'medium',
  category text,
  due_date date,
  status text not null default 'todo',
  completion_note text,
  ai_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sales_uploads (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  file_name text not null,
  uploaded_at timestamptz not null default now(),
  summary_json jsonb not null default '{}'::jsonb
);

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

alter table public.stores enable row level security;
alter table public.staff_members enable row level security;
alter table public.employee_profiles enable row level security;
alter table public.competitor_reports enable row level security;
alter table public.weekly_tasks enable row level security;
alter table public.sales_uploads enable row level security;
alter table public.strategy_experiments enable row level security;
