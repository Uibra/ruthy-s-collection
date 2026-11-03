create table if not exists public.shop_settings (
  id text primary key default 'default',
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.shop_settings enable row level security;

create policy "Anyone can read shop settings"
on public.shop_settings
for select
using (true);

create policy "Admins can insert shop settings"
on public.shop_settings
for insert
with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can update shop settings"
on public.shop_settings
for update
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete shop settings"
on public.shop_settings
for delete
using (public.has_role(auth.uid(), 'admin'));

create or replace function public.upsert_shop_settings(p_settings jsonb)
returns public.shop_settings
language sql
security definer
set search_path = public
as $$
  insert into public.shop_settings (id, settings, updated_at)
  values ('default', p_settings, now())
  on conflict (id)
  do update set
    settings = excluded.settings,
    updated_at = now()
  returning *;
$$;

insert into public.shop_settings (id, settings)
values ('default', jsonb_build_object(
  'name', 'Ruthys Collection',
  'tagline', 'Luxury essentials for everyday confidence',
  'phoneLocal', '+234 803 000 0000',
  'whatsappNumber', '2348030000000',
  'email', 'hello@ruthyscollection.com',
  'location', 'Kano, Nigeria',
  'hours', 'Mon – Sat, 9:00am – 7:00pm',
  'socials', jsonb_build_object(
    'instagram', 'https://instagram.com/ruthyscollection',
    'facebook', 'https://facebook.com/ruthyscollection',
    'tiktok', 'https://tiktok.com/@ruthyscollection'
  ),
  'delivery', jsonb_build_object(
    'homeFee', 2000,
    'pickupFee', 0,
    'freeOver', 75000
  )
))
on conflict (id) do nothing;
