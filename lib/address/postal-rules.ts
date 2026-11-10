export type CountryAddressRules = {
  postalCodeRequired: boolean;
  postalCodePattern?: RegExp;
  administrativeAreaRequired?: boolean;
};

/**
 * Country-specific postal rules for seeded active shipping destinations.
 * Codes match prisma/data/shipping.ts (AM, GR, IL, GE, AE, DE).
 */
export const postalRulesByCountry: Record<string, CountryAddressRules> = {
  AM: {
    postalCodeRequired: true,
    postalCodePattern: /^\d{4}$/,
  },
  GR: {
    postalCodeRequired: true,
    postalCodePattern: /^\d{3}\s?\d{2}$/,
  },
  IL: {
    postalCodeRequired: true,
    postalCodePattern: /^\d{7}$/,
  },
  GE: {
    postalCodeRequired: true,
    postalCodePattern: /^\d{4}$/,
  },
  AE: {
    // UAE deliveries commonly omit postal codes.
    postalCodeRequired: false,
    postalCodePattern: /^[A-Za-z0-9][A-Za-z0-9\s-]{0,11}$/,
  },
  DE: {
    postalCodeRequired: true,
    postalCodePattern: /^\d{5}$/,
  },
};

export function postalCodeRequired(countryCode: string): boolean {
  const rules = postalRulesByCountry[countryCode.toUpperCase()];
  return rules?.postalCodeRequired ?? true;
}

export function validatePostalCode(
  countryCode: string,
  postalCode: string | undefined | null,
): boolean {
  const code = countryCode.toUpperCase();
  const rules = postalRulesByCountry[code];
  if (!rules) return false;

  const value = postalCode?.trim() ?? "";

  if (!value) {
    return !rules.postalCodeRequired;
  }

  if (!rules.postalCodePattern) {
    return true;
  }

  return rules.postalCodePattern.test(value);
}
