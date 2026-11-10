"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type CmsLocale = "en" | "ru" | "hy";
type CmsPage = "home" | "about";
type Translation = {
  locale: string;
  eyebrow: string | null;
  title: string | null;
  text: string | null;
  imageAlt: string | null;
  ctaLabel: string | null;
};
type Section = {
  id: string;
  key: string;
  page: string;
  imageUrl: string | null;
  position: number;
  isActive: boolean;
  translations: Translation[];
};

const locales = ["en", "ru", "hy"] as const;

const emptyTranslation = (locale: CmsLocale): Translation => ({
  locale,
  eyebrow: "",
  title: "",
  text: "",
  imageAlt: "",
  ctaLabel: "",
});

const newSection = (page: CmsPage): Omit<Section, "id"> => ({
  key: "",
  page,
  imageUrl: "",
  position: 0,
  isActive: true,
  translations: locales.map(emptyTranslation),
});

function TranslationFields({
  value,
  onChange,
}: {
  value: Translation;
  onChange: (value: Translation) => void;
}) {
  const update = (key: Exclude<keyof Translation, "locale">, next: string) =>
    onChange({ ...value, [key]: next });

  return (
    <div className="grid gap-3">
      <label className="text-sm">
        Eyebrow
        <input
          value={value.eyebrow ?? ""}
          onChange={(e) => update("eyebrow", e.target.value)}
          className="mt-1 w-full border border-sand p-2"
        />
      </label>
      <label className="text-sm">
        Title
        <input
          value={value.title ?? ""}
          onChange={(e) => update("title", e.target.value)}
          className="mt-1 w-full border border-sand p-2"
        />
      </label>
      <label className="text-sm">
        Text
        <textarea
          value={value.text ?? ""}
          onChange={(e) => update("text", e.target.value)}
          rows={4}
          className="mt-1 w-full border border-sand p-2"
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          Image alt
          <input
            value={value.imageAlt ?? ""}
            onChange={(e) => update("imageAlt", e.target.value)}
            className="mt-1 w-full border border-sand p-2"
          />
        </label>
        <label className="text-sm">
          CTA label
          <input
            value={value.ctaLabel ?? ""}
            onChange={(e) => update("ctaLabel", e.target.value)}
            className="mt-1 w-full border border-sand p-2"
          />
        </label>
      </div>
    </div>
  );
}

export function CmsManager({
  sections,
  page,
}: {
  sections: Section[];
  page: CmsPage;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<Section | Omit<Section, "id"> | null>(null);
  const [locale, setLocale] = useState<CmsLocale>("en");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const isExisting = editing && "id" in editing;
  const visibleSections = useMemo(
    () => sections.filter((section) => section.page === page),
    [page, sections],
  );
  const translation = useMemo(
    () => editing?.translations.find((item) => item.locale === locale) ?? emptyTranslation(locale),
    [editing, locale],
  );

  function updateTranslation(next: Translation) {
    if (!editing) return;
    setEditing({
      ...editing,
      translations: editing.translations.map((item) =>
        item.locale === next.locale ? next : item,
      ),
    });
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!editing) return;
    setSaving(true);
    setError(null);
    const response = await fetch(
      isExisting ? `/api/admin/cms/sections/${editing.id}` : "/api/admin/cms/sections",
      {
        method: isExisting ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...editing, page }),
      },
    );
    const payload = await response.json();
    setSaving(false);
    if (!response.ok) {
      return setError(payload.error?.message ?? "Unable to save section.");
    }
    setEditing(null);
    router.refresh();
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this CMS section?")) return;
    setDeletingId(id);
    setError(null);
    try {
      const response = await fetch(`/api/admin/cms/sections/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        setError(payload?.error?.message ?? "Unable to delete section.");
        return;
      }
      if (editing && "id" in editing && editing.id === id) {
        setEditing(null);
      }
      router.refresh();
    } catch {
      setError("Unable to delete section.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold capitalize">{page} sections</h2>
          <p className="text-sm text-leather">
            DB-backed content for the {page} page. Edit all locales (EN / RU / HY).
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditing(newSection(page))}
          className="rounded bg-brown px-4 py-2 text-sm font-semibold text-white"
        >
          Add section
        </button>
      </div>
      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
      <div className="mt-5 grid gap-3">
        {visibleSections.map((section) => (
          <article
            key={section.id}
            className="flex items-center justify-between border border-sand bg-white p-4"
          >
            <div>
              <p className="font-semibold">{section.key}</p>
              <p className="text-sm text-leather">
                #{section.position} · {section.isActive ? "Active" : "Inactive"}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setEditing(section)}
                className="font-semibold text-brown"
              >
                Edit
              </button>
              <button
                type="button"
                disabled={deletingId === section.id}
                onClick={() => remove(section.id)}
                className="font-semibold text-red-700 disabled:opacity-50"
              >
                {deletingId === section.id ? "Deleting…" : "Delete"}
              </button>
            </div>
          </article>
        ))}
        {visibleSections.length === 0 && (
          <p className="text-sm text-leather">No sections for this page yet.</p>
        )}
      </div>
      {editing && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-charcoal/40 p-4">
          <form onSubmit={save} className="mx-auto my-8 max-w-3xl bg-white p-6">
            <div className="flex justify-between">
              <h2 className="text-xl font-semibold">
                {isExisting ? "Edit" : "Add"} {page} section
              </h2>
              <button type="button" onClick={() => setEditing(null)}>
                Close
              </button>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <label className="text-sm">
                Stable key
                <input
                  required
                  value={editing.key}
                  onChange={(e) => setEditing({ ...editing, key: e.target.value })}
                  className="mt-1 w-full border border-sand p-2"
                />
              </label>
              <label className="text-sm">
                Image URL
                <input
                  value={editing.imageUrl ?? ""}
                  onChange={(e) => setEditing({ ...editing, imageUrl: e.target.value })}
                  placeholder="/images/… or https://…"
                  className="mt-1 w-full border border-sand p-2"
                />
              </label>
              <label className="text-sm">
                Position
                <input
                  type="number"
                  min="0"
                  value={editing.position}
                  onChange={(e) =>
                    setEditing({ ...editing, position: Number(e.target.value) })
                  }
                  className="mt-1 w-full border border-sand p-2"
                />
              </label>
            </div>
            <label className="mt-4 flex gap-2 text-sm">
              <input
                type="checkbox"
                checked={editing.isActive}
                onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })}
              />
              Active
            </label>
            <div className="mt-6 flex gap-2 border-b border-sand">
              {locales.map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => setLocale(item)}
                  className={`px-3 py-2 text-sm font-semibold ${
                    locale === item ? "border-b-2 border-brown" : ""
                  }`}
                >
                  {item.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="mt-5">
              <TranslationFields value={translation} onChange={updateTranslation} />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button
                disabled={saving}
                className="rounded bg-brown px-4 py-2 text-sm font-semibold text-white"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
