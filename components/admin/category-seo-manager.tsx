"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Category = {
  id: string;
  name: string;
  slug: string;
  model: string;
  seoHeading: string | null;
  intro: string | null;
  editorialContent: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
};

type SeoFields = Pick<
  Category,
  "seoHeading" | "intro" | "editorialContent" | "seoTitle" | "seoDescription"
>;

function seoFields(category: Category): SeoFields {
  return {
    seoHeading: category.seoHeading,
    intro: category.intro,
    editorialContent: category.editorialContent,
    seoTitle: category.seoTitle,
    seoDescription: category.seoDescription,
  };
}

export function CategorySeoManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [values, setValues] = useState<SeoFields | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function edit(category: Category) {
    setEditingId(category.id);
    setValues(seoFields(category));
    setError(null);
  }

  function cancel() {
    setEditingId(null);
    setValues(null);
    setError(null);
  }

  async function save() {
    if (!editingId || !values) return;
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/categories/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error?.message ?? "Unable to save category SEO.");
      }
      cancel();
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save category SEO.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-8 space-y-3">
      {error && <p role="alert" className="rounded border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {categories.map((category) => {
        const isEditing = editingId === category.id && values;
        return (
          <section key={category.id} className="rounded border border-sand bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold">{category.name}</h2>
                <p className="mt-1 text-sm text-leather">{category.model} · /{category.slug}</p>
              </div>
              {isEditing ? (
                <div className="flex gap-2">
                  <button type="button" onClick={cancel} disabled={saving} className="px-3 py-2 text-sm font-semibold text-leather">Cancel</button>
                  <button type="button" onClick={save} disabled={saving} className="rounded bg-brown px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">{saving ? "Saving…" : "Save SEO"}</button>
                </div>
              ) : (
                <button type="button" onClick={() => edit(category)} className="rounded border border-sand px-3 py-2 text-sm font-semibold text-leather hover:border-leather">Edit SEO</button>
              )}
            </div>

            {isEditing ? (
              <div className="mt-4 grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-medium">SEO heading<input className="mt-1 w-full rounded border border-sand px-3 py-2" maxLength={200} value={values.seoHeading ?? ""} onChange={(event) => setValues({ ...values, seoHeading: event.target.value || null })} /></label>
                  <label className="text-sm font-medium">SEO title<input className="mt-1 w-full rounded border border-sand px-3 py-2" maxLength={60} value={values.seoTitle ?? ""} onChange={(event) => setValues({ ...values, seoTitle: event.target.value || null })} /></label>
                </div>
                <label className="text-sm font-medium">SEO description<textarea className="mt-1 min-h-20 w-full rounded border border-sand px-3 py-2" maxLength={160} value={values.seoDescription ?? ""} onChange={(event) => setValues({ ...values, seoDescription: event.target.value || null })} /></label>
                <label className="text-sm font-medium">Intro<textarea className="mt-1 min-h-24 w-full rounded border border-sand px-3 py-2" maxLength={1_000} value={values.intro ?? ""} onChange={(event) => setValues({ ...values, intro: event.target.value || null })} /></label>
                <label className="text-sm font-medium">Editorial content<textarea className="mt-1 min-h-36 w-full rounded border border-sand px-3 py-2" maxLength={10_000} value={values.editorialContent ?? ""} onChange={(event) => setValues({ ...values, editorialContent: event.target.value || null })} /></label>
              </div>
            ) : (
              <p className="mt-3 text-sm text-leather">{category.seoTitle ?? "No SEO title override"}</p>
            )}
          </section>
        );
      })}
    </div>
  );
}
