"use client";

import { X } from "lucide-react";

interface BadgeProps {
  label: string;
  color?: string;
  onRemove?: () => void;
  className?: string;
}

function isLightColor(hex: string): boolean {
  if (!hex || hex.length < 4) return false;
  const match = hex.replace("#", "").match(/.{2}/g);
  if (!match) return false;
  const [r, g, b] = match.map((x) => parseInt(x, 16));
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6;
}

export function Badge({ label, color, onRemove, className = "" }: BadgeProps) {
  const bgColor = color || "#e0e7ff";
  const textColor = color && isLightColor(color) ? "#1e293b" : "#ffffff";
  const displayBg = color || "bg-indigo-100";
  const displayText = color ? undefined : "text-indigo-700";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${displayBg} ${displayText} ${className}`}
      style={color ? { backgroundColor: bgColor, color: textColor } : undefined}
    >
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onRemove();
          }}
          className="p-0.5 rounded-full hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-1 min-w-[20px] min-h-[20px] flex items-center justify-center"
          aria-label={`Remove ${label}`}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}
