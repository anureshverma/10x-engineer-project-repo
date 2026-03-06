"use client";

import { useState, useEffect } from "react";
import type { Prompt, PromptCreateInput, Collection, Tag } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { getCollections } from "@/lib/api/collections";
import { getTags } from "@/lib/api/tags";

interface PromptFormProps {
  initial?: Prompt | null;
  onSubmit: (data: PromptCreateInput) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

export function PromptForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = "Save Prompt",
}: PromptFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [collectionId, setCollectionId] = useState(initial?.collection_id ?? "");
  const [tagIds, setTagIds] = useState<string[]>(initial?.tag_ids ?? []);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [collectionsLoading, setCollectionsLoading] = useState(true);
  const [tagsLoading, setTagsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    getCollections()
      .then((r) => setCollections(r.collections))
      .finally(() => setCollectionsLoading(false));
    getTags()
      .then((r) => setTags(r.tags))
      .finally(() => setTagsLoading(false));
  }, []);

  const validate = (): boolean => {
    const err: Record<string, string> = {};
    if (!title.trim()) err.title = "Title is required";
    else if (title.length > 200) err.title = "Title must be under 200 characters";
    if (!content.trim()) err.content = "Content is required";
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
        title: title.trim(),
        content: content.trim(),
        description: description.trim() || undefined,
        collection_id: collectionId || undefined,
        tag_ids: tagIds,
      });
    } catch (e: unknown) {
      const msg = e && typeof e === "object" && "detail" in e ? String((e as { detail: string }).detail) : "Something went wrong.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (id: string) => {
    setTagIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <ErrorMessage
          message={error}
          onDismiss={() => setError(null)}
        />
      )}

      <div>
        <label htmlFor="prompt-title" className="block text-sm font-medium text-slate-700 mb-1.5">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          id="prompt-title"
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (fieldErrors.title) setFieldErrors((p) => ({ ...p, title: "" }));
          }}
          maxLength={200}
          disabled={loading}
          className={`w-full rounded-lg border px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-offset-0 transition-colors disabled:opacity-50 ${
            fieldErrors.title ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20"
          }`}
          placeholder="Prompt title"
        />
        <div className="flex justify-between mt-1">
          <span className="text-red-600 text-xs">{fieldErrors.title}</span>
          <span className="text-xs text-slate-500">{title.length} / 200</span>
        </div>
      </div>

      <div>
        <label htmlFor="prompt-content" className="block text-sm font-medium text-slate-700 mb-1.5">
          Content <span className="text-red-500">*</span>
        </label>
        <textarea
          id="prompt-content"
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            if (fieldErrors.content) setFieldErrors((p) => ({ ...p, content: "" }));
          }}
          rows={6}
          disabled={loading}
          className={`w-full rounded-lg border px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-offset-0 transition-colors disabled:opacity-50 ${
            fieldErrors.content ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20"
          }`}
          placeholder="Main prompt content..."
        />
        <p className="text-red-600 text-xs mt-1">{fieldErrors.content}</p>
      </div>

      <div>
        <label htmlFor="prompt-desc" className="block text-sm font-medium text-slate-700 mb-1.5">
          Description
        </label>
        <textarea
          id="prompt-desc"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            if (fieldErrors.description) setFieldErrors((p) => ({ ...p, description: "" }));
          }}
          maxLength={500}
          rows={2}
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

      <div>
        <label htmlFor="prompt-collection" className="block text-sm font-medium text-slate-700 mb-1.5">
          Collection
        </label>
        <select
          id="prompt-collection"
          value={collectionId}
          onChange={(e) => setCollectionId(e.target.value)}
          disabled={loading || collectionsLoading}
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
        >
          <option value="">No collection</option>
          {collectionsLoading ? (
            <option disabled>Loading...</option>
          ) : (
            collections.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))
          )}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Tags
        </label>
        {tagsLoading ? (
          <p className="text-sm text-slate-500">Loading tags...</p>
        ) : tags.length === 0 ? (
          <p className="text-sm text-slate-500">No tags yet. Create tags from the Tags page.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tagIds.map((id) => {
              const t = tags.find((x) => x.id === id);
              return t ? (
                <Badge
                  key={t.id}
                  label={t.name}
                  color={t.color}
                  onRemove={() => setTagIds((prev) => prev.filter((x) => x !== t.id))}
                />
              ) : null;
            })}
            {tags.filter((t) => !tagIds.includes(t.id)).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => toggleTag(t.id)}
                className="rounded-full px-2.5 py-0.5 text-xs font-medium border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 min-h-[28px]"
              >
                + {t.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={loading} disabled={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
