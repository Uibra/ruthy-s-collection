import type { ReactNode } from "react";

export function PageIntro({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-14 text-center sm:px-6">
      <p className="eyebrow text-muted-foreground">{eyebrow}</p>
      <h1 className="mt-3 font-display text-4xl sm:text-5xl">{title}</h1>
      <div className="mx-auto mt-4 h-px w-16 surface-gold" />
      {children && <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground">{children}</p>}
    </div>
  );
}

export function seo(title: string, description: string, extra: { name?: string; property?: string; content: string }[] = []) {
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      ...extra,
    ],
  };
}
