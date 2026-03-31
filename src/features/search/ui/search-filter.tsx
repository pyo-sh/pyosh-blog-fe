"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { SearchFilter } from "@entities/post";

const FILTER_OPTIONS: Array<{ value: SearchFilter; label: string }> = [
  { value: "title_content", label: "제목 + 내용" },
  { value: "title", label: "제목" },
  { value: "content", label: "내용" },
  { value: "tag", label: "태그" },
  { value: "category", label: "카테고리" },
  { value: "comment", label: "댓글" },
];

interface SearchFilterProps {
  currentFilter: SearchFilter;
  query: string;
}

export function SearchFilterDropdown({
  currentFilter,
  query,
}: SearchFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("filter", event.target.value);
    params.set("page", "1");
    if (query) {
      params.set("q", query);
    }
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="relative">
      <select
        value={currentFilter}
        onChange={handleChange}
        aria-label="검색 필터"
        className="h-[2.625rem] appearance-none rounded-[0.625rem] border border-border-3 bg-background-2 py-0 pl-[0.875rem] pr-9 text-ui-sm text-text-1 outline-none transition-[border-color,box-shadow] focus:border-primary-1"
      >
        {FILTER_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-3" />
    </div>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="16"
      height="16"
      aria-hidden="true"
      className={className}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
