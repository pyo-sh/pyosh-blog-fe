"use client";

import { useContext } from "react";
import { ThemeContext } from "@app-layer/theme/theme-provider";

export function useTheme() {
  const value = useContext(ThemeContext);

  if (!value) {
    throw new Error(
      "Theme Error : useToggleTheme must be used within ToggleThemeProvider",
    );
  }

  return value;
}
