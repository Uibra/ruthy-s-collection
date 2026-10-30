import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, MapPin, Music2, Phone } from "lucide-react";

import { shop } from "@/lib/shop-config";
import { categories } from "@/lib/products";

export function Footer() {
  return (
    <footer className="surface-emerald mt-24">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div>
          <p className="font-display text-2xl">Ruthy's Collection</p>
          <p className="mt-2 text-sm opacity-80">{shop.tagline}</p>
          <div className="mt-5 flex gap-3">
            <a href={shop.socials.instagram} aria-label="Instagram" className="grid h-9 w-9 place-items-center border border-primary-foreground/30">
              <Instagram className="h-4 w-4" />
            </a>
            <a href={shop.socials.facebook} aria-label="Facebook" className="grid h-9 w-9 place-items-center border border-primary-foreground/30">
              <Facebook className="h-4 w-4" />
            </a>
            <a href={shop.socials.tiktok} aria-label="TikTok" className="grid h-9 w-9 place-items-center border border-primary-foreground/30">
              <Music2 className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <p className="eyebrow opacity-70">Shop</p>
          <ul className="mt-4 space-y-2 text-sm">
            {categories.map((c) => (
              <li key={c.name}>
                <Link
                  to="/shop"
                  search={{ q: "", category: c.name, sort: "newest" }}
                  className="opacity-85 hover:opacity-100"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="eyebrow opacity-70">Help</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/faq" className="opacity-85 hover:opacity-100">FAQ</Link></li>
            <li><Link to="/contact" className="opacity-85 hover:opacity-100">Contact us</Link></li>
            <li><Link to="/about" className="opacity-85 hover:opacity-100">About us</Link></li>
            <li><Link to="/policies" className="opacity-85 hover:opacity-100">Policies</Link></li>
            <li><Link to="/admin" className="opacity-85 hover:opacity-100">Owner sign in</Link></li>
            <li><Link to="/wishlist" className="opacity-85 hover:opacity-100">My wishlist</Link></li>
          </ul>
        </div>

        <div>
          <p className="eyebrow opacity-70">Reach us</p>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-center gap-2 opacity-85">
              <Phone className="h-4 w-4" /> {shop.phoneLocal}
            </li>
            <li className="flex items-center gap-2 opacity-85">
              <Mail className="h-4 w-4" /> {shop.email}
            </li>
            <li className="flex items-center gap-2 opacity-85">
              <MapPin className="h-4 w-4" /> {shop.location}
            </li>
          </ul>
          <p className="mt-4 text-xs opacity-70">{shop.hours}</p>
        </div>
      </div>

      <div className="border-t border-primary-foreground/15 px-4 py-5 text-center text-xs opacity-70">
        © {new Date().getFullYear()} Ruthy's Collection. All rights reserved.
      </div>
    </footer>
  );
}
