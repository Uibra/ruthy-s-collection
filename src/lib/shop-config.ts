export const defaultShop = {
  name: "Pixel Perfect Match",
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

export function getStoredShopSettings() {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function updateShopSettings(partial: Partial<typeof defaultShop>) {
  const next = { ...defaultShop, ...shop, ...partial };
  shop = next;

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore storage failures silently.
    }
  }

  return shop;
}

export let shop = { ...defaultShop, ...getStoredShopSettings() };

export function formatNaira(amount: number) {
  return `\u20A6${amount.toLocaleString("en-NG")}`;
}
