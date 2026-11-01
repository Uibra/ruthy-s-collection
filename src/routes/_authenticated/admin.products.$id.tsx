import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, ArrowRight, Sparkles, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { deleteProduct, saveProduct, uploadProductImage, writeDescription } from "@/lib/catalog.functions";
import { useProducts } from "@/lib/catalog";
import { categories } from "@/lib/products";

export const Route = createFileRoute("/_authenticated/admin/products/$id")({
  component: Editor,
});

type Form = {
  name: string;
  slug: string;
  category: string;
  price: string;
  comparePrice: string;
  stock: string;
  description: string;
  details: string;
  options: string;
  images: string[];
  featured: boolean;
  bestSeller: boolean;
  newArrival: boolean;
  rating: number;
  reviews: number;
};

const empty: Form = {
  name: "",
  slug: "",
  category: categories[0]!.name,
  price: "",
  comparePrice: "",
  stock: "0",
  description: "",
  details: "",
  options: "",
  images: [],
  featured: false,
  bestSeller: false,
  newArrival: true,
  rating: 5,
  reviews: 0,
};

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 120);

function Editor() {
  const { id } = Route.useParams();
  const isNew = id === "new";
  const products = useProducts();
  const existing = products.find((p) => p.id === id);
  const [f, setF] = useState<Form>(empty);
  const [loaded, setLoaded] = useState(isNew);
  const [busy, setBusy] = useState<"" | "save" | "upload" | "ai" | "delete">("");
  const qc = useQueryClient();
  const navigate = useNavigate();
  const save = useServerFn(saveProduct);
  const remove = useServerFn(deleteProduct);
  const upload = useServerFn(uploadProductImage);
  const describe = useServerFn(writeDescription);

  useEffect(() => {
    if (loaded || !existing) return;
    setF({
      name: existing.name,
      slug: existing.slug,
      category: existing.category,
      price: String(existing.price),
      comparePrice: existing.comparePrice ? String(existing.comparePrice) : "",
      stock: String(existing.stock),
      description: existing.description,
      details: existing.details.join("\n"),
      options: (existing.options ?? []).map((o) => `${o.label}: ${o.values.join(", ")}`).join("\n"),
      images: existing.images,
      featured: Boolean(existing.featured),
      bestSeller: Boolean(existing.bestSeller),
      newArrival: Boolean(existing.newArrival),
      rating: existing.rating,
      reviews: existing.reviews,
    });
    setLoaded(true);
  }, [existing, loaded]);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((x) => ({ ...x, [k]: v }));

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setBusy("upload");
    try {
      for (const file of Array.from(files)) {
        if (file.size > 10_000_000) {
          toast.error(`${file.name} is over 10MB`);
          continue;
        }
        const buf = new Uint8Array(await file.arrayBuffer());
        let bin = "";
        for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode(...buf.subarray(i, i + 0x8000));
        const { url } = await upload({ data: { fileName: file.name, contentType: file.type || "image/jpeg", base64: btoa(bin) } });
        setF((x) => ({ ...x, images: [...x.images, url] }));
      }
      toast.success("Photo uploaded — remember to save");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy("");
    }
  }

  function move(i: number, d: -1 | 1) {
    const imgs = [...f.images];
    const j = i + d;
    if (j < 0 || j >= imgs.length) return;
    [imgs[i], imgs[j]] = [imgs[j]!, imgs[i]!];
    set("images", imgs);
  }

  async function aiWrite(): Promise<void> {
    if (!f.name.trim()) {
      toast.error("Add a product name first");
      return;
    }
    setBusy("ai");
    try {
      const r = await describe({
        data: { name: f.name, category: f.category, notes: `${f.details}\n${f.description}`.trim(), imageUrl: f.images[0] ?? null },
      });
      if (!r.ok) {
        toast.error(r.error);
        return;
      }
      setF((x) => ({ ...x, description: r.description, details: r.details.length ? r.details.join("\n") : x.details }));
      toast.success("Description written — review and save");
    } finally {
      setBusy("");
    }
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setBusy("save");
    try {
      const options = f.options
        .split("\n")
        .map((l) => l.split(":"))
        .filter((p) => p.length >= 2 && p[0]!.trim())
        .map(([label, rest]) => ({
          label: label!.trim(),
          values: rest!.split(",").map((v) => v.trim()).filter(Boolean),
        }));
      const res = await save({
        data: {
          ...(isNew ? {} : { id }),
          slug: f.slug.trim() || slugify(f.name),
          name: f.name,
          category: f.category,
          price: Math.round(Number(f.price) || 0),
          comparePrice: f.comparePrice ? Math.round(Number(f.comparePrice)) : null,
          stock: Math.max(0, Math.round(Number(f.stock) || 0)),
          rating: f.rating,
          reviews: f.reviews,
          featured: f.featured,
          bestSeller: f.bestSeller,
          newArrival: f.newArrival,
          description: f.description,
          details: f.details.split("\n").map((s) => s.trim()).filter(Boolean),
          options,
          images: f.images,
        },
      });
      qc.setQueryData(["products"], (current: unknown) => {
        const list = Array.isArray(current) ? [...current] : [];
        const item = {
          id: res.id,
          slug: f.slug.trim() || slugify(f.name),
          name: f.name,
          category: f.category,
          price: Math.round(Number(f.price) || 0),
          comparePrice: f.comparePrice ? Math.round(Number(f.comparePrice)) : undefined,
          stock: Math.max(0, Math.round(Number(f.stock) || 0)),
          rating: f.rating,
          reviews: f.reviews,
          addedAt: new Date().toISOString(),
          featured: f.featured,
          bestSeller: f.bestSeller,
          newArrival: f.newArrival,
          description: f.description,
          details: f.details.split("\n").map((s) => s.trim()).filter(Boolean),
          options: (f.options
            .split("\n")
            .map((l) => l.split(":"))
            .filter((p) => p.length >= 2 && p[0]!.trim())
            .map(([label, rest]) => ({
              label: label!.trim(),
              values: rest!.split(",").map((v) => v.trim()).filter(Boolean),
            }))),
          images: f.images,
        };

        const index = list.findIndex((product: any) => product.id === res.id);
        if (index >= 0) list[index] = item;
        else list.unshift(item);
        return list;
      });
      await qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("Saved — live on the shop now");
      if (isNew) navigate({ to: "/admin/products/$id", params: { id: res.id }, replace: true });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save");
    } finally {
      setBusy("");
    }
  }

  async function onDelete() {
    if (!confirm(`Delete "${f.name}"? This can't be undone.`)) return;
    setBusy("delete");
    try {
      await remove({ data: { id } });
      await qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deleted");
      navigate({ to: "/admin" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not delete");
      setBusy("");
    }
  }

  if (!loaded) return <p className="p-10 text-center text-sm text-muted-foreground">Loading…</p>;

  return (
    <form onSubmit={onSave} className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-5">
        <Link to="/admin" className="text-xs text-muted-foreground">← All products</Link>
        <h1 className="font-display text-3xl">{isNew ? "New product" : f.name}</h1>

        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" required value={f.name} onChange={(e) => set("name", e.target.value)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="cat">Category</Label>
            <select
              id="cat"
              value={f.category}
              onChange={(e) => set("category", e.target.value)}
              className="h-9 w-full border border-input bg-card px-3 text-sm"
            >
              {categories.map((c) => (
                <option key={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Web address (optional)</Label>
            <Input id="slug" placeholder={slugify(f.name)} value={f.slug} onChange={(e) => set("slug", slugify(e.target.value))} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Price (₦)</Label>
            <Input id="price" type="number" min={0} required value={f.price} onChange={(e) => set("price", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cmp">Was price (₦)</Label>
            <Input id="cmp" type="number" min={0} placeholder="—" value={f.comparePrice} onChange={(e) => set("comparePrice", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stock">Stock</Label>
            <Input id="stock" type="number" min={0} value={f.stock} onChange={(e) => set("stock", e.target.value)} />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="desc">Description</Label>
            <Button type="button" size="sm" variant="gold" onClick={aiWrite} disabled={busy !== ""}>
              <Sparkles /> {busy === "ai" ? "Writing…" : "Write with AI"}
            </Button>
          </div>
          <Textarea id="desc" rows={5} value={f.description} onChange={(e) => set("description", e.target.value)} />
          <p className="text-xs text-muted-foreground">
            AI uses the name, key details below and the first photo.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="details">Key details (one per line)</Label>
          <Textarea id="details" rows={4} value={f.details} onChange={(e) => set("details", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="opts">Options (e.g. "Size: S, M, L", one per line)</Label>
          <Textarea id="opts" rows={2} value={f.options} onChange={(e) => set("options", e.target.value)} />
        </div>
      </div>

      <aside className="space-y-6">
        <div className="border border-border bg-card p-4">
          <p className="eyebrow text-muted-foreground">Photos</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {f.images.map((src, i) => (
              <div key={src} className="relative border border-border">
                <img src={src} alt="" className="aspect-square w-full object-cover" />
                {i === 0 && <span className="absolute left-1 top-1 surface-gold px-1.5 text-[10px]">Main</span>}
                <div className="flex justify-between bg-background/90 p-1">
                  <button type="button" aria-label="Move left" onClick={() => move(i, -1)}><ArrowLeft className="h-4 w-4" /></button>
                  <button type="button" aria-label="Remove photo" onClick={() => set("images", f.images.filter((_, k) => k !== i))}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </button>
                  <button type="button" aria-label="Move right" onClick={() => move(i, 1)}><ArrowRight className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
          </div>
          <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 border border-dashed border-border p-4 text-sm text-muted-foreground">
            <Upload className="h-4 w-4" /> {busy === "upload" ? "Uploading…" : "Upload photos"}
            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
          </label>
        </div>

        <div className="space-y-3 border border-border bg-card p-4">
          {(
            [
              ["featured", "Featured on home"],
              ["bestSeller", "Best seller"],
              ["newArrival", "New arrival"],
            ] as const
          ).map(([k, l]) => (
            <label key={k} className="flex items-center justify-between text-sm">
              {l}
              <Switch checked={f[k]} onCheckedChange={(v) => set(k, v)} />
            </label>
          ))}
        </div>

        <div className="space-y-3 border border-border bg-card p-4">
          <p className="eyebrow text-muted-foreground">Rating shown on the shop</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="rating">Stars (0–5)</Label>
              <Input id="rating" type="number" min={0} max={5} step={0.1} value={f.rating} onChange={(e) => set("rating", Math.min(5, Math.max(0, Number(e.target.value) || 0)))} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="reviews">Reviews</Label>
              <Input id="reviews" type="number" min={0} value={f.reviews} onChange={(e) => set("reviews", Math.max(0, Math.round(Number(e.target.value) || 0)))} />
            </div>
          </div>
        </div>

        <Button type="submit" variant="emerald" className="w-full" disabled={busy !== ""}>
          {busy === "save" ? "Saving…" : "Save changes"}
        </Button>
        {!isNew && (
          <Button type="button" variant="outline" className="w-full text-destructive" onClick={onDelete} disabled={busy !== ""}>
            Delete product
          </Button>
        )}
      </aside>
    </form>
  );
}
