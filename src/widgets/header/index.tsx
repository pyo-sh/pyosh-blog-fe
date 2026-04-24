"use client";

import React, { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import hamburgerMenuLinear from "@iconify-icons/solar/hamburger-menu-linear";
import Link from "next/link";
import { cn } from "@shared/lib/style-utils";
import throttle from "@shared/lib/throttle";
import { SearchBar } from "@widgets/header/search-bar";
import { ThemeButton } from "@widgets/header/theme-button";
import { LogoIcon } from "@widgets/logo/ui/logo-icon";

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
      className="pt-14"
      style={headerHeight > 0 ? { paddingTop: `${headerHeight}px` } : undefined}
    >
      <header
        ref={headerRef}
        className={cn(
          "w-full h-14",
          "fixed top-0 z-[1000]",
          "flex justify-center",
          "border-b text-text-1",
          "bg-[rgba(249,249,250,0.8)] border-[rgba(219,221,224,0.5)] shadow-[0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-[16px] backdrop-saturate-[1.4]",
          "dark:bg-[rgba(19,20,21,0.85)] dark:border-[rgba(62,66,69,0.5)] dark:shadow-[0_1px_0_rgba(0,0,0,0.15)]",
          "transition-all duration-300",
          isShown ? "translate-y-0" : "-translate-y-full",
        )}
      >
        <div className="mx-auto flex h-full w-full max-w-[67.5rem] items-center justify-between px-4 md:px-6 lg:px-8">
          <Link
            href="/"
            aria-label="pyosh blog 홈"
            className="flex items-center gap-2"
          >
            <LogoIcon
              width="1.75rem"
              height="1.75rem"
              className="text-primary-1"
            />
            <span className="text-[0.875rem] leading-[1.188rem] font-bold tracking-tight text-text-1">
              pyosh blog
            </span>
          </Link>

          <div className="flex items-center gap-1">
            <Link
              href="/guestbook"
              className="inline-flex h-9 items-center rounded-lg px-3 text-sm font-medium text-text-2 transition-colors hover:bg-background-3 hover:text-text-1"
            >
              방명록
            </Link>
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
                className="flex h-9 w-9 items-center justify-center rounded-lg text-text-3 transition-colors hover:bg-background-3 lg:hidden"
              >
                <Icon
                  icon={hamburgerMenuLinear}
                  width="20"
                  aria-hidden="true"
                />
              </button>
            )}
          </div>
        </div>
      </header>
    </div>
  );
};

Header.displayName = "Header";

export { Header };
