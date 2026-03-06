"use client";

import { Loader2 } from "lucide-react";

interface SpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

export function Spinner({ className = "", size = "md" }: SpinnerProps) {
  return (
    <Loader2
      className={`animate-spin text-current ${sizeClasses[size]} ${className}`}
      aria-hidden
    />
  );
}
