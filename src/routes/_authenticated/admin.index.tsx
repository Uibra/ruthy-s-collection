import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Package, TrendingUp, Wallet, MessageCircle } from "lucide-react";

import { seo } from "@/components/site/PageIntro";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/lib/catalog";
import { formatNaira } from "@/lib/shop-config";
import { listOrders, listMessages } from "@/lib/orders.functions";
import type { AdminOrder, AdminMessage } from "@/lib/orders.functions";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({
    meta: [
      { title: "Shop manager — Ruthys Collection" },
      { name: "description", content: "Sales, orders and customer messages at a glance." },
      { property: "og:title", content: "Shop manager — Ruthys Collection" },
      { property: "og:description", content: "Track sales, orders and customer messages." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminDashboard,
});

function shortDate(iso: string) {
  return new Date(iso).toLocaleString("en-NG", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

function AdminDashboard() {
  const products = useProducts();
  const getOrders = useServerFn(listOrders);
  const getMessages = useServerFn(listMessages);
  const ordersQ = useQuery({ queryKey: ["admin-orders"], queryFn: () => getOrders() });
  const messagesQ = useQuery({ queryKey: ["admin-messages"], queryFn: () => getMessages() });

  const orders: AdminOrder[] = ordersQ.data?.orders ?? [];
  const messages: AdminMessage[] = messagesQ.data?.messages ?? [];
  const live = orders.filter((o) => o.status !== "cancelled");
  const revenue = live.reduce((s, o) => s + o.total, 0);
  const avg = live.length ? Math.round(revenue / live.length) : 0;
  const newOrders = orders.filter((o) => o.status === "new").length;
  const unread = messages.filter((m) => m.status === "new").length;
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const outOfStock = products.filter((p) => p.stock <= 0).length;

  const stats: [string, string, string, string][] = [
    ["Total sales", revenue ? formatNaira(revenue) : "—", Wallet, `${live.length} order${live.length === 1 ? "" : "s"}`],
    ["Average order", avg ? formatNaira(avg) : "—", TrendingUp, "per order"],
    ["New orders", String(newOrders), Package, "waiting on you"],
    ["New messages", String(unread), MessageCircle, "from shoppers"],
  ];

  return (
    <div className="mt-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(([label, value, Icon, hint]) => (
          <div key={label} className="border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="eyebrow text-muted-foreground">{label}</p>
              <Icon className="h-4 w-4 text-gold" />
            </div>
            <p className="mt-2 font-display text-3xl">{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <h2 className="font-display text-xl">Latest orders</h2>
            <Button asChild variant="outline" size="sm"><Link to="/admin/orders">View all</Link></Button>
          </div>
          {orders.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">No orders yet. They appear here the moment a shopper checks out.</p>
          ) : (
            <ul className="divide-y divide-border">
              {orders.slice(0, 5).map((o) => (
                <li key={o.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{o.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {o.items[0]?.name}
                      {o.items.length > 1 ? ` +${o.items.length - 1} more` : ""} · {shortDate(o.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatNaira(o.total)}</p>
                    <p className="text-xs text-muted-foreground capitalize">{o.status}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <h2 className="font-display text-xl">Customer messages</h2>
            <Button asChild variant="outline" size="sm"><Link to="/admin/messages">View all</Link></Button>
          </div>
          {messages.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">No messages yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {messages.slice(0, 5).map((m) => (
                <li key={m.id} className="px-5 py-3">
                  <p className="flex items-center gap-2 text-sm font-medium">
                    {m.name}
                    {m.status === "new" && <span className="bg-gold/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-gold">New</span>}
                    <span className="ml-auto text-xs font-normal text-muted-foreground">{shortDate(m.createdAt)}</span>
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{m.message}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {(lowStock > 0 || outOfStock > 0) && (
        <p className="mt-6 text-sm text-muted-foreground">
          Stock check: {lowStock} running low, {outOfStock} sold out — <Link to="/admin/products" className="text-primary underline">open products</Link> to restock and manage updates.
        </p>
      )}
    </div>
  );
}
