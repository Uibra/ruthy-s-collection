import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { shop, updateShopSettings } from "@/lib/shop-config";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: StoreSettingsPage,
});

function StoreSettingsPage() {
  const [form, setForm] = useState({ ...shop, socials: { ...shop.socials }, delivery: { ...shop.delivery } });
  const [saved, setSaved] = useState<string | null>(null);

  function setField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function save() {
    updateShopSettings(form as any);
    setSaved("Store settings saved locally");
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

      <div className="flex items-center gap-3">
        <Button variant="emerald" onClick={save}>Save settings</Button>
        {saved ? <span className="text-sm text-muted-foreground">{saved}</span> : null}
      </div>
    </div>
  );
}
