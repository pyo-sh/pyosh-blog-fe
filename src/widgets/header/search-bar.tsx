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
  const containerRef = useRef<HTMLFormElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    inputRef.current?.focus();
    inputRef.current?.select();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
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
  }, [isOpen]);

  const handleOpen = () => {
    const currentUrl = new URL(window.location.href);

    if (currentUrl.pathname === "/search") {
      setQuery(currentUrl.searchParams.get("q") ?? "");
    } else {
      setQuery("");
    }

    setIsOpen(true);
  };

  const handleClose = () => {
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
      handleClose();

      return;
    }

    const currentUrl = new URL(window.location.href);
    const currentFilter =
      currentUrl.pathname === "/search"
        ? (currentUrl.searchParams.get("filter") ?? "title_content")
        : "title_content";

    const params = new URLSearchParams({
      q: trimmedQuery,
      filter: currentFilter,
    });
    router.push(`/search?${params.toString()}`);
    handleClose();
  };

  return (
    <form
      ref={containerRef}
      className="flex items-center justify-end gap-2"
      onSubmit={handleSubmit}
    >
      <label
        aria-hidden={!isOpen}
        className={cn(
          "overflow-hidden transition-all duration-300",
          isOpen
            ? "min-w-[120px] max-w-[320px] opacity-100 md:min-w-[200px]"
            : "w-0 opacity-0 pointer-events-none",
        )}
      >
        <span className="sr-only">검색어</span>
        <input
          id="header-search-input"
          ref={inputRef}
          type="search"
          disabled={!isOpen}
          tabIndex={isOpen ? 0 : -1}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="검색어 입력"
          maxLength={200}
          aria-label="검색어 입력"
          className="h-10 w-full rounded-full border border-border-3 bg-background-2 px-4 text-body-sm text-text-1 outline-none transition-colors placeholder:text-text-4 focus:border-primary-1"
        />
      </label>

      <Button
        type={isOpen ? "submit" : "button"}
        onClick={isOpen ? undefined : handleOpen}
        showShadow={false}
        fill="weak"
        aria-label="검색"
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
