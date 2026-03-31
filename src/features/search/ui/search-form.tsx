"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import magniferLinear from "@iconify-icons/solar/magnifer-linear";
import { useRouter } from "next/navigation";
import type { SearchFilter } from "@entities/post";

const FILTER_OPTIONS: Array<{ value: SearchFilter; label: string }> = [
  { value: "title_content", label: "제목 + 내용" },
  { value: "title", label: "제목" },
  { value: "content", label: "내용" },
  { value: "tag", label: "태그" },
  { value: "category", label: "카테고리" },
  { value: "comment", label: "댓글" },
];

interface SearchFormProps {
  currentFilter: SearchFilter;
  initialQuery: string;
}

export function SearchForm({ currentFilter, initialQuery }: SearchFormProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [filter, setFilter] = useState<SearchFilter>(currentFilter);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    setFilter(currentFilter);
  }, [currentFilter]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      router.push("/search");

      return;
    }

    const params = new URLSearchParams({ q: trimmedQuery });

    if (filter !== "title_content") {
      params.set("filter", filter);
    }

    router.push(`/search?${params.toString()}`);
  };

  return (
    <form
      className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center"
      onSubmit={handleSubmit}
    >
      <div className="relative shrink-0">
        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value as SearchFilter)}
          aria-label="검색 필터"
          className="h-[2.625rem] w-full appearance-none rounded-[0.625rem] border border-border-3 bg-background-2 py-0 pl-[0.875rem] pr-9 text-ui-sm text-text-1 outline-none transition-[border-color,box-shadow] focus:border-primary-1 sm:w-auto sm:min-w-[7.5rem]"
        >
          {FILTER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-3" />
      </div>

      <label className="flex h-[2.625rem] flex-1 items-center gap-2 rounded-[0.625rem] border border-border-3 bg-background-2 px-[0.875rem] transition-[border-color,box-shadow] focus-within:border-primary-1 focus-within:shadow-[0_0_0_3px_rgba(138,111,224,0.12)]">
        <Icon
          icon={magniferLinear}
          width="16"
          aria-hidden="true"
          className="shrink-0 text-text-4"
        />
        <span className="sr-only">검색어 입력</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="검색어를 입력해 주세요"
          aria-label="검색어 입력"
          className="h-full w-full min-w-0 bg-transparent text-[0.875rem] leading-normal text-text-1 outline-none placeholder:text-text-4"
        />
      </label>

      <button
        type="submit"
        aria-label="검색"
        className="flex h-[2.625rem] w-[2.625rem] shrink-0 items-center justify-center rounded-[0.625rem] bg-primary-1 text-white transition-all hover:-translate-y-px hover:opacity-90"
      >
        <Icon icon={magniferLinear} width="18" aria-hidden="true" />
      </button>
    </form>
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
      width="12"
      height="12"
      aria-hidden="true"
      className={className}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
