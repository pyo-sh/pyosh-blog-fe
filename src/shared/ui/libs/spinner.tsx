import { cn } from "@shared/lib/style-utils";

interface SpinnerProps {
  size?: "sm" | "md";
  className?: string;
}

const sizeClasses: Record<NonNullable<SpinnerProps["size"]>, string> = {
  sm: "w-3.5 h-3.5",
  md: "w-5 h-5",
};

export function Spinner({ size = "sm", className }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="로딩 중"
      className={cn("inline-flex items-center justify-center", className)}
    >
      <svg
        className={cn("animate-spin", sizeClasses[size])}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      <span className="sr-only">로딩 중</span>
    </span>
  );
}
