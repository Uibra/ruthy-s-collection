import { createFileRoute } from "@tanstack/react-router";

import { PageIntro, seo } from "@/components/site/PageIntro";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { formatNaira, shop } from "@/lib/shop-config";

export const Route = createFileRoute("/faq")({
  head: () => seo("FAQ — Ruthy's Collection", "Answers about ordering, delivery, payment, returns and product care at Ruthy's Collection."),
  component: Faq,
});

const faqs = [
  { q: "How do I place an order?", a: "Add items to your cart and check out, or tap “Order on WhatsApp” on any product and we'll confirm everything with you directly." },
  { q: "How much is delivery?", a: `Home delivery is ${formatNaira(shop.delivery.homeFee)}, pickup in ${shop.location} is free, and orders over ${formatNaira(shop.delivery.freeOver)} ship free.` },
  { q: "How long does delivery take?", a: "Within Kano, 1–2 days. Other states usually take 2–5 working days." },
  { q: "How do I pay?", a: "We confirm your order on WhatsApp and share bank transfer details. Your order ships once payment is received." },
  { q: "Are your products original?", a: "Yes. Every item is checked by hand before it's packed." },
  { q: "Can I return an item?", a: "Unused items in original packaging can be exchanged within 3 days of delivery. Perfumes and waist beads can't be returned once opened, for hygiene reasons." },
  { q: "Do you gift wrap?", a: "Yes — just mention it in your order notes or on WhatsApp." },
];

function Faq() {
  return (
    <div className="pb-20">
      <PageIntro eyebrow="Help centre" title="Frequently asked questions" />
      <Accordion type="single" collapsible className="mx-auto mt-10 max-w-2xl px-4 sm:px-6">
        {faqs.map((f, i) => (
          <AccordionItem key={f.q} value={`q${i}`}>
            <AccordionTrigger className="text-left font-display text-lg">{f.q}</AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed text-muted-foreground">{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
