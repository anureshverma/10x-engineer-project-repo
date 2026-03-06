"use client";

import { useState } from "react";
import type { CollectionCreateInput } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { ErrorMessage } from "@/components/ui/ErrorMessage";

interface CollectionFormProps {
  onSubmit: (data: CollectionCreateInput) => Promise<void>;
  onCancel: () => void;
}

export function CollectionForm({ onSubmit, onCancel }: CollectionFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const err: Record<string, string> = {};
    if (!name.trim()) err.name = "Name is required";
    else if (name.length > 100) err.name = "Name must be under 100 characters";
    if (description.length > 500) err.description = "Description must be under 500 characters";
    setFieldErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
      });
    } catch (e: unknown) {
      const msg = e && typeof e === "object" && "detail" in e ? String((e as { detail: string }).detail) : "Something went wrong.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <ErrorMessage message={error} onDismiss={() => setError(null)} />
      )}

      <div>
        <label htmlFor="collection-name" className="block text-sm font-medium text-slate-700 mb-1.5">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          id="collection-name"
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (fieldErrors.name) setFieldErrors((p) => ({ ...p, name: "" }));
          }}
          maxLength={100}
          disabled={loading}
          className={`w-full rounded-lg border px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-offset-0 transition-colors disabled:opacity-50 ${
            fieldErrors.name ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20"
          }`}
          placeholder="Collection name"
        />
        <div className="flex justify-between mt-1">
          <span className="text-red-600 text-xs">{fieldErrors.name}</span>
          <span className="text-xs text-slate-500">{name.length} / 100</span>
        </div>
      </div>

      <div>
        <label htmlFor="collection-desc" className="block text-sm font-medium text-slate-700 mb-1.5">
          Description
        </label>
        <textarea
          id="collection-desc"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            if (fieldErrors.description) setFieldErrors((p) => ({ ...p, description: "" }));
          }}
          maxLength={500}
          rows={3}
          disabled={loading}
          className={`w-full rounded-lg border px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-offset-0 transition-colors disabled:opacity-50 ${
            fieldErrors.description ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20"
          }`}
          placeholder="Optional description"
        />
        <div className="flex justify-between mt-1">
          <span className="text-red-600 text-xs">{fieldErrors.description}</span>
          <span className="text-xs text-slate-500">{description.length} / 500</span>
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={loading} disabled={loading}>
          Create Collection
        </Button>
      </div>
    </form>
  );
}
