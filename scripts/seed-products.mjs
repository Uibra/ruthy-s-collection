import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadEnvFromFiles() {
  const candidates = [".env", ".env.local", ".env.development", ".env.production"];
  const values = {};

  for (const file of candidates) {
    const path = join(process.cwd(), file);
    if (!existsSync(path)) continue;

    const text = readFileSync(path, "utf8");
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
      const [key, ...rest] = trimmed.split("=");
      values[key.trim()] = rest.join("=").trim().replace(/^['"]|['"]$/g, "");
    }
  }

  return values;
}

const env = loadEnvFromFiles();
const url = process.env.SUPABASE_URL ?? env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing Supabase env vars: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your shell or .env file.");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const products = [
  {
    slug: "velvet-oud-eau-de-parfum",
    name: "Velvet Oud Eau de Parfum",
    category: "Perfumes",
    price: 38000,
    compare_price: 45000,
    stock: 12,
    rating: 4.8,
    reviews: 24,
    featured: true,
    best_seller: true,
    new_arrival: false,
    description: "A warm, resinous oud softened with rose and vanilla. Built for evenings and lasts through the day.",
    details: ["50ml spray", "Notes: oud, rose, vanilla, amber", "8–10 hour wear"],
    options: [{ label: "Size", values: ["50ml", "100ml"] }],
    images: [
      "https://images.unsplash.com/photo-1528740561666-dc2479dc08ab?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    slug: "gilded-hoop-earrings",
    name: "Gilded Hoop Earrings",
    category: "Earrings & Chains",
    price: 12500,
    compare_price: null,
    stock: 20,
    rating: 4.9,
    reviews: 41,
    featured: true,
    best_seller: true,
    new_arrival: false,
    description: "Lightweight hoops with a brushed finish — the pair you reach for without thinking.",
    details: ["Tarnish-resistant plating", "Hypoallergenic posts", "Diameter: 40mm"],
    options: [{ label: "Colour", values: ["Gold", "Silver"] }],
    images: [
      "https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1617038220319-276d3cfab537?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    slug: "handmade-waist-beads-set",
    name: "Handmade Waist Beads Set",
    category: "Waist Beads",
    price: 7500,
    compare_price: null,
    stock: 3,
    rating: 4.7,
    reviews: 18,
    featured: false,
    best_seller: false,
    new_arrival: true,
    description: "A set of three strands, hand-strung and tied to your measurement. Comfortable enough to sleep in.",
    details: ["Set of 3 strands", "Adjustable cotton tie", "Made to measure"],
    options: [{ label: "Size", values: ["Small", "Medium", "Large"] }],
    images: [
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    slug: "classic-ladies-handbag",
    name: "Classic Ladies Handbag",
    category: "Bags",
    price: 25000,
    compare_price: null,
    stock: 7,
    rating: 4.6,
    reviews: 33,
    featured: true,
    best_seller: true,
    new_arrival: false,
    description: "A structured everyday bag with a roomy interior, inner zip pocket and a detachable strap.",
    details: ["Faux leather", "Detachable shoulder strap", "32 × 24 × 12cm"],
    options: [{ label: "Colour", values: ["Black", "Cream", "Emerald"] }],
    images: [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    slug: "vintage-silk-print-scarf",
    name: "Vintage Silk Print Scarf",
    category: "Vintage Scarves",
    price: 9500,
    compare_price: null,
    stock: 1,
    rating: 5,
    reviews: 9,
    featured: false,
    best_seller: false,
    new_arrival: true,
    description: "A one-of-a-kind printed scarf, carefully sourced and inspected. Wear it at the neck, wrist or bag handle.",
    details: ["Silk blend", "Approx. 90 × 90cm", "Single piece — once it's gone, it's gone"],
    options: [],
    images: [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    slug: "rose-musk-body-mist",
    name: "Rose Musk Body Mist",
    category: "Perfumes",
    price: 14000,
    compare_price: 17000,
    stock: 15,
    rating: 4.5,
    reviews: 27,
    featured: false,
    best_seller: false,
    new_arrival: false,
    description: "A light, powdery mist for daytime. Layer it under a perfume or wear it alone.",
    details: ["200ml", "Notes: rose, white musk, pear", "Alcohol-free"],
    options: [],
    images: [
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=900&q=80",
    ],
  },
];

const rows = products.map((product) => ({
  ...product,
  added_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}));

const { data, error } = await supabase
  .from("products")
  .upsert(rows, { onConflict: "slug", ignoreDuplicates: false })
  .select("slug");

if (error) {
  console.error("Seed failed:", error.message);
  process.exit(1);
}

console.log(`Seeded ${data.length} products into Supabase.`);
