"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type StatusFormProps = {
  action: string;
  endpoint: string;
  initialStatus: string;
  options: readonly string[];
};

export function StatusForm({
  action,
  endpoint,
  initialStatus,
  options,
}: StatusFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function saveStatus(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage("");

    try {
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const payload = await response.json();
      if (!response.ok) {
        setMessage(payload.error?.message ?? "Could not update status");
        return;
      }

      setMessage("Status updated.");
      router.refresh();
    } catch {
      setMessage("Could not update status");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={saveStatus} className="flex flex-wrap items-end gap-3">
      <label className="grid gap-1 text-sm font-semibold">
        Status
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="border border-sand bg-white px-3 py-2 font-normal"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        disabled={isSaving}
        className="rounded bg-brown px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSaving ? "Saving..." : action}
      </button>
      {message ? <p className="basis-full text-sm text-leather">{message}</p> : null}
    </form>
  );
}
