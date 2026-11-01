import { createFileRoute, Link } from "@tanstack/react-router";
import { Gem, HeartHandshake, Truck } from "lucide-react";

import ruth from "@/assets/ruth-friday.jpg";
import { seo } from "@/components/site/PageIntro";
import { Button } from "@/components/ui/button";
import { shop } from "@/lib/shop-config";

export const Route = createFileRoute("/about")({
  head: () =>
    seo(
      "About Ruthys Collection — Founded by Ruth Friday",
      "Meet Ruth Friday, CEO and founder of Ruthys Collection — a Kano boutique for quality perfumes, jewellery, waist beads, scarves and bags.",
    ),
  component: About,
});

const values = [
  { icon: Gem, title: "Quality first", text: "Every piece is checked by hand before it reaches you." },
  { icon: HeartHandshake, title: "Personal service", text: "Real advice on WhatsApp, from people who care how you look and feel." },
  { icon: Truck, title: "Delivered with care", text: "Neatly packed, gift-ready, and sent across Nigeria." },
];

function About() {
  return (
    <div>
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[5fr_6fr] lg:py-20">
        <figure className="fade-rise relative mx-auto w-full max-w-md">
          <div className="absolute -right-4 -top-4 h-full w-full border border-gold/50" />
          <img
            src={ruth}
            alt="Ruth Friday, CEO and founder of Ruthys Collection"
            width={1020}
            height={1280}
            className="relative aspect-[4/5] w-full object-cover shadow-lift"
          />
          <figcaption className="relative mt-4 text-center">
            <span className="font-display text-xl">Ruth Friday</span>
            <span className="eyebrow mt-1 block text-muted-foreground">CEO &amp; Founder</span>
          </figcaption>
        </figure>

        <div className="fade-rise">
          <p className="eyebrow text-muted-foreground">Our story</p>
          <h1 className="rule-gold mt-3 font-display text-4xl leading-tight sm:text-5xl">
            A boutique built on <span className="text-gilded">good taste</span> and trust
          </h1>
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              {shop.name} was founded by Ruth Friday with one simple idea: every woman deserves beautiful, quality
              pieces without the stress of guessing what's real.
            </p>
            <p>
              From long-lasting perfumes to gold-tone chains, handmade waist beads, vintage scarves and
              structured bags, each item is chosen personally — the kind of thing Ruth would wear herself.
            </p>
          </div>
          <blockquote className="mt-8 border-l-2 border-gold pl-5 font-display text-2xl italic leading-snug">
            "I want every customer to open her parcel and smile. That's the standard."
            <footer className="eyebrow mt-3 not-italic text-muted-foreground">— Ruth Friday</footer>
          </blockquote>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="emerald" size="lg"><Link to="/shop">Shop the collection</Link></Button>
            <Button asChild variant="gilded" size="lg"><Link to="/contact">Get in touch</Link></Button>
          </div>
        </div>
      </section>

      <section className="surface-cream border-y border-border">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 md:grid-cols-3">
          {values.map((v) => (
            <div key={v.title} className="text-center">
              <v.icon className="mx-auto h-6 w-6 text-gold" />
              <h2 className="mt-4 font-display text-2xl">{v.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{v.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
