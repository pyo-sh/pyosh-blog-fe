import Link from "next/link";
import { Button } from "./button";
import { Text } from "./text";
import { cn } from "@shared/lib/style-utils";

type ErrorAction =
  | { type: "link"; href: string; label: string }
  | { type: "button"; onClick: () => void; label: string };

interface ErrorContentProps {
  badge: string;
  badgeVariant: "primary" | "negative";
  title: string;
  description: string;
  action: ErrorAction;
}

export function ErrorContent({
  badge,
  badgeVariant,
  title,
  description,
  action,
}: ErrorContentProps) {
  const badgeClasses =
    badgeVariant === "primary"
      ? "bg-primary-1/10 text-primary-1"
      : "bg-negative-1/10 text-negative-1";

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="w-full max-w-[32rem] rounded-[2rem] border border-border-3 bg-background-2 p-8 text-center shadow-[0px_18px_60px_0px_rgba(0,0,0,0.08)]"
    >
      <Text
        as="span"
        fontSize="body-sm"
        fontWeight="bold"
        className={cn("mb-4 inline-block rounded-full px-4 py-2", badgeClasses)}
      >
        {badge}
      </Text>

      <Text as="h1" fontSize="h3" fontWeight="bold" className="mb-3 block">
        {title}
      </Text>

      <Text as="p" fontSize="body-base" className="mb-8 block text-text-2">
        {description}
      </Text>

      {action.type === "link" ? (
        <Link
          href={action.href}
          className={cn(
            "inline-flex items-center justify-center rounded-[3px] bg-primary-1 px-6 py-2 text-text-1 shadow-[0px_2px_7px_0px_rgba(0,0,0,0.26)]",
            "transition-all duration-300 hover:-translate-y-[7px]",
          )}
        >
          {action.label}
        </Link>
      ) : (
        <Button
          type="button"
          theme="error"
          className="min-w-32 px-6"
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
