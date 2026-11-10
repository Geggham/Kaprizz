"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Product } from "@/types";

export type AuthUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "CUSTOMER" | "ADMIN" | "MANAGER";
};

export type CartItem = {
  productId: string;
  colorId: string;
  size: number;
  quantity: number;
  variantId?: string;
  productName?: string;
  colorName?: string;
  image?: string;
  unitPrice?: number;
  slug?: string;
  category?: "men" | "women";
};

type CartApiResponse = {
  items: Array<{
    variantId: string;
    productId: string;
    colorId: string;
    size: number;
    quantity: number;
    productName: string;
    colorName: string;
    image: string;
    unitPrice: number;
    slug: string;
    category: "men" | "women";
  }>;
  subtotal: number;
};

type CommerceContextValue = {
  cart: CartItem[];
  cartCount: number;
  favoriteIds: string[];
  isReady: boolean;
  toggleFavorite: (productId: string) => Promise<void>;
  addToCart: (product: Product, colorId: string, size: number) => Promise<void>;
  removeFromCart: (
    productId: string,
    colorId: string,
    size: number,
  ) => Promise<void>;
  updateQuantity: (
    productId: string,
    colorId: string,
    size: number,
    quantity: number,
  ) => Promise<void>;
  user: AuthUser | null;
  signIn: (email: string, password: string) => Promise<void>;
  register: (input: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
};

const CommerceContext = createContext<CommerceContextValue | null>(null);

const FAVORITES_KEY = "kapriz_favorites";
const CART_KEY = "kapriz_cart";

type ApiEnvelope<T> = {
  data: T | null;
  error: { message: string } | null;
};

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const payload = (await response.json()) as ApiEnvelope<T>;
  if (!response.ok || payload.error) {
    throw new Error(payload.error?.message ?? "Request failed");
  }
  return payload.data as T;
}

function readStorage<T>(key: string, fallback: T): T {
  try {
    const saved = window.localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : fallback;
  } catch {
    return fallback;
  }
}

function mapCartItems(items: CartApiResponse["items"]): CartItem[] {
  return items.map((item) => ({
    productId: item.productId,
    colorId: item.colorId,
    size: item.size,
    quantity: item.quantity,
    variantId: item.variantId,
    productName: item.productName,
    colorName: item.colorName,
    image: item.image,
    unitPrice: item.unitPrice,
    slug: item.slug,
    category: item.category,
  }));
}

