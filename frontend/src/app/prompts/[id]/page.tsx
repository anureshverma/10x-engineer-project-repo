"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Pencil, FileQuestion, Plus } from "lucide-react";
import { getPrompt } from "@/lib/api/prompts";
import { getPromptTags, addPromptTags, removePromptTag } from "@/lib/api/prompts";
import { getCollection } from "@/lib/api/collections";
import { getTags } from "@/lib/api/tags";
import type { Prompt, Tag, Collection } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatDate } from "@/lib/utils";
import { ApiError } from "@/lib/api/client";

export default function PromptDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [collection, setCollection] = useState<Collection | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingTagId, setAddingTagId] = useState<string | null>(null);
  const [removingTagId, setRemovingTagId] = useState<string | null>(null);

  const loadPrompt = async () => {
    setError(null);
    setLoading(true);
    try {
      const [p, tagsRes, allTagsRes] = await Promise.all([
        getPrompt(id),
        getPromptTags(id),
        getTags(),
      ]);
      setPrompt(p);
      setTags(tagsRes.tags);
      setAllTags(allTagsRes.tags);
      if (p.collection_id) {
        try {
          const c = await getCollection(p.collection_id);
          setCollection(c);
        } catch {
          setCollection(null);
        }
      } else {
        setCollection(null);
      }
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        setError("not_found");
      } else {
        const msg = e && typeof e === "object" && "detail" in e ? String((e as { detail: string }).detail) : "Failed to load prompt.";
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrompt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAddTag = async (tagId: string) => {
    setAddingTagId(tagId);
    try {
      await addPromptTags(id, { tag_ids: [tagId] });
      const tagsRes = await getPromptTags(id);
      setTags(tagsRes.tags);
    } finally {
      setAddingTagId(null);
    }
  };

  const handleRemoveTag = async (tagId: string) => {
    setRemovingTagId(tagId);
    try {
      await removePromptTag(id, tagId);
      setTags((prev) => prev.filter((t) => t.id !== tagId));
    } finally {
      setRemovingTagId(null);
    }
  };

  const unassignedTags = allTags.filter((t) => !tags.some((x) => x.id === t.id));

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <Skeleton className="h-8 w-2/3 mb-4" rounded="sm" />
        <Skeleton className="h-4 w-full mb-2" rounded="sm" />
        <Skeleton className="h-4 w-full mb-2" rounded="sm" />
        <Skeleton className="h-4 w-3/4 mb-6" rounded="sm" />
        <div className="flex gap-2 mb-4">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>
    );
  }

  if (error === "not_found") {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <EmptyState
          icon={FileQuestion}
          title="Prompt not found"
          description="This prompt may have been deleted or the link is incorrect."
          actionLabel="Back to Prompts"
          actionHref="/prompts"
        />
      </div>
    );
  }

  if (error || !prompt) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <ErrorMessage
          message={error || "Failed to load prompt"}
          onRetry={loadPrompt}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            {prompt.title}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Updated {formatDate(prompt.updated_at)}
          </p>
        </div>
        <Button href={`/prompts/${id}/edit`} variant="primary" size="md">
          <Pencil className="w-4 h-4" />
          Edit
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
        {prompt.description && (
          <p className="text-sm text-slate-600 mb-4">{prompt.description}</p>
        )}
        <div className="prose prose-slate max-w-none">
          <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 bg-slate-50 p-4 rounded-lg overflow-x-auto">
            {prompt.content}
          </pre>
        </div>
      </div>

      <div className="space-y-4">
        {collection && (
          <div>
            <h2 className="text-sm font-medium text-slate-700 mb-1">Collection</h2>
            <Link
              href="/collections"
              className="text-indigo-600 hover:underline text-sm"
            >
              {collection.name}
            </Link>
          </div>
        )}

        <div>
          <h2 className="text-sm font-medium text-slate-700 mb-2">Tags</h2>
          {tags.length === 0 && unassignedTags.length === 0 ? (
            <p className="text-sm text-slate-500">
              No tags yet. Add tags from the Tags page, then assign them here.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2 items-center">
              {tags.map((t) => (
                <Badge
                  key={t.id}
                  label={t.name}
                  color={t.color}
                  onRemove={
                    removingTagId === t.id
                      ? undefined
                      : () => handleRemoveTag(t.id)
                  }
                />
              ))}
              {unassignedTags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {unassignedTags.map((t) => (
                    <Button
                      key={t.id}
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAddTag(t.id)}
                      loading={addingTagId === t.id}
                      disabled={!!addingTagId}
                    >
                      <Plus className="w-3 h-3" />
                      {t.name}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
