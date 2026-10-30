import { Link } from "@tanstack/react-router";
import { Heart, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/shop/ProductImage";
import { formatNaira } from "@/lib/shop-config";
import { productBadge, stockStatus, type Product } from "@/lib/products";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart, toggleWishlist, isWishlisted } = useStore();
  const badge = productBadge(product);
  const status = stockStatus(product.stock);
  const wished = isWishlisted(product.id);

  return (
    <article className="group card-hover relative flex flex-col overflow-hidden border border-border bg-card shadow-soft">
      <Link
        to="/shop/$slug"
        params={{ slug: product.slug }}
        className="relative block aspect-[4/5] overflow-hidden"
      >
        <ProductImage
          product={product}
          className="transition-transform duration-700 group-hover:scale-105"
        />
        {badge && (
          <span
            className={cn(
              "absolute left-3 top-3 px-2.5 py-1 text-[0.625rem] font-medium uppercase tracking-[0.18em]",
              badge === "Sale" ? "surface-gold" : "surface-emerald",
            )}
          >
            {badge}
          </span>
        )}
      </Link>

      <button
        type="button"
        aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
        onClick={() => {
          toggleWishlist(product.id);
          toast(wished ? "Removed from wishlist" : "Saved to your wishlist");
        }}
        className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full border border-border bg-card/90 backdrop-blur transition-colors hover:border-gold"
      >
        <Heart
          className={cn("h-4 w-4", wished ? "fill-destructive text-destructive" : "text-muted-foreground")}
        />
      </button>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="eyebrow text-muted-foreground">{product.category}</p>
        <h3 className="font-display text-lg leading-snug">
          <Link to="/shop/$slug" params={{ slug: product.slug }}>
            {product.name}
          </Link>
        </h3>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-base font-medium">{formatNaira(product.price)}</span>
          {product.comparePrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatNaira(product.comparePrice)}
            </span>
          )}
        </div>
        <p
          className={cn(
            "text-xs",
            status === "Out of Stock"
              ? "text-destructive"
              : status === "Low Stock"
                ? "text-gold-foreground"
                : "text-muted-foreground",
          )}
        >
          {status}
        </p>

        <Button
          variant={status === "Out of Stock" ? "outline" : "emerald"}
          className="mt-4 w-full"
          disabled={status === "Out of Stock"}
          onClick={() => {
            addToCart(product.id, 1);
            toast.success(`${product.name} added to cart`);
          }}
        >
          <ShoppingBag />
          {status === "Out of Stock" ? "Sold out" : "Add to cart"}
        </Button>
      </div>
    </article>
  );
}
