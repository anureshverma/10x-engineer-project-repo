"use client";

import { useState, useEffect, useCallback } from "react";
import { FolderOpen } from "lucide-react";
import { getCollections } from "@/lib/api/collections";
import { getPrompts } from "@/lib/api/prompts";
import type { Collection } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { CollectionCard } from "@/components/collections/CollectionCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";
import { deleteCollection } from "@/lib/api/collections";

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [promptCountByCollection, setPromptCountByCollection] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await getCollections();
      setCollections(res.collections);
      const counts: Record<string, number> = {};
      await Promise.all(
        res.collections.map(async (c) => {
          const pr = await getPrompts({ collection_id: c.id });
          counts[c.id] = pr.total;
        })
      );
      setPromptCountByCollection(counts);
    } catch (e: unknown) {
      const msg = e && typeof e === "object" && "detail" in e ? String((e as { detail: string }).detail) : "Failed to load collections.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteError(null);
    setDeleteLoading(true);
    try {
      await deleteCollection(deleteTarget.id);
      setDeleteTarget(null);
      await loadData();
    } catch (e: unknown) {
      const msg = e && typeof e === "object" && "detail" in e ? String((e as { detail: string }).detail) : "Failed to delete.";
      setDeleteError(msg);
    } finally {
      setDeleteLoading(false);
    }
  };

  const isEmpty = !loading && collections.length === 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Collections</h1>
        <Button href="/collections/new" variant="primary">
          New Collection
        </Button>
      </div>

      {error && (
        <ErrorMessage message={error} onRetry={loadData} className="mb-6" />
      )}

      {isEmpty && (
        <EmptyState
          icon={FolderOpen}
          title="No collections yet"
          description="Collections help you organize related prompts together. Create one to get started!"
          actionLabel="Create Your First Collection"
          actionHref="/collections/new"
        />
      )}

      {loading && !isEmpty && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 lg:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonCard key={i} lines={2} />
          ))}
        </div>
      )}

      {!loading && !isEmpty && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 lg:gap-6">
          {collections.map((c) => (
            <CollectionCard
              key={c.id}
              collection={c}
              promptCount={promptCountByCollection[c.id] ?? 0}
              onDelete={(id) => {
                const col = collections.find((x) => x.id === id);
                setDeleteTarget(col ? { id: col.id, name: col.name } : { id, name: "This collection" });
              }}
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
        title="Delete collection?"
        description={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.name}"? All prompts in this collection will also be deleted.`
            : ""
        }
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
        error={deleteError}
      />
    </div>
  );
}
