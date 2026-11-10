export type AddressValidationState =
  | "VALID"
  | "NEEDS_CONFIRMATION"
  | "INVALID"
  | "UNAVAILABLE";

export type AddressSuggestion = {
  id: string;
  label: string;
  /** Present when the provider can resolve structured fields (mock / place details). */
  normalizedAddress?: NormalizedAddress;
};

export type NormalizedAddress = {
  countryCode: string;
  administrativeArea?: string;
  city: string;
  postalCode?: string;
  addressLine1: string;
  addressLine2?: string;
  latitude?: number;
  longitude?: number;
};

export type AddressValidationResult = {
  state: AddressValidationState;
  address?: NormalizedAddress;
  suggestedAddress?: NormalizedAddress;
  message?: string;
};

export type AddressProvider = {
  isConfigured: () => boolean;
  supportsValidation: (countryCode: string) => boolean;
  autocomplete: (
    query: string,
    countryCode: string,
  ) => Promise<AddressSuggestion[]>;
  validate: (address: NormalizedAddress) => Promise<AddressValidationResult>;
};
