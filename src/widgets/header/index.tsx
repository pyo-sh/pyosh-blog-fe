"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@shared/lib/style-utils";
import throttle from "@shared/lib/throttle";
import { SearchBar } from "@widgets/header/search-bar";
import { ThemeButton } from "@widgets/header/theme-button";
import { Logo } from "@widgets/logo";

interface HeaderProps {
  onHamburgerClick?: () => void;
  isSidebarOpen?: boolean;
  hamburgerRef?: React.Ref<HTMLButtonElement>;
}

const Header: React.FC<HeaderProps> = ({
  onHamburgerClick,
  isSidebarOpen,
  hamburgerRef,
}) => {
  const [isShown, setIsShown] = useState<boolean>(true);
  const [headerHeight, setHeaderHeight] = useState<number>(0);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let prevY = window.scrollY;

    const handleScroll = throttle(() => {
      if (!headerRef.current) return;

      const nowY = window.scrollY;
      const isTop = nowY <= headerRef.current.clientHeight;
      const isUp = prevY - nowY >= 0;

      prevY = nowY;
      setIsShown(isTop || isUp);
    }, 100);

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (!headerRef.current) return;

    const updateHeight = () => {
      setHeaderHeight(headerRef.current?.clientHeight ?? 0);
    };

    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(headerRef.current);

    window.addEventListener("resize", updateHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

  return (
    <div
      className="pt-[4.5rem]"
      style={headerHeight > 0 ? { paddingTop: `${headerHeight}px` } : undefined}
    >
      <header
        ref={headerRef}
        className={cn(
          "w-full h-[4.5rem]",
          "fixed top-0 z-[1000]",
          "flex justify-center",
          "text-text-1 bg-background-1 border-b border-border-3",
          "transition-all duration-300",
          isShown ? "translate-y-0" : "-translate-y-full",
        )}
      >
        <div className="max-w-[67.5rem] w-full mx-auto px-4 h-full flex items-center justify-between md:px-6">
          <Logo />

          <div className="flex items-center gap-2">
            <SearchBar />
            <ThemeButton />
            {onHamburgerClick && (
              <button
                ref={hamburgerRef}
                type="button"
                onClick={onHamburgerClick}
                aria-label="메뉴 열기"
                aria-expanded={isSidebarOpen}
                aria-controls="public-sidebar-panel"
                className="flex lg:hidden items-center justify-center rounded-md p-2 text-text-3 transition-colors hover:bg-background-2 hover:text-text-1"
              >
                <HamburgerIcon />
              </button>
            )}
          </div>
        </div>
      </header>
    </div>
  );
};

Header.displayName = "Header";

function HamburgerIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

export { Header };
