"use client";

import { Search } from "lucide-react";
import type { Collection, Tag } from "@/lib/types";
import { Button } from "@/components/ui/Button";

interface PromptFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  collectionId: string;
  onCollectionChange: (v: string) => void;
  tagIds: string[];
  onTagIdsChange: (v: string[]) => void;
  tagMatch: "any" | "all";
  onTagMatchChange: (v: "any" | "all") => void;
  collections: Collection[];
  tags: Tag[];
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export function PromptFilters({
  search,
  onSearchChange,
  collectionId,
  onCollectionChange,
  tagIds,
  onTagIdsChange,
  tagMatch,
  onTagMatchChange,
  collections,
  tags,
  onClearFilters,
  hasActiveFilters,
}: PromptFiltersProps) {
  const toggleTag = (id: string) => {
    if (tagIds.includes(id)) {
      onTagIdsChange(tagIds.filter((t) => t !== id));
    } else {
      onTagIdsChange([...tagIds, id]);
    }
  };

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4 flex-wrap">
      <div className="relative flex-1 min-w-0 md:max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="search"
          placeholder="Search prompts..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors"
          aria-label="Search prompts"
        />
      </div>
      <select
        value={collectionId}
        onChange={(e) => onCollectionChange(e.target.value)}
        className="w-full md:w-auto min-w-[180px] rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
        aria-label="Filter by collection"
      >
        <option value="">All collections</option>
        {collections.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-slate-600">Tags:</span>
        {tags.length === 0 ? (
          <span className="text-sm text-slate-400">No tags</span>
        ) : (
          <>
            {tags.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => toggleTag(t.id)}
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium border transition-colors min-h-[32px] ${
                  tagIds.includes(t.id)
                    ? "bg-indigo-100 text-indigo-700 border-indigo-200"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {t.name}
              </button>
            ))}
            {tagIds.length > 0 && (
              <select
                value={tagMatch}
                onChange={(e) => onTagMatchChange(e.target.value as "any" | "all")}
                className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700"
                aria-label="Tag match mode"
              >
                <option value="all">Match all</option>
                <option value="any">Match any</option>
              </select>
            )}
          </>
        )}
      </div>
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onClearFilters}>
          Clear filters
        </Button>
      )}
    </div>
  );
}
