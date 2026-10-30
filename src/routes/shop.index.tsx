import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Search, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FindAssistant } from "@/components/shop/FindAssistant";
import { Input } from "@/components/ui/input";
import { ProductCard } from "@/components/shop/ProductCard";
import { categories, stockStatus } from "@/lib/products";
import { useProducts } from "@/lib/catalog";
import { formatNaira } from "@/lib/shop-config";
import { cn } from "@/lib/utils";

type ShopSearch = { q?: string; category?: string; sort?: string };

export const Route = createFileRoute("/shop/")({
  validateSearch: (search: Record<string, unknown>): ShopSearch => {
    const out: ShopSearch = {};
    const q = search["q"];
    const category = search["category"];
    const sort = search["sort"];
    if (typeof q === "string" && q) out.q = q;
    if (typeof category === "string" && category) out.category = category;
    if (typeof sort === "string" && sort) out.sort = sort;
    return out;
  },
  head: () => ({
    meta: [
      { title: "Shop All — Ruthy's Collection" },
      {
        name: "description",
        content:
          "Browse perfumes, earrings and chains, waist beads, vintage scarves and bags. Filter by category, price and availability.",
      },
      { property: "og:title", content: "Shop All — Ruthy's Collection" },
      {
        property: "og:description",
        content: "Search, filter and sort the full Ruthy's Collection catalogue.",
      },
    ],
  }),
  component: Shop,
});

const sorts = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
  { value: "popular", label: "Popularity" },
  { value: "rating", label: "Top rated" },
  { value: "name", label: "Name A–Z" },
];

function Shop() {
  const search = Route.useSearch();
  const products = useProducts();
  const q = search.q ?? "";
  const category = search.category ?? "";
  const sort = search.sort ?? "newest";
  const navigate = useNavigate();
  const ceiling = Math.max(50000, Math.ceil(Math.max(0, ...products.map((p) => p.price)) / 5000) * 5000);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const priceCap = maxPrice ?? ceiling;
  const [inStockOnly, setInStockOnly] = useState(false);
  const [tag, setTag] = useState<"all" | "new" | "best" | "sale">("all");
  const [showFilters, setShowFilters] = useState(false);
  const setMax = (v: number) => setMaxPrice(v >= ceiling ? null : v);

  const update = (patch: ShopSearch) =>
    navigate({ to: "/shop", search: { q, category, sort, ...patch } });

  const filtered = products
    .filter((p) => {
      const needle = q.trim().toLowerCase();
      if (needle && !`${p.name} ${p.category} ${p.description}`.toLowerCase().includes(needle))
        return false;
      if (category && p.category !== category) return false;
      if (p.price > priceCap) return false;
      if (inStockOnly && p.stock <= 0) return false;
      if (tag === "new" && !p.newArrival) return false;
      if (tag === "best" && !p.bestSeller) return false;
      if (tag === "sale" && !p.comparePrice) return false;
      return true;
    })
    .sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "popular") return b.reviews - a.reviews;
      if (sort === "rating") return b.rating - a.rating;
      if (sort === "name") return a.name.localeCompare(b.name);
      return b.addedAt.localeCompare(a.addedAt);
    });

  return (
    <>
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <p className="eyebrow text-muted-foreground">The collection</p>
      <h1 className="rule-gold mt-3 font-display text-4xl">
        {category || (tag === "new" ? "New Arrivals" : "Shop All")}
      </h1>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => update({ q: e.target.value })}
            placeholder="Search perfumes, bags, earrings..."
            className="h-11 pl-9"
            aria-label="Search products"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => update({ sort: e.target.value })}
          aria-label="Sort products"
          className="h-11 border border-input bg-card px-3 text-sm"
        >
          {sorts.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <Button variant="gilded" className="h-11 lg:hidden" onClick={() => setShowFilters((v) => !v)}>
          <SlidersHorizontal /> Filters
        </Button>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className={cn("space-y-8", showFilters ? "block" : "hidden lg:block")}>
          <div>
            <p className="eyebrow text-muted-foreground">Category</p>
            <div className="mt-3 flex flex-col items-start gap-2">
              <button
                onClick={() => update({ category: "" })}
                className={cn("text-sm", !category ? "text-primary" : "text-muted-foreground")}
              >
                All products
              </button>
              {categories.map((c) => (
                <button
                  key={c.name}
                  onClick={() => update({ category: c.name })}
                  className={cn(
                    "text-left text-sm",
                    category === c.name ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="eyebrow text-muted-foreground">Max price</p>
            <input
              type="range"
              min={5000}
              max={ceiling}
              step={500}
              value={priceCap}
              onChange={(e) => setMax(Number(e.target.value))}
              className="mt-3 w-full accent-primary"
              aria-label="Maximum price"
            />
            <p className="mt-1 text-sm">Up to {formatNaira(priceCap)}</p>
          </div>

          <div>
            <p className="eyebrow text-muted-foreground">Highlights</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(
                [
                  ["all", "All"],
                  ["new", "New arrivals"],
                  ["best", "Best sellers"],
                  ["sale", "Special offers"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setTag(value)}
                  className={cn(
                    "border px-3 py-1.5 text-xs",
                    tag === value ? "border-gold surface-gold" : "border-border text-muted-foreground",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="accent-primary"
            />
            In stock only
          </label>
        </aside>

        <div>
          <p className="text-xs text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "product" : "products"}
          </p>
          {filtered.length === 0 ? (
            <div className="mt-10 border border-border bg-card p-10 text-center">
              <h2 className="font-display text-2xl">Nothing matches that yet</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Try a different search or clear your filters.
              </p>
              <Button
                variant="emerald"
                className="mt-6"
                onClick={() => {
                  setTag("all");
                  setMaxPrice(null);
                  setInStockOnly(false);
                  update({ q: "", category: "" });
                }}
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          <div className="mt-12 border-t border-border pt-6 text-xs text-muted-foreground">
            Low stock moves fast —{" "}
            {products.filter((p) => stockStatus(p.stock) === "Low Stock").length} items are almost
            gone.{" "}
            <Link to="/contact" className="text-primary">
              Ask us about restocks
            </Link>
          </div>
        </div>
      </div>
    </div>
    <FindAssistant />
    </>
  );
}
