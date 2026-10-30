import { createFileRoute, Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/shop/ProductCard";
import { useProducts } from "@/lib/catalog";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "My Wishlist — Ruthy's Collection" },
      { name: "description", content: "The pieces you saved for later at Ruthy's Collection." },
      { property: "og:title", content: "My Wishlist — Ruthy's Collection" },
      { property: "og:description", content: "Your saved pieces, ready when you are." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const { wishlist, hydrated } = useStore();
  const products = useProducts();
  const saved = products.filter((p) => wishlist.includes(p.id));

  if (!hydrated) return <div className="mx-auto max-w-7xl px-4 py-20" />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <p className="eyebrow text-muted-foreground">Saved for later</p>
      <h1 className="rule-gold mt-3 font-display text-4xl">My wishlist</h1>

      {saved.length === 0 ? (
        <div className="mt-12 border border-border bg-card p-12 text-center">
          <h2 className="font-display text-2xl">Nothing saved yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Tap the heart on any product to keep it here.
          </p>
          <Button asChild variant="emerald" size="lg" className="mt-6">
            <Link to="/shop">Browse the shop</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {saved.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
