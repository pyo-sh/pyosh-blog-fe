"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { SearchFilter } from "@entities/post";
import { DropSelect } from "@shared/ui/libs";

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

  const handleChange = (value: SearchFilter) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("filter", value);
    params.set("page", "1");
    if (query) {
      params.set("q", query);
    }
    router.push(`/search?${params.toString()}`);
  };

  return (
    <DropSelect
      value={currentFilter}
      onChange={handleChange}
      ariaLabel="검색 필터"
      triggerClassName="h-[2.625rem] rounded-[0.625rem] border-border-3 bg-background-2 py-0 pl-[0.875rem] pr-9 text-ui-sm text-text-1"
      iconClassName="text-text-3"
      options={FILTER_OPTIONS}
    />
  );
}
