"use client";

import React, { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import magniferLinear from "@iconify-icons/solar/magnifer-linear";
import { useRouter } from "next/navigation";
import { cn } from "@shared/lib/style-utils";

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
          className="h-9 w-full rounded-lg border border-border-3 bg-background-2 px-3 text-body-sm text-text-1 outline-none transition-colors placeholder:text-text-4 focus:border-primary-1"
        />
      </label>

      <button
        type={isOpen ? "submit" : "button"}
        onClick={isOpen ? undefined : handleOpen}
        aria-label="검색"
        aria-expanded={isOpen}
        aria-controls="header-search-input"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-text-3 transition-colors hover:bg-background-3"
      >
        <Icon icon={magniferLinear} width="18" aria-hidden="true" />
      </button>
    </form>
  );
};

SearchBar.displayName = "SearchBar";

export { SearchBar };
