import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

import { Button } from "@/components/ui/button";
import { listOrders, setOrderStatus } from "@/lib/orders.functions";
import { formatNaira } from "@/lib/shop-config";

export const Route = createFileRoute("/_authenticated/admin/orders")({
  component: AdminOrdersPage,
});

function shortDate(iso: string) {
  return new Date(iso).toLocaleString("en-NG", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

function AdminOrdersPage() {
  const getOrders = useServerFn(listOrders);
  const updateStatus = useServerFn(setOrderStatus);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin-orders"], queryFn: () => getOrders() });

  const orders = data?.orders ?? [];

  async function handleStatus(id: string, status: "new" | "confirmed" | "delivered" | "cancelled") {
    await updateStatus({ data: { id, status } });
    await qc.invalidateQueries({ queryKey: ["admin-orders"] });
  }

  if (isLoading) return <p className="mt-6 text-center text-sm text-muted-foreground">Loading orders…</p>;

  return (
    <div className="mt-6 space-y-5">
      <div>
        <p className="eyebrow text-muted-foreground">Orders</p>
        <h1 className="font-display text-3xl">Manage customer orders</h1>
      </div>

      <div className="overflow-hidden border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/30">
            <tr>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Method</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No orders yet.</td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-3 align-top">
                    <div className="font-medium">{order.name}</div>
                    <div className="text-xs text-muted-foreground">{order.phone}</div>
                    <div className="mt-2 text-xs text-muted-foreground">{order.address || "Pickup order"}</div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    {order.items.map((item) => (
                      <div key={`${order.id}-${item.name}`} className="text-xs text-muted-foreground">
                        {item.quantity} × {item.name}
                      </div>
                    ))}
                  </td>
                  <td className="px-4 py-3 align-top capitalize text-muted-foreground">{order.method}</td>
                  <td className="px-4 py-3 align-top">{formatNaira(order.total)}</td>
                  <td className="px-4 py-3 align-top text-muted-foreground">{shortDate(order.createdAt)}</td>
                  <td className="px-4 py-3 align-top">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatus(order.id, e.target.value as "new" | "confirmed" | "delivered" | "cancelled")}
                      className="h-9 rounded-md border border-input bg-background px-2 text-sm capitalize"
                    >
                      <option value="new">New</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
