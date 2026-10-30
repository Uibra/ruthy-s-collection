import { cn } from "@/lib/utils";
import type { Product } from "@/lib/products";

/**
 * Shows the product photo when one exists, otherwise an on-brand placeholder
 * tile so the catalogue looks finished before real photos arrive.
 */
export function ProductImage({
  product,
  index = 0,
  className,
}: {
  product: Product;
  index?: number;
  className?: string;
}) {
  const src = product.images[index];

  if (src) {
    return (
      <img
        src={src}
        alt={product.name}
        loading="lazy"
        className={cn("h-full w-full object-cover", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "relative flex h-full w-full flex-col items-center justify-center surface-cream",
        className,
      )}
      aria-hidden="true"
    >
      <div className="absolute inset-3 border border-gold/30" />
      <span className="font-display text-3xl text-primary/70">RC</span>
      <span className="eyebrow mt-2 text-muted-foreground">{product.category}</span>
      <span className="mt-1 text-[0.625rem] tracking-wider text-muted-foreground/70">
        Photo coming soon
      </span>
    </div>
  );
}
