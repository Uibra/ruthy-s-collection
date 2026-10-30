import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { type Product } from "./products";
import { useProducts } from "./catalog";

export type CartLine = {
  productId: string;
  quantity: number;
  options: Record<string, string>;
};

type StoreValue = {
  hydrated: boolean;
  cart: CartLine[];
  wishlist: string[];
  addToCart: (productId: string, quantity?: number, options?: Record<string, string>) => void;
  setQuantity: (index: number, quantity: number) => void;
  removeLine: (index: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  cartCount: number;
  subtotal: number;
  detailedCart: { line: CartLine; product: Product; lineTotal: number }[];
};

const CART_KEY = "rc.cart.v1";
const WISH_KEY = "rc.wishlist.v1";

const StoreContext = createContext<StoreValue | null>(null);

function read<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const products = useProducts();
  const [hydrated, setHydrated] = useState(false);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    setCart(read<CartLine[]>(CART_KEY, []));
    setWishlist(read<string[]>(WISH_KEY, []));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart, hydrated]);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(WISH_KEY, JSON.stringify(wishlist));
  }, [wishlist, hydrated]);

  const addToCart = useCallback(
    (productId: string, quantity = 1, options?: Record<string, string>) => {
      const opts: Record<string, string> = options ?? {};
      const key = JSON.stringify(opts);
      setCart((prev) => {
        const exists = prev.some(
          (l) => l.productId === productId && JSON.stringify(l.options) === key,
        );
        if (exists) {
          return prev.map((l) =>
            l.productId === productId && JSON.stringify(l.options) === key
              ? { ...l, quantity: l.quantity + quantity }
              : l,
          );
        }
        return [...prev, { productId, quantity, options: opts }];
      });
    },
    [],
  );

  const setQuantity = useCallback((index: number, quantity: number) => {
    setCart((prev) =>
      prev
        .map((l, i) => (i === index ? { ...l, quantity: Math.max(0, quantity) } : l))
        .filter((l) => l.quantity > 0),
    );
  }, []);

  const removeLine = useCallback((index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const toggleWishlist = useCallback((productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
    );
  }, []);

  const value = useMemo<StoreValue>(() => {
    const detailedCart = cart.flatMap((line) => {
      const product = products.find((p) => p.id === line.productId);
      return product ? [{ line, product, lineTotal: product.price * line.quantity }] : [];
    });

    return {
      hydrated,
      cart,
      wishlist,
      addToCart,
      setQuantity,
      removeLine,
      clearCart,
      toggleWishlist,
      isWishlisted: (id: string) => wishlist.includes(id),
      cartCount: cart.reduce((n, l) => n + l.quantity, 0),
      subtotal: detailedCart.reduce((n, l) => n + l.lineTotal, 0),
      detailedCart,
    };
  }, [products, cart, wishlist, hydrated, addToCart, setQuantity, removeLine, clearCart, toggleWishlist]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
