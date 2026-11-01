import { createFileRoute } from "@tanstack/react-router";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

import { PageIntro, seo } from "@/components/site/PageIntro";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useShopSettings } from "@/lib/shop-config";
import { whatsappGeneral } from "@/lib/whatsapp";

export const Route = createFileRoute("/contact")({
  head: () => seo("Contact Ruthys Collection", "Reach Ruthys Collection on WhatsApp, phone or email. Based in Kano, delivering across Nigeria."),
  component: Contact,
});

const schema = z.object({
  name: z.string().trim().min(1, "Please add your name").max(100),
  message: z.string().trim().min(1, "Please write a message").max(1000),
});

function Contact() {
  const shop = useShopSettings();
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const rows = [
    { icon: MessageCircle, label: "WhatsApp", value: shop.phoneLocal, href: whatsappGeneral() },
    { icon: Phone, label: "Phone", value: shop.phoneLocal, href: `tel:+${shop.whatsappNumber}` },
    { icon: Mail, label: "Email", value: shop.email, href: `mailto:${shop.email}` },
    { icon: MapPin, label: "Location", value: shop.location },
    { icon: Clock, label: "Hours", value: shop.hours },
  ];

  return (
    <div className="pb-20">
      <PageIntro eyebrow="We'd love to hear from you" title="Contact us">
        Questions about a product, delivery or a custom gift? The fastest way to reach us is WhatsApp.
      </PageIntro>
      <div className="mx-auto mt-12 grid max-w-5xl gap-8 px-4 sm:px-6 md:grid-cols-2">
        <ul className="space-y-5 border border-border bg-card p-6 shadow-soft">
          {rows.map((r) => (
            <li key={r.label} className="flex items-start gap-4">
              <r.icon className="mt-0.5 h-5 w-5 text-gold" />
              <div>
                <p className="eyebrow text-muted-foreground">{r.label}</p>
                {r.href ? (
                  <a href={r.href} target="_blank" rel="noreferrer" className="text-sm hover:text-primary">{r.value}</a>
                ) : (
                  <p className="text-sm">{r.value}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
        <form
          className="space-y-4 border border-border bg-card p-6 shadow-soft"
          onSubmit={(e) => {
            e.preventDefault();
            const r = schema.safeParse({ name, message });
            if (!r.success) return setError(r.error.issues[0]?.message ?? "Please check the form");
            setError("");
            window.open(whatsappGeneral(`Hello ${shop.name}, my name is ${r.data.name}.\n\n${r.data.message}`), "_blank");
          }}
        >
          <h2 className="font-display text-2xl">Send a message</h2>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" maxLength={100} aria-label="Your name" />
          <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="How can we help?" rows={5} maxLength={1000} aria-label="Message" />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" variant="emerald" size="lg" className="w-full">Send on WhatsApp</Button>
        </form>
      </div>
    </div>
  );
}
