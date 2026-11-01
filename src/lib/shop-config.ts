import { useEffect, useState } from "react";

export const defaultShop = {
  name: "Ruthys Collection",
  tagline: "Modern essentials, curated for everyday style",
  phoneLocal: "+234 800 000 0000",
  whatsappNumber: "2348000000000",
  email: "hello@pixelperfectmatch.com",
  location: "Lagos, Nigeria",
  hours: "Mon – Sat, 9:00am – 7:00pm",
  socials: {
    instagram: "https://instagram.com/pixelperfectmatch",
    facebook: "https://facebook.com/pixelperfectmatch",
    tiktok: "https://tiktok.com/@pixelperfectmatch",
  },
  delivery: {
    homeFee: 2000,
    pickupFee: 0,
    freeOver: 75000,
  },
};

const STORAGE_KEY = "shop-settings-v1";
const listeners = new Set<(settings: typeof defaultShop) => void>();

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
  const stored = getStoredShopSettings();
  const merged = {
    ...defaultShop,
    ...stored,
    socials: { ...defaultShop.socials, ...(stored?.socials ?? {}) },
    delivery: { ...defaultShop.delivery, ...(stored?.delivery ?? {}) },
  };
  return merged;
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
  const next = {
    ...current,
    ...partial,
    socials: { ...current.socials, ...partial.socials },
    delivery: { ...current.delivery, ...partial.delivery },
  };
  shop = next;

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY, newValue: JSON.stringify(next) }));
    } catch {
      // Ignore storage failures silently.
    }
  }

  notifyShopSettingsChanged(next);
  return shop;
}

export function useShopSettings() {
  const [settings, setSettings] = useState<typeof defaultShop>(() => readShopSettings());

  useEffect(() => {
    const syncFromStorage = () => setSettings(readShopSettings());
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

    syncFromStorage();

    return () => {
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
