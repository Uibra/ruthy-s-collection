CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see their own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- The very first signed-in account can claim admin; afterwards nobody can.
CREATE OR REPLACE FUNCTION public.claim_first_admin()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RETURN false; END IF;
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    RETURN public.has_role(auth.uid(), 'admin');
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (auth.uid(), 'admin');
  RETURN true;
END $$;
REVOKE EXECUTE ON FUNCTION public.claim_first_admin() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.claim_first_admin() TO authenticated;

CREATE TABLE public.products (
  id text PRIMARY KEY DEFAULT ('rc-' || substr(gen_random_uuid()::text, 1, 8)),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  category text NOT NULL,
  price integer NOT NULL DEFAULT 0,
  compare_price integer,
  stock integer NOT NULL DEFAULT 0,
  rating numeric NOT NULL DEFAULT 5,
  reviews integer NOT NULL DEFAULT 0,
  added_at date NOT NULL DEFAULT current_date,
  featured boolean NOT NULL DEFAULT false,
  best_seller boolean NOT NULL DEFAULT false,
  new_arrival boolean NOT NULL DEFAULT false,
  description text NOT NULL DEFAULT '',
  details text[] NOT NULL DEFAULT '{}',
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  images text[] NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view products" ON public.products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can add products" ON public.products FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can edit products" ON public.products FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete products" ON public.products FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.products (id, slug, name, category, price, compare_price, stock, rating, reviews, added_at, featured, best_seller, new_arrival, description, details, options) VALUES
('rc-001','velvet-oud-eau-de-parfum','Velvet Oud Eau de Parfum','Perfumes',38000,45000,12,4.8,24,'2026-09-12',true,true,false,'A warm, resinous oud softened with rose and vanilla. Built for evenings and lasts through the day.',ARRAY['50ml spray','Notes: oud, rose, vanilla, amber','8–10 hour wear'],'[{"label":"Size","values":["50ml","100ml"]}]'),
('rc-002','gilded-hoop-earrings','Gilded Hoop Earrings','Earrings & Chains',12500,NULL,20,4.9,41,'2026-09-20',true,true,false,'Lightweight hoops with a brushed finish — the pair you reach for without thinking.',ARRAY['Tarnish-resistant plating','Hypoallergenic posts','Diameter: 40mm'],'[{"label":"Colour","values":["Gold","Silver"]}]'),
('rc-003','handmade-waist-beads-set','Handmade Waist Beads Set','Waist Beads',7500,NULL,3,4.7,18,'2026-09-22',false,false,true,'A set of three strands, hand-strung and tied to your measurement. Comfortable enough to sleep in.',ARRAY['Set of 3 strands','Adjustable cotton tie','Made to measure'],'[{"label":"Size","values":["Small","Medium","Large"]}]'),
('rc-004','classic-ladies-handbag','Classic Ladies Handbag','Bags',25000,NULL,7,4.6,33,'2026-08-30',true,true,false,'A structured everyday bag with a roomy interior, inner zip pocket and a detachable strap.',ARRAY['Faux leather','Detachable shoulder strap','32 × 24 × 12cm'],'[{"label":"Colour","values":["Black","Cream","Emerald"]}]'),
('rc-005','vintage-silk-print-scarf','Vintage Silk Print Scarf','Vintage Scarves',9500,NULL,1,5,9,'2026-09-24',false,false,true,'A one-of-a-kind printed scarf, carefully sourced and inspected. Wear it at the neck, wrist or bag handle.',ARRAY['Silk blend','Approx. 90 × 90cm','Single piece — once it''s gone, it''s gone'],'[]'),
('rc-006','rose-musk-body-mist','Rose Musk Body Mist','Perfumes',14000,17000,15,4.5,27,'2026-09-02',false,false,false,'A light, powdery mist for daytime. Layer it under a perfume or wear it alone.',ARRAY['200ml','Notes: rose, white musk, pear','Alcohol-free'],'[]'),
('rc-007','layered-chain-necklace','Layered Chain Necklace','Earrings & Chains',16500,NULL,0,4.8,15,'2026-09-08',false,false,false,'Two chains in one clasp, so the layering stays neat all day. Pairs with the gilded hoops.',ARRAY['18k gold plated','Adjustable 40–46cm','Lobster clasp'],'[{"label":"Colour","values":["Gold","Silver"]}]'),
('rc-008','evening-clutch-bag','Evening Clutch Bag','Bags',18500,NULL,5,4.7,11,'2026-09-26',true,false,true,'A slim clutch with a fine chain strap — enough room for a phone, cards and a lipstick.',ARRAY['Satin finish','Removable chain strap','26 × 14cm'],'[{"label":"Colour","values":["Emerald","Gold","Black"]}]');