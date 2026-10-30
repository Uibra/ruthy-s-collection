import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

import { Button } from "@/components/ui/button";
import { listMessages, setMessageRead } from "@/lib/orders.functions";

export const Route = createFileRoute("/_authenticated/admin/messages")({
  component: AdminMessagesPage,
});

function shortDate(iso: string) {
  return new Date(iso).toLocaleString("en-NG", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

function AdminMessagesPage() {
  const getMessages = useServerFn(listMessages);
  const markRead = useServerFn(setMessageRead);
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin-messages"], queryFn: () => getMessages() });

  const messages = data?.messages ?? [];

  async function handleToggle(id: string, read: boolean) {
    await markRead({ data: { id, read } });
    await qc.invalidateQueries({ queryKey: ["admin-messages"] });
  }

  if (isLoading) return <p className="mt-6 text-center text-sm text-muted-foreground">Loading messages…</p>;

  return (
    <div className="mt-6 space-y-5">
      <div>
        <p className="eyebrow text-muted-foreground">Inbox</p>
        <h1 className="font-display text-3xl">Customer messages</h1>
      </div>

      <div className="space-y-3">
        {messages.length === 0 ? (
          <div className="rounded border border-border bg-card p-6 text-center text-sm text-muted-foreground">No messages yet.</div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="rounded border border-border bg-card p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-medium">{message.name}</h2>
                    {message.status === "new" && <span className="rounded bg-gold/20 px-2 py-0.5 text-[10px] uppercase tracking-wide text-gold">New</span>}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{shortDate(message.createdAt)}</p>
                </div>
                <Button size="sm" variant={message.status === "read" ? "outline" : "emerald"} onClick={() => handleToggle(message.id, message.status !== "read")}>
                  {message.status === "read" ? "Mark unread" : "Mark as read"}
                </Button>
              </div>
              <p className="mt-4 whitespace-pre-line text-sm text-foreground">{message.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
