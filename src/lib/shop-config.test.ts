import test from "node:test";
import assert from "node:assert/strict";

import { readShopSettings, subscribeToShopSettings, updateShopSettings } from "./shop-config.ts";
import { whatsappGeneral } from "./whatsapp.ts";

test("shop settings update persists and notifies listeners", () => {
  const originalWindow = globalThis.window;
  const storage = new Map<string, string>();
  const fakeWindow = {
    localStorage: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => {
        storage.set(key, value);
      },
      removeItem: (key: string) => {
        storage.delete(key);
      },
    },
  } as any;

  globalThis.window = fakeWindow;

  const names: string[] = [];
  const unsubscribe = subscribeToShopSettings((settings) => {
    names.push(settings.name);
  });

  try {
    updateShopSettings({ name: "Ruthys Studio" });
    assert.equal(readShopSettings().name, "Ruthys Studio");
    assert.ok(names.includes("Ruthys Studio"));
  } finally {
    unsubscribe();
    globalThis.window = originalWindow;
  }
});

test("shop settings update is reflected in WhatsApp links", () => {
  const originalWindow = globalThis.window;
  const storage = new Map<string, string>();
  globalThis.window = {
    localStorage: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => {
        storage.set(key, value);
      },
      removeItem: (key: string) => {
        storage.delete(key);
      },
    },
    dispatchEvent: () => undefined,
  } as any;

  try {
    updateShopSettings({ name: "Ruthys Studio", whatsappNumber: "2348123456789" });
    const link = whatsappGeneral();
    assert.match(link, /wa\.me\/2348123456789/);
    assert.match(link, /Hello%20Ruthys%20Studio/);
  } finally {
    globalThis.window = originalWindow;
  }
});

test("default store profile uses the Ruthys Collection brand details", () => {
  const settings = readShopSettings();

  assert.equal(settings.name, "Ruthys Collection");
  assert.equal(settings.location, "Kano, Nigeria");
  assert.equal(settings.email, "hello@ruthyscollection.com");
  assert.match(settings.socials.instagram, /ruthyscollection/i);
  assert.match(settings.socials.tiktok, /ruthyscollection/i);
});
