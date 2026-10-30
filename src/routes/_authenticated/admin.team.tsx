import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

import { Button } from "@/components/ui/button";
import { listAdminUsers, updateAdminRole } from "@/lib/orders.functions";

export const Route = createFileRoute("/_authenticated/admin/team")({
  component: TeamPage,
});

function TeamPage() {
  const getUsers = useServerFn(listAdminUsers);
  const updateRole = useServerFn(updateAdminRole);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin-users"], queryFn: () => getUsers() });

  async function handleToggle(userId: string, isAdmin: boolean) {
    await updateRole({ data: { userId, isAdmin } });
    await qc.invalidateQueries({ queryKey: ["admin-users"] });
  }

  if (isLoading) return <p className="mt-6 text-center text-sm text-muted-foreground">Loading team…</p>;

  return (
    <div className="mt-6 space-y-5">
      <div>
        <p className="eyebrow text-muted-foreground">Access</p>
        <h1 className="font-display text-3xl">Team and admin permissions</h1>
      </div>

      <div className="overflow-hidden border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/30">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {(data?.users ?? []).map((user) => (
              <tr key={user.id} className="border-b border-border last:border-b-0">
                <td className="px-4 py-3">
                  <div className="font-medium">{user.name ?? "Unnamed user"}</div>
                  <div className="text-xs text-muted-foreground">{user.email ?? user.id}</div>
                </td>
                <td className="px-4 py-3 capitalize">{user.isAdmin ? "Admin" : "User"}</td>
                <td className="px-4 py-3">
                  <Button
                    size="sm"
                    variant={user.isAdmin ? "outline" : "emerald"}
                    onClick={() => handleToggle(user.id, !user.isAdmin)}
                  >
                    {user.isAdmin ? "Remove admin" : "Make admin"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
