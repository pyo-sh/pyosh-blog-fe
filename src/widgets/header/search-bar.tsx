"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@shared/lib/style-utils";
import { Button } from "@shared/ui/libs";

const ICON_WIDTH = "1.5rem";
const ICON_HEIGHT = "1.5rem";

const SearchBar: React.FC = () => {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    inputRef.current?.focus();
    inputRef.current?.select();
  }, [isOpen]);

  const handleOpen = () => {
    const currentUrl = new URL(window.location.href);

    if (currentUrl.pathname === "/search") {
      setQuery(currentUrl.searchParams.get("q") ?? "");
    }

    setIsOpen(true);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setIsOpen(false);

      return;
    }

    const params = new URLSearchParams({ q: trimmedQuery });
    router.push(`/search?${params.toString()}`);
    setIsOpen(false);
  };

  return (
    <form
      className="flex items-center justify-end gap-2"
      onSubmit={handleSubmit}
    >
      <label
        className={cn(
          "overflow-hidden transition-all duration-300",
          isOpen
            ? "w-40 opacity-100 md:w-56"
            : "w-0 opacity-0 pointer-events-none",
        )}
      >
        <span className="sr-only">검색어</span>
        <input
          id="header-search-input"
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="검색어 입력"
          className="h-10 w-full rounded-full border border-border-3 bg-background-2 px-4 text-body-sm text-text-1 outline-none transition-colors placeholder:text-text-4 focus:border-primary-1"
        />
      </label>

      <Button
        type={isOpen ? "submit" : "button"}
        onClick={isOpen ? undefined : handleOpen}
        showShadow={false}
        fill="weak"
        aria-label={isOpen ? "검색 실행" : "검색창 열기"}
        aria-expanded={isOpen}
        aria-controls="header-search-input"
      >
        <SearchIcon
          className="text-text-1"
          width={ICON_WIDTH}
          height={ICON_HEIGHT}
        />
      </Button>
    </form>
  );
};

type SearchIconProps = {
  className?: string;
  width?: number | string;
  height?: number | string;
};

const SearchIcon: React.FC<SearchIconProps> = ({
  className,
  width,
  height,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      width={width}
      height={height}
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" strokeLinecap="round" />
    </svg>
  );
};

SearchBar.displayName = "SearchBar";

export { SearchBar };
