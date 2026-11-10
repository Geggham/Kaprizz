import "server-only";

import type {
  AddressProvider,
  AddressSuggestion,
  AddressValidationResult,
  NormalizedAddress,
} from "@/lib/address/types";

const CITY_BY_COUNTRY: Record<string, { city: string; postalCode: string }> = {
  AM: { city: "Yerevan", postalCode: "0001" },
  GR: { city: "Athens", postalCode: "10552" },
  IL: { city: "Tel Aviv", postalCode: "6100000" },
  GE: { city: "Tbilisi", postalCode: "0105" },
  AE: { city: "Dubai", postalCode: "00000" },
  DE: { city: "Berlin", postalCode: "10115" },
};

/**
 * Local-only suggestions so checkout dropdown works without Google credentials.
 * Never used when GOOGLE_MAPS_API_KEY is set.
 */
export function createMockAddressProvider(): AddressProvider {
  return {
    isConfigured() {
      return true;
    },

    supportsValidation() {
      return false;
    },

    async autocomplete(query: string, countryCode: string) {
      const code = countryCode.toUpperCase();
      const locale = CITY_BY_COUNTRY[code] ?? { city: "City", postalCode: "00000" };
      const trimmed = query.trim();
      const base: Array<{ street: string; line2?: string }> = [
        { street: trimmed },
        { street: `${trimmed} 12` },
        { street: `${trimmed} Street`, line2: "Apt 3" },
      ];

      const suggestions: AddressSuggestion[] = base.map((item, index) => {
        const address: NormalizedAddress = {
          countryCode: code,
          city: locale.city,
          postalCode: locale.postalCode,
          addressLine1: item.street,
          addressLine2: item.line2,
        };
        const label = [address.addressLine1, address.city, code]
          .filter(Boolean)
          .join(", ");
        return {
          id: `mock-${code}-${index}-${trimmed.slice(0, 24)}`,
          label,
          normalizedAddress: address,
        };
      });

      return suggestions;
    },

    async validate(address: NormalizedAddress): Promise<AddressValidationResult> {
      return {
        state: "UNAVAILABLE",
        address,
        message: "Please confirm that this address is correct",
      };
    },
  };
}
