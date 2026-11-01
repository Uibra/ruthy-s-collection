import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";

import { seo } from "@/components/site/PageIntro";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatNaira, useShopSettings } from "@/lib/shop-config";
import { useStore } from "@/lib/store";
import { whatsappCart } from "@/lib/whatsapp";

export const Route = createFileRoute("/checkout")({
  head: () => {
    const h = seo("Checkout — Ruthys Collection", "Confirm your delivery details and send your order to Ruthys Collection.");
    return { meta: [...h.meta, { name: "robots", content: "noindex" }] };
  },
  component: Checkout,
});

const schema = z.object({
  name: z.string().trim().min(1, "Please add your name").max(100),
  phone: z.string().trim().regex(/^[0-9+ ]{7,20}$/, "Please add a valid phone number"),
  address: z.string().trim().max(300),
  notes: z.string().trim().max(500),
});

function Checkout() {
  const shop = useShopSettings();
  const { detailedCart, subtotal, clearCart, hydrated } = useStore();
  const [method, setMethod] = useState<"home" | "pickup">("home");
  const [form, setForm] = useState({ name: "", phone: "", address: "", notes: "" });
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const delivery =
    method === "pickup" || subtotal >= shop.delivery.freeOver ? 0 : shop.delivery.homeFee;
  const total = subtotal + delivery;

  if (done)
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <p className="eyebrow text-muted-foreground">Thank you</p>
        <h1 className="mt-3 font-display text-4xl">Your order is on its way to us</h1>
        <p className="mt-4 text-sm text-muted-foreground">Finish sending the WhatsApp message and we'll confirm payment and delivery shortly.</p>
        <Button asChild variant="emerald" size="lg" className="mt-8"><Link to="/shop">Continue shopping</Link></Button>
      </div>
    );

  if (hydrated && detailedCart.length === 0)
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-display text-4xl">Your cart is empty</h1>
        <Button asChild variant="emerald" size="lg" className="mt-8"><Link to="/shop">Browse the collection</Link></Button>
      </div>
    );

  function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    const r = schema.safeParse(form);
    if (!r.success) return setError(r.error.issues[0]?.message ?? "Please check the form");
    if (method === "home" && r.data.address.length < 5) return setError("Please add your delivery address");
    setError("");
    const extra = [
      `Delivery: ${method === "home" ? `Home delivery (${delivery === 0 ? "free" : formatNaira(delivery)})` : "Pickup"}`,
      `Name: ${r.data.name}`,
      `Phone: ${r.data.phone}`,
      method === "home" ? `Address: ${r.data.address}` : "",
      r.data.notes ? `Notes: ${r.data.notes}` : "",
    ].filter(Boolean).join("\n");
    const url = whatsappCart(
      detailedCart.map(({ product, line }) => ({ name: product.name, quantity: line.quantity, price: product.price, options: line.options })),
      total,
      extra,
    );
    window.open(url, "_blank");
    clearCart();
    setDone(true);
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <form onSubmit={placeOrder} className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[3fr_2fr]">
      <div className="space-y-6">
        <h1 className="rule-gold font-display text-4xl">Checkout</h1>
        <fieldset className="grid gap-3 sm:grid-cols-2">
          <legend className="eyebrow mb-3 text-muted-foreground">Delivery method</legend>
          {(["home", "pickup"] as const).map((m) => (
            <label key={m} className={`cursor-pointer border p-4 text-sm ${method === m ? "border-primary bg-secondary" : "border-border bg-card"}`}>
              <input type="radio" name="method" className="sr-only" checked={method === m} onChange={() => setMethod(m)} />
              <span className="font-medium">{m === "home" ? "Home delivery" : `Pickup in ${shop.location}`}</span>
              <span className="mt-1 block text-muted-foreground">{m === "home" ? formatNaira(shop.delivery.homeFee) : "Free"}</span>
            </label>
          ))}
        </fieldset>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input placeholder="Full name" value={form.name} onChange={set("name")} maxLength={100} aria-label="Full name" />
          <Input placeholder="Phone number" value={form.phone} onChange={set("phone")} maxLength={20} aria-label="Phone number" inputMode="tel" />
        </div>
        {method === "home" && <Textarea placeholder="Delivery address" value={form.address} onChange={set("address")} maxLength={300} aria-label="Delivery address" />}
        <Textarea placeholder="Order notes (gift wrap, promo code…)" value={form.notes} onChange={set("notes")} maxLength={500} aria-label="Order notes" />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
      <aside className="h-fit border border-border bg-card p-6 shadow-soft">
        <h2 className="font-display text-2xl">Your order</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {detailedCart.map(({ product, line, lineTotal }, i) => (
            <li key={i} className="flex justify-between gap-3"><span>{line.quantity} × {product.name}</span><span>{formatNaira(lineTotal)}</span></li>
          ))}
        </ul>
        <dl className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
          <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>{formatNaira(subtotal)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Delivery</dt><dd>{delivery === 0 ? "Free" : formatNaira(delivery)}</dd></div>
          <div className="flex justify-between text-base font-medium"><dt>Total</dt><dd>{formatNaira(total)}</dd></div>
        </dl>
        <Button type="submit" variant="emerald" size="lg" className="mt-6 w-full">Place order on WhatsApp</Button>
      </aside>
    </form>
  );
}
