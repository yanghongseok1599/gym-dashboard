insert into public.stores (
  id,
  brand_name,
  industry,
  region,
  manager_name,
  phone,
  email,
  homepage_url,
  naver_place_url,
  naver_blog_url,
  instagram_url,
  google_business_url
) values (
  '00000000-0000-4000-8000-000000000001',
  'itn피트니스',
  '피트니스',
  '강원도 동해시',
  '양홍석',
  '+821075451599',
  'ccv1599@gmail.com',
  'https://itnpt.vercel.app/',
  'https://map.naver.com/p/search/ITN%20%ED%94%BC%ED%8A%B8%EB%8B%88%EC%8A%A4',
  'https://blog.naver.com/wgym7987',
  'https://www.instagram.com/itnfitness_/',
  'https://www.google.com/maps/search/?api=1&query=itn%ED%94%BC%ED%8A%B8%EB%8B%88%EC%8A%A4'
) on conflict (id) do update set
  brand_name = excluded.brand_name,
  industry = excluded.industry,
  region = excluded.region,
  manager_name = excluded.manager_name,
  phone = excluded.phone,
  email = excluded.email,
  homepage_url = excluded.homepage_url,
  naver_place_url = excluded.naver_place_url,
  naver_blog_url = excluded.naver_blog_url,
  instagram_url = excluded.instagram_url,
  google_business_url = excluded.google_business_url,
  updated_at = now();

create policy "internal_mvp_stores_select"
on public.stores for select
to anon
using (true);

create policy "internal_mvp_staff_all"
on public.staff_members for all
to anon
using (true)
with check (true);

create policy "internal_mvp_reports_all"
on public.competitor_reports for all
to anon
using (true)
with check (true);

create policy "internal_mvp_tasks_all"
on public.weekly_tasks for all
to anon
using (true)
with check (true);

create policy "internal_mvp_sales_all"
on public.sales_uploads for all
to anon
using (true)
with check (true);
