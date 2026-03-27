import { cn } from "@shared/lib/style-utils";

interface SkeletonProps {
  variant?: "text" | "circle" | "rect";
  width?: string;
  height?: string;
  repeat?: number;
  className?: string;
}

const variantDefaults: Record<
  NonNullable<SkeletonProps["variant"]>,
  { rounded: string; height: string; width?: string }
> = {
  text: { rounded: "rounded-full", height: "h-4" },
  circle: { rounded: "rounded-full", height: "h-8", width: "2rem" },
  rect: { rounded: "rounded-lg", height: "h-16" },
};

function SkeletonItem({
  variant = "text",
  width,
  height,
  className,
}: Omit<SkeletonProps, "repeat">) {
  const defaults = variantDefaults[variant];

  return (
    <div
      className={cn(
        "animate-pulse bg-background-4",
        defaults.rounded,
        !height && defaults.height,
        className,
      )}
      style={{
        width: width ?? defaults.width ?? "100%",
        ...(height ? { height } : {}),
      }}
    />
  );
}

export function Skeleton({
  variant = "text",
  width,
  height,
  repeat = 1,
  className,
}: SkeletonProps) {
  if (repeat === 1) {
    return (
      <div aria-busy="true">
        <SkeletonItem
          variant={variant}
          width={width}
          height={height}
          className={className}
        />
      </div>
    );
  }

  return (
    <div aria-busy="true" className="space-y-2">
      {Array.from({ length: repeat }).map((_, index) => (
        <SkeletonItem
          key={index}
          variant={variant}
          width={width}
          height={height}
          className={className}
        />
      ))}
    </div>
  );
}
