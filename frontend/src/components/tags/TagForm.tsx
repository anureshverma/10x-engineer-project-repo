"use client";

import { useState } from "react";
import type { Tag, TagCreateInput, TagPatchInput } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { ErrorMessage } from "@/components/ui/ErrorMessage";

interface TagFormProps {
  initial?: Tag | null;
  onSubmit: (data: TagCreateInput | TagPatchInput) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

export function TagForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = "Save Tag",
}: TagFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [color, setColor] = useState(initial?.color ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const err: Record<string, string> = {};
    if (!name.trim()) err.name = "Name is required";
    else if (name.length > 50) err.name = "Name must be under 50 characters";
    if (description.length > 200) err.description = "Description must be under 200 characters";
    setFieldErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      if (initial) {
        await onSubmit({ name: name.trim(), description: description.trim() || undefined, color: color || undefined });
      } else {
        await onSubmit({
          name: name.trim(),
          description: description.trim() || undefined,
          color: color || undefined,
        });
      }
    } catch (e: unknown) {
      const msg = e && typeof e === "object" && "detail" in e ? String((e as { detail: string }).detail) : "Something went wrong.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <ErrorMessage message={error} onDismiss={() => setError(null)} />
      )}
      <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="tag-name" className="block text-sm font-medium text-slate-700 mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            id="tag-name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (fieldErrors.name) setFieldErrors((p) => ({ ...p, name: "" }));
            }}
            maxLength={50}
            disabled={loading}
            className={`w-full rounded-lg border px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-offset-0 text-sm disabled:opacity-50 ${
              fieldErrors.name ? "border-red-500 focus:ring-red-500/20" : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20"
            }`}
            placeholder="Tag name"
          />
          <p className="text-red-600 text-xs mt-0.5">{fieldErrors.name}</p>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="tag-color" className="block text-sm font-medium text-slate-700 mb-1">
            Color
          </label>
          <input
            id="tag-color"
            type="text"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            disabled={loading}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm disabled:opacity-50"
            placeholder="#3b82f6 or color name"
          />
        </div>
      </div>
      <div>
        <label htmlFor="tag-desc" className="block text-sm font-medium text-slate-700 mb-1">
          Description
        </label>
        <input
          id="tag-desc"
          type="text"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            if (fieldErrors.description) setFieldErrors((p) => ({ ...p, description: "" }));
          }}
          maxLength={200}
          disabled={loading}
          className={`w-full rounded-lg border px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-offset-0 text-sm disabled:opacity-50 ${
            fieldErrors.description ? "border-red-500 focus:ring-red-500/20" : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20"
          }`}
          placeholder="Optional description"
        />
        <div className="flex justify-between mt-0.5">
          <span className="text-red-600 text-xs">{fieldErrors.description}</span>
          <span className="text-xs text-slate-500">{description.length} / 200</span>
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="sm" loading={loading} disabled={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
