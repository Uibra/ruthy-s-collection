export type Category =
  | "Perfumes"
  | "Earrings & Chains"
  | "Waist Beads"
  | "Vintage Scarves"
  | "Bags";

export const categories: { name: Category; blurb: string }[] = [
  { name: "Perfumes", blurb: "Long-lasting scents with presence." },
  { name: "Earrings & Chains", blurb: "Gold and silver pieces for every day." },
  { name: "Waist Beads", blurb: "Handmade, adjustable, quietly beautiful." },
  { name: "Vintage Scarves", blurb: "Soft prints, one-of-a-kind finds." },
  { name: "Bags", blurb: "Structured shapes that carry everything." },
];

export type ProductOption = {
  label: string;
  values: string[];
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: Category;
  price: number;
  comparePrice?: number;
  stock: number;
  rating: number;
  reviews: number;
  addedAt: string;
  featured?: boolean;
  bestSeller?: boolean;
  newArrival?: boolean;
  description: string;
  details: string[];
  options?: ProductOption[];
  /** Real photos go here later; empty means the elegant placeholder tile shows. */
  images: string[];
};

/**
 * Sample catalogue. Replace names, prices and images with the real products
 * once the owner sends photos and pricing — the rest of the store reads from here.
 */
export const products: Product[] = [
  {
    id: "rc-001",
    slug: "velvet-oud-eau-de-parfum",
    name: "Velvet Oud Eau de Parfum",
    category: "Perfumes",
    price: 38000,
    comparePrice: 45000,
    stock: 12,
    rating: 4.8,
    reviews: 24,
    addedAt: "2026-09-12",
    featured: true,
    bestSeller: true,
    description:
      "A warm, resinous oud softened with rose and vanilla. Built for evenings and lasts through the day.",
    details: ["50ml spray", "Notes: oud, rose, vanilla, amber", "8–10 hour wear"],
    options: [{ label: "Size", values: ["50ml", "100ml"] }],
    images: [],
  },
  {
    id: "rc-002",
    slug: "gilded-hoop-earrings",
    name: "Gilded Hoop Earrings",
    category: "Earrings & Chains",
    price: 12500,
    stock: 20,
    rating: 4.9,
    reviews: 41,
    addedAt: "2026-09-20",
    featured: true,
    bestSeller: true,
    description:
      "Lightweight hoops with a brushed finish — the pair you reach for without thinking.",
    details: ["Tarnish-resistant plating", "Hypoallergenic posts", "Diameter: 40mm"],
    options: [{ label: "Colour", values: ["Gold", "Silver"] }],
    images: [],
  },
  {
    id: "rc-003",
    slug: "handmade-waist-beads-set",
    name: "Handmade Waist Beads Set",
    category: "Waist Beads",
    price: 7500,
    stock: 3,
    rating: 4.7,
    reviews: 18,
    addedAt: "2026-09-22",
    newArrival: true,
    description:
      "A set of three strands, hand-strung and tied to your measurement. Comfortable enough to sleep in.",
    details: ["Set of 3 strands", "Adjustable cotton tie", "Made to measure"],
    options: [{ label: "Size", values: ["Small", "Medium", "Large"] }],
    images: [],
  },
  {
    id: "rc-004",
    slug: "classic-ladies-handbag",
    name: "Classic Ladies Handbag",
    category: "Bags",
    price: 25000,
    stock: 7,
    rating: 4.6,
    reviews: 33,
    addedAt: "2026-08-30",
    featured: true,
    bestSeller: true,
    description:
      "A structured everyday bag with a roomy interior, inner zip pocket and a detachable strap.",
    details: ["Faux leather", "Detachable shoulder strap", "32 × 24 × 12cm"],
    options: [{ label: "Colour", values: ["Black", "Cream", "Emerald"] }],
    images: [],
  },
  {
    id: "rc-005",
    slug: "vintage-silk-print-scarf",
    name: "Vintage Silk Print Scarf",
    category: "Vintage Scarves",
    price: 9500,
    stock: 1,
    rating: 5,
    reviews: 9,
    addedAt: "2026-09-24",
    newArrival: true,
    description:
      "A one-of-a-kind printed scarf, carefully sourced and inspected. Wear it at the neck, wrist or bag handle.",
    details: ["Silk blend", "Approx. 90 × 90cm", "Single piece — once it's gone, it's gone"],
    images: [],
  },
  {
    id: "rc-006",
    slug: "rose-musk-body-mist",
    name: "Rose Musk Body Mist",
    category: "Perfumes",
    price: 14000,
    comparePrice: 17000,
    stock: 15,
    rating: 4.5,
    reviews: 27,
    addedAt: "2026-09-02",
    description:
      "A light, powdery mist for daytime. Layer it under a perfume or wear it alone.",
    details: ["200ml", "Notes: rose, white musk, pear", "Alcohol-free"],
    images: [],
  },
  {
    id: "rc-007",
    slug: "layered-chain-necklace",
    name: "Layered Chain Necklace",
    category: "Earrings & Chains",
    price: 16500,
    stock: 0,
    rating: 4.8,
    reviews: 15,
    addedAt: "2026-09-08",
    description:
      "Two chains in one clasp, so the layering stays neat all day. Pairs with the gilded hoops.",
    details: ["18k gold plated", "Adjustable 40–46cm", "Lobster clasp"],
    options: [{ label: "Colour", values: ["Gold", "Silver"] }],
    images: [],
  },
  {
    id: "rc-008",
    slug: "evening-clutch-bag",
    name: "Evening Clutch Bag",
    category: "Bags",
    price: 18500,
    stock: 5,
    rating: 4.7,
    reviews: 11,
    addedAt: "2026-09-26",
    newArrival: true,
    featured: true,
    description:
      "A slim clutch with a fine chain strap — enough room for a phone, cards and a lipstick.",
    details: ["Satin finish", "Removable chain strap", "26 × 14cm"],
    options: [{ label: "Colour", values: ["Emerald", "Gold", "Black"] }],
    images: [],
  },
];

export type StockStatus = "In Stock" | "Low Stock" | "Out of Stock";

export function stockStatus(stock: number): StockStatus {
  if (stock <= 0) return "Out of Stock";
  if (stock <= 3) return "Low Stock";
  return "In Stock";
}

export function productBadge(product: Product) {
  if (product.comparePrice) return "Sale";
  if (product.newArrival) return "New";
  if (product.bestSeller) return "Best Seller";
  return null;
}

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}
