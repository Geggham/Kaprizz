import "server-only";

import { createGoogleAddressProvider } from "@/lib/address/google-provider";
import { createMockAddressProvider } from "@/lib/address/mock-provider";
import {
  postalCodeRequired,
  validatePostalCode,
} from "@/lib/address/postal-rules";
import type {
  AddressSuggestion,
  AddressValidationResult,
  NormalizedAddress,
} from "@/lib/address/types";
import { prisma } from "@/lib/prisma";

export type AddressAutocompleteResult = {
  suggestions: AddressSuggestion[];
  /** False when Google key is missing and mock fallback is not active. */
  available: boolean;
  source: "google" | "mock" | "none";
};

function getGoogleProvider() {
  return createGoogleAddressProvider();
}

function getAutocompleteProvider() {
  const google = getGoogleProvider();
  if (google.isConfigured()) {
    return { provider: google, source: "google" as const };
  }
  if (process.env.NODE_ENV === "development") {
    return { provider: createMockAddressProvider(), source: "mock" as const };
  }
  return { provider: null, source: "none" as const };
}

async function isActiveShippingCountry(countryCode: string) {
  const country = await prisma.shippingCountry.findFirst({
    where: { code: countryCode.toUpperCase(), isActive: true },
    select: { code: true },
  });
  return Boolean(country);
}

/**
 * Autocomplete suggestions for a shipping country.
 * Never validates full addresses — keystroke-safe.
 * In development without GOOGLE_MAPS_API_KEY, uses a local mock so the dropdown is testable.
 */
export async function suggestAddresses(
  query: string,
  countryCode: string,
): Promise<AddressAutocompleteResult> {
  const code = countryCode.toUpperCase();
  const active = await isActiveShippingCountry(code);
  if (!active) {
    return { suggestions: [], available: false, source: "none" };
  }

  const { provider, source } = getAutocompleteProvider();
  if (!provider) {
    return { suggestions: [], available: false, source: "none" };
  }

  try {
    const suggestions = await provider.autocomplete(query, code);
    return { suggestions, available: true, source };
  } catch {
    return { suggestions: [], available: true, source };
  }
}

/**
 * Layered full-address validation. Call only on blur/submit, not every keystroke.
 */
export async function validateDeliveryAddress(
  input: NormalizedAddress,
): Promise<AddressValidationResult> {
  const countryCode = input.countryCode.toUpperCase();
  const address: NormalizedAddress = { ...input, countryCode };

  const active = await isActiveShippingCountry(countryCode);
  if (!active) {
    return {
      state: "INVALID",
      address,
      message: "Delivery is currently unavailable to this country",
    };
  }

  const postal = address.postalCode?.trim() ?? "";
  if (postalCodeRequired(countryCode) && !postal) {
    return {
      state: "INVALID",
      address,
      message: `Please enter a valid postal code for ${countryCode}`,
    };
  }

  if (!validatePostalCode(countryCode, postal || undefined)) {
    return {
      state: "INVALID",
      address,
      message: `Please enter a valid postal code for ${countryCode}`,
    };
  }

  const provider = getGoogleProvider();
  if (!provider.isConfigured() || !provider.supportsValidation(countryCode)) {
    return {
      state: "UNAVAILABLE",
      address,
      message: "Please confirm that this address is correct",
    };
  }

  try {
    return await provider.validate(address);
  } catch {
    return {
      state: "UNAVAILABLE",
      address,
      message: "Please confirm that this address is correct",
    };
  }
}
