import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, Menu, Search, ShoppingBag, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { shop } from "@/lib/shop-config";
import { useStore } from "@/lib/store";
import { categories } from "@/lib/products";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
  { to: "/faq", label: "FAQ" },
] as const;

export function AnnouncementBar() {
  return (
    <div className="surface-emerald px-4 py-2 text-center text-xs tracking-[0.14em]">
      New Arrivals Are Here — Explore Our Latest Collection
    </div>
  );
}

export function Header() {
  const { cartCount, wishlist } = useStore();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    setOpen(false);
    navigate({ to: "/shop", search: { q: query, category: "", sort: "newest" } });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <button
          type="button"
          className="grid h-10 w-10 place-items-center md:hidden"
          aria-label="Open menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <Link to="/" className="mr-auto flex flex-col leading-none">
          <span className="font-display text-xl sm:text-2xl">{shop.name}</span>
          <span className="hidden text-[0.625rem] tracking-[0.22em] text-muted-foreground sm:block">
            {shop.tagline.toUpperCase()}
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm tracking-wide text-foreground/80 transition-colors hover:text-primary"
              activeProps={{ className: "text-primary" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <form onSubmit={submitSearch} className="ml-4 hidden lg:block">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search perfumes, bags, earrings..."
              className="h-9 w-64 pl-8"
              aria-label="Search products"
            />
          </div>
        </form>

        <Link
          to="/wishlist"
          className="relative grid h-10 w-10 place-items-center"
          aria-label="Wishlist"
        >
          <Heart className="h-5 w-5" />
          {wishlist.length > 0 && <Dot>{wishlist.length}</Dot>}
        </Link>

        <Link to="/cart" className="relative grid h-10 w-10 place-items-center" aria-label="Cart">
          <ShoppingBag className="h-5 w-5" />
          {cartCount > 0 && <Dot>{cartCount}</Dot>}
        </Link>
      </div>

      {open && (
        <div className="border-t border-border bg-background px-4 pb-6 pt-4 md:hidden">
          <form onSubmit={submitSearch} className="mb-4">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search perfumes, bags, earrings..."
              aria-label="Search products"
            />
          </form>
          <nav className="flex flex-col">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="border-b border-border py-3 text-sm tracking-wide"
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <p className="eyebrow mt-5 text-muted-foreground">Categories</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {categories.map((c) => (
              <Link
                key={c.name}
                to="/shop"
                search={{ q: "", category: c.name, sort: "newest" }}
                onClick={() => setOpen(false)}
                className="border border-border px-3 py-1.5 text-xs"
              >
                {c.name}
              </Link>
            ))}
          </div>
          <Button asChild variant="gold" className="mt-5 w-full">
            <Link to="/shop" onClick={() => setOpen(false)}>
              Shop now
            </Link>
          </Button>
        </div>
      )}
    </header>
  );
}

function Dot({ children }: { children: React.ReactNode }) {
  return (
    <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full surface-gold px-1 text-[0.625rem] font-semibold">
      {children}
    </span>
  );
}
