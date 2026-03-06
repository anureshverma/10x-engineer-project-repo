"use client";

import { useEffect, useRef } from "react";
import { Button } from "./Button";
import { ErrorMessage } from "./ErrorMessage";

interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
  error?: string | null;
}

export function DeleteConfirmDialog({
  open,
  onClose,
  title,
  description,
  onConfirm,
  loading = false,
  error = null,
}: DeleteConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={dialogRef}
        className="relative w-full md:max-w-md bg-white rounded-t-2xl md:rounded-2xl shadow-xl p-6"
      >
        <h2
          id="delete-dialog-title"
          className="text-lg font-semibold text-slate-900 mb-2"
        >
          {title}
        </h2>
        <p className="text-sm text-slate-600 mb-4">{description}</p>
        {error && (
          <ErrorMessage message={error} className="mb-4" />
        )}
        <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => onConfirm()}
            loading={loading}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}
