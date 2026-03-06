"use client";

import { forwardRef } from "react";
import Link from "next/link";
import { Spinner } from "./Spinner";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 border-transparent",
  secondary:
    "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-slate-400 border-slate-300",
  danger:
    "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 border-transparent",
  ghost:
    "text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-400 border-transparent",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

interface BaseButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
  children: React.ReactNode;
  "aria-label"?: string;
}

interface ButtonAsButton extends BaseButtonProps {
  href?: never;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

interface ButtonAsLink extends BaseButtonProps {
  href: string;
  onClick?: never;
}

type ButtonProps = ButtonAsButton | ButtonAsLink;

const baseClasses =
  "rounded-lg font-medium transition-colors duration-150 inline-flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      loading = false,
      disabled = false,
      type = "button",
      className = "",
      children,
      ...rest
    },
    ref
  ) {
    const isDisabled = disabled || loading;
    const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

    if ("href" in rest && rest.href) {
      return (
        <Link
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={rest.href}
          className={classes}
          aria-disabled={isDisabled}
        >
          {children}
        </Link>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={type}
        disabled={isDisabled}
        className={classes}
        onClick={"onClick" in rest ? rest.onClick : undefined}
        aria-label={rest["aria-label"]}
      >
        {loading ? (
          <>
            <Spinner size={size === "lg" ? "lg" : size === "sm" ? "sm" : "md"} />
            {children}
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);
