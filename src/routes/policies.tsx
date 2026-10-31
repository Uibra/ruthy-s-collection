import { createFileRoute } from "@tanstack/react-router";

import { PageIntro, seo } from "@/components/site/PageIntro";
import { formatNaira, shop } from "@/lib/shop-config";

export const Route = createFileRoute("/policies")({
  head: () => seo("Shipping, Returns & Privacy — Ruthys Collection", "Delivery, returns, exchanges and privacy policies for Ruthys Collection."),
  component: Policies,
});

function Policies() {
  const sections = [
    { title: "Shipping", body: `We deliver across Nigeria. Home delivery costs ${formatNaira(shop.delivery.homeFee)}; pickup in ${shop.location} is free. Orders over ${formatNaira(shop.delivery.freeOver)} ship free. Orders are dispatched once payment is confirmed.` },
    { title: "Returns & exchanges", body: "Unused items in their original packaging may be exchanged within 3 days of delivery. For hygiene reasons, opened perfumes and waist beads cannot be returned. Contact us on WhatsApp to arrange an exchange." },
    { title: "Damaged items", body: "If something arrives damaged, send us a photo within 24 hours and we'll replace it or refund you." },
    { title: "Privacy", body: "We only use your name, phone number and address to process and deliver your order. We never sell your details." },
  ];
  return (
    <div className="pb-20">
      <PageIntro eyebrow="The fine print" title="Store policies" />
      <div className="mx-auto mt-10 max-w-2xl space-y-10 px-4 sm:px-6">
        {sections.map((s) => (
          <section key={s.title}>
            <h2 className="font-display text-2xl">{s.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
