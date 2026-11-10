"use client";

import { useMemo, useState } from "react";
import { ProductFilters, type CatalogFilters, type PriceRange } from "@/components/product/product-filters";
import { ProductGrid } from "@/components/product/product-grid";
import { useTranslate } from "@/hooks/use-translate";
import type { Product, ProductColor, ShoeModel } from "@/types";

type SortOrder = "featured" | "newest" | "price-asc" | "price-desc";

type CatalogExperienceProps = {
  products: Product[];
};

const initialFilters: CatalogFilters = {
  sizes: [],
  colorIds: [],
  models: [],
  priceRanges: [],
  newOnly: false,
  bestSellerOnly: false,
};

function isInPriceRange(price: number, range: PriceRange): boolean {
  switch (range) {
    case "under-300":
      return price < 300;
    case "300-400":
      return price >= 300 && price < 400;
    case "400-500":
      return price >= 400 && price < 500;
    case "500-plus":
      return price >= 500;
  }
}

function hasActiveFilters(filters: CatalogFilters): boolean {
  return (
    filters.sizes.length > 0 ||
    filters.colorIds.length > 0 ||
    filters.models.length > 0 ||
    filters.priceRanges.length > 0 ||
    filters.newOnly ||
    filters.bestSellerOnly
  );
}

