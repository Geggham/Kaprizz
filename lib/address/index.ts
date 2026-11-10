export type {
  AddressProvider,
  AddressSuggestion,
  AddressValidationResult,
  AddressValidationState,
  NormalizedAddress,
} from "@/lib/address/types";

export {
  postalCodeRequired,
  postalRulesByCountry,
  validatePostalCode,
} from "@/lib/address/postal-rules";
export type { CountryAddressRules } from "@/lib/address/postal-rules";
