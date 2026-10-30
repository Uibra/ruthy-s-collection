import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ProductImage } from "@/components/shop/ProductImage";
import { recommendProducts } from "@/lib/catalog.functions";
import type { Product } from "@/lib/products";
import { formatNaira } from "@/lib/shop-config";

const ideas = [
  "A long-lasting perfume gift for my mum under ₦40,000",
  "Gold earrings for a wedding guest outfit",
  "A bag that fits my laptop for work",
];

type Result = { ok: boolean; message: string; picks: { product: Product; reason: string }[] };

export function FindAssistant() {
  const ask = useServerFn(recommendProducts);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  async function submit(text = query) {
    const q = text.trim();
    if (q.length < 2 || loading) return;
    setQuery(q);
    setLoading(true);
    setResult(null);
    try {
      setResult((await ask({ data: { query: q } })) as Result);
    } catch {
      setResult({ ok: false, message: "The assistant couldn't answer just now. Please try again.", picks: [] });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="surface-emerald">
      <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
        <p className="eyebrow text-gold">Personal shopper</p>
        <h2 className="mt-3 font-display text-3xl sm:text-4xl">Help me find it</h2>
        <p className="mt-2 max-w-xl text-sm opacity-85">
          Tell us who it's for, the occasion and your budget — we'll pick the best matches from our collection.
        </p>
        <form
          className="mt-6 flex flex-col gap-3 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <Textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            maxLength={500}
            rows={2}
            placeholder="e.g. A sweet perfume for date night under ₦30,000"
            aria-label="Describe what you're looking for"
            className="min-h-[3.25rem] flex-1 resize-none bg-card text-foreground"
          />
          <Button type="submit" variant="gilded" size="lg" disabled={loading || query.trim().length < 2} className="sm:self-stretch">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            {loading ? "Finding…" : "Find it"}
          </Button>
        </form>
        <div className="mt-3 flex flex-wrap gap-2">
          {ideas.map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => submit(i)}
              className="border border-gold/40 px-3 py-1 text-xs opacity-85 transition hover:opacity-100"
            >
              {i}
            </button>
          ))}
        </div>

        {result && (
          <div className="mt-8" aria-live="polite">
            <p className="font-display text-xl">{result.message}</p>
            {result.picks.length > 0 && (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {result.picks.map(({ product, reason }) => (
                  <Link
                    key={product.id}
                    to="/shop/$slug"
                    params={{ slug: product.slug }}
                    className="card-hover flex gap-4 bg-card p-3 text-card-foreground"
                  >
                    <div className="w-24 shrink-0">
                      <ProductImage product={product} />
                    </div>
                    <div className="min-w-0">
                      <p className="eyebrow text-muted-foreground">{product.category}</p>
                      <p className="font-display text-lg leading-tight">{product.name}</p>
                      <p className="text-sm text-primary">{formatNaira(product.price)}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{reason}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
