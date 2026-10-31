import { createFileRoute, Link } from "@tanstack/react-router";
import { Gift, ShieldCheck, Sparkles, Truck } from "lucide-react";

import heroImage from "@/assets/hero-collection.jpg";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/shop/ProductCard";
import { FindAssistant } from "@/components/shop/FindAssistant";
import { categories, type Product } from "@/lib/products";
import { useProducts } from "@/lib/catalog";
import { shop } from "@/lib/shop-config";
import { whatsappGeneral } from "@/lib/whatsapp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ruthys Collection — Perfumes, Jewellery, Bags & More" },
      {
        name: "description",
        content:
          "Discover your perfect find: quality perfumes, earrings and chains, waist beads, vintage scarves and bags. Order online or on WhatsApp.",
      },
      { property: "og:title", content: "Ruthys Collection — Quality Finds, Just for You" },
      {
        property: "og:description",
        content:
          "Quality perfumes, accessories, bags and more — carefully selected just for you.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const products = useProducts();
  const featured = products.filter((p) => p.featured).slice(0, 4);
  const newArrivals = products.filter((p) => p.newArrival).slice(0, 4);
  const bestSellers = products.filter((p) => p.bestSeller).slice(0, 4);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div className="fade-rise">
            <p className="eyebrow text-muted-foreground">{shop.tagline}</p>
            <h1 className="mt-4 font-display text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">
              Discover Your <span className="text-gilded">Perfect Find</span>
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
              Quality perfumes, accessories, bags and more — carefully selected just for you.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="emerald" size="lg">
                <Link to="/shop">Shop now</Link>
              </Button>
              <Button asChild variant="gilded" size="lg">
                <Link to="/shop" hash="collections">
                  Explore collections
                </Link>
              </Button>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-2"><Truck className="h-4 w-4 text-primary" /> Nationwide delivery</span>
              <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Quality checked</span>
              <span className="flex items-center gap-2"><Gift className="h-4 w-4 text-primary" /> Gift wrapping</span>
            </div>
          </div>

          <div className="fade-rise relative">
            <div className="absolute -inset-3 -z-10 surface-gold opacity-20 blur-2xl" />
            <img
              src={heroImage}
              alt="Perfume, gold jewellery, an emerald handbag and a printed silk scarf arranged on cream silk"
              width={1600}
              height={1200}
              className="h-full w-full border border-gold/30 object-cover shadow-lift"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="collections" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6">
        <p className="eyebrow text-muted-foreground">Our collections</p>
        <h2 className="rule-gold mt-3 font-display text-3xl sm:text-4xl">Shop by category</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {categories.map((c) => (
            <Link
              key={c.name}
              to="/shop"
              search={{ q: "", category: c.name, sort: "newest" }}
              className="card-hover group flex flex-col justify-between border border-border bg-card p-5 shadow-soft"
            >
              <Sparkles className="h-5 w-5 text-gold" />
              <div className="mt-8">
                <h3 className="font-display text-xl">{c.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{c.blurb}</p>
              </div>
              <span className="mt-5 text-xs uppercase tracking-[0.16em] text-primary">Shop →</span>
            </Link>
          ))}
        </div>
      </section>

      <FindAssistant />

      <ProductRow title="Featured pieces" eyebrow="Handpicked" items={featured} />
      <ProductRow title="New arrivals" eyebrow="Just in" items={newArrivals} />
      <ProductRow title="Best sellers" eyebrow="Loved by our customers" items={bestSellers} />

      {/* Promo */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="surface-emerald flex flex-col items-center gap-4 px-6 py-14 text-center">
          <p className="eyebrow opacity-80">Special offer</p>
          <h2 className="font-display text-4xl sm:text-5xl">10% off your first order</h2>
          <p className="max-w-lg text-sm opacity-85">
            Use code <span className="font-medium tracking-[0.2em]">RUTHY10</span> at checkout, or
            mention it when you order on WhatsApp.
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <Button asChild variant="gold" size="lg">
              <Link to="/shop">Start shopping</Link>
            </Button>
            <Button asChild variant="onDark" size="lg">
              <a href={whatsappGeneral()} target="_blank" rel="noreferrer">
                Order on WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Social */}
      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6">
        <div className="text-center">
          <p className="eyebrow text-muted-foreground">@ruthyscollection</p>
          <h2 className="mt-3 font-display text-3xl">Follow Ruthys Collection</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            New pieces, restocks and styling ideas — shared first on our socials.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild variant="gilded">
              <a href={shop.socials.instagram} target="_blank" rel="noreferrer">Instagram</a>
            </Button>
            <Button asChild variant="gilded">
              <a href={shop.socials.facebook} target="_blank" rel="noreferrer">Facebook</a>
            </Button>
            <Button asChild variant="gilded">
              <a href={shop.socials.tiktok} target="_blank" rel="noreferrer">TikTok</a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function ProductRow({
  title,
  eyebrow,
  items,
}: {
  title: string;
  eyebrow: string;
  items: Product[];
}) {
  if (items.length === 0) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-muted-foreground">{eyebrow}</p>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl">{title}</h2>
        </div>
        <Link to="/shop" className="text-xs uppercase tracking-[0.16em] text-primary">
          View all →
        </Link>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
