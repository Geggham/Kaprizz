"use client";

import { useId, useState, type ReactNode } from "react";
import type { ProductColor, ShoeModel } from "@/types";

export type PriceRange = "under-300" | "300-400" | "400-500" | "500-plus";

export type CatalogFilters = {
  sizes: number[];
  colorIds: string[];
  models: ShoeModel[];
  priceRanges: PriceRange[];
  newOnly: boolean;
  bestSellerOnly: boolean;
};

type ProductFiltersProps = {
  availableColors: ProductColor[];
  availableModels: ShoeModel[];
  availableSizes: number[];
  filters: CatalogFilters;
  onChange: (filters: CatalogFilters) => void;
  title: string;
  labels: {
    bestSeller: string;
    color: string;
    new: string;
    price: string;
    price300to400: string;
    price400to500: string;
    price500Plus: string;
    size: string;
    under300: string;
    model: string;
  };
};

function toggleValue<T>(values: T[], value: T): T[] {
  return values.includes(value)
    ? values.filter((current) => current !== value)
    : [...values, value];
}

function FilterSection({
  children,
  selectedCount = 0,
  title,
}: {
  children: ReactNode;
  selectedCount?: number;
  title: string;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const generatedId = useId();
  const contentId = `product-filter-${generatedId.replaceAll(":", "")}`;

  return (
    <section className="border-b border-sand py-5 first:pt-0">
      <h3>
        <button
          type="button"
          aria-controls={contentId}
          aria-expanded={isOpen}
          onClick={() => setIsOpen((current) => !current)}
          className="flex w-full items-center justify-between gap-3 text-left text-sm font-semibold text-charcoal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brown"
        >
          <span>
            {title}
            {selectedCount > 0 ? (
              <span className="ml-1.5 text-xs font-medium text-leather">
                ({selectedCount})
              </span>
            ) : null}
          </span>
          <span
            aria-hidden="true"
            className={`text-lg font-normal leading-none transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          >
            ⌄
          </span>
        </button>
      </h3>
      <div id={contentId} hidden={!isOpen} className="pt-3">
        {children}
      </div>
    </section>
  );
}

export function ProductFilters({
  availableColors,
  availableModels,
  availableSizes,
  filters,
  labels,
  onChange,
  title,
}: ProductFiltersProps) {
  const priceOptions: Array<{ label: string; value: PriceRange }> = [
    { label: labels.under300, value: "under-300" },
    { label: labels.price300to400, value: "300-400" },
    { label: labels.price400to500, value: "400-500" },
    { label: labels.price500Plus, value: "500-plus" },
  ];

  return (
    <section aria-label={title} className="space-y-0">
      <FilterSection selectedCount={filters.sizes.length} title={labels.size}>
        <div className="flex flex-wrap gap-2">
          {availableSizes.map((size) => {
            const selected = filters.sizes.includes(size);
            return (
              <button
                key={size}
                type="button"
                aria-pressed={selected}
                onClick={() =>
                  onChange({
                    ...filters,
                    sizes: toggleValue(filters.sizes, size),
                  })
                }
                className={`min-w-10 border px-2 py-1.5 text-xs transition-colors focus-visible:outline-2 focus-visible:outline-brown ${
                  selected
                    ? "border-brown bg-brown text-white"
                    : "border-sand text-charcoal hover:border-leather"
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </FilterSection>

      <FilterSection selectedCount={filters.colorIds.length} title={labels.color}>
        <div className="space-y-2">
          {availableColors.map((color) => {
            const selected = filters.colorIds.includes(color.id);
            return (
              <label key={color.id} className="flex cursor-pointer items-center gap-3 text-sm text-charcoal">
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() =>
                    onChange({
                      ...filters,
                      colorIds: toggleValue(filters.colorIds, color.id),
                    })
                  }
                  className="size-4 accent-brown"
                />
                <span
                  aria-hidden="true"
                  className="size-4 rounded-full border border-charcoal/20"
                  style={{ backgroundColor: color.hex }}
                />
                {color.name}
              </label>
            );
          })}
        </div>
      </FilterSection>

      <FilterSection selectedCount={filters.models.length} title={labels.model}>
        <div className="space-y-2">
          {availableModels.map((model) => {
            const selected = filters.models.includes(model);
            return (
              <label key={model} className="flex cursor-pointer items-center gap-3 text-sm text-charcoal">
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() =>
                    onChange({
                      ...filters,
                      models: toggleValue(filters.models, model),
                    })
                  }
                  className="size-4 accent-brown"
                />
                {model}
              </label>
            );
          })}
        </div>
      </FilterSection>

      <FilterSection selectedCount={filters.priceRanges.length} title={labels.price}>
        <div className="space-y-2">
          {priceOptions.map((option) => {
            const selected = filters.priceRanges.includes(option.value);
            return (
              <label key={option.value} className="flex cursor-pointer items-center gap-3 text-sm text-charcoal">
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() =>
                    onChange({
                      ...filters,
                      priceRanges: toggleValue(filters.priceRanges, option.value),
                    })
                  }
                  className="size-4 accent-brown"
                />
                {option.label}
              </label>
            );
          })}
        </div>
      </FilterSection>

      <div className="space-y-2 pt-5">
        <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-charcoal">
          <input
            type="checkbox"
            checked={filters.newOnly}
            onChange={() => onChange({ ...filters, newOnly: !filters.newOnly })}
            className="size-4 accent-brown"
          />
          {labels.new}
        </label>
        <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-charcoal">
          <input
            type="checkbox"
            checked={filters.bestSellerOnly}
            onChange={() =>
              onChange({ ...filters, bestSellerOnly: !filters.bestSellerOnly })
            }
            className="size-4 accent-brown"
          />
          {labels.bestSeller}
        </label>
      </div>
    </section>
  );
}
