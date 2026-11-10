"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { type CartItem, useCommerce } from "@/context/commerce-context";
import { formatProductPrice } from "@/lib/product-formatters";
import { useTranslate } from "@/hooks/use-translate";

type Address = {
  id: string;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  addressLine1: string;
  addressLine2: string | null;
  postalCode: string;
  phone: string;
  isDefault: boolean;
};

type Country = {
  code: string;
  name: string;
  available: boolean;
  estimatedMinDays?: number;
  estimatedMaxDays?: number;
  estimatedDelivery?: string;
};

type CheckoutPreview = {
  subtotal?: number | string;
  shippingCost?: number | string;
  total?: number | string;
  currency?: "USD";
  deliveryOptions?: Array<{
    id: "standard";
    name: string;
    price: number;
    estimatedMinDays: number;
    estimatedMaxDays: number;
  }>;
};

type CheckoutResponse = {
  orderNumber?: string;
  order?: { id?: string; orderNumber?: string; number?: string };
  preview?: CheckoutPreview;
  summary?: CheckoutPreview;
};

type ApiEnvelope<T> = {
  data?: T | null;
  error?: { message?: string } | null;
};

type NormalizedAddress = {
  countryCode: string;
  city: string;
  postalCode?: string;
  addressLine1: string;
  addressLine2?: string;
};

type AddressSuggestion = {
  id: string;
  label: string;
  normalizedAddress?: NormalizedAddress;
};

type AddressValidationResult = {
  state: "VALID" | "NEEDS_CONFIRMATION" | "INVALID" | "UNAVAILABLE";
  address?: NormalizedAddress;
  suggestedAddress?: NormalizedAddress;
  message?: string;
};

type CheckoutForm = {
  email: string;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  addressLine1: string;
  addressLine2: string;
  postalCode: string;
  phone: string;
};

const initialForm: CheckoutForm = {
  email: "",
  firstName: "",
  lastName: "",
  country: "",
  city: "",
  addressLine1: "",
  addressLine2: "",
  postalCode: "",
  phone: "",
};

function getErrorMessage(payload: ApiEnvelope<unknown>, fallback: string) {
  return payload.error?.message ?? fallback;
}

function toAmount(value: number | string | undefined) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : undefined;
}

function checkoutItems(items: CartItem[]) {
  return items.flatMap(({ variantId, quantity }) =>
    variantId ? [{ variantId, quantity }] : [],
  );
}

function validationAddress(form: CheckoutForm): NormalizedAddress {
  return {
    countryCode: form.country,
    city: form.city,
    postalCode: form.postalCode || undefined,
    addressLine1: form.addressLine1,
    addressLine2: form.addressLine2 || undefined,
  };
}

function withNormalizedAddress(
  form: CheckoutForm,
  address: NormalizedAddress,
  preserveAddressLine2 = false,
): CheckoutForm {
  return {
    ...form,
    country: address.countryCode,
    city: address.city,
    postalCode: address.postalCode ?? "",
    addressLine1: address.addressLine1,
    addressLine2: preserveAddressLine2
      ? form.addressLine2
      : (address.addressLine2 ?? form.addressLine2),
  };
}

function addressSummary(address: NormalizedAddress) {
  return [
    address.addressLine1,
    address.addressLine2,
    address.city,
    address.postalCode,
    address.countryCode,
  ].filter(Boolean).join(", ");
}