export function CommerceProvider({ children }: { children: React.ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  const refreshSession = useCallback(async () => {
    const result = await api<{ user: AuthUser | null }>("/api/auth/me");
    setUser(result.user);

    if (result.user) {
      const favorites = await api<{ productIds: string[] }>("/api/favorites");
      setFavoriteIds(favorites.productIds);
      const cartResult = await api<CartApiResponse>("/api/cart");
      setCart(mapCartItems(cartResult.items));
      return;
    }

    setFavoriteIds(readStorage<string[]>(FAVORITES_KEY, []));
    setCart(readStorage<CartItem[]>(CART_KEY, []));
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      void (async () => {
        try {
          await refreshSession();
        } catch {
          setFavoriteIds(readStorage<string[]>(FAVORITES_KEY, []));
          setCart(readStorage<CartItem[]>(CART_KEY, []));
          setUser(null);
        } finally {
          setIsReady(true);
        }
      })();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [refreshSession]);

  useEffect(() => {
    if (isReady && !user) {
      window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoriteIds));
    }
  }, [favoriteIds, isReady, user]);

  useEffect(() => {
    if (isReady && !user) {
      window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }
  }, [cart, isReady, user]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      await api<{ user: AuthUser }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      await refreshSession();
    },
    [refreshSession],
  );

  const register = useCallback(
    async (input: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
    }) => {
      await api<{ user: AuthUser }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(input),
      });
      await refreshSession();
    },
    [refreshSession],
  );

  const signOut = useCallback(async () => {
    await api<{ success: boolean }>("/api/auth/logout", { method: "POST" });
    setUser(null);
    setFavoriteIds(readStorage<string[]>(FAVORITES_KEY, []));
    setCart(readStorage<CartItem[]>(CART_KEY, []));
  }, []);

  const toggleFavorite = useCallback(
    async (productId: string) => {
      if (!user) {
        window.dispatchEvent(new Event("kapriz:open-auth"));
        return;
      }

      const isFavorite = favoriteIds.includes(productId);
      if (isFavorite) {
        const result = await api<{ productIds: string[] }>(
          `/api/favorites/${productId}`,
          { method: "DELETE" },
        );
        setFavoriteIds(result.productIds);
      } else {
        const result = await api<{ productIds: string[] }>("/api/favorites", {
          method: "POST",
          body: JSON.stringify({ productId }),
        });
        setFavoriteIds(result.productIds);
      }
    },
    [favoriteIds, user],
  );

  const addToCart = useCallback(
    async (product: Product, colorId: string, size: number) => {
      const colorName =
        product.colors.find((color) => color.id === colorId)?.name ?? "";
      const variantId = product.variants.find(
        (variant) =>
          variant.colorId === colorId &&
          variant.size === size &&
          variant.isActive,
      )?.id;

      if (!user) {
        if (!variantId) {
          throw new Error("This size is no longer available");
        }
        setCart((current) => {
          const itemIndex = current.findIndex(
            (item) =>
              item.productId === product.id &&
              item.colorId === colorId &&
              item.size === size,
          );
          if (itemIndex === -1) {
            return [
              ...current,
              {
                productId: product.id,
                colorId,
                size,
                quantity: 1,
                productName: product.name,
                colorName,
                image: product.image,
                unitPrice: product.price,
                slug: product.slug,
                category: product.category,
                variantId,
              },
            ];
          }
          return current.map((item, index) =>
            index === itemIndex
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          );
        });
        return;
      }

      const result = await api<CartApiResponse>("/api/cart", {
        method: "POST",
        body: JSON.stringify({
          productId: product.id,
          colorId,
          size,
          quantity: 1,
        }),
      });
      setCart(mapCartItems(result.items));
    },
    [user],
  );

  const removeFromCart = useCallback(
    async (productId: string, colorId: string, size: number) => {
      if (!user) {
        setCart((current) =>
          current.filter(
            (item) =>
              !(
                item.productId === productId &&
                item.colorId === colorId &&
                item.size === size
              ),
          ),
        );
        return;
      }

      const target = cart.find(
        (item) =>
          item.productId === productId &&
          item.colorId === colorId &&
          item.size === size,
      );
      if (!target?.variantId) return;

      const result = await api<CartApiResponse>(
        `/api/cart/${target.variantId}`,
        { method: "DELETE" },
      );
      setCart(mapCartItems(result.items));
    },
    [cart, user],
  );

  const updateQuantity = useCallback(
    async (
      productId: string,
      colorId: string,
      size: number,
      quantity: number,
    ) => {
      if (quantity < 1) {
        await removeFromCart(productId, colorId, size);
        return;
      }

      if (!user) {
        setCart((current) =>
          current.map((item) =>
            item.productId === productId &&
            item.colorId === colorId &&
            item.size === size
              ? { ...item, quantity }
              : item,
          ),
        );
        return;
      }

      const target = cart.find(
        (item) =>
          item.productId === productId &&
          item.colorId === colorId &&
          item.size === size,
      );
      if (!target?.variantId) return;

      const result = await api<CartApiResponse>(
        `/api/cart/${target.variantId}`,
        {
          method: "PATCH",
          body: JSON.stringify({ quantity }),
        },
      );
      setCart(mapCartItems(result.items));
    },
    [cart, removeFromCart, user],
  );

  const value = useMemo<CommerceContextValue>(
    () => ({
      cart,
      cartCount: cart.reduce((total, item) => total + item.quantity, 0),
      favoriteIds,
      isReady,
      toggleFavorite,
      addToCart,
      removeFromCart,
      updateQuantity,
      user,
      signIn,
      register,
      signOut,
      refreshSession,
    }),
    [
      addToCart,
      cart,
      favoriteIds,
      isReady,
      register,
      removeFromCart,
      refreshSession,
      signIn,
      signOut,
      toggleFavorite,
      updateQuantity,
      user,
    ],
  );

  return (
    <CommerceContext.Provider value={value}>{children}</CommerceContext.Provider>
  );
}

export function useCommerce(): CommerceContextValue {
  const context = useContext(CommerceContext);

  if (!context) {
    throw new Error("useCommerce must be used within CommerceProvider");
  }

  return context;
}
