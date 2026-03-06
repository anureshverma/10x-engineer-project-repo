"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { FileText, SearchX } from "lucide-react";
import { getPrompts, type GetPromptsFilters } from "@/lib/api/prompts";
import { getCollections } from "@/lib/api/collections";
import { getTags } from "@/lib/api/tags";
import type { Prompt, Collection, Tag } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { PromptCard } from "@/components/prompts/PromptCard";
import { PromptFilters } from "@/components/prompts/PromptFilters";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { DeleteConfirmDialog } from "@/components/ui/DeleteConfirmDialog";
import { deletePrompt } from "@/lib/api/prompts";

function PromptsPageContent() {
  const searchParams = useSearchParams();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [collectionId, setCollectionId] = useState(searchParams.get("collection_id") ?? "");
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [tagMatch, setTagMatch] = useState<"any" | "all">("all");

  useEffect(() => {
    const cid = searchParams.get("collection_id");
    if (cid) setCollectionId(cid);
  }, [searchParams]);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const hasActiveFilters = search !== "" || collectionId !== "" || tagIds.length > 0;

  const loadPrompts = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const filters: GetPromptsFilters = {};
      if (search) filters.search = search;
      if (collectionId) filters.collection_id = collectionId;
      if (tagIds.length) {
        filters.tag_ids = tagIds;
        filters.tag_match = tagMatch;
      }
      const res = await getPrompts(filters);
      setPrompts(res.prompts);
    } catch (e: unknown) {
      const msg = e && typeof e === "object" && "detail" in e ? String((e as { detail: string }).detail) : "Failed to load prompts.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [search, collectionId, tagIds, tagMatch]);

  useEffect(() => {
    loadPrompts();
  }, [loadPrompts]);

  useEffect(() => {
    getCollections().then((r) => setCollections(r.collections));
    getTags().then((r) => setTags(r.tags));
  }, []);

  const handleClearFilters = () => {
    setSearch("");
    setCollectionId("");
    setTagIds([]);
  };

  const handleDeleteClick = (id: string) => {
    const p = prompts.find((x) => x.id === id);
    setDeleteTarget(p ? { id: p.id, title: p.title } : { id, title: "This prompt" });
  };
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteError(null);
    setDeleteLoading(true);
    try {
      await deletePrompt(deleteTarget.id);
      setDeleteTarget(null);
      await loadPrompts();
    } catch (e: unknown) {
      const msg = e && typeof e === "object" && "detail" in e ? String((e as { detail: string }).detail) : "Failed to delete.";
      setDeleteError(msg);
    } finally {
      setDeleteLoading(false);
    }
  };

  const isEmpty = !loading && prompts.length === 0;
  const isEmptyNoFilters = isEmpty && !hasActiveFilters;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Prompts</h1>
        <Button href="/prompts/new" variant="primary">
          New Prompt
        </Button>
      </div>

      <div className="mb-6">
        <PromptFilters
          search={search}
          onSearchChange={setSearch}
          collectionId={collectionId}
          onCollectionChange={setCollectionId}
          tagIds={tagIds}
          onTagIdsChange={setTagIds}
          tagMatch={tagMatch}
          onTagMatchChange={setTagMatch}
          collections={collections}
          tags={tags}
          onClearFilters={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
        />
      </div>

      {error && (
        <ErrorMessage message={error} onRetry={loadPrompts} className="mb-6" />
      )}

      {!loading && isEmptyNoFilters && (
        <EmptyState
          icon={FileText}
          title="No prompts yet"
          description="Prompts are reusable text templates. Create your first one to get started!"
          actionLabel="Create Your First Prompt"
          actionHref="/prompts/new"
        />
      )}

      {!loading && isEmpty && hasActiveFilters && (
        <EmptyState
          icon={SearchX}
          title="No matching prompts"
          description="No prompts match your current search or filters. Try adjusting your criteria."
          onAction={handleClearFilters}
          actionLabel="Clear All Filters"
        />
      )}

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 lg:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonCard key={i} lines={3} />
          ))}
        </div>
      )}

      {!loading && !isEmpty && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 lg:gap-6">
          {prompts.map((p) => (
            <PromptCard
              key={p.id}
              prompt={p}
              tags={tags}
              onDelete={handleDeleteClick}
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
        title="Delete prompt?"
        description={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.title}"? This action cannot be undone.`
            : ""
        }
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
        error={deleteError}
      />
    </div>
  );
}

export default function PromptsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <div className="h-9 w-48 mb-6 rounded bg-slate-200 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 lg:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} lines={3} />
            ))}
          </div>
        </div>
      }
    >
      <PromptsPageContent />
    </Suspense>
  );
}
