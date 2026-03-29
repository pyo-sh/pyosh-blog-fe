"use client";

import React from "react";
import { Icon } from "@iconify/react";
import moonLinear from "@iconify-icons/solar/moon-linear";
import sun2Linear from "@iconify-icons/solar/sun-2-linear";
import { useTheme } from "@app-layer/theme";

const ThemeButton: React.FC = () => {
  const { isMounted, themeType, toggleTheme } = useTheme();

  if (!isMounted) {
    return <></>;
  }

  if (themeType === "light") {
    return (
      <button
        onClick={toggleTheme}
        aria-label="다크 모드로 전환"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-text-3 transition-transform duration-300 hover:scale-110 hover:rotate-[30deg] hover:bg-background-3"
      >
        <Icon icon={sun2Linear} width="18" aria-hidden="true" />
      </button>
    );
  }

  if (themeType === "dark") {
    return (
      <button
        onClick={toggleTheme}
        aria-label="라이트 모드로 전환"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-text-3 transition-transform duration-300 hover:scale-110 hover:rotate-[30deg] hover:bg-background-3"
      >
        <Icon icon={moonLinear} width="18" aria-hidden="true" />
      </button>
    );
  }

  return <></>;
};

export { ThemeButton };