export function CatalogExperience({ products }: CatalogExperienceProps) {
  const { locale, t } = useTranslate();
  const [filters, setFilters] = useState<CatalogFilters>(initialFilters);
  const [sortOrder, setSortOrder] = useState<SortOrder>("featured");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const availableSizes = useMemo(
    () => [...new Set(products.flatMap((product) => product.sizes))].sort((a, b) => a - b),
    [products],
  );
  const availableColors = useMemo<ProductColor[]>(
    () =>
      Array.from(
        new Map(
          products.flatMap((product) =>
            product.colors.map((color) => [color.id, color] as const),
          ),
        ).values(),
      ),
    [products],
  );
  const availableModels = useMemo<ShoeModel[]>(
    () => [...new Set(products.map((product) => product.model))],
    [products],
  );

  const filteredProducts = useMemo(() => {
    const result = products.filter((product) => {
      const matchesSize =
        filters.sizes.length === 0 ||
        filters.sizes.some((size) => product.sizes.includes(size));
      const matchesColor =
        filters.colorIds.length === 0 ||
        filters.colorIds.some((colorId) =>
          product.colors.some((color) => color.id === colorId),
        );
      const matchesModel =
        filters.models.length === 0 || filters.models.includes(product.model);
      const matchesPrice =
        filters.priceRanges.length === 0 ||
        filters.priceRanges.some((range) => isInPriceRange(product.price, range));

      return (
        matchesSize &&
        matchesColor &&
        matchesModel &&
        matchesPrice &&
        (!filters.newOnly || product.isNew) &&
        (!filters.bestSellerOnly || product.isBestSeller)
      );
    });

    return [...result].sort((first, second) => {
      switch (sortOrder) {
        case "newest":
          return Number(Boolean(second.isNew)) - Number(Boolean(first.isNew));
        case "price-asc":
          return first.price - second.price;
        case "price-desc":
          return second.price - first.price;
        case "featured":
          return (
            Number(Boolean(second.isBestSeller)) -
            Number(Boolean(first.isBestSeller))
          );
      }
    });
  }, [filters, products, sortOrder]);

  const filterLabels = {
    bestSeller: t("catalog.bestSeller"),
    color: t("catalog.color"),
    model: t("catalog.model"),
    new: t("catalog.new"),
    price: t("catalog.price"),
    price300to400: t("catalog.price300to400"),
    price400to500: t("catalog.price400to500"),
    price500Plus: t("catalog.price500Plus"),
    size: t("catalog.size"),
    under300: t("catalog.under300"),
  };

  const removeFilter = (
    kind: "size" | "color" | "model" | "price" | "new" | "best-seller",
    value?: string | number,
  ) => {
    switch (kind) {
      case "size":
        setFilters((current) => ({
          ...current,
          sizes: current.sizes.filter((size) => size !== value),
        }));
        break;
      case "color":
        setFilters((current) => ({
          ...current,
          colorIds: current.colorIds.filter((color) => color !== value),
        }));
        break;
      case "model":
        setFilters((current) => ({
          ...current,
          models: current.models.filter((model) => model !== value),
        }));
        break;
      case "price":
        setFilters((current) => ({
          ...current,
          priceRanges: current.priceRanges.filter((price) => price !== value),
        }));
        break;
      case "new":
        setFilters((current) => ({ ...current, newOnly: false }));
        break;
      case "best-seller":
        setFilters((current) => ({ ...current, bestSellerOnly: false }));
        break;
    }
  };

  const activeFilterLabels = [
    ...filters.sizes.map((size) => ({ label: String(size), kind: "size" as const, value: size })),
    ...filters.colorIds.map((id) => ({
      label: availableColors.find((color) => color.id === id)?.name ?? id,
      kind: "color" as const,
      value: id,
    })),
    ...filters.models.map((model) => ({ label: model, kind: "model" as const, value: model })),
    ...filters.priceRanges.map((range) => ({
      label:
        {
          "under-300": t("catalog.under300"),
          "300-400": t("catalog.price300to400"),
          "400-500": t("catalog.price400to500"),
          "500-plus": t("catalog.price500Plus"),
        }[range],
      kind: "price" as const,
      value: range,
    })),
    ...(filters.newOnly
      ? [{ label: t("catalog.new"), kind: "new" as const, value: undefined }]
      : []),
    ...(filters.bestSellerOnly
      ? [
          {
            label: t("catalog.bestSeller"),
            kind: "best-seller" as const,
            value: undefined,
          },
        ]
      : []),
  ];

  return (
    <div className="mx-auto max-w-[1440px] px-4 pb-20 sm:px-6 lg:px-10">
      <div className="mb-8 flex items-center justify-between gap-4 border-y border-sand py-4">
        <button
          type="button"
          onClick={() => setIsMobileFiltersOpen(true)}
          className="border border-sand px-4 py-2 text-sm font-semibold text-charcoal lg:hidden"
        >
          {t("catalog.filters")}
        </button>
        <p className="text-sm text-leather">
          {filteredProducts.length} {t("catalog.products")}
        </p>
        <label className="ml-auto flex items-center gap-2 text-sm text-charcoal">
          <span className="hidden sm:inline">{t("catalog.sort")}</span>
          <select
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value as SortOrder)}
            className="border border-sand bg-white px-3 py-2 text-sm text-charcoal focus:outline-2 focus:outline-brown"
          >
            <option value="featured">{t("catalog.featured")}</option>
            <option value="newest">{t("catalog.newest")}</option>
            <option value="price-asc">{t("catalog.priceLowToHigh")}</option>
            <option value="price-desc">{t("catalog.priceHighToLow")}</option>
          </select>
        </label>
      </div>

      {hasActiveFilters(filters) ? (
        <div className="mb-7 flex flex-wrap items-center gap-2">
          {activeFilterLabels.map((filter) => (
            <button
              key={`${filter.kind}-${filter.value ?? filter.label}`}
              type="button"
              onClick={() => removeFilter(filter.kind, filter.value)}
              className="border border-sand bg-white px-3 py-1.5 text-xs text-charcoal transition-colors hover:border-leather"
            >
              {filter.label} ×
            </button>
          ))}
          <button
            type="button"
            onClick={() => setFilters(initialFilters)}
            className="px-2 py-1.5 text-xs font-semibold text-brown underline underline-offset-4"
          >
            {t("catalog.clearAll")}
          </button>
        </div>
      ) : null}

      <div className="grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <ProductFilters
            availableColors={availableColors}
            availableModels={availableModels}
            availableSizes={availableSizes}
            filters={filters}
            labels={filterLabels}
            onChange={setFilters}
            title={t("catalog.filters")}
          />
        </aside>

        {filteredProducts.length > 0 ? (
          <ProductGrid
            bestSellerLabel={t("catalog.bestSeller")}
            locale={locale}
            newLabel={t("catalog.new")}
            products={filteredProducts}
          />
        ) : (
          <section className="flex min-h-80 flex-col items-center justify-center bg-white px-6 text-center">
            <h2 className="text-xl font-semibold text-charcoal">
              {t("catalog.noProductsTitle")}
            </h2>
            <p className="mt-2 text-sm text-leather">{t("catalog.noProductsText")}</p>
            <button
              type="button"
              onClick={() => setFilters(initialFilters)}
              className="mt-5 border-b border-brown pb-1 text-sm font-semibold text-brown"
            >
              {t("catalog.clearFilters")}
            </button>
          </section>
        )}
      </div>

      {isMobileFiltersOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t("catalog.filterProducts")}
          className="fixed inset-0 z-50 bg-charcoal/35 p-4 sm:p-6 lg:hidden"
        >
          <div className="ml-auto flex h-full w-full max-w-sm flex-col bg-ivory shadow-xl">
            <div className="flex items-center justify-between border-b border-sand px-5 py-4">
              <h2 className="text-lg font-semibold text-charcoal">{t("catalog.filters")}</h2>
              <button
                type="button"
                onClick={() => setIsMobileFiltersOpen(false)}
                className="p-2 text-sm font-semibold text-brown focus-visible:outline-2 focus-visible:outline-brown"
              >
                {t("catalog.close")}
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-6">
              <ProductFilters
                availableColors={availableColors}
                availableModels={availableModels}
                availableSizes={availableSizes}
                filters={filters}
                labels={filterLabels}
                onChange={setFilters}
                title={t("catalog.filters")}
              />
            </div>
            <div className="border-t border-sand p-5">
              <button
                type="button"
                onClick={() => setIsMobileFiltersOpen(false)}
                className="w-full bg-brown px-4 py-3 text-sm font-semibold text-white"
              >
                {filteredProducts.length} {t("catalog.products")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
