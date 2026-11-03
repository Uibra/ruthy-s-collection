import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { saveShopSettingsToSupabase, updateShopSettings, useShopSettings } from "@/lib/shop-config";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: StoreSettingsPage,
});

function StoreSettingsPage() {
  const shop = useShopSettings();
  const [form, setForm] = useState({ ...shop, socials: { ...shop.socials }, delivery: { ...shop.delivery } });
  const [saved, setSaved] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadUser() {
      const { data, error } = await supabase.auth.getUser();
      if (!active) return;
      if (!error && data.user?.email) {
        setEmail(data.user.email);
        setNewEmail(data.user.email);
      }
    }

    loadUser();
    return () => {
      active = false;
    };
  }, []);

  function setField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  useEffect(() => {
    setForm({ ...shop, socials: { ...shop.socials }, delivery: { ...shop.delivery } });
  }, [shop]);

  async function save() {
    const next = { ...form, socials: { ...form.socials }, delivery: { ...form.delivery } };
    updateShopSettings(next as any);
    const savedToRemote = await saveShopSettingsToSupabase(next as any);
    setSaved(
      savedToRemote
        ? "Store settings saved and live on the storefront"
        : "Saved locally for this browser, but Supabase is not configured yet",
    );
  }

  async function updateAccount() {
    const trimmedEmail = newEmail.trim();
    const emailChanged = trimmedEmail.length > 0 && trimmedEmail.toLowerCase() !== email.toLowerCase();
    const passwordChanged = newPassword.length > 0;

    if (!emailChanged && !passwordChanged) {
      toast.error("Enter a new email or password to update your owner account.");
      return;
    }

    if (passwordChanged && newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    if (passwordChanged && newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setBusy(true);

    try {
      if (emailChanged) {
        const { error } = await supabase.auth.updateUser({ email: trimmedEmail });
        if (error) throw error;
        toast.success("Email update sent. Confirm it from the new inbox.");
        setEmail(trimmedEmail);
      }

      if (passwordChanged) {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
        toast.success("Password updated successfully.");
      }

      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update account details.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-6 space-y-6">
      <div>
        <p className="eyebrow text-muted-foreground">Store</p>
        <h1 className="font-display text-3xl">Store settings</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4 rounded border border-border bg-card p-5">
          <div className="space-y-2">
            <Label>Shop name</Label>
            <Input value={form.name} onChange={(e) => setField("name", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Tagline</Label>
            <Input value={form.tagline} onChange={(e) => setField("tagline", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input value={form.phoneLocal} onChange={(e) => setField("phoneLocal", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>WhatsApp number</Label>
            <Input value={form.whatsappNumber} onChange={(e) => setField("whatsappNumber", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={form.email} onChange={(e) => setField("email", e.target.value)} />
          </div>
        </div>

        <div className="space-y-4 rounded border border-border bg-card p-5">
          <div className="space-y-2">
            <Label>Location</Label>
            <Input value={form.location} onChange={(e) => setField("location", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Business hours</Label>
            <Input value={form.hours} onChange={(e) => setField("hours", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Instagram</Label>
            <Input value={form.socials.instagram} onChange={(e) => setField("socials", { ...form.socials, instagram: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Facebook</Label>
            <Input value={form.socials.facebook} onChange={(e) => setField("socials", { ...form.socials, facebook: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>TikTok</Label>
            <Input value={form.socials.tiktok} onChange={(e) => setField("socials", { ...form.socials, tiktok: e.target.value })} />
          </div>
        </div>
      </div>

      <div className="rounded border border-border bg-card p-5">
        <h2 className="font-display text-2xl">Delivery settings</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Home delivery fee</Label>
            <Input type="number" value={form.delivery.homeFee} onChange={(e) => setField("delivery", { ...form.delivery, homeFee: Number(e.target.value || 0) })} />
          </div>
          <div className="space-y-2">
            <Label>Pickup fee</Label>
            <Input type="number" value={form.delivery.pickupFee} onChange={(e) => setField("delivery", { ...form.delivery, pickupFee: Number(e.target.value || 0) })} />
          </div>
          <div className="space-y-2">
            <Label>Free over</Label>
            <Input type="number" value={form.delivery.freeOver} onChange={(e) => setField("delivery", { ...form.delivery, freeOver: Number(e.target.value || 0) })} />
          </div>
        </div>
      </div>

      <div className="rounded border border-border bg-card p-5">
        <h2 className="font-display text-2xl">Owner account</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Current email</Label>
            <Input value={email} readOnly />
          </div>
          <div className="space-y-2">
            <Label>New email</Label>
            <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>New password</Label>
            <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 8 characters" />
          </div>
          <div className="space-y-2">
            <Label>Confirm password</Label>
            <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat new password" />
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Email changes require confirmation from the new inbox. Password updates take effect immediately after save.
        </p>
        <div className="mt-4 flex items-center gap-3">
          <Button variant="emerald" onClick={updateAccount} disabled={busy}>
            {busy ? "Updating…" : "Update account"}
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="emerald" onClick={save}>Save settings</Button>
        {saved ? <span className="text-sm text-muted-foreground">{saved}</span> : null}
      </div>
    </div>
  );
}
