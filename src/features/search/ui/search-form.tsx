"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react/offline";
import magniferLinear from "@iconify-icons/solar/magnifer-linear";
import { useRouter } from "next/navigation";
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
      <DropSelect
        value={filter}
        onChange={setFilter}
        ariaLabel="검색 필터"
        className="w-full shrink-0 sm:w-auto"
        triggerClassName="h-[2.625rem] rounded-[0.625rem] border-border-3 bg-background-2 py-0 pl-[0.875rem] pr-9 text-ui-sm text-text-1 sm:min-w-[7.5rem]"
        iconClassName="text-text-3"
        iconWidth="12"
        options={FILTER_OPTIONS}
      />

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
