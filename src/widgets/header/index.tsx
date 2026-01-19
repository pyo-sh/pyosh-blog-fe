"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@shared/lib/style-utils";
import throttle from "@shared/lib/throttle";
import { Navigation } from "@widgets/header/navigation";
import { ThemeButton } from "@widgets/header/theme-button";
import { Logo } from "@widgets/logo";

const Header: React.FC = () => {
  const [isShown, setIsShown] = useState<boolean>(true);
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

  return (
    <div className="pt-[5.625rem]">
      <header
        ref={headerRef}
        className={cn(
          // Layout
          "w-full h-[5.625rem]",
          "fixed top-0 z-[1000]",
          "flex justify-center",
          // Colors
          "text-text-1 bg-background-1",
          // Transition
          "transition-all duration-300",
          // Transform
          isShown ? "translate-y-0" : "-translate-y-[5.625rem]",
        )}
      >
        <div className="max-w-[67.5rem] w-full h-full mx-auto px-6 flex items-center justify-between">
          <Logo />

          <div className="flex items-center gap-8">
            <Navigation />
            <ThemeButton />
          </div>
        </div>
      </header>
    </div>
  );
};

Header.displayName = "Header";

export { Header };
