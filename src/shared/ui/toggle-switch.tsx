"use client";

import { cn } from "@shared/lib/style-utils";

interface ToggleSwitchProps {
  checked: boolean;
  disabled?: boolean;
  size?: "md" | "sm";
  onChange: (checked: boolean) => void;
  label?: string;
  "aria-label"?: string;
}

export function ToggleSwitch({
  checked,
  disabled,
  size = "md",
  onChange,
  label,
  "aria-label": ariaLabel,
}: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel ?? label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex shrink-0 cursor-pointer items-center border-2 border-transparent",
        "transition-colors duration-200 ease-in-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-1 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        size === "sm" ? "h-5 w-9 rounded-[10px]" : "h-6 w-11 rounded-full",
        checked ? "bg-primary-1" : "bg-border-3",
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block bg-white shadow-sm",
          "transform transition duration-200 ease-in-out",
          size === "sm" ? "h-4 w-4 rounded-[8px]" : "h-5 w-5 rounded-full",
          checked
            ? size === "sm"
              ? "translate-x-4"
              : "translate-x-5"
            : "translate-x-0",
        )}
      />
    </button>
  );
}
