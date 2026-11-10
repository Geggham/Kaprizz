"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type Category = { id: string; name: string; model: ProductModel };
type ProductModel =
  | "OXFORD"
  | "DERBY"
  | "LOAFER"
  | "MONK_STRAP"
  | "BOOT"
  | "MARY_JANE"
  | "PUMP"
  | "BALLET_FLAT"
  | "SLINGBACK";

type EditorColor = { id: string; persistedId?: string; name: string; hex: string };
type EditorImage = { id?: string; url: string; alt: string; position: number };
type EditorVariant = {
  id?: string;
  colorId: string;
  size: number;
  sku: string;
  stock: number;
  isActive: boolean;
  priceOverride: number | null;
};

export type ProductEditorValue = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  seoTitle: string | null;
  seoDescription: string | null;
  price: number;
  gender: "MEN" | "WOMEN";
  model: ProductModel;
  categoryId: string;
  isActive: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  isFeatured: boolean;
  images: EditorImage[];
  colors: EditorColor[];
  sizes: number[];
  variants: EditorVariant[];
};

const modelLabels: Record<ProductModel, string> = {
  OXFORD: "Oxford",
  DERBY: "Derby",
  LOAFER: "Loafer",
  MONK_STRAP: "Monk Strap",
  BOOT: "Boot",
  MARY_JANE: "Mary Jane",
  PUMP: "Pump",
  BALLET_FLAT: "Ballet Flat",
  SLINGBACK: "Slingback",
};

const inputClass =
  "mt-1 w-full rounded border border-sand bg-white px-3 py-2 text-sm outline-none focus:border-leather";

function makeVariant(colorId: string, size: number): EditorVariant {
  return {
    colorId,
    size,
    sku: `${colorId.slice(-6)}-${size}`.toUpperCase(),
    stock: 0,
    isActive: true,
    priceOverride: null,
  };
}

function synchronizeMatrix(value: ProductEditorValue): ProductEditorValue {
  const current = new Map(
    value.variants.map((variant) => [`${variant.colorId}:${variant.size}`, variant]),
  );
  const variants = value.colors.flatMap((color) =>
    value.sizes.map(
      (size) => current.get(`${color.id}:${size}`) ?? makeVariant(color.id, size),
    ),
  );
  return { ...value, variants };
}

