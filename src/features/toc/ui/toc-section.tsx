"use client";

import { type MouseEvent, useEffect, useState } from "react";
import type { TocItem } from "@shared/lib/markdown";
import { cn } from "@shared/lib/style-utils";

const DESKTOP_BREAKPOINT = 1080;
const DESKTOP_MEDIA_QUERY = `(min-width: ${DESKTOP_BREAKPOINT}px)`;

interface TocSectionProps {
  headings: TocItem[];
  onItemClick?: () => void;
}

export function TocSection({ headings, onItemClick }: TocSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_MEDIA_QUERY);
    const syncOpenState = () => setIsOpen(mediaQuery.matches);

    syncOpenState();
    mediaQuery.addEventListener("change", syncOpenState);

    return () => mediaQuery.removeEventListener("change", syncOpenState);
  }, []);

  if (headings.length === 0) {
    return null;
  }

  const handleHeadingClick = (
    event: MouseEvent<HTMLAnchorElement>,
    id: string,
  ) => {
    event.preventDefault();

    const headingElement = document.getElementById(id);

    if (!headingElement) {
      return;
    }

    headingElement.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", `#${id}`);

    if (window.innerWidth < DESKTOP_BREAKPOINT) {
      setIsOpen(false);
      onItemClick?.();
    }
  };

  return (
    <nav aria-label="목차">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-body-xs font-semibold uppercase tracking-[0.16em] text-text-4">
          목차
        </h2>
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          aria-expanded={isOpen}
          aria-label={isOpen ? "목차 접기" : "목차 펼치기"}
          className="rounded-md p-1 text-text-4 transition-colors hover:text-primary-1"
        >
          <ChevronIcon isOpen={isOpen} />
        </button>
      </div>

      {isOpen && (
        <ol className="mt-3 space-y-1 border-l-2 border-border-4 pl-3">
          {headings.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={(event) => handleHeadingClick(event, item.id)}
                className={cn(
                  "block truncate transition-colors hover:text-primary-1",
                  item.level === 1 &&
                    "pl-0 text-body-xs font-medium text-text-3",
                  item.level === 2 &&
                    "pl-2.5 text-body-xs font-medium text-text-3",
                  item.level === 3 && "pl-5 text-[11px] text-text-4",
                )}
                title={item.text}
              >
                {item.text}
              </a>
            </li>
          ))}
        </ol>
      )}
    </nav>
  );
}

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("transition-transform", isOpen && "rotate-180")}
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
