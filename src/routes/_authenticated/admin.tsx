import { createFileRoute, Link, Navigate, Outlet, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { checkAdmin } from "@/lib/catalog.functions";
import { resolveAdminAccess } from "@/lib/admin-auth";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Ruthys Collection" },
      { name: "description", content: "Manage products, prices, stock and photos." },
      { property: "og:title", content: "Admin — Ruthys Collection" },
      { property: "og:description", content: "Manage the Ruthys Collection catalogue." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

function AdminLayout() {
  const check = useServerFn(checkAdmin);
  const { data: sessionData, isLoading: isSessionLoading, error: sessionError } = useQuery({
    queryKey: ["supabase-session"],
    queryFn: async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data;
    },
    staleTime: Infinity,
    retry: false,
  });
  const isAuthenticated = Boolean(sessionData?.session);
  const { data, isLoading } = useQuery({
    queryKey: ["is-admin"],
    queryFn: () => check(),
    enabled: isAuthenticated,
  });
  const access = resolveAdminAccess({ isAuthenticated, isAdmin: data?.isAdmin });
  const qc = useQueryClient();
  const navigate = useNavigate();

  if (sessionError) return <Navigate to="/auth" replace />;
  if (!isSessionLoading && !isAuthenticated) return <Navigate to="/auth" replace />;

  async function signOut() {
    await qc.cancelQueries();
    qc.removeQueries({ queryKey: ["is-admin"] });
    qc.removeQueries({ queryKey: ["supabase-session"] });
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (isSessionLoading || (isAuthenticated && isLoading)) return <p className="p-10 text-center text-sm text-muted-foreground">Checking access…</p>;
  if (access.shouldRedirect) return <Navigate to="/auth" replace />;
  if (data?.isAdmin === false)
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
