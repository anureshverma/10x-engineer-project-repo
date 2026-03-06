"use client";

import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import type { Prompt, Tag } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";

interface PromptCardProps {
  prompt: Prompt;
  tags?: Tag[];
  onDelete?: (id: string) => void;
}

export function PromptCard({ prompt, tags = [], onDelete }: PromptCardProps) {
  const tagMap = new Map(tags.map((t) => [t.id, t]));

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 p-5 flex flex-col h-full">
      <div className="flex-1 min-w-0">
        <Link href={`/prompts/${prompt.id}`} className="block group">
          <h3 className="font-semibold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
            {prompt.title}
          </h3>
          <p className="text-sm text-slate-600 line-clamp-2 mt-1">
            {prompt.description || prompt.content.slice(0, 120)}
          </p>
        </Link>
        {prompt.tag_ids.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {prompt.tag_ids.slice(0, 3).map((tagId) => {
              const tag = tagMap.get(tagId);
              return tag ? (
                <Badge key={tagId} label={tag.name} color={tag.color} />
              ) : null;
            })}
            {prompt.tag_ids.length > 3 && (
              <span className="text-xs text-slate-400">
                +{prompt.tag_ids.length - 3}
              </span>
            )}
          </div>
        )}
        <p className="text-xs text-slate-500 mt-2">
          Updated {formatDate(prompt.updated_at)}
        </p>
      </div>
      <div className="border-t border-slate-100 mt-4 pt-3 flex flex-wrap gap-2 justify-end">
        <Button
          href={`/prompts/${prompt.id}/edit`}
          variant="ghost"
          size="sm"
          className="min-h-[44px] min-w-[44px] md:min-w-0"
        >
          <Pencil className="w-4 h-4" />
          Edit
        </Button>
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(prompt.id)}
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
