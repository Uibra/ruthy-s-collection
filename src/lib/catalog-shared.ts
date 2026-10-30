import type { Category, Product, ProductOption } from "./products";

export type ProductRow = {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  compare_price: number | null;
  stock: number;
  rating: number;
  reviews: number;
  added_at: string;
  featured: boolean;
  best_seller: boolean;
  new_arrival: boolean;
  description: string;
  details: string[];
  options: unknown;
  images: string[];
};

export function rowToProduct(r: ProductRow): Product {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    category: r.category as Category,
    price: r.price,
    ...(r.compare_price != null ? { comparePrice: r.compare_price } : {}),
    stock: r.stock,
    rating: Number(r.rating),
    reviews: r.reviews,
    addedAt: r.added_at,
    featured: r.featured,
    bestSeller: r.best_seller,
    newArrival: r.new_arrival,
    description: r.description,
    details: r.details ?? [],
    options: Array.isArray(r.options) ? (r.options as ProductOption[]) : [],
    images: r.images ?? [],
  };
}