export function ProductEditor({
  initialValue,
  categories,
}: {
  initialValue: ProductEditorValue;
  categories: Category[];
}) {
  const router = useRouter();
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const categoryOptions = useMemo(
    () => categories.filter((category) => category.model === value.model),
    [categories, value.model],
  );

  function update(next: ProductEditorValue) {
    setValue(next);
  }

  function setModel(model: ProductModel) {
    const category = categories.find((item) => item.model === model);
    update({ ...value, model, categoryId: category?.id ?? "" });
  }

  function updateVariant(index: number, patch: Partial<EditorVariant>) {
    update({
      ...value,
      variants: value.variants.map((variant, currentIndex) =>
        currentIndex === index ? { ...variant, ...patch } : variant,
      ),
    });
  }

  function addColor() {
    const id = `new-color-${Date.now()}`;
    update(
      synchronizeMatrix({
        ...value,
        colors: [...value.colors, { id, name: "New color", hex: "#000000" }],
      }),
    );
  }

  function removeColor(id: string) {
    if (value.colors.length === 1) return;
    update(synchronizeMatrix({ ...value, colors: value.colors.filter((color) => color.id !== id) }));
  }

  function addSize() {
    const nextSize = Math.max(0, ...value.sizes) + 1;
    update(synchronizeMatrix({ ...value, sizes: [...value.sizes, nextSize] }));
  }

  function removeSize(size: number) {
    if (value.sizes.length === 1) return;
    update(synchronizeMatrix({ ...value, sizes: value.sizes.filter((item) => item !== size) }));
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const endpoint = value.id ? `/api/admin/products/${value.id}` : "/api/admin/products";
      const response = await fetch(endpoint, {
        method: value.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(value),
      });
      const body = (await response.json()) as {
        data?: { product?: { id: string } };
        error?: { message?: string };
      };
      if (!response.ok) throw new Error(body.error?.message ?? "Unable to save product");
      router.push(`/admin/products/${body.data?.product?.id ?? value.id}`);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save product");
    } finally {
      setSaving(false);
    }
  }

  async function removeProduct() {
    if (!value.id || !window.confirm("Delete this product? Referenced products will be archived instead.")) return;
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/products/${value.id}`, { method: "DELETE" });
      const body = (await response.json()) as { error?: { message?: string } };
      if (!response.ok) throw new Error(body.error?.message ?? "Unable to delete product");
      router.push("/admin/products");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to delete product");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="p-5 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin/products" className="text-sm font-semibold text-leather hover:text-brown">← Products</Link>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            {value.id ? "Edit product" : "New product"}
          </h1>
        </div>
        <div className="flex gap-2">
          {value.id && (
            <button type="button" onClick={removeProduct} disabled={saving} className="rounded border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 disabled:opacity-50">
              Delete
            </button>
          )}
          <button type="button" onClick={save} disabled={saving} className="rounded bg-brown px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
            {saving ? "Saving…" : "Save product"}
          </button>
        </div>
      </div>

      {error && <p role="alert" className="mt-5 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">{error}</p>}

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.8fr)]">
        <section className="space-y-6">
          <div className="rounded border border-sand bg-white p-5">
            <h2 className="font-semibold">Product details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium">Name<input className={inputClass} value={value.name} onChange={(event) => update({ ...value, name: event.target.value })} /></label>
              <label className="text-sm font-medium">Slug<input className={inputClass} value={value.slug} onChange={(event) => update({ ...value, slug: event.target.value })} /></label>
              <label className="text-sm font-medium">Price (USD)<input className={inputClass} type="number" min="0" step="0.01" value={value.price} onChange={(event) => update({ ...value, price: Number(event.target.value) })} /></label>
              <label className="text-sm font-medium">Gender<select className={inputClass} value={value.gender} onChange={(event) => update({ ...value, gender: event.target.value as ProductEditorValue["gender"] })}><option value="MEN">Men</option><option value="WOMEN">Women</option></select></label>
              <label className="text-sm font-medium">Model<select className={inputClass} value={value.model} onChange={(event) => setModel(event.target.value as ProductModel)}>{Object.entries(modelLabels).map(([model, label]) => <option key={model} value={model}>{label}</option>)}</select></label>
              <label className="text-sm font-medium">Category<select className={inputClass} value={value.categoryId} onChange={(event) => update({ ...value, categoryId: event.target.value })}>{categoryOptions.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
            </div>
            <label className="mt-4 block text-sm font-medium">Description<textarea className={`${inputClass} min-h-32`} value={value.description} onChange={(event) => update({ ...value, description: event.target.value })} /></label>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {(["isActive", "isNew", "isBestSeller", "isFeatured"] as const).map((key) => <label key={key} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={value[key]} onChange={(event) => update({ ...value, [key]: event.target.checked })} />{key.replace(/^is/, "").replace(/([A-Z])/g, " $1")}</label>)}
            </div>
          </div>

          <div className="rounded border border-sand bg-white p-5">
            <h2 className="font-semibold">SEO overrides</h2>
            <p className="mt-1 text-sm text-leather">Leave fields empty to use the product defaults.</p>
            <label className="mt-4 block text-sm font-medium">SEO title<input className={inputClass} maxLength={60} value={value.seoTitle ?? ""} onChange={(event) => update({ ...value, seoTitle: event.target.value || null })} /></label>
            <label className="mt-4 block text-sm font-medium">SEO description<textarea className={`${inputClass} min-h-24`} maxLength={160} value={value.seoDescription ?? ""} onChange={(event) => update({ ...value, seoDescription: event.target.value || null })} /></label>
          </div>

          <div className="rounded border border-sand bg-white p-5">
            <div className="flex items-center justify-between"><h2 className="font-semibold">Images</h2><button type="button" onClick={() => update({ ...value, images: [...value.images, { url: "", alt: "", position: value.images.length }] })} className="text-sm font-semibold text-leather">Add image</button></div>
            <div className="mt-4 space-y-3">
              {value.images.map((image, index) => <div key={`${image.id ?? "new"}-${index}`} className="grid gap-2 sm:grid-cols-[1fr_1fr_90px_auto]"><input aria-label="Image URL" className={inputClass} placeholder="Image URL" value={image.url} onChange={(event) => update({ ...value, images: value.images.map((item, i) => i === index ? { ...item, url: event.target.value } : item) })} /><input aria-label="Image alt text" className={inputClass} placeholder="Alt text" value={image.alt} onChange={(event) => update({ ...value, images: value.images.map((item, i) => i === index ? { ...item, alt: event.target.value } : item) })} /><input aria-label="Image position" className={inputClass} type="number" min="0" value={image.position} onChange={(event) => update({ ...value, images: value.images.map((item, i) => i === index ? { ...item, position: Number(event.target.value) } : item) })} /><button type="button" onClick={() => update({ ...value, images: value.images.filter((_, i) => i !== index) })} className="text-sm text-red-700">Remove</button></div>)}
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded border border-sand bg-white p-5">
            <div className="flex items-center justify-between"><h2 className="font-semibold">Colors</h2><button type="button" onClick={addColor} className="text-sm font-semibold text-leather">Add color</button></div>
            <div className="mt-4 space-y-3">{value.colors.map((color, index) => <div key={color.id} className="grid grid-cols-[1fr_110px_auto] gap-2"><input aria-label="Color name" className={inputClass} value={color.name} onChange={(event) => update({ ...value, colors: value.colors.map((item, i) => i === index ? { ...item, name: event.target.value } : item) })} /><input aria-label="Color hex" className={inputClass} value={color.hex} onChange={(event) => update({ ...value, colors: value.colors.map((item, i) => i === index ? { ...item, hex: event.target.value } : item) })} /><button type="button" onClick={() => removeColor(color.id)} className="text-sm text-red-700">Remove</button></div>)}</div>
          </div>
          <div className="rounded border border-sand bg-white p-5">
            <div className="flex items-center justify-between"><h2 className="font-semibold">Sizes</h2><button type="button" onClick={addSize} className="text-sm font-semibold text-leather">Add size</button></div>
            <div className="mt-4 flex flex-wrap gap-3">{value.sizes.map((size, index) => <div key={`${size}-${index}`} className="flex items-center gap-1"><input aria-label="Size" className="w-20 rounded border border-sand px-2 py-1 text-sm" type="number" min="1" value={size} onChange={(event) => { const sizes = [...value.sizes]; sizes[index] = Number(event.target.value); update(synchronizeMatrix({ ...value, sizes })); }} /><button type="button" onClick={() => removeSize(size)} className="text-sm text-red-700">×</button></div>)}</div>
          </div>
        </section>
      </div>

      <section className="mt-6 overflow-x-auto rounded border border-sand bg-white p-5">
        <h2 className="font-semibold">Inventory matrix</h2>
        <p className="mt-1 text-sm text-leather">Set stock, SKU, status, and optional price override for every color and size.</p>
        <table className="mt-4 min-w-[800px] text-left text-sm">
          <thead className="border-b border-sand text-leather"><tr><th className="pb-2">Color</th><th className="pb-2">Size</th><th className="pb-2">Stock</th><th className="pb-2">SKU</th><th className="pb-2">Active</th><th className="pb-2">Override</th></tr></thead>
          <tbody>{value.variants.map((variant, index) => <tr key={`${variant.colorId}-${variant.size}`} className="border-b border-sand/70"><td className="py-2">{value.colors.find((color) => color.id === variant.colorId)?.name}</td><td className="py-2">{variant.size}</td><td className="py-2"><input className="w-20 rounded border border-sand px-2 py-1" type="number" min="0" value={variant.stock} onChange={(event) => updateVariant(index, { stock: Number(event.target.value) })} /></td><td className="py-2"><input className="rounded border border-sand px-2 py-1" value={variant.sku} onChange={(event) => updateVariant(index, { sku: event.target.value })} /></td><td className="py-2"><input type="checkbox" checked={variant.isActive} onChange={(event) => updateVariant(index, { isActive: event.target.checked })} /></td><td className="py-2"><input className="w-28 rounded border border-sand px-2 py-1" type="number" min="0" step="0.01" placeholder="Base price" value={variant.priceOverride ?? ""} onChange={(event) => updateVariant(index, { priceOverride: event.target.value === "" ? null : Number(event.target.value) })} /></td></tr>)}</tbody>
        </table>
      </section>
    </main>
  );
}
