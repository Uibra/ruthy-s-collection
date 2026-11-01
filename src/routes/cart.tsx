import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageCircle, Minus, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/shop/ProductImage";
import { formatNaira, useShopSettings } from "@/lib/shop-config";
import { useStore } from "@/lib/store";
import { whatsappCart } from "@/lib/whatsapp";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — Ruthys Collection" },
      { name: "description", content: "Review your selected items before checkout." },
      { property: "og:title", content: "Your Cart — Ruthys Collection" },
      { property: "og:description", content: "Review your items, then checkout or order on WhatsApp." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const shop = useShopSettings();
  const { detailedCart, setQuantity, removeLine, subtotal, hydrated } = useStore();
  const delivery = subtotal >= shop.delivery.freeOver || subtotal === 0 ? 0 : shop.delivery.homeFee;

  if (!hydrated) return <div className="mx-auto max-w-7xl px-4 py-20" />;

  if (detailedCart.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-display text-4xl">Your cart is empty</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Browse the collection and add something you love.
        </p>
        <Button asChild variant="emerald" size="lg" className="mt-8">
          <Link to="/shop">Continue shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="rule-gold font-display text-4xl">Your cart</h1>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="divide-y divide-border border-y border-border">
          {detailedCart.map(({ line, product, lineTotal }, index) => (
            <div key={`${product.id}-${index}`} className="flex gap-4 py-5">
              <Link
                to="/shop/$slug"
                params={{ slug: product.slug }}
                className="h-24 w-20 shrink-0 overflow-hidden border border-border"
              >
                <ProductImage product={product} />
              </Link>
              <div className="flex-1">
                <h2 className="font-display text-lg">
                  <Link to="/shop/$slug" params={{ slug: product.slug }}>
                    {product.name}
                  </Link>
                </h2>
                <p className="text-xs text-muted-foreground">
                  {Object.entries(line.options).map(([k, v]) => `${k}: ${v}`).join(" · ") ||
                    product.category}
                </p>
                <p className="mt-1 text-sm">{formatNaira(product.price)}</p>

                <div className="mt-3 flex items-center gap-4">
                  <div className="flex items-center border border-border">
                    <button
                      className="grid h-9 w-9 place-items-center"
                      aria-label="Decrease quantity"
                      onClick={() => setQuantity(index, line.quantity - 1)}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-9 text-center text-sm">{line.quantity}</span>
                    <button
                      className="grid h-9 w-9 place-items-center"
                      aria-label="Increase quantity"
                      onClick={() => setQuantity(index, line.quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                    onClick={() => removeLine(index)}
                  >
                    <Trash2 className="h-4 w-4" /> Remove
                  </button>
                </div>
              </div>
              <p className="font-medium">{formatNaira(lineTotal)}</p>
            </div>
          ))}
        </div>

        <aside className="h-fit border border-border bg-card p-6 shadow-soft">
          <h2 className="font-display text-2xl">Order summary</h2>
          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>{formatNaira(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Delivery (estimate)</dt>
              <dd>{delivery === 0 ? "Free" : formatNaira(delivery)}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-3 text-base font-medium">
              <dt>Total</dt>
              <dd>{formatNaira(subtotal + delivery)}</dd>
            </div>
          </dl>

          <Button asChild variant="emerald" size="lg" className="mt-6 w-full">
            <Link to="/checkout">Proceed to checkout</Link>
          </Button>
          <Button asChild variant="gilded" size="lg" className="mt-3 w-full">
            <a
              href={whatsappCart(
                detailedCart.map(({ product, line }) => ({
                  name: product.name,
                  quantity: line.quantity,
                  price: product.price,
                  options: line.options,
                })),
                subtotal + delivery,
              )}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle /> Order via WhatsApp
            </a>
          </Button>
          <Button asChild variant="ghost" className="mt-2 w-full">
            <Link to="/shop">Continue shopping</Link>
          </Button>
          <p className="mt-4 text-xs text-muted-foreground">
            Free delivery on orders over {formatNaira(shop.delivery.freeOver)}.
          </p>
        </aside>
      </div>
    </div>
  );
}
