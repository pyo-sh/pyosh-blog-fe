import Link from "next/link";
import { formatNumber } from "@shared/lib/format-number";

interface ArchiveTagBadgeProps {
  href: string;
  name: string;
  count: number;
}

export function ArchiveTagBadge({ href, name, count }: ArchiveTagBadgeProps) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2 rounded-full border border-border-3 bg-background-1 px-4 py-[0.4375rem] text-body-sm font-medium text-text-2 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-px hover:border-primary-1 hover:bg-primary-1/5 hover:text-primary-1 active:translate-y-0"
    >
      <span>#{name}</span>
      <span className="text-ui-xs font-normal text-text-4 transition-colors duration-200 group-hover:text-primary-2">
        {formatNumber(count)}
      </span>
    </Link>
  );
}
