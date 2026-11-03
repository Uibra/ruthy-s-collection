import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";

export const defaultShop = {
  name: "Ruthys Collection",
  tagline: "Luxury essentials for everyday confidence",
  phoneLocal: "+234 803 000 0000",
  whatsappNumber: "2348030000000",
  email: "hello@ruthyscollection.com",
  location: "Kano, Nigeria",
  hours: "Mon – Sat, 9:00am – 7:00pm",
  socials: {
    instagram: "https://instagram.com/ruthyscollection",
    facebook: "https://facebook.com/ruthyscollection",
    tiktok: "https://tiktok.com/@ruthyscollection",
  },
  delivery: {
    homeFee: 2000,
    pickupFee: 0,
    freeOver: 75000,
  },
};

const STORAGE_KEY = "shop-settings-v1";
const listeners = new Set<(settings: typeof defaultShop) => void>();

function mergeShopSettings(base: typeof defaultShop, incoming?: Partial<typeof defaultShop>): typeof defaultShop {
  return {
    ...base,
    ...incoming,
    socials: { ...base.socials, ...(incoming?.socials ?? {}) },
    delivery: { ...base.delivery, ...(incoming?.delivery ?? {}) },
  };
}

export function getStoredShopSettings() {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function readShopSettings() {
  return mergeShopSettings(defaultShop, getStoredShopSettings());
}

function hasSupabaseConfig() {
  const viteUrl = typeof import.meta !== "undefined" ? import.meta.env?.VITE_SUPABASE_URL : undefined;
  const viteKey = typeof import.meta !== "undefined" ? import.meta.env?.VITE_SUPABASE_ANON_KEY : undefined;
  const vitePublishableKey = typeof import.meta !== "undefined" ? import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY : undefined;

  return Boolean(
    viteUrl ||
      viteKey ||
      vitePublishableKey ||
      process.env.SUPABASE_URL ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.SUPABASE_PUBLISHABLE_KEY,
  );
}

export async function fetchShopSettingsFromSupabase() {
  if (typeof window === "undefined" || !hasSupabaseConfig()) return null;

  try {
    const { data, error } = await supabase.from("shop_settings").select("settings").eq("id", "default").maybeSingle();
    if (error || !data?.settings) return null;
    return mergeShopSettings(defaultShop, data.settings as Partial<typeof defaultShop>);
  } catch {
    return null;
  }
}

export async function saveShopSettingsToSupabase(settings: typeof defaultShop) {
  if (typeof window === "undefined" || !hasSupabaseConfig()) return false;

  const next = mergeShopSettings(defaultShop, settings);
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore storage fallback issues; the site still keeps the in-memory state.
    }
  }

  try {
    const { error } = await supabase.from("shop_settings").upsert({ id: "default", settings: next }, { onConflict: "id" });
    if (error) {
      console.warn("Could not save shop settings to Supabase:", error.message);
      return false;
    }
    shop = next;
    notifyShopSettingsChanged(next);
    return true;
  } catch (error) {
    console.warn("Could not save shop settings to Supabase:", error);
    return false;
  }
}

export function subscribeToShopSettings(listener: (settings: typeof defaultShop) => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notifyShopSettingsChanged(next: typeof defaultShop) {
  listeners.forEach((listener) => listener(next));
  if (typeof window !== "undefined") {
    try {
      window.dispatchEvent(new CustomEvent("shop-settings-updated", { detail: next }));
    } catch {
      // Ignore event failures silently.
    }
  }
}

export function updateShopSettings(partial: Partial<typeof defaultShop>) {
  const current = readShopSettings();
  const next = mergeShopSettings(current, partial);
  shop = next;

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY, newValue: JSON.stringify(next) }));
    } catch {
      // Ignore storage failures silently.
    }
  }

  void saveShopSettingsToSupabase(next);
  notifyShopSettingsChanged(next);
  return shop;
}

export function useShopSettings() {
  const [settings, setSettings] = useState<typeof defaultShop>(() => readShopSettings());

  useEffect(() => {
    let active = true;

    const syncFromStorage = () => {
      if (!active) return;
      setSettings(readShopSettings());
    };

    const syncFromRemote = async () => {
      const remote = await fetchShopSettingsFromSupabase();
      if (!active) return;
      if (remote) {
        setSettings(remote);
        shop = remote;
        if (typeof window !== "undefined") {
          try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(remote));
          } catch {
            // Ignore local fallback errors.
          }
        }
      } else {
        syncFromStorage();
      }
    };

    const onStorage = (event: StorageEvent) => {
      if (!event.key || event.key === STORAGE_KEY) syncFromStorage();
    };
    const onCustom = (event: Event) => {
      const detail = (event as CustomEvent<typeof defaultShop>).detail;
      if (detail) setSettings(detail);
      else syncFromStorage();
    };

    const unsubscribe = subscribeToShopSettings(setSettings);

    if (typeof window !== "undefined") {
      window.addEventListener("storage", onStorage);
      window.addEventListener("shop-settings-updated", onCustom);
    }

    void syncFromRemote();

    return () => {
      active = false;
      unsubscribe();
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", onStorage);
        window.removeEventListener("shop-settings-updated", onCustom);
      }
    };
  }, []);

  return settings;
}

export let shop = readShopSettings();

export function formatNaira(amount: number) {
  return `\u20A6${amount.toLocaleString("en-NG")}`;
}
