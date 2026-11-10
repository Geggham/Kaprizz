import "server-only";

import type {
  AddressProvider,
  AddressSuggestion,
  AddressValidationResult,
  NormalizedAddress,
} from "@/lib/address/types";

/**
 * Google Address Validation coverage for Kapriz shipping countries.
 * Source: https://developers.google.com/maps/documentation/address-validation/coverage
 * Only DE is listed among AM, GR, IL, GE, AE, DE.
 */
const VALIDATION_SUPPORTED_COUNTRIES = new Set(["DE"]);

const PLACES_AUTOCOMPLETE_URL =
  "https://places.googleapis.com/v1/places:autocomplete";
const ADDRESS_VALIDATION_URL =
  "https://addressvalidation.googleapis.com/v1:validateAddress";

type GooglePlacePrediction = {
  placeId?: string;
  text?: { text?: string };
};

type GoogleAutocompleteResponse = {
  suggestions?: Array<{ placePrediction?: GooglePlacePrediction }>;
};

type GooglePostalAddress = {
  regionCode?: string;
  administrativeArea?: string;
  locality?: string;
  postalCode?: string;
  addressLines?: string[];
};

type GoogleValidateResponse = {
  result?: {
    verdict?: {
      inputGranularity?: string;
      validationGranularity?: string;
      geocodeGranularity?: string;
      addressComplete?: boolean;
      hasUnconfirmedComponents?: boolean;
      hasInferredComponents?: boolean;
      hasReplacedComponents?: boolean;
    };
    address?: {
      formattedAddress?: string;
      postalAddress?: GooglePostalAddress;
    };
    geocode?: {
      location?: { latitude?: number; longitude?: number };
    };
  };
};

function getApiKey(): string | null {
  const key = process.env.GOOGLE_MAPS_API_KEY?.trim();
  return key ? key : null;
}

function unavailable(message?: string): AddressValidationResult {
  return {
    state: "UNAVAILABLE",
    message: message ?? "Address validation is temporarily unavailable",
  };
}

function fromPostalAddress(
  postal: GooglePostalAddress | undefined,
  fallback: NormalizedAddress,
  location?: { latitude?: number; longitude?: number },
): NormalizedAddress {
  const lines = postal?.addressLines ?? [];
  return {
    countryCode: (postal?.regionCode ?? fallback.countryCode).toUpperCase(),
    administrativeArea: postal?.administrativeArea || fallback.administrativeArea,
    city: postal?.locality || fallback.city,
    postalCode: postal?.postalCode || fallback.postalCode,
    addressLine1: lines[0] || fallback.addressLine1,
    addressLine2: lines[1] || fallback.addressLine2,
    latitude: location?.latitude,
    longitude: location?.longitude,
  };
}

function mapValidationResult(
  payload: GoogleValidateResponse,
  input: NormalizedAddress,
): AddressValidationResult {
  const result = payload.result;
  if (!result) return unavailable();

  const verdict = result.verdict;
  const suggested = fromPostalAddress(
    result.address?.postalAddress,
    input,
    result.geocode?.location,
  );

  const hasMaterialChanges =
    Boolean(verdict?.hasReplacedComponents) ||
    Boolean(verdict?.hasInferredComponents) ||
    Boolean(verdict?.hasUnconfirmedComponents);

  if (verdict?.addressComplete && !hasMaterialChanges) {
    return { state: "VALID", address: suggested };
  }

  if (
    verdict?.validationGranularity === "OTHER" ||
    verdict?.validationGranularity === "GRANULARITY_UNSPECIFIED"
  ) {
    return {
      state: "INVALID",
      address: input,
      message: "We could not verify this address",
    };
  }

  if (hasMaterialChanges || verdict?.addressComplete === false) {
    return {
      state: "NEEDS_CONFIRMATION",
      address: input,
      suggestedAddress: suggested,
      message: "We found a more complete version of this address",
    };
  }

  if (verdict?.addressComplete) {
    return { state: "VALID", address: suggested };
  }

  return {
    state: "NEEDS_CONFIRMATION",
    address: input,
    suggestedAddress: suggested,
    message: "Please confirm that this address is correct",
  };
}

async function postJson<T>(
  url: string,
  apiKey: string,
  body: unknown,
  headers?: Record<string, string>,
): Promise<T | null> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        ...headers,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      if (process.env.NODE_ENV === "development") {
        const detail = await response.text().catch(() => "");
        console.warn(
          `[address] Google request failed ${response.status} ${url}`,
          detail.slice(0, 400),
        );
      }
      return null;
    }

    return (await response.json()) as T;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[address] Google request error", error);
    }
    return null;
  }
}

export function createGoogleAddressProvider(): AddressProvider {
  return {
    isConfigured() {
      return Boolean(getApiKey());
    },

    supportsValidation(countryCode: string) {
      return VALIDATION_SUPPORTED_COUNTRIES.has(countryCode.toUpperCase());
    },

    async autocomplete(query: string, countryCode: string) {
      const apiKey = getApiKey();
      if (!apiKey) return [];

      const region = countryCode.toUpperCase();
      // Avoid narrow includedPrimaryTypes — they often return zero hits for partial street input.
      const payload = await postJson<GoogleAutocompleteResponse>(
        PLACES_AUTOCOMPLETE_URL,
        apiKey,
        {
          input: query,
          includedRegionCodes: [region],
          languageCode: "en",
        },
        {
          "X-Goog-FieldMask":
            "suggestions.placePrediction.placeId,suggestions.placePrediction.text",
        },
      );

      if (!payload?.suggestions) return [];

      const suggestions: AddressSuggestion[] = [];
      for (const item of payload.suggestions) {
        const prediction = item.placePrediction;
        const id = prediction?.placeId?.trim();
        const label = prediction?.text?.text?.trim();
        if (!id || !label) continue;
        suggestions.push({ id, label });
      }
      return suggestions;
    },

    async validate(address: NormalizedAddress) {
      const apiKey = getApiKey();
      if (!apiKey) return unavailable();

      const countryCode = address.countryCode.toUpperCase();
      if (!VALIDATION_SUPPORTED_COUNTRIES.has(countryCode)) {
        return unavailable("Address validation is not available for this country");
      }

      const addressLines = [address.addressLine1];
      if (address.addressLine2?.trim()) {
        addressLines.push(address.addressLine2.trim());
      }

      const payload = await postJson<GoogleValidateResponse>(
        ADDRESS_VALIDATION_URL,
        apiKey,
        {
          address: {
            regionCode: countryCode,
            locality: address.city,
            administrativeArea: address.administrativeArea,
            postalCode: address.postalCode,
            addressLines,
          },
        },
      );

      if (!payload) return unavailable();
      return mapValidationResult(payload, { ...address, countryCode });
    },
  };
}
