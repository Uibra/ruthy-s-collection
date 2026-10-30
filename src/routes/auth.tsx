import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { isSignupOpen } from "@/lib/catalog.functions";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Admin Sign In — Ruthy's Collection" },
      { name: "description", content: "Private sign-in for the Ruthy's Collection shop owner." },
      { property: "og:title", content: "Admin Sign In — Ruthy's Collection" },
      { property: "og:description", content: "Private sign-in for the shop owner." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const openSignup = useServerFn(isSignupOpen);
  // Hidden until the server confirms sign-up is still possible — the shop allows exactly one owner account.
  const { data: signup } = useQuery({ queryKey: ["signup-open"], queryFn: () => openSignup(), staleTime: Infinity });
  const canShowSignup = signup?.open === true;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/admin" });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        if (data.session) navigate({ to: "/admin" });
        else toast.success("Check your email to confirm your account, then sign in.");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not sign in");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <p className="eyebrow text-muted-foreground">Owner area</p>
      <h1 className="rule-gold mt-3 font-display text-4xl">
        {mode === "in" ? "Sign in" : "Create admin account"}
      </h1>
      <form onSubmit={submit} className="mt-8 space-y-4 border border-border bg-card p-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button type="submit" variant="emerald" className="w-full" disabled={busy}>
          {busy ? "Please wait…" : mode === "in" ? "Sign in" : "Create account"}
        </Button>
        {canShowSignup && (
          <button
            type="button"
            className="w-full text-center text-xs text-muted-foreground"
            onClick={() => setMode(mode === "in" ? "up" : "in")}
          >
            {mode === "in" ? "First time? Create the owner account" : "Already have an account? Sign in"}
          </button>
        )}
      </form>
      <p className="mt-4 text-xs text-muted-foreground">
        {canShowSignup
          ? "Only the shop owner's account can edit products. The first account created becomes the owner."
          : "Owner sign-in only. New accounts are permanently closed — your owner account is the only one."}
      </p>
    </div>
  );
}
