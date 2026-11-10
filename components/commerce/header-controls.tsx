"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ModeToggle } from "@/components/layout/mode-toggle";
import { Icon } from "@/components/ui/icon";
import { useCommerce } from "@/context/commerce-context";
import { formatProductPrice } from "@/lib/product-formatters";
import { useTranslate } from "@/hooks/use-translate";
import type { Product } from "@/types";

type Overlay = "search" | "auth" | "cart" | null;
type AuthMode = "sign-in" | "register" | "reset" | "reset-success";

const headerControlClassName =
  "rounded-full p-1.5 text-charcoal transition-colors hover:bg-sand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brown sm:p-2";

function useOverlayScrollLock(isOpen: boolean) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);
}

export function HeaderControls() {
  const { cart, cartCount, user } = useCommerce();
  const { locale } = useTranslate();
  const router = useRouter();
  const [overlay, setOverlay] = useState<Overlay>(null);

  useOverlayScrollLock(overlay !== null);

  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOverlay(null);
      }
    };

    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  useEffect(() => {
    const openAuth = () => setOverlay("auth");
    window.addEventListener("kapriz:open-auth", openAuth);
    return () => window.removeEventListener("kapriz:open-auth", openAuth);
  }, []);

  useEffect(() => {
    const openCart = () => setOverlay("cart");
    window.addEventListener("kapriz:open-cart", openCart);
    return () => window.removeEventListener("kapriz:open-cart", openCart);
  }, []);

  return (
    <>
      <div className="flex items-center gap-0.5 sm:gap-2">
        {user?.role === "ADMIN" ? <ModeToggle active="storefront" /> : null}
        <button
          type="button"
          aria-label="Open search"
          onClick={() => setOverlay("search")}
          className={headerControlClassName}
        >
          <Icon name="search" className="size-5" />
        </button>
        <Link
          href="/favorites"
          aria-label="View favorites"
          className={`relative ${headerControlClassName}`}
        >
          <Icon name="heart" className="size-5" />
        </Link>
        <button
          type="button"
          aria-label={user ? "Open account" : "Open account sign in"}
          onClick={() => {
            if (user) {
              router.push("/account");
            } else {
              setOverlay("auth");
            }
          }}
          className={headerControlClassName}
        >
          <Icon name="user" className="size-5" />
        </button>
        <button
          type="button"
          aria-label="Open shopping bag"
          onClick={() => setOverlay("cart")}
          className={`relative ${headerControlClassName}`}
        >
          <Icon name="bag" className="size-5" />
          {cartCount > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-brown text-[0.6rem] font-semibold text-white">
              {cartCount}
            </span>
          ) : null}
        </button>
      </div>

      {overlay === "search" ? <SearchOverlay onClose={() => setOverlay(null)} /> : null}
      {overlay === "auth" ? <AuthModal onClose={() => setOverlay(null)} /> : null}
      {overlay === "cart" ? (
        <CartDrawer
          cart={cart}
          locale={locale}
          onClose={() => setOverlay(null)}
        />
      ) : null}
    </>
  );
}

function OverlayFrame({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-[70] bg-charcoal/40 p-4 sm:p-8"
    >
      <div
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) {
            onClose();
          }
        }}
      >
        {children}
      </div>
    </div>
  );
}

