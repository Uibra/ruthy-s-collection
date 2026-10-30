import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { checkAdmin } from "@/lib/catalog.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Ruthy's Collection" },
      { name: "description", content: "Manage products, prices, stock and photos." },
      { property: "og:title", content: "Admin — Ruthy's Collection" },
      { property: "og:description", content: "Manage the Ruthy's Collection catalogue." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const check = useServerFn(checkAdmin);
  const { data, isLoading } = useQuery({ queryKey: ["is-admin"], queryFn: () => check() });
  const qc = useQueryClient();
  const navigate = useNavigate();

  async function signOut() {
    await qc.cancelQueries();
    qc.removeQueries({ queryKey: ["is-admin"] });
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (isLoading) return <p className="p-10 text-center text-sm text-muted-foreground">Checking access…</p>;
  if (!data?.isAdmin)
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="font-display text-3xl">Owner access only</h1>
        <p className="mt-2 text-sm text-muted-foreground">This account can't edit the shop.</p>
        <Button variant="emerald" className="mt-6" onClick={signOut}>Sign out</Button>
      </div>
    );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center gap-3 border-b border-border pb-4">
        <Link to="/admin" className="font-display text-2xl">Shop manager</Link>
        <nav className="ml-4 flex flex-wrap items-center gap-2 text-sm">
          <Button asChild variant="ghost" size="sm">
            <Link to="/admin">Overview</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link to="/admin/products">Products</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link to="/admin/orders">Orders</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link to="/admin/messages">Messages</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link to="/admin/settings">Settings</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link to="/admin/team">Team</Link>
          </Button>
        </nav>
        <div className="ml-auto flex gap-2">
          <Button asChild variant="emerald" size="sm">
            <Link to="/admin/products/$id" params={{ id: "new" }}>Add product</Link>
          </Button>
          <Button variant="outline" size="sm" onClick={signOut}>Sign out</Button>
        </div>
      </div>
      <Outlet />
    </div>
  );
}
