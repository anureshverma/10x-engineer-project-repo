"use client";

import { AlertCircle, X } from "lucide-react";
import { Button } from "./Button";

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function ErrorMessage({
  title = "Something went wrong",
  message,
  onRetry,
  onDismiss,
  className = "",
}: ErrorMessageProps) {
  return (
    <div
      role="alert"
      className={`bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3 items-start ${className}`}
    >
      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" aria-hidden />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-red-800">{title}</p>
        <p className="text-sm text-red-700 mt-1">{message}</p>
        {onRetry && (
          <Button
            variant="secondary"
            size="sm"
            className="mt-3"
            onClick={onRetry}
          >
            Retry
          </Button>
        )}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="p-1 rounded hover:bg-red-100 text-red-600 flex-shrink-0"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
