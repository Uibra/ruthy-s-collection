CREATE TABLE public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  customer_name text not null,
  customer_phone text not null,
  address text not null default '',
  notes text not null default '',
  delivery_method text not null check (delivery_method in ('home','pickup')),
  delivery_fee integer not null default 0,
  subtotal integer not null,
  total integer not null,
  items jsonb not null default '[]'::jsonb,
  status text not null default 'new' check (status in ('new','confirmed','delivered','cancelled'))
);
GRANT INSERT ON public.orders TO anon, authenticated;
GRANT SELECT, UPDATE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can place an order" ON public.orders FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can view orders" ON public.orders FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update orders" ON public.orders FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.customer_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  message text not null,
  status text not null default 'new' check (status in ('new','read'))
);
GRANT INSERT ON public.customer_messages TO anon, authenticated;
GRANT SELECT, UPDATE ON public.customer_messages TO authenticated;
GRANT ALL ON public.customer_messages TO service_role;
ALTER TABLE public.customer_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can send a message" ON public.customer_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can view messages" ON public.customer_messages FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update messages" ON public.customer_messages FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE INDEX idx_orders_created_at ON public.orders (created_at DESC);
CREATE INDEX idx_messages_created_at ON public.customer_messages (created_at DESC);