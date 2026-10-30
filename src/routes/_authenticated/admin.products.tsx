import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { Button } from "@/components/ui/button";
import { deleteProduct } from "@/lib/catalog.functions";
import { useProducts } from "@/lib/catalog";
import { formatNaira } from "@/lib/shop-config";

export const Route = createFileRoute("/_authenticated/admin/products")({
  component: AdminProductsPage,
});

function AdminProductsPage() {
  const products = useProducts();
  const qc = useQueryClient();
  const remove = useServerFn(deleteProduct);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This can't be undone.`)) return;
    await remove({ data: { id } });
    await qc.invalidateQueries({ queryKey: ["products"] });
  }

  return (
    <div className="mt-6 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="eyebrow text-muted-foreground">Catalog</p>
          <h1 className="font-display text-3xl">Products</h1>
        </div>
        <Button asChild variant="emerald">
          <Link to="/admin/products/$id" params={{ id: "new" }}>Add product</Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {products.map((product) => (
          <div key={product.id} className="flex flex-col gap-4 border border-border bg-card p-4 md:flex-row md:items-center">
            <div className="h-20 w-20 overflow-hidden rounded-md border border-border bg-muted/40">
              {product.images?.[0] ? (
                <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-muted-foreground">No photo</div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-medium">{product.name}</h2>
                <span className="rounded bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                  {product.category}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{formatNaira(product.price)}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Stock: {product.stock} · {product.stock <= 0 ? "Out of stock" : product.stock <= 5 ? "Low stock" : "In stock"}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 md:ml-auto">
              <Button asChild variant="outline" size="sm">
                <Link to="/admin/products/$id" params={{ id: product.id }}>Edit</Link>
              </Button>
              <Button variant="destructive" size="sm" onClick={() => handleDelete(product.id, product.name)}>
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
