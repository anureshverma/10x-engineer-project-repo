"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import type { Collection } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";

interface CollectionCardProps {
  collection: Collection;
  promptCount?: number;
  onDelete?: (id: string) => void;
}

export function CollectionCard({ collection, promptCount = 0, onDelete }: CollectionCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-5 flex flex-col h-full">
      <div className="flex-1 min-w-0">
        <Link href={`/prompts?collection_id=${encodeURIComponent(collection.id)}`} className="block group">
          <h3 className="font-semibold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
            {collection.name}
          </h3>
          {collection.description && (
            <p className="text-sm text-slate-600 line-clamp-2 mt-1">
              {collection.description}
            </p>
          )}
        </Link>
        {promptCount > 0 && (
          <p className="text-xs text-slate-500 mt-2">
            {promptCount} prompt{promptCount !== 1 ? "s" : ""} in this collection
          </p>
        )}
        <p className="text-xs text-slate-500 mt-1">
          Created {formatDate(collection.created_at)}
        </p>
      </div>
      <div className="border-t border-slate-100 mt-4 pt-3 flex flex-wrap gap-2 justify-end">
        <Link
          href={`/prompts?collection_id=${encodeURIComponent(collection.id)}`}
          className="inline-flex items-center justify-center rounded-lg font-medium px-4 py-2 text-sm border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 min-h-[44px]"
        >
          View prompts
        </Link>
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(collection.id)}
            className="text-red-600 hover:bg-red-50 min-h-[44px] min-w-[44px] md:min-w-0"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}
