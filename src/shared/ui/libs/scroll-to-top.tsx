"use client";

import { useEffect, useState } from "react";
import throttle from "@shared/lib/throttle";
import { cn } from "@shared/lib/style-utils";
import { ArrowUpIcon } from "@shared/ui/icons";

const ScrollToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = throttle(() => {
      setVisible(window.scrollY >= window.innerHeight);
    }, 100);

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      aria-label="맨 위로"
      onClick={handleClick}
      className={cn(
        "fixed bottom-6 right-6 z-40",
        "hidden md:flex items-center justify-center",
        "h-11 w-11 rounded-full",
        "bg-background-2 border border-border-3",
        "text-text-3 hover:text-text-1 hover:border-border-2",
        "shadow-[0px_2px_7px_0px_rgba(0,0,0,0.26)]",
        "transition-all duration-300",
        visible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
      )}
    >
      <ArrowUpIcon width={20} height={20} />
    </button>
  );
};

export { ScrollToTop };
