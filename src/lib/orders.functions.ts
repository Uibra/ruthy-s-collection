import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

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

// ---------- Public: place an order / send a message ----------

const orderInput = z.object({
  name: z.string().trim().min(1).max(100),
  phone: z.string().trim().min(7).max(20),
  address: z.string().max(300),
  notes: z.string().max(500),
  method: z.enum(["home", "pickup"]),
  subtotal: z.number().int().min(0),
  deliveryFee: z.number().int().min(0),
  total: z.number().int().min(0),
  items: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(200),
        quantity: z.number().int().min(1).max(99),
        price: z.number().int().min(0),
        options: z.record(z.string().max(60), z.string().max(120)).optional(),
      }),
    )
    .min(1)
    .max(50),
});

export const createOrder = createServerFn({ method: "POST" })
  .inputValidator((d) => orderInput.parse(d))
  .handler(async ({ data }) => {
    const { data: order, error } = await publicClient()
      .from("orders")
      .insert({
        customer_name: data.name,
        customer_phone: data.phone,
        address: data.address,
        notes: data.notes,
        delivery_method: data.method,
        delivery_fee: data.deliveryFee,
        subtotal: data.subtotal,
        total: data.total,
        items: data.items,
        status: "new",
      })
      .select("id")
      .single();
    if (error || !order) throw new Error("Could not save your order");
    return { id: order.id };
  });

export const createMessage = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ name: z.string().trim().min(1).max(100), message: z.string().trim().min(1).max(1000) }).parse(d))
  .handler(async ({ data }) => {
    const { error } = await publicClient().from("customer_messages").insert({ name: data.name, message: data.message });
    if (error) throw new Error("Could not save your message");
    return { ok: true as const };
  });

// ---------- Admin: dashboard data ----------

async function assertAdmin(
  supabase: { rpc: (fn: "has_role", args: { _user_id: string; _role: "admin" }) => PromiseLike<{ data: unknown }> },
  userId: string,
) {
  const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (!data) throw new Error("Admins only");
}

export type AdminOrderItem = { name: string; quantity: number; price: number; options?: Record<string, string> };

export type AdminOrder = {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  address: string;
  notes: string;
  method: "home" | "pickup";
  deliveryFee: number;
  subtotal: number;
  total: number;
  items: AdminOrderItem[];
  status: "new" | "confirmed" | "delivered" | "cancelled";
};

export type AdminMessage = { id: string; createdAt: string; name: string; message: string; status: "new" | "read" };

const statuses = z.enum(["new", "confirmed", "delivered", "cancelled"]);

function toOrder(row: Database["public"]["Tables"]["orders"]["Row"]): AdminOrder {
  return {
    id: row.id,
    createdAt: row.created_at,
    name: row.customer_name,
    phone: row.customer_phone,
    address: row.address,
    notes: row.notes,
    method: row.delivery_method as "home" | "pickup",
    deliveryFee: row.delivery_fee,
    subtotal: row.subtotal,
    total: row.total,
    items: (row.items as AdminOrderItem[]) ?? [],
    status: statuses.parse(row.status),
  };
}

export const listOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase as never, context.userId);
    const { data, error } = await context.supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error("Could not load orders");
    return { orders: (data ?? []).map(toOrder) };
  });

export const setOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid(), status: statuses }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase as never, context.userId);
    const { error } = await context.supabase.from("orders").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error("Could not update the order");
    return { ok: true as const };
  });

export const listMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase as never, context.userId);
    const { data, error } = await context.supabase
      .from("customer_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error("Could not load messages");
    return {
      messages: (data ?? []).map((m) => ({
        id: m.id,
        createdAt: m.created_at,
        name: m.name,
        message: m.message,
        status: (m.status === "read" ? "read" : "new") as "new" | "read",
      })),
    };
  });

export const setMessageRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid(), read: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase as never, context.userId);
    const { error } = await context.supabase
      .from("customer_messages")
      .update({ status: data.read ? "read" : "new" })
      .eq("id", data.id);
    if (error) throw new Error("Could not update the message");
    return { ok: true as const };
  });

export type AdminUser = {
  id: string;
  email: string | null;
  name: string | null;
  isAdmin: boolean;
};

export const listAdminUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase as never, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rolesData, error: rolesError } = await supabaseAdmin.from("user_roles").select("user_id, role");
    const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers();

    if (rolesError || usersError) throw new Error("Could not load admin users");

    const roleSet = new Set((rolesData ?? []).filter((row) => row.role === "admin").map((row) => row.user_id));

    const users = (usersData?.users ?? []).map((user) => ({
      id: user.id,
      email: user.email ?? null,
      name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
      isAdmin: roleSet.has(user.id),
    }));

    return { users };
  });

export const updateAdminRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ userId: z.string(), isAdmin: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase as never, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    if (data.isAdmin) {
      const { data: existing } = await supabaseAdmin.from("user_roles").select("id").eq("user_id", data.userId).eq("role", "admin").maybeSingle();
      if (!existing) {
        const { error } = await supabaseAdmin.from("user_roles").insert({ user_id: data.userId, role: "admin" });
        if (error) throw new Error("Could not add admin access");
      }
    } else {
      const { error } = await supabaseAdmin.from("user_roles").delete().eq("user_id", data.userId).eq("role", "admin");
      if (error) throw new Error("Could not remove admin access");
    }

    return { ok: true as const };
  });
