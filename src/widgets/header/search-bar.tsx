"use client";

import React, { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import magniferLinear from "@iconify-icons/solar/magnifer-linear";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@shared/lib/style-utils";

const SearchBar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLFormElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const isSearchPage = pathname === "/search";
  const isExpanded = isSearchPage || isOpen;

  useEffect(() => {
    if (!isExpanded) {
      return;
    }

    inputRef.current?.focus();
    if (!isSearchPage) {
      inputRef.current?.select();
    }
  }, [isExpanded, isSearchPage]);

  useEffect(() => {
    if (!isOpen || isSearchPage) {
      return;
    }

    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, isSearchPage]);

  useEffect(() => {
    if (isSearchPage) {
      setQuery(searchParams.get("q") ?? "");
      setIsOpen(false);

      return;
    }

    setQuery("");
  }, [isSearchPage, searchParams]);

  const handleOpen = () => {
    if (isSearchPage) {
      inputRef.current?.focus();

      return;
    }

    setQuery("");
    setIsOpen(true);
  };

  const handleClose = () => {
    if (isSearchPage) {
      inputRef.current?.blur();

      return;
    }

    setIsOpen(false);
    setQuery("");
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      handleClose();
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      if (isSearchPage) {
        inputRef.current?.focus();

        return;
      }

      return handleClose();
    }

    const currentFilter = isSearchPage
      ? (searchParams.get("filter") ?? "title_content")
      : "title_content";

    const params = new URLSearchParams({ q: trimmedQuery });

    if (currentFilter !== "title_content") {
      params.set("filter", currentFilter);
    }

    router.push(`/search?${params.toString()}`);

    if (!isSearchPage) {
      handleClose();
    }
  };

  return (
    <form
      ref={containerRef}
      className={cn(
        "flex items-center overflow-hidden rounded-[0.625rem] transition-[width,min-width,padding,border-color,background-color,box-shadow] duration-300",
        isExpanded
          ? "h-[2.125rem] min-w-[10rem] gap-1.5 border border-border-3 bg-background-2 px-3 focus-within:border-primary-1 focus-within:shadow-[0_0_0_3px_rgba(138,111,224,0.12)] md:min-w-[12.5rem]"
          : "h-[2.125rem] w-[2.125rem] min-w-[2.125rem] cursor-pointer border border-transparent bg-transparent px-0 hover:bg-background-3",
      )}
      onSubmit={handleSubmit}
    >
      {isExpanded ? null : (
        <button
          type="button"
          onClick={handleOpen}
          aria-label="검색"
          aria-expanded={false}
          aria-controls="header-search-input"
          className="flex h-[2.125rem] w-[2.125rem] shrink-0 items-center justify-center text-text-3 transition-transform duration-200 hover:scale-110"
        >
          <Icon icon={magniferLinear} width="18" aria-hidden="true" />
        </button>
      )}

      <span className="sr-only">검색어 입력</span>
      <input
        id="header-search-input"
        ref={inputRef}
        type="text"
        disabled={!isExpanded}
        tabIndex={isExpanded ? 0 : -1}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="검색어 입력"
        maxLength={200}
        aria-label="검색어 입력"
        className={cn(
          "min-w-0 bg-transparent text-[0.813rem] leading-[1.125rem] font-normal text-text-1 outline-none placeholder:text-text-4 transition-[width,opacity] duration-300",
          isExpanded
            ? "w-full opacity-100"
            : "w-0 opacity-0 pointer-events-none",
        )}
      />

      {isExpanded ? (
        <button
          type="button"
          onClick={() => {
            setQuery("");
            inputRef.current?.focus();
          }}
          aria-label="검색어 지우기"
          disabled={!query}
          className={cn(
            "flex h-[1.375rem] w-[1.375rem] shrink-0 items-center justify-center rounded-full transition-colors",
            query
              ? "text-text-4 hover:bg-background-3 hover:text-text-2"
              : "pointer-events-none text-transparent",
          )}
        >
          <ClearIcon />
        </button>
      ) : null}

      {isExpanded ? (
        <button
          type="submit"
          aria-label="검색 실행"
          className="flex h-[2.125rem] w-[2.125rem] shrink-0 items-center justify-center rounded-[0.5rem] text-text-3 transition-colors hover:bg-background-3"
        >
          <Icon icon={magniferLinear} width="16" aria-hidden="true" />
        </button>
      ) : null}
    </form>
  );
};

function ClearIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="12"
      height="12"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M7 7 17 17" />
      <path d="M17 7 7 17" />
    </svg>
  );
}

SearchBar.displayName = "SearchBar";

export { SearchBar };