export function CheckoutContent() {
  const { cart, cartCount, isReady, user } = useCommerce();
  const { locale } = useTranslate();
  const router = useRouter();
  const [countries, setCountries] = useState<Country[]>([]);
  const [form, setForm] = useState<CheckoutForm>(initialForm);
  const [saveAddress, setSaveAddress] = useState(false);
  const [preview, setPreview] = useState<CheckoutPreview | null>(null);
  const [message, setMessage] = useState("");
  const [countryMessage, setCountryMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [suggestionsPending, setSuggestionsPending] = useState(false);
  const [autocompleteAvailable, setAutocompleteAvailable] = useState(true);
  const [autocompleteEnabled, setAutocompleteEnabled] = useState(true);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [validationResult, setValidationResult] = useState<AddressValidationResult | null>(null);
  const [validationAccepted, setValidationAccepted] = useState(false);
  const [validationPending, setValidationPending] = useState(false);
  const validationRequestRef = useRef(0);

  const selectedCountry = countries.find((country) => country.code === form.country);
  const localSubtotal = useMemo(
    () => cart.reduce((total, item) => total + (item.unitPrice ?? 0) * item.quantity, 0),
    [cart],
  );
  const subtotal = toAmount(preview?.subtotal) ?? localSubtotal;
  const shippingCost = toAmount(preview?.shippingCost);
  const total = toAmount(preview?.total) ?? (shippingCost === undefined ? undefined : subtotal + shippingCost);
  const delivery = preview?.deliveryOptions?.[0];
  const deliveryEstimate = delivery
    ? `${delivery.estimatedMinDays}–${delivery.estimatedMaxDays} business days`
    : selectedCountry?.estimatedMinDays && selectedCountry.estimatedMaxDays
      ? `${selectedCountry.estimatedMinDays}–${selectedCountry.estimatedMaxDays} business days`
      : "";

  useEffect(() => {
    void fetch("/api/shipping/countries")
      .then(async (response) => {
        const payload = (await response.json()) as ApiEnvelope<{ countries?: Country[] }>;
        if (!response.ok) throw new Error(getErrorMessage(payload, "Could not load delivery countries."));
        setCountries(payload.data?.countries ?? []);
      })
      .catch(() => setCountryMessage("Delivery countries are unavailable. Please try again."));
  }, []);

  useEffect(() => {
    if (!user) return;
    void Promise.all([fetch("/api/account"), fetch("/api/account/addresses")])
      .then(async ([accountResponse, addressResponse]) => {
        const accountPayload = (await accountResponse.json()) as ApiEnvelope<{
          user?: { email?: string; firstName?: string; lastName?: string };
        }>;
        const addressPayload = (await addressResponse.json()) as ApiEnvelope<{
          addresses?: Address[];
        }>;
        const savedAddress =
          addressPayload.data?.addresses?.find((address) => address.isDefault) ??
          addressPayload.data?.addresses?.[0];
        setForm((current) => ({
          ...current,
          email: accountPayload.data?.user?.email ?? user.email ?? current.email,
          firstName: savedAddress?.firstName ?? accountPayload.data?.user?.firstName ?? user.firstName ?? current.firstName,
          lastName: savedAddress?.lastName ?? accountPayload.data?.user?.lastName ?? user.lastName ?? current.lastName,
          country: savedAddress?.country ?? current.country,
          city: savedAddress?.city ?? current.city,
          addressLine1: savedAddress?.addressLine1 ?? current.addressLine1,
          addressLine2: savedAddress?.addressLine2 ?? current.addressLine2,
          postalCode: savedAddress?.postalCode ?? current.postalCode,
          phone: savedAddress?.phone ?? current.phone,
        }));
        setAutocompleteEnabled(false);
      })
      .catch(() => undefined);
  }, [user]);

  useEffect(() => {
    const query = form.addressLine1.trim();
    if (!autocompleteEnabled || !form.country || query.length < 3) {
      if (!form.country || query.length < 3) {
        setSuggestions([]);
        setSuggestionsPending(false);
      }
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      setSuggestionsPending(true);
      void fetch(
        `/api/address/autocomplete?query=${encodeURIComponent(query)}&countryCode=${encodeURIComponent(form.country)}`,
        { signal: controller.signal },
      )
        .then(async (response) => {
          const payload = (await response.json()) as ApiEnvelope<{
            suggestions?: AddressSuggestion[];
            available?: boolean;
          }>;
          if (!response.ok) throw new Error();
          setSuggestions(payload.data?.suggestions ?? []);
          setAutocompleteAvailable(payload.data?.available !== false);
          setActiveSuggestion(-1);
        })
        .catch(() => {
          if (!controller.signal.aborted) {
            setSuggestions([]);
            setAutocompleteAvailable(false);
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) setSuggestionsPending(false);
        });
    }, 300);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [autocompleteEnabled, form.addressLine1, form.country]);

  if (!isReady) return <div className="h-40" />;

  if (!cartCount) {
    return (
      <section className="bg-white px-6 py-16 text-center">
        <h2 className="text-xl font-semibold text-charcoal">Your bag is empty</h2>
        <Link
          href="/cart"
          className="mt-6 inline-block border-b border-brown pb-1 text-sm font-semibold text-brown"
        >
          Return to Shopping Bag
        </Link>
      </section>
    );
  }

  const updateForm = <Key extends keyof CheckoutForm>(key: Key, value: CheckoutForm[Key]) => {
    setForm((current) => {
      if (key === "country") {
        return { ...current, country: value as string, postalCode: "" };
      }
      return { ...current, [key]: value };
    });
    if (key === "addressLine1") {
      setAutocompleteEnabled(true);
      if ((value as string).trim().length < 3) {
        setSuggestions([]);
        setSuggestionsPending(false);
        setActiveSuggestion(-1);
      }
    }
    if (key === "country" || key === "city" || key === "addressLine1" || key === "addressLine2" || key === "postalCode") {
      validationRequestRef.current += 1;
      setValidationResult(null);
      setValidationAccepted(false);
      setValidationPending(false);
    }
    if (key === "country") {
      setPreview(null);
      setCountryMessage("");
      setSuggestions([]);
      setAutocompleteEnabled(false);
      setActiveSuggestion(-1);
    }
  };

  const validateAddress = async (addressForm: CheckoutForm) => {
    const requestId = ++validationRequestRef.current;
    setValidationPending(true);
    setMessage("");
    try {
      const response = await fetch("/api/address/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validationAddress(addressForm)),
      });
      const payload = (await response.json()) as ApiEnvelope<{ result?: AddressValidationResult }>;
      if (!response.ok || !payload.data?.result) {
        if (requestId === validationRequestRef.current) {
          setMessage(getErrorMessage(payload, "Could not validate this address."));
        }
        return null;
      }
      if (requestId !== validationRequestRef.current) return null;
      const result = payload.data.result;
      setValidationResult(result);
      setValidationAccepted(result.state === "VALID");
      if (result.state === "VALID" && result.address) {
        setForm((current) => withNormalizedAddress(current, result.address!));
      }
      return result;
    } catch {
      if (requestId === validationRequestRef.current) {
        setMessage("Could not validate this address. Please try again.");
      }
      return null;
    } finally {
      if (requestId === validationRequestRef.current) {
        setValidationPending(false);
      }
    }
  };

  const selectSuggestion = (suggestion: AddressSuggestion) => {
    const nextForm = suggestion.normalizedAddress
      ? withNormalizedAddress(form, suggestion.normalizedAddress, true)
      : { ...form, addressLine1: suggestion.label };
    setForm(nextForm);
    setSuggestions([]);
    setAutocompleteEnabled(false);
    setActiveSuggestion(-1);
    setValidationResult(null);
    setValidationAccepted(false);
    void validateAddress(nextForm);
  };

  const handleAddressKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!suggestions.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveSuggestion((current) => (current + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveSuggestion((current) => (current <= 0 ? suggestions.length - 1 : current - 1));
    } else if (event.key === "Enter" && activeSuggestion >= 0) {
      event.preventDefault();
      selectSuggestion(suggestions[activeSuggestion]);
    } else if (event.key === "Escape") {
      setSuggestions([]);
      setActiveSuggestion(-1);
    }
  };

  const loadPreview = async (country: string) => {
    if (!countries.some((item) => item.code === country && item.available)) return;
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preview: true,
          countryCode: country,
          cartItems: checkoutItems(cart),
        }),
      });
      if (!response.ok) {
        const payload = (await response.json()) as ApiEnvelope<unknown>;
        setCountryMessage(getErrorMessage(payload, "Could not calculate delivery."));
        return;
      }
      const payload = (await response.json()) as ApiEnvelope<CheckoutResponse>;
      setPreview(payload.data?.preview ?? payload.data?.summary ?? null);
    } catch {
      // Country delivery data remains a useful fallback until checkout is submitted.
    }
  };

  const placeOrder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    const cartItems = checkoutItems(cart);
    if (!selectedCountry?.available) {
      setCountryMessage("Select a supported delivery country to continue.");
      return;
    }
    if (cartItems.length !== cart.length) {
      setMessage("Please refresh your bag before checkout.");
      return;
    }
    let checkoutForm = form;
    if (!validationResult || !validationAccepted) {
      const result = await validateAddress(form);
      if (!result || result.state === "INVALID") return;
      if (
        result.state === "NEEDS_CONFIRMATION" ||
        result.state === "UNAVAILABLE"
      ) {
        setMessage(
          result.state === "UNAVAILABLE"
            ? "Please confirm that this delivery address is correct."
            : "Please choose the suggested address or confirm your entered address.",
        );
        return;
      }
      if (result.address) {
        checkoutForm = withNormalizedAddress(form, result.address);
      }
    }
    setPending(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartItems,
          contact: {
            email: checkoutForm.email,
            firstName: checkoutForm.firstName,
            lastName: checkoutForm.lastName,
            phone: checkoutForm.phone,
          },
          shippingAddress: {
            firstName: checkoutForm.firstName,
            lastName: checkoutForm.lastName,
            country: checkoutForm.country,
            city: checkoutForm.city,
            addressLine1: checkoutForm.addressLine1,
            addressLine2: checkoutForm.addressLine2 || null,
            postalCode: checkoutForm.postalCode,
            phone: checkoutForm.phone,
          },
          saveAddress: user ? saveAddress : false,
          countryCode: checkoutForm.country,
          deliveryMethod: "standard",
          clientRequestId:
            globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
        }),
      });
      const payload = (await response.json()) as ApiEnvelope<CheckoutResponse>;
      if (!response.ok) {
        setMessage(getErrorMessage(payload, "Could not place your order."));
        return;
      }
      const orderNumber =
        payload.data?.orderNumber ??
        payload.data?.order?.orderNumber ??
        payload.data?.order?.number ??
        payload.data?.order?.id;
      if (!orderNumber) {
        setMessage("Your order was received, but its confirmation number is unavailable.");
        return;
      }
      router.push(`/order-confirmation/${encodeURIComponent(orderNumber)}`);
    } catch {
      setMessage("Could not place your order. Please try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={placeOrder} className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
      <section className="min-w-0 border-t border-sand pt-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="text-xl font-semibold text-charcoal">Contact & delivery</h2>
          {!user ? (
            <button type="button" onClick={() => window.dispatchEvent(new Event("kapriz:open-auth"))} className="border-b border-brown pb-1 text-sm font-semibold text-brown">
              Sign In
            </button>
          ) : null}
        </div>
        {!user ? <p className="mt-2 text-sm text-leather">Already have an account? Sign in to use your saved details.</p> : null}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Email" type="email" value={form.email} onChange={(value) => updateForm("email", value)} className="sm:col-span-2" />
          <Field label="First name" value={form.firstName} onChange={(value) => updateForm("firstName", value)} />
          <Field label="Last name" value={form.lastName} onChange={(value) => updateForm("lastName", value)} />
          <label className="grid gap-2 text-sm text-charcoal">
            Country
            <select required value={form.country} onChange={(event) => { updateForm("country", event.target.value); void loadPreview(event.target.value); }} className="border border-sand bg-white px-3 py-3 text-sm">
              <option value="">Select country</option>
              {countries.map((country) => <option key={country.code} value={country.code} disabled={!country.available}>{country.name}</option>)}
            </select>
          </label>
          <Field label="City" value={form.city} onChange={(value) => updateForm("city", value)} />
          <div className="relative grid gap-2 text-sm text-charcoal sm:col-span-2">
            <label htmlFor="checkout-address-line-1">Address line 1</label>
            <input
              id="checkout-address-line-1"
              required
              autoComplete="address-line1"
              value={form.addressLine1}
              onChange={(event) => updateForm("addressLine1", event.target.value)}
              onKeyDown={handleAddressKeyDown}
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={suggestions.length > 0}
              aria-controls="checkout-address-suggestions"
              aria-activedescendant={activeSuggestion >= 0 ? `checkout-address-suggestion-${activeSuggestion}` : undefined}
              className="min-w-0 border border-sand px-3 py-3 text-sm"
            />
            {suggestionsPending ? <p className="text-xs text-leather">Finding addresses…</p> : null}
            {!form.country && form.addressLine1.trim().length >= 3 ? (
              <p className="text-xs text-leather">Select a country to see address suggestions.</p>
            ) : null}
            {form.country && form.addressLine1.trim().length >= 3 && !suggestionsPending && !suggestions.length && !autocompleteAvailable ? (
              <p className="text-xs text-leather">Address suggestions unavailable — enter the address manually.</p>
            ) : null}
            {suggestions.length ? (
              <ul id="checkout-address-suggestions" role="listbox" aria-label="Address suggestions" className="absolute top-full z-10 mt-1 max-h-56 w-full overflow-y-auto border border-sand bg-white shadow-sm">
                {suggestions.map((suggestion, index) => (
                  <li id={`checkout-address-suggestion-${index}`} key={suggestion.id} role="option" aria-selected={activeSuggestion === index}>
                    <button
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => selectSuggestion(suggestion)}
                      className={`w-full px-3 py-3 text-left text-sm ${activeSuggestion === index ? "bg-cream" : "hover:bg-cream"}`}
                    >
                      {suggestion.label}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <Field label="Address line 2 (optional)" value={form.addressLine2} onChange={(value) => updateForm("addressLine2", value)} required={false} className="sm:col-span-2" />
          <Field label="Postal code" value={form.postalCode} onChange={(value) => updateForm("postalCode", value)} />
          <Field label="Phone" type="tel" value={form.phone} onChange={(value) => updateForm("phone", value)} />
        </div>
        {validationPending ? <p className="mt-4 text-sm text-leather">Checking delivery address…</p> : null}
        {validationResult?.state === "INVALID" ? (
          <p role="alert" className="mt-4 text-sm text-brown">{validationResult.message ?? "Please enter a valid delivery address."}</p>
        ) : null}
        {validationResult?.state === "NEEDS_CONFIRMATION" ? (
          <div className="mt-4 border border-sand p-4 text-sm text-charcoal">
            <p className="font-semibold">{validationResult.message ?? "Please confirm your delivery address."}</p>
            <div className="mt-3 grid gap-2 text-leather">
              <p><span className="font-semibold text-charcoal">Entered:</span> {addressSummary(validationResult.address ?? validationAddress(form))}</p>
              {validationResult.suggestedAddress ? <p><span className="font-semibold text-charcoal">Suggested:</span> {addressSummary(validationResult.suggestedAddress)}</p> : null}
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              {validationResult.suggestedAddress ? (
                <button type="button" onClick={() => {
                  setForm((current) => withNormalizedAddress(current, validationResult.suggestedAddress!));
                  setValidationAccepted(true);
                }} className="bg-brown px-4 py-2 font-semibold text-white">
                  Use suggested
                </button>
              ) : null}
              <button type="button" onClick={() => setValidationAccepted(true)} className="border border-brown px-4 py-2 font-semibold text-brown">
                Keep my address
              </button>
            </div>
            {validationAccepted ? <p className="mt-3 text-xs text-leather">Address confirmed.</p> : null}
          </div>
        ) : null}
        {validationResult?.state === "UNAVAILABLE" ? (
          <div className="mt-4 border border-sand p-4 text-sm text-charcoal">
            <p>{validationResult.message ?? "Automatic address validation is unavailable. Please check the address manually."}</p>
            <label className="mt-3 flex items-start gap-3 text-leather">
              <input type="checkbox" checked={validationAccepted} onChange={(event) => setValidationAccepted(event.target.checked)} className="mt-1" />
              I confirm that this delivery address is correct
            </label>
          </div>
        ) : null}
        {user ? <label className="mt-5 flex items-start gap-3 text-sm text-leather"><input type="checkbox" checked={saveAddress} onChange={(event) => setSaveAddress(event.target.checked)} className="mt-1" />Save this delivery address to my account</label> : null}
        {countryMessage ? <p role="alert" className="mt-4 text-sm text-brown">{countryMessage}</p> : null}
        {message ? <p role="alert" className="mt-4 text-sm text-brown">{message}</p> : null}
      </section>
      <aside className="h-fit min-w-0 bg-white p-6 lg:sticky lg:top-6">
        <h2 className="text-xl font-semibold text-charcoal">Summary</h2>
        <ul className="mt-5 space-y-3 text-sm text-leather">
          {cart.map((item) => (
            <li key={`${item.productId}-${item.variantId ?? item.size}`}>
              {item.productName} × {item.quantity}
            </li>
          ))}
        </ul>
        <dl className="mt-6 space-y-3 border-t border-sand pt-5 text-sm">
          <div className="flex justify-between gap-4"><dt className="text-leather">Subtotal</dt><dd className="text-charcoal">{formatProductPrice(subtotal, "USD", locale)}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-leather">Standard delivery</dt><dd className="text-charcoal">{shippingCost === undefined ? "Calculated securely" : formatProductPrice(shippingCost, "USD", locale)}</dd></div>
          {deliveryEstimate ? <div className="flex justify-between gap-4"><dt className="text-leather">Estimate</dt><dd className="text-right text-charcoal">{deliveryEstimate}</dd></div> : null}
          <div className="flex justify-between gap-4 border-t border-sand pt-3 text-base font-semibold"><dt>Total</dt><dd>{total === undefined ? "Calculated securely" : formatProductPrice(total, "USD", locale)}</dd></div>
        </dl>
        <p className="mt-5 text-xs leading-5 text-leather">Delivery estimates exclude customs processing. Import duties or taxes may be collected by your local authority.</p>
        <p className="mt-5 text-xs leading-5 text-leather">
          Shipping price and estimated delivery time are calculated for your selected destination.
        </p>
        <button type="submit" disabled={pending || validationPending || !selectedCountry?.available || !preview} className="mt-6 w-full bg-brown px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">
          {pending ? "Placing your order..." : validationPending ? "Checking address..." : "Place order"}
        </button>
      </aside>
    </form>
  );
}

function Field({ label, value, onChange, type = "text", required = true, className = "" }: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  className?: string;
}) {
  return <label className={`grid gap-2 text-sm text-charcoal ${className}`}>{label}<input required={required} type={type} value={value} onChange={(event) => onChange(event.target.value)} className="min-w-0 border border-sand px-3 py-3 text-sm" /></label>;
}
