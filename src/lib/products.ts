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
 * The live storefront should read from Supabase, not a source-controlled mock catalogue.
 * This array remains empty until the owner adds real products in the admin dashboard or via the seed script.
 */
export const products: Product[] = [];

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
  return products.find((p) => p.slug === slug) ?? undefined;
}
