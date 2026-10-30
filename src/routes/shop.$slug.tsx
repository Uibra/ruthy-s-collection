import { useState } from "react";
import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { Heart, Minus, MessageCircle, Plus, ShieldCheck, Star, Truck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/shop/ProductImage";
import { ProductCard } from "@/components/shop/ProductCard";
import { stockStatus } from "@/lib/products";
import { productsQuery, useProducts } from "@/lib/catalog";
import { formatNaira } from "@/lib/shop-config";
import { whatsappProduct } from "@/lib/whatsapp";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/shop/$slug")({
  loader: async ({ params, context }) => {
    const all = await context.queryClient.ensureQueryData(productsQuery);
    const product = all.find((p) => p.slug === params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Product not found — Ruthy's Collection" }, { name: "robots", content: "noindex" }],
      };
    }
    const { product } = loaderData;
    const title = `${product.name} — Ruthy's Collection`;
    return {
      meta: [
        { title },
        { name: "description", content: product.description },
        { property: "og:title", content: title },
        { property: "og:description", content: product.description },
      ],
    };
  },
  component: ProductDetail,
});

function ProductDetail() {
  const { product: loaded } = Route.useLoaderData();
  const products = useProducts();
  const product = products.find((p) => p.slug === loaded.slug) ?? loaded;
  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [gallery, setGallery] = useState(0);
  const [options, setOptions] = useState<Record<string, string>>(() =>
    Object.fromEntries((product.options ?? []).map((o) => [o.label, o.values[0] ?? ""])),
  );

  const status = stockStatus(product.stock);
  const soldOut = status === "Out of Stock";
  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <nav className="text-xs text-muted-foreground">
        <Link to="/" className="hover:text-primary">Home</Link> /{" "}
        <Link to="/shop" search={{ q: "", category: "", sort: "newest" }} className="hover:text-primary">
          Shop
        </Link>{" "}
        /{" "}
        <Link
          to="/shop"
          search={{ q: "", category: product.category, sort: "newest" }}
          className="hover:text-primary"
        >
          {product.category}
        </Link>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div>
          <div className="aspect-square overflow-hidden border border-border bg-card">
            <ProductImage product={product} index={gallery} />
          </div>
          <div className="mt-3 grid grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <button
                key={i}
                onClick={() => setGallery(i)}
                aria-label={`View image ${i + 1}`}
                className={cn(
                  "aspect-square overflow-hidden border",
                  gallery === i ? "border-gold" : "border-border",
                )}
              >
                <ProductImage product={product} index={i} />
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="eyebrow text-muted-foreground">{product.category}</p>
          <h1 className="mt-3 font-display text-4xl">{product.name}</h1>

          <div className="mt-3 flex items-center gap-2 text-sm">
            <span className="flex text-gold">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  className={cn("h-4 w-4", n <= Math.round(product.rating) && "fill-gold")}
                />
              ))}
            </span>
            <span className="text-muted-foreground">
              {product.rating} ({product.reviews} reviews)
            </span>
          </div>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="font-display text-3xl">{formatNaira(product.price)}</span>
            {product.comparePrice && (
              <span className="text-lg text-muted-foreground line-through">
                {formatNaira(product.comparePrice)}
              </span>
            )}
          </div>

          <p
            className={cn(
              "mt-2 text-sm",
              soldOut ? "text-destructive" : status === "Low Stock" ? "text-gold-foreground" : "text-primary",
            )}
          >
            Availability: {status}
            {status === "Low Stock" && ` — only ${product.stock} left`}
          </p>

          <p className="mt-6 leading-relaxed text-muted-foreground">{product.description}</p>

          {product.options?.map((opt) => (
            <div key={opt.label} className="mt-6">
              <p className="eyebrow text-muted-foreground">{opt.label}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {opt.values.map((v) => (
                  <button
                    key={v}
                    onClick={() => setOptions((prev) => ({ ...prev, [opt.label]: v }))}
                    className={cn(
                      "border px-4 py-2 text-sm",
                      options[opt.label] === v
                        ? "border-gold surface-gold"
                        : "border-border text-muted-foreground",
                    )}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="mt-6 flex items-center gap-4">
            <p className="eyebrow text-muted-foreground">Quantity</p>
            <div className="flex items-center border border-border">
              <button
                className="grid h-10 w-10 place-items-center"
                aria-label="Decrease quantity"
                onClick={() => setQuantity((n) => Math.max(1, n - 1))}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center text-sm">{quantity}</span>
              <button
                className="grid h-10 w-10 place-items-center"
                aria-label="Increase quantity"
                onClick={() => setQuantity((n) => n + 1)}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button
              variant="emerald"
              size="lg"
              className="flex-1"
              disabled={soldOut}
              onClick={() => {
                addToCart(product.id, quantity, options);
                toast.success(`${product.name} added to cart`);
              }}
            >
              {soldOut ? "Sold out" : "Add to cart"}
            </Button>
            <Button
              variant="gold"
              size="lg"
              className="flex-1"
              disabled={soldOut}
              onClick={() => {
                addToCart(product.id, quantity, options);
                navigate({ to: "/checkout" });
              }}
            >
              Buy now
            </Button>
          </div>

          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="gilded" size="lg" className="flex-1">
              <a href={whatsappProduct(product, quantity, options)} target="_blank" rel="noreferrer">
                <MessageCircle /> Order via WhatsApp
              </a>
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                toggleWishlist(product.id);
                toast(isWishlisted(product.id) ? "Removed from wishlist" : "Saved to your wishlist");
              }}
            >
              <Heart className={cn(isWishlisted(product.id) && "fill-destructive text-destructive")} />
              Wishlist
            </Button>
          </div>

          <ul className="mt-8 space-y-2 border-t border-border pt-6 text-sm text-muted-foreground">
            {product.details.map((d) => (
              <li key={d}>• {d}</li>
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-2"><Truck className="h-4 w-4 text-primary" /> Delivery within 1–5 working days</span>
            <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Checked before it ships</span>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="font-display text-3xl">You may also like</h2>
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
