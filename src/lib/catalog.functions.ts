import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";
import { rowToProduct, type ProductRow } from "./catalog-shared";

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      // Opaque sb_ keys aren't JWTs; send only apikey, not the default Authorization bearer.
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

async function fetchAll() {
  const { data, error } = await publicClient().from("products").select("*").order("added_at", { ascending: false });
  if (error) throw new Error("Could not load products");
  return (data as ProductRow[]).map(rowToProduct);
}

export const listProducts = createServerFn({ method: "GET" }).handler(fetchAll);

/** Whether a new account can still be created — the shop allows exactly one owner account, ever. */
export const isSignupOpen = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await publicClient().rpc("signup_open");
  return { open: !error && Boolean(data) };
});

export const recommendProducts = createServerFn({ method: "POST" })
  .validator((d) => z.object({ query: z.string().trim().min(2).max(500) }).parse(d))
  .handler(async ({ data }) => {
    const { askModel, AiError } = await import("./ai-gateway.server");
    const products = await fetchAll();
    const catalogue = products
      .map(
        (p) =>
          `id=${p.id} | ${p.name} | ${p.category} | ₦${p.price}${p.stock <= 0 ? " | SOLD OUT" : ""} | ${p.description} | ${p.details.join("; ")}${
            p.options?.length ? " | options: " + p.options.map((o) => `${o.label}: ${o.values.join("/")}`).join(", ") : ""
          }`,
      )
      .join("\n");
    const system = `You are the friendly shopping assistant for Ruthys Collection, a Nigerian boutique. Prices are in Naira.
Only recommend products from this catalogue:
${catalogue}

Reply with ONLY JSON, no markdown: {"message": string, "picks": [{"id": string, "reason": string}]}
- "message": one or two warm sentences.
- "picks": up to 4 best matches, best first; "reason" under 20 words. Respect budgets. Prefer in-stock items.
- If nothing fits, return an empty picks array and suggest what they could try instead.`;
    try {
      const text = await askModel([{ role: "user", content: data.query }], system);
      const json = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1)) as {
        message?: string;
        picks?: { id: string; reason: string }[];
      };
      const byId = new Map(products.map((p) => [p.id, p]));
      const picks = (json.picks ?? [])
        .filter((p) => byId.has(p.id))
        .slice(0, 4)
        .map((p) => ({ product: byId.get(p.id)!, reason: String(p.reason ?? "").slice(0, 200) }));
      return { ok: true as const, message: String(json.message ?? ""), picks };
    } catch (e) {
      const msg = e instanceof AiError ? e.message : "The assistant couldn't answer just now. Please try again.";
      return { ok: false as const, message: msg, picks: [] };
    }
  });

// ---------- Admin ----------

export const checkAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("claim_first_admin");
    if (error) throw new Error("Could not check access");
    return { isAdmin: Boolean(data) };
  });

async function assertAdmin(supabase: { rpc: (fn: "has_role", args: { _user_id: string; _role: "admin" }) => PromiseLike<{ data: unknown }> }, userId: string) {
  const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (!data) throw new Error("Admins only");
}

const productInput = z.object({
  id: z.string().optional(),
  slug: z.string().trim().min(1).max(120),
  name: z.string().trim().min(1).max(200),
  category: z.string().trim().min(1).max(60),
  price: z.number().int().min(0),
  comparePrice: z.number().int().min(0).nullable(),
  stock: z.number().int().min(0),
  rating: z.number().min(0).max(5),
  reviews: z.number().int().min(0),
  featured: z.boolean(),
  bestSeller: z.boolean(),
  newArrival: z.boolean(),
  description: z.string().max(3000),
  details: z.array(z.string().max(300)).max(30),
  options: z.array(z.object({ label: z.string().max(60), values: z.array(z.string().max(60)).max(30) })).max(10),
  images: z.array(z.string().url()).max(12),
});

export const saveProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d) => productInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase as never, context.userId);
    const row = {
      slug: data.slug,
      name: data.name,
      category: data.category,
      price: data.price,
      compare_price: data.comparePrice,
      stock: data.stock,
      rating: data.rating,
      reviews: data.reviews,
      featured: data.featured,
      best_seller: data.bestSeller,
      new_arrival: data.newArrival,
      description: data.description,
      details: data.details,
      options: data.options,
      images: data.images,
      updated_at: new Date().toISOString(),
    };
    const q = data.id
      ? context.supabase.from("products").update(row).eq("id", data.id).select("id").single()
      : context.supabase.from("products").insert(row).select("id").single();
    const { data: saved, error } = await q;
    if (error) throw new Error(error.code === "23505" ? "Another product already uses that web address" : "Could not save product");
    return { id: saved.id };
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d) => z.object({ id: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase as never, context.userId);
    const { error } = await context.supabase.from("products").delete().eq("id", data.id);
    if (error) throw new Error("Could not delete product");
    return { ok: true };
  });

export const writeDescription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d) =>
    z
      .object({
        name: z.string().trim().min(1).max(200),
        category: z.string().max(60),
        notes: z.string().max(2000),
        imageUrl: z.string().url().nullable(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase as never, context.userId);
    const { askModel, AiError } = await import("./ai-gateway.server");
    const system = `You write product copy for Ruthys Collection, a premium Nigerian boutique. Tone: warm, elegant, confident, never cheesy. Use only facts from the owner's notes and the photo; never invent materials, sizes or brands.
Reply with ONLY JSON, no markdown: {"description": string, "details": string[]}
- "description": 2–3 sentences, under 70 words.
- "details": 3–5 short bullet facts (under 8 words each).`;
    const content: ({ type: "text"; text: string } | { type: "image"; image: URL })[] = [
      { type: "text", text: `Product: ${data.name}\nCategory: ${data.category}\nOwner's notes: ${data.notes || "(none)"}` },
    ];
    if (data.imageUrl) content.push({ type: "image", image: new URL(data.imageUrl) });
    try {
      const text = await askModel([{ role: "user", content }], system);
      const json = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1)) as {
        description?: string;
        details?: string[];
      };
      return {
        ok: true as const,
        description: String(json.description ?? ""),
        details: (json.details ?? []).map(String).slice(0, 8),
      };
    } catch (e) {
      return { ok: false as const, error: e instanceof AiError ? e.message : "Couldn't write a description just now." };
    }
  });

export const uploadProductImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d) =>
    z.object({ fileName: z.string().max(200), contentType: z.string().regex(/^image\//), base64: z.string().max(14_000_000) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase as never, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const ext = data.fileName.split(".").pop()?.replace(/[^a-z0-9]/gi, "").slice(0, 5) || "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;
    const bytes = Uint8Array.from(atob(data.base64), (c) => c.charCodeAt(0));
    const { error } = await supabaseAdmin.storage.from("product-images").upload(path, bytes, { contentType: data.contentType });
    if (error) throw new Error("Upload failed");
    const { data: signed, error: sErr } = await supabaseAdmin.storage
      .from("product-images")
      .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
    if (sErr || !signed) throw new Error("Upload failed");
    return { url: signed.signedUrl };
  });
