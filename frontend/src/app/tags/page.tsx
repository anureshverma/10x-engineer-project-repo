"use client";

import { useState, useEffect, useCallback } from "react";
import { Tags } from "lucide-react";
import { getTags } from "@/lib/api/tags";
import { createTag } from "@/lib/api/tags";
import { deleteTag } from "@/lib/api/tags";
import type { Tag, TagCreateInput, TagPatchInput } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { TagCard } from "@/components/tags/TagCard";
import { TagForm } from "@/components/tags/TagForm";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Tag | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const loadTags = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await getTags();
      setTags(res.tags);
    } catch (e: unknown) {
      const msg = e && typeof e === "object" && "detail" in e ? String((e as { detail: string }).detail) : "Failed to load tags.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  const handleCreateSubmit = async (data: TagCreateInput | TagPatchInput) => {
    await createTag(data as TagCreateInput);
    setShowCreateForm(false);
    await loadTags();
  };

  const handleTagUpdated = (updated: Tag) => {
    setTags((prev) => prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t)));
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteError(null);
    setDeleteLoading(true);
    try {
      await deleteTag(deleteTarget.id);
      setDeleteTarget(null);
      await loadTags();
    } catch (e: unknown) {
      const msg = e && typeof e === "object" && "detail" in e ? String((e as { detail: string }).detail) : "Failed to delete.";
      setDeleteError(msg);
    } finally {
      setDeleteLoading(false);
    }
  };

  const isEmpty = !loading && tags.length === 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Tags</h1>
        {!showCreateForm && (
          <Button
            variant="primary"
            onClick={() => setShowCreateForm(true)}
          >
            New Tag
          </Button>
        )}
      </div>

      {showCreateForm && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Create Tag</h2>
          <TagForm
            onSubmit={handleCreateSubmit}
            onCancel={() => setShowCreateForm(false)}
            submitLabel="Create Tag"
          />
        </div>
      )}

      {error && (
        <ErrorMessage message={error} onRetry={loadTags} className="mb-6" />
      )}

      {isEmpty && !showCreateForm && (
        <EmptyState
          icon={Tags}
          title="No tags yet"
          description="Tags help you categorize and filter your prompts. Add your first tag below!"
          actionLabel="Create Your First Tag"
          onAction={() => setShowCreateForm(true)}
        />
      )}

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonCard key={i} lines={2} />
          ))}
        </div>
      )}

      {!loading && tags.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tags.map((tag) => (
            <TagCard
              key={tag.id}
              tag={tag}
              onDeleteClick={setDeleteTarget}
              onUpdated={handleTagUpdated}
            />
          ))}
        </div>
      )}

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onClose={() => {
          setDeleteTarget(null);
          setDeleteError(null);
        }}
        title="Delete tag?"
        description={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.name}"? This tag will be removed from all prompts.`
            : ""
        }
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
        error={deleteError}
      />
    </div>
  );
}
