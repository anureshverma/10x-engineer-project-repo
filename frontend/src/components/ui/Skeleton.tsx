"use client";

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: "none" | "sm" | "md" | "lg" | "full";
}

const roundedClasses = {
  none: "rounded-none",
  sm: "rounded",
  md: "rounded-lg",
  lg: "rounded-xl",
  full: "rounded-full",
};

export function Skeleton({
  className = "",
  width,
  height,
  rounded = "md",
}: SkeletonProps) {
  const style: React.CSSProperties = {};
  if (width !== undefined) style.width = typeof width === "number" ? `${width}px` : width;
  if (height !== undefined) style.height = typeof height === "number" ? `${height}px` : height;

  return (
    <div
      className={`animate-pulse bg-slate-200 ${roundedClasses[rounded]} ${className}`}
      style={Object.keys(style).length ? style : undefined}
      aria-hidden
    />
  );
}

export function SkeletonLine({ className = "" }: { className?: string }) {
  return <Skeleton className={`h-4 ${className}`} rounded="sm" />;
}

export function SkeletonCircle({ size = 10 }: { size?: number }) {
  return (
    <Skeleton
      width={size}
      height={size}
      rounded="full"
      className="flex-shrink-0"
    />
  );
}

export function SkeletonCard({
  className = "",
  lines = 3,
}: {
  className?: string;
  lines?: number;
}) {
  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 shadow-sm p-5 ${className}`}
    >
      <Skeleton className="h-5 w-3/4 mb-4" rounded="sm" />
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLine key={i} className={i < lines - 1 ? "mb-2" : ""} />
      ))}
      <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end gap-2">
        <Skeleton className="h-9 w-20" rounded="lg" />
        <Skeleton className="h-9 w-20" rounded="lg" />
      </div>
    </div>
  );
}
