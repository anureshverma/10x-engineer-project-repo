"use client";

import { useState } from "react";
import type { Tag } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { TagForm } from "./TagForm";
import { Pencil, Trash2 } from "lucide-react";
import { updateTag } from "@/lib/api/tags";
import type { TagPatchInput } from "@/lib/types";

interface TagCardProps {
  tag: Tag;
  onDeleteClick: (tag: Tag) => void;
  onUpdated: (tag: Tag) => void;
}

export function TagCard({ tag, onDeleteClick, onUpdated }: TagCardProps) {
  const [editing, setEditing] = useState(false);

  const handleSubmit = async (data: TagPatchInput) => {
    await updateTag(tag.id, data);
    onUpdated({ ...tag, ...data });
    setEditing(false);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      {editing ? (
        <TagForm
          initial={tag}
          onSubmit={handleSubmit}
          onCancel={() => setEditing(false)}
          submitLabel="Save"
        />
      ) : (
        <>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <Badge label={tag.name} color={tag.color} />
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditing(true)}
                className="min-h-[44px] min-w-[44px] md:min-w-0"
              >
                <Pencil className="w-4 h-4" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDeleteClick(tag)}
                className="text-red-600 hover:bg-red-50 min-h-[44px] min-w-[44px] md:min-w-0"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            </div>
          </div>
          {tag.description && (
            <p className="text-sm text-slate-600 mt-2">{tag.description}</p>
          )}
        </>
      )}
    </div>
  );
}
