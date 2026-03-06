"use client";

import type { LucideIcon } from "lucide-react";
import { Button } from "./Button";

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-4">
      <Icon
        className="w-16 h-16 text-slate-300 mb-4"
        strokeWidth={1.5}
        aria-hidden
      />
      <h2 className="text-lg font-semibold text-slate-700 mb-2">{title}</h2>
      <p className="text-sm text-slate-500 max-w-md mb-6">{description}</p>
      {actionLabel && (actionHref || onAction) && (
        actionHref ? (
          <Button href={actionHref} variant="primary" size="lg">
            {actionLabel}
          </Button>
        ) : (
          <Button variant="primary" size="lg" onClick={onAction}>
            {actionLabel}
          </Button>
        )
      )}
    </div>
  );
}
