"use client";

import { useMemo, useState } from "react";

export type ShippingCountryOption = {
  code: string;
  name: string;
  available: boolean;
  estimatedDelivery: string;
  estimatedMinDays?: number;
  estimatedMaxDays?: number;
};

type CountrySelectorProps = {
  countries: ShippingCountryOption[];
  labels: {
    available: string;
    deliveryTo: string;
    estimatedDelivery: string;
    selectCountry: string;
  };
};

export function CountrySelector({ countries, labels }: CountrySelectorProps) {
  const [selectedCode, setSelectedCode] = useState(countries[0]?.code ?? "");
  const selectedCountry = useMemo(
    () => countries.find((country) => country.code === selectedCode),
    [countries, selectedCode],
  );

  return (
    <div className="border border-sand bg-white p-5 sm:p-6">
      <label className="block text-sm font-semibold text-charcoal">
        {labels.selectCountry}
        <select
          value={selectedCode}
          onChange={(event) => setSelectedCode(event.target.value)}
          className="mt-3 block w-full border border-sand bg-ivory px-3 py-3 text-sm text-charcoal focus:outline-2 focus:outline-brown"
        >
          {countries.map((country) => (
            <option key={country.code} value={country.code}>
              {country.name}
            </option>
          ))}
        </select>
      </label>

      {selectedCountry ? (
        <div className="mt-5 border-t border-sand pt-5">
          <p className="font-semibold text-brown">
            {labels.deliveryTo} {selectedCountry.name} {labels.available}
          </p>
          <p className="mt-2 text-sm text-leather">
            {labels.estimatedDelivery}: {selectedCountry.estimatedDelivery}
          </p>
        </div>
      ) : null}
    </div>
  );
}
