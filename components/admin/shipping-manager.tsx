"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type ShippingCountry = {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
  estimatedMinDays: number;
  estimatedMaxDays: number;
};

type FormValues = Omit<ShippingCountry, "id">;

const emptyValues: FormValues = {
  code: "",
  name: "",
  isActive: true,
  estimatedMinDays: 1,
  estimatedMaxDays: 7,
};

function toFormValues(country: ShippingCountry): FormValues {
  return {
    code: country.code,
    name: country.name,
    isActive: country.isActive,
    estimatedMinDays: country.estimatedMinDays,
    estimatedMaxDays: country.estimatedMaxDays,
  };
}

export function ShippingManager({ countries }: { countries: ShippingCountry[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<ShippingCountry | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [values, setValues] = useState<FormValues>(emptyValues);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function openEditor(country?: ShippingCountry) {
    setEditing(country ?? null);
    setIsEditorOpen(true);
    setValues(country ? toFormValues(country) : emptyValues);
    setError(null);
  }

  function closeEditor() {
    setEditing(null);
    setIsEditorOpen(false);
    setValues(emptyValues);
    setError(null);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError(null);

    const endpoint = editing ? `/api/admin/shipping/${editing.id}` : "/api/admin/shipping";
    const response = await fetch(endpoint, {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const payload = await response.json();
    setIsSaving(false);

    if (!response.ok) {
      setError(payload.error?.message ?? "Unable to save shipping country.");
      return;
    }

    closeEditor();
    router.refresh();
  }

  async function remove(country: ShippingCountry) {
    if (!window.confirm(`Delete shipping for ${country.name}?`)) return;

    const response = await fetch(`/api/admin/shipping/${country.id}`, { method: "DELETE" });
    if (!response.ok) {
      const payload = await response.json();
      setError(payload.error?.message ?? "Unable to delete shipping country.");
      return;
    }

    if (editing?.id === country.id) closeEditor();
    router.refresh();
  }

  return (
    <>
      <div className="mt-8 flex justify-end">
        <button
          type="button"
          onClick={() => openEditor()}
          className="rounded bg-brown px-4 py-2 text-sm font-semibold text-white"
        >
          Add country
        </button>
      </div>

      {error && <p className="mt-4 rounded border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="mt-4 overflow-x-auto border border-sand bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-sand bg-ivory text-leather">
            <tr>
              <th className="px-4 py-3 font-semibold">Country</th>
              <th className="px-4 py-3 font-semibold">Code</th>
              <th className="px-4 py-3 font-semibold">Delivery estimate</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {countries.map((country) => (
              <tr key={country.id} className="border-b border-sand last:border-0">
                <td className="px-4 py-3 font-semibold">{country.name}</td>
                <td className="px-4 py-3 font-mono">{country.code}</td>
                <td className="px-4 py-3">{country.estimatedMinDays}–{country.estimatedMaxDays} business days</td>
                <td className="px-4 py-3">{country.isActive ? "Active" : "Inactive"}</td>
                <td className="space-x-3 px-4 py-3 text-right">
                  <button type="button" onClick={() => openEditor(country)} className="font-semibold text-leather hover:text-brown">
                    Edit
                  </button>
                  <button type="button" onClick={() => remove(country)} className="font-semibold text-red-700 hover:text-red-900">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {!countries.length && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-leather">No shipping countries yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 p-4">
          <form onSubmit={submit} className="w-full max-w-lg border border-sand bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-xl font-semibold">{editing ? "Edit shipping country" : "Add shipping country"}</h2>
              <button type="button" onClick={closeEditor} className="text-sm font-semibold text-leather hover:text-charcoal">Close</button>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold">Country name
                <input required value={values.name} onChange={(event) => setValues({ ...values, name: event.target.value })} className="mt-1 w-full border border-sand px-3 py-2 font-normal" />
              </label>
              <label className="text-sm font-semibold">Code
                <input required maxLength={3} value={values.code} onChange={(event) => setValues({ ...values, code: event.target.value.toUpperCase() })} className="mt-1 w-full border border-sand px-3 py-2 font-mono font-normal" />
              </label>
              <label className="text-sm font-semibold">Minimum days
                <input required min="0" max="365" type="number" value={values.estimatedMinDays} onChange={(event) => setValues({ ...values, estimatedMinDays: Number(event.target.value) })} className="mt-1 w-full border border-sand px-3 py-2 font-normal" />
              </label>
              <label className="text-sm font-semibold">Maximum days
                <input required min="0" max="365" type="number" value={values.estimatedMaxDays} onChange={(event) => setValues({ ...values, estimatedMaxDays: Number(event.target.value) })} className="mt-1 w-full border border-sand px-3 py-2 font-normal" />
              </label>
            </div>
            <label className="mt-4 flex items-center gap-2 text-sm font-semibold">
              <input type="checkbox" checked={values.isActive} onChange={(event) => setValues({ ...values, isActive: event.target.checked })} />
              Available for checkout
            </label>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={closeEditor} className="px-4 py-2 text-sm font-semibold text-leather">Cancel</button>
              <button disabled={isSaving} className="rounded bg-brown px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                {isSaving ? "Saving…" : "Save country"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