function SearchOverlay({ onClose }: { onClose: () => void }) {
  const { locale } = useTranslate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);

  useEffect(() => inputRef.current?.focus(), []);

  useEffect(() => {
    const normalized = query.trim();
    if (!normalized) {
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void fetch(`/api/products?limit=24&sort=featured`, {
        signal: controller.signal,
      })
        .then((response) => response.json())
        .then((payload: { data?: { items?: Product[] } }) => {
          const items = payload.data?.items ?? [];
          const needle = normalized.toLowerCase();
          setResults(
            items.filter((product) =>
              [product.name, product.model, product.category, ...product.colors.map((color) => color.name)]
                .join(" ")
                .toLowerCase()
                .includes(needle),
            ),
          );
        })
        .catch(() => {
          if (!controller.signal.aborted) setResults([]);
        });
    }, 200);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query]);

  const visibleResults = query.trim() ? results : [];

  return (
    <OverlayFrame onClose={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="search-title"
        className="mx-auto max-h-full w-full max-w-3xl overflow-y-auto bg-ivory p-6 shadow-xl sm:p-10"
      >
        <div className="flex items-center justify-between gap-4">
          <h2 id="search-title" className="text-2xl font-semibold text-charcoal">
            Search Kapriz
          </h2>
          <button type="button" onClick={onClose} className="text-sm font-semibold text-brown">
            Close
          </button>
        </div>
        <label className="sr-only" htmlFor="site-search">Search shoes and collections</label>
        <input
          ref={inputRef}
          id="site-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search shoes, collections..."
          className="mt-6 w-full border-b border-brown bg-transparent px-0 py-3 text-lg text-charcoal outline-none placeholder:text-leather/70"
        />
        {!query ? (
          <div className="mt-8">
            <p className="text-sm font-semibold text-charcoal">Popular searches</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {["Oxford", "Loafers", "Derby", "Monk Strap"].map((term) => (
                <button key={term} type="button" onClick={() => setQuery(term)} className="border border-sand px-3 py-2 text-sm text-brown">
                  {term}
                </button>
              ))}
            </div>
          </div>
        ) : null}
        {query ? (
          <div className="mt-8">
            {visibleResults.length ? (
              <ul className="divide-y divide-sand">
                {visibleResults.slice(0, 6).map((product) => (
                  <li key={product.id}>
                    <Link href={`/${product.category}/${product.slug}`} onClick={onClose} className="flex items-center gap-4 py-4">
                      <Image src={product.image} alt="" width={56} height={70} className="bg-white object-cover" />
                      <span className="min-w-0">
                        <span className="block font-semibold text-charcoal">{product.name}</span>
                        <span className="mt-1 block text-sm text-leather">{product.category === "men" ? "Men" : "Women"} · {formatProductPrice(product.price, product.currency, locale)}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-10 text-center text-leather">No products found. Try another search.</p>
            )}
          </div>
        ) : null}
      </section>
    </OverlayFrame>
  );
}

function AuthModal({ onClose }: { onClose: () => void }) {
  const { signIn, register } = useCommerce();
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    if (!email.includes("@")) {
      setMessage("Enter a valid email address.");
      return;
    }
    if (mode !== "reset" && password.length < 8) {
      setMessage("Password must contain at least 8 characters.");
      return;
    }
    if (mode === "register" && password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }
    if (mode === "reset") {
      setMode("reset-success");
      return;
    }

    setPending(true);
    try {
      if (mode === "register") {
        await register({ firstName, lastName, email, password });
      } else {
        await signIn(email, password);
      }
      onClose();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Authentication failed.");
    } finally {
      setPending(false);
    }
  };

  return (
    <OverlayFrame onClose={onClose}>
      <section role="dialog" aria-modal="true" aria-labelledby="auth-title" className="mx-auto max-h-full w-full max-w-md overflow-y-auto bg-ivory p-6 shadow-xl sm:p-8">
        <div className="flex justify-end">
          <button type="button" onClick={onClose} className="text-sm font-semibold text-brown">Close</button>
        </div>
        {mode === "reset-success" ? (
          <div className="py-8">
            <h2 id="auth-title" className="text-2xl font-semibold text-charcoal">Check your email</h2>
            <p className="mt-4 leading-7 text-leather">If an account exists for this email, password reset instructions will be sent.</p>
            <button type="button" onClick={() => setMode("sign-in")} className="mt-7 border-b border-brown pb-1 text-sm font-semibold text-brown">Back to Sign In</button>
          </div>
        ) : (
          <form onSubmit={submit} className="py-4">
            <h2 id="auth-title" className="text-2xl font-semibold text-charcoal">
              {mode === "sign-in" ? "Welcome back" : mode === "register" ? "Create account" : "Reset your password"}
            </h2>
            <p className="mt-3 text-sm leading-6 text-leather">
              {mode === "sign-in" ? "Sign in to access your orders, favorites and account details." : mode === "register" ? "Create an account to save favorites and manage your orders." : "Enter your email and we'll send you instructions to reset your password."}
            </p>
            {mode === "register" ? (
              <div className="mt-6 grid grid-cols-2 gap-3">
                <Field label="First name" name="firstName" required value={firstName} onChange={setFirstName} />
                <Field label="Last name" name="lastName" required value={lastName} onChange={setLastName} />
              </div>
            ) : null}
            <div className="mt-6"><Field label="Email" name="email" type="email" required value={email} onChange={setEmail} /></div>
            {mode !== "reset" ? (
              <>
                <div className="mt-4"><Field label="Password" name="password" type="password" required minLength={8} value={password} onChange={setPassword} /></div>
                {mode === "register" ? <div className="mt-4"><Field label="Confirm password" name="confirmPassword" type="password" required minLength={8} value={confirmPassword} onChange={setConfirmPassword} /></div> : null}
              </>
            ) : null}
            {message ? <p className="mt-3 text-sm text-leather">{message}</p> : null}
            {mode === "sign-in" ? <button type="button" onClick={() => setMode("reset")} className="mt-4 text-sm text-brown underline underline-offset-4">Forgot password?</button> : null}
            <button type="submit" disabled={pending} className="mt-6 w-full bg-brown px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">
              {pending ? "Please wait…" : mode === "sign-in" ? "Sign In" : mode === "register" ? "Create Account" : "Send Reset Link"}
            </button>
            <p className="mt-5 text-center text-sm text-leather">
              {mode === "sign-in" ? "Don't have an account? " : "Already have an account? "}
              <button type="button" onClick={() => setMode(mode === "sign-in" ? "register" : "sign-in")} className="font-semibold text-brown underline underline-offset-4">
                {mode === "sign-in" ? "Create account" : "Sign in"}
              </button>
            </p>
          </form>
        )}
      </section>
    </OverlayFrame>
  );
}

function Field({ label, name, type = "text", required, minLength, value, onChange }: { label: string; name: string; type?: string; required?: boolean; minLength?: number; value?: string; onChange?: (value: string) => void }) {
  return <label className="block text-sm font-medium text-charcoal">{label}<input name={name} type={type} required={required} minLength={minLength} value={value} onChange={onChange ? (event) => onChange(event.target.value) : undefined} className="mt-2 block w-full border border-sand bg-white px-3 py-3 text-sm outline-none focus:border-brown" /></label>;
}

function CartDrawer({ cart, locale, onClose }: { cart: ReturnType<typeof useCommerce>["cart"]; locale: ReturnType<typeof useTranslate>["locale"]; onClose: () => void }) {
  const { removeFromCart, updateQuantity } = useCommerce();
  const subtotal = cart.reduce(
    (total, item) => total + (item.unitPrice ?? 0) * item.quantity,
    0,
  );
  return (
    <OverlayFrame onClose={onClose}>
      <aside role="dialog" aria-modal="true" aria-labelledby="bag-title" className="ml-auto flex h-full w-full max-w-md flex-col bg-ivory p-6 shadow-xl sm:p-8">
        <div className="flex items-center justify-between">
          <h2 id="bag-title" className="text-2xl font-semibold text-charcoal">Your Bag</h2>
          <button type="button" onClick={onClose} className="text-sm font-semibold text-brown">Close</button>
        </div>
        <p className="mt-2 text-sm text-leather">{cart.reduce((total, item) => total + item.quantity, 0)} items</p>
        <div className="mt-6 flex-1 overflow-y-auto">
          {cart.length ? (
            cart.map((item) => (
              <article key={`${item.productId}-${item.colorId}-${item.size}`} className="flex gap-4 border-b border-sand py-4">
                <Image src={item.image ?? "/images/for-al-boxes.png"} alt="" width={72} height={90} className="bg-white object-cover" />
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-charcoal">{item.productName ?? "Product"}</h3>
                  <p className="mt-1 text-sm text-leather">{item.colorName} · Size {item.size}</p>
                  <p className="mt-2 text-sm text-brown">{formatProductPrice(item.unitPrice ?? 0, "USD", locale)}</p>
                  <div className="mt-3 flex items-center gap-3">
                    <button type="button" onClick={() => void updateQuantity(item.productId, item.colorId, item.size, item.quantity - 1)} className="border border-sand px-2">−</button>
                    <span className="text-sm">{item.quantity}</span>
                    <button type="button" onClick={() => void updateQuantity(item.productId, item.colorId, item.size, item.quantity + 1)} className="border border-sand px-2">+</button>
                    <button type="button" onClick={() => void removeFromCart(item.productId, item.colorId, item.size)} className="ml-auto text-xs font-semibold text-brown underline">Remove</button>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="py-16 text-center">
              <p className="font-semibold text-charcoal">Your bag is empty.</p>
              <p className="mt-2 text-sm leading-6 text-leather">Discover handcrafted shoes made to become part of your story.</p>
              <Link href="/men" onClick={onClose} className="mt-5 inline-block border-b border-brown pb-1 text-sm font-semibold text-brown">Explore Collections</Link>
            </div>
          )}
        </div>
        {cart.length ? (
          <div className="border-t border-sand pt-5">
            <div className="flex justify-between font-semibold text-charcoal">
              <span>Subtotal</span>
              <span>{formatProductPrice(subtotal, "USD", locale)}</span>
            </div>
            <Link href="/cart" onClick={onClose} className="mt-5 block border border-brown px-4 py-3 text-center text-sm font-semibold text-brown">View Bag</Link>
            <Link href="/checkout" onClick={onClose} className="mt-3 block bg-brown px-4 py-3 text-center text-sm font-semibold text-white">Checkout</Link>
          </div>
        ) : null}
      </aside>
    </OverlayFrame>
  );
}
